import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateOpaqueToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  async register(dto: RegisterDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });
    if (!organization) {
      throw new BadRequestException('المؤسسة المحددة غير موجودة.');
    }

    const email = dto.email.trim().toLowerCase();
    const duplicate = await this.prisma.user.findFirst({
      where: { organizationId: organization.id, email },
      select: { id: true },
    });
    if (duplicate) {
      throw new BadRequestException('البريد الإلكتروني مستخدم مسبقاً.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const department = await tx.department.upsert({
        where: {
          organizationId_name: {
            organizationId: organization.id,
            name: dto.department.trim(),
          },
        },
        update: {},
        create: {
          organizationId: organization.id,
          name: dto.department.trim(),
        },
      });

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          departmentId: department.id,
          email,
          passwordHash,
          name: dto.fullName.trim(),
          status: 'ACTIVE',
        },
      });

      await tx.employee.create({
        data: {
          organizationId: organization.id,
          departmentId: department.id,
          employeeNumber: `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: dto.fullName.trim(),
          email,
          phone: dto.phone.trim(),
          jobTitle: dto.jobTitle.trim(),
          status: 'ACTIVE',
        },
      });

      const role = await tx.role.upsert({
        where: {
          organizationId_name: {
            organizationId: organization.id,
            name: 'EMPLOYEE',
          },
        },
        update: {},
        create: {
          organizationId: organization.id,
          name: 'EMPLOYEE',
          description: 'مستخدم موظف',
          isSystem: true,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      return user;
    });

    return {
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        organizationId: result.organizationId,
        roles: ['EMPLOYEE'],
        permissions: [],
      },
    };
  }

  async login(email: string, password: string, organizationId?: string) {
    const normalizedEmail = email.trim().toLowerCase();

    // In multi-tenant environments, if organizationId is supplied we use it, otherwise find by email
    const user = await this.prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !user ||
      user.status !== 'ACTIVE' ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const roles = user.roles.map((assignment) =>
      assignment.role.name.toUpperCase(),
    );
    const permissions = [
      ...new Set(
        user.roles.flatMap((assignment) =>
          assignment.role.permissions.map(
            (item) => `${item.permission.resource}:${item.permission.action}`,
          ),
        ),
      ),
    ];

    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      roles,
      permissions,
      tokenVersion: user.tokenVersion ?? 0,
    };

    const accessToken = await this.jwt.signAsync(payload);

    // Create Refresh Token
    const rawRefreshToken = this.generateOpaqueToken();
    const tokenHash = this.hashToken(rawRefreshToken);
    const refreshDays = parseInt(
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d').replace('d', ''),
      10,
    ) || 7;
    const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
        roles,
        permissions,
      },
    };
  }

  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
      throw new UnauthorizedException('رمز التحديث مطلوب.');
    }

    const tokenHash = this.hashToken(rawRefreshToken);

    type RefreshTxOutcome =
      | {
          kind: 'SUCCESS';
          newAccessToken: string;
          newRawRefreshToken: string;
          user: {
            id: string;
            name: string;
            email: string;
            organizationId: string;
            roles: string[];
            permissions: string[];
          };
        }
      | { kind: 'REPLAY_DETECTED' }
      | { kind: 'CONCURRENT_GRACE_PERIOD' }
      | { kind: 'CONCURRENT_ROTATION' };

    const txResult: RefreshTxOutcome = await this.prisma.$transaction(async (tx) => {
      const record = await tx.refreshToken.findFirst({
        where: { tokenHash },
        include: {
          user: {
            include: {
              roles: {
                include: {
                  role: {
                    include: {
                      permissions: {
                        include: {
                          permission: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!record) {
        throw new UnauthorizedException('رمز التحديث غير صالح.');
      }

      // Reuse detection & Concurrency Grace Period
      if (record.revokedAt) {
        const gracePeriodMs = 15000; // 15s grace window for concurrent requests
        const isWithinGrace =
          Date.now() - record.revokedAt.getTime() < gracePeriodMs;

        if (!isWithinGrace) {
          // Malicious replay attack detected:
          // Revoke all active refresh tokens and atomically increment tokenVersion.
          // IMPORTANT: We do NOT throw inside the transaction callback here.
          // This guarantees that PostgreSQL successfully COMMITS the session revocation
          // and tokenVersion increment rather than rolling them back!
          await tx.refreshToken.updateMany({
            where: { userId: record.userId, revokedAt: null },
            data: { revokedAt: new Date() },
          });
          await tx.user.update({
            where: { id: record.userId },
            data: { tokenVersion: { increment: 1 } },
          });

          return { kind: 'REPLAY_DETECTED' };
        }

        return { kind: 'CONCURRENT_GRACE_PERIOD' };
      }

      if (record.expiresAt < new Date()) {
        throw new UnauthorizedException('رمز التحديث منتهي الصلاحية.');
      }

      const userRecord = record.user;
      if (!userRecord || userRecord.status !== 'ACTIVE') {
        throw new UnauthorizedException('المستخدم غير متاح أو موقوف.');
      }

      // Atomic conditional update requiring id and revokedAt: null
      const revokeResult = await tx.refreshToken.updateMany({
        where: {
          id: record.id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      if (revokeResult.count !== 1) {
        // Another concurrent transaction just revoked this exact token in the same millisecond
        return { kind: 'CONCURRENT_ROTATION' };
      }

      // Generate new pair
      const roles = userRecord.roles.map((assignment) =>
        assignment.role.name.toUpperCase(),
      );
      const permissions = [
        ...new Set(
          userRecord.roles.flatMap((assignment) =>
            assignment.role.permissions.map(
              (item) => `${item.permission.resource}:${item.permission.action}`,
            ),
          ),
        ),
      ];

      const payload = {
        sub: userRecord.id,
        userId: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        organizationId: userRecord.organizationId,
        roles,
        permissions,
        tokenVersion: userRecord.tokenVersion ?? 0,
      };

      const newAccessToken = await this.jwt.signAsync(payload);
      const newRawRefreshToken = this.generateOpaqueToken();
      const newTokenHash = this.hashToken(newRawRefreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await tx.refreshToken.create({
        data: {
          userId: userRecord.id,
          tokenHash: newTokenHash,
          expiresAt,
        },
      });

      return {
        kind: 'SUCCESS',
        newAccessToken,
        newRawRefreshToken,
        user: {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          organizationId: userRecord.organizationId,
          roles,
          permissions,
        },
      };
    });

    // Handle post-commit outcomes outside the transaction callback:
    if (txResult.kind === 'REPLAY_DETECTED') {
      throw new UnauthorizedException(
        'تم اكتشاف محاولة استخدام رمز ملغي. تم إلغاء كافة الجلسات النشطة لأسباب أمنية.',
      );
    }

    if (txResult.kind === 'CONCURRENT_GRACE_PERIOD') {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          code: 'CONCURRENT_REFRESH',
          message:
            'تم استخدام رمز التحديث مسبقاً بالتزامن. يرجى استخدام أحدث رمز صادر.',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (txResult.kind === 'CONCURRENT_ROTATION') {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          code: 'CONCURRENT_REFRESH',
          message: 'تم تدوير رمز التحديث بالتزامن بواسطة طلب آخر.',
        },
        HttpStatus.CONFLICT,
      );
    }

    return {
      accessToken: txResult.newAccessToken,
      refreshToken: txResult.newRawRefreshToken,
      user: txResult.user,
    };
  }

  /**
   * Device-specific logout:
   * Revokes ONLY the specific refresh token for the current device session.
   * Other device sessions remain active.
   *
   * Note on Access Token:
   * As per standard stateless JWT architecture, the current short-lived access token
   * remains valid until natural expiry (maximum 15 minutes). For immediate instant
   * invalidation across all devices and tokens, use `logoutAll`.
   */
  async logout(userId: string, rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return {
        success: true,
        message: 'تم تسجيل الخروج بنجاح من هذا الجهاز.',
      };
    }

    return {
      success: true,
      message: 'تم تسجيل الخروج بنجاح.',
    };
  }

  /**
   * Global logout (all devices):
   * Revokes ALL active refresh tokens for the user AND atomically increments user.tokenVersion.
   * This immediately and definitively invalidates all active access tokens across all devices.
   */
  async logoutAll(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
      });
    });

    return {
      success: true,
      message: 'تم تسجيل الخروج من كافة الأجهزة بنجاح وإلغاء صلاحية جميع الجلسات فورياً.',
    };
  }
}
