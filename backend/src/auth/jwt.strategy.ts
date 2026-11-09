import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export type AuthenticatedUser = {
  sub: string;
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: {
    sub: string;
    userId?: string;
    email: string;
    organizationId: string;
    roles?: string[];
    permissions?: string[];
    tokenVersion?: number;
  }): Promise<AuthenticatedUser> {
    const userId = payload.sub || payload.userId;
    if (!userId) {
      throw new UnauthorizedException('رمز الدخول غير صالح.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user || user.status !== 'ACTIVE' || user.organizationId !== payload.organizationId) {
      throw new UnauthorizedException('المستخدم غير متاح أو تم إيقاف حسابه أو المؤسسة غير متطابقة.');
    }

    // Strict JWT security policy:
    // 1. tokenVersion must be explicitly present in payload
    // 2. Must be a valid non-negative integer
    // 3. Must strictly match current user.tokenVersion in database
    // Legacy tokens without tokenVersion are strictly rejected, requiring re-login.
    const isValidTokenVersion =
      typeof payload.tokenVersion === 'number' &&
      Number.isInteger(payload.tokenVersion) &&
      payload.tokenVersion >= 0;

    if (!isValidTokenVersion || user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException(
        'رمز الدخول غير صالح أو تم إلغاء صلاحية الجلسة لتغيير حالة الأمان. يرجى تسجيل الدخول مجدداً.',
      );
    }

    const roles = user.roles.map((assignment) => assignment.role.name.toUpperCase());
    const permissions = [
      ...new Set(
        user.roles.flatMap((assignment) =>
          assignment.role.permissions.map(
            (item) => `${item.permission.resource}:${item.permission.action}`,
          ),
        ),
      ),
    ];

    return {
      sub: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      roles,
      permissions,
    };
  }
}
