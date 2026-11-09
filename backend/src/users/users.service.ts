import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  private include = {
    department: true,
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    },
  } as const;

  async findAll(organizationId: string, query: { search?: string; roleId?: string; status?: UserStatus; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where = {
      organizationId,
      status: query.status,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { email: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(query.roleId ? { roles: { some: { roleId: query.roleId } } } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: this.include,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    const sanitizedItems = items.map((u) => {
      const copy = { ...u } as Partial<typeof u>;
      delete copy.passwordHash;
      return copy;
    });
    return { items: sanitizedItems, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async findOne(organizationId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, organizationId }, include: this.include });
    if (!user) throw new NotFoundException('المستخدم غير موجود.');
    const employee = await this.prisma.employee.findFirst({ where: { organizationId, email: user.email }, include: { department: true } });
    const userCopy = { ...user } as Partial<typeof user>;
    delete userCopy.passwordHash;
    return { ...userCopy, employee };
  }

  async create(organizationId: string, dto: CreateUserDto) {
    const roleIds = [...new Set(dto.roleIds || [])];
    if (!roleIds.length) throw new BadRequestException('يجب إسناد دور واحد على الأقل.');
    const roles = await this.prisma.role.findMany({ where: { organizationId, id: { in: roleIds } } });
    if (roles.length !== roleIds.length) throw new BadRequestException('أحد الأدوار المحددة غير صالح.');
    const duplicate = await this.prisma.user.findFirst({ where: { organizationId, email: dto.email.toLowerCase() } });
    if (duplicate) throw new ConflictException('البريد الإلكتروني مستخدم مسبقاً.');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          organizationId,
          departmentId: dto.departmentId,
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.fullName.trim(),
          status: UserStatus.ACTIVE,
        },
      });
      await tx.employee.create({
        data: {
          organizationId,
          departmentId: dto.departmentId,
          employeeNumber: `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: dto.fullName.trim(),
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          jobTitle: dto.jobTitle,
          status: 'ACTIVE',
        },
      });
      await tx.userRole.createMany({ data: roleIds.map((roleId) => ({ userId: created.id, roleId })) });
      return created;
    });
    return this.findOne(organizationId, user.id);
  }

  async update(organizationId: string, id: string, dto: UpdateUserDto) {
    const current = await this.findOne(organizationId, id);
    const roleIds = dto.roleIds ? [...new Set(dto.roleIds)] : undefined;
    if (roleIds && !roleIds.length) throw new BadRequestException('يجب الاحتفاظ بدور واحد على الأقل.');
    if (roleIds) {
      const roles = await this.prisma.role.findMany({ where: { organizationId, id: { in: roleIds } } });
      if (roles.length !== roleIds.length) throw new BadRequestException('أحد الأدوار المحددة غير صالح.');
    }
    const email = dto.email?.toLowerCase();
    if (email && email !== current.email && await this.prisma.user.findFirst({ where: { organizationId, email, id: { not: id } } })) {
      throw new ConflictException('البريد الإلكتروني مستخدم مسبقاً.');
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data: { name: dto.fullName?.trim(), email, departmentId: dto.departmentId } });
      if (roleIds) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.createMany({ data: roleIds.map((roleId) => ({ userId: id, roleId })) });
      }
      await tx.employee.updateMany({
        where: { organizationId, email: current.email },
        data: { name: dto.fullName?.trim(), email, departmentId: dto.departmentId, phone: dto.phone, jobTitle: dto.jobTitle },
      });
      return user;
    });
    return this.findOne(organizationId, result.id);
  }

  async updateStatus(organizationId: string, id: string, status: UserStatus) {
    await this.findOne(organizationId, id);
    return this.prisma.user.update({ where: { id }, data: { status } });
  }

  async remove(organizationId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود.');
    }

    const roleNames = user.roles.map((r) => r.role.name.toUpperCase());
    const isProtected = roleNames.some((name) =>
      ['ADMIN', 'ASSET_MANAGER'].includes(name),
    );

    if (isProtected) {
      throw new BadRequestException({
        message: 'You cannot delete this user',
        arabicMessage: 'لا يمكن حذف هذا المستخدم (محمي بحكم الدور).',
      });
    }

    const employee = await this.prisma.employee.findFirst({
      where: { organizationId, email: user.email },
    });

    try {
      await this.prisma.$transaction(async (tx) => {
        // Delete user notifications
        await tx.notification.deleteMany({ where: { recipientId: id } });
        // Delete user roles
        await tx.userRole.deleteMany({ where: { userId: id } });

        if (employee) {
          const activeCustodies = await tx.custodyRecord.count({
            where: { employeeId: employee.id, status: 'ACTIVE' },
          });

          if (activeCustodies > 0) {
            // Cannot hard delete employee with active custody - mark INACTIVE safely
            await tx.employee.update({
              where: { id: employee.id },
              data: { status: 'INACTIVE' },
            });
            await tx.user.update({
              where: { id },
              data: { status: UserStatus.INACTIVE },
            });
            return;
          }

          // Check historical records
          const totalCustodies = await tx.custodyRecord.count({
            where: { employeeId: employee.id },
          });
          const totalRequests = await tx.custodyRequest.count({
            where: { requesterId: employee.id },
          });
          const totalMaint = await tx.maintenanceRequest.count({
            where: { requestedById: employee.id },
          });

          if (totalCustodies === 0 && totalRequests === 0 && totalMaint === 0) {
            await tx.employee.delete({ where: { id: employee.id } });
          } else {
            await tx.employee.update({
              where: { id: employee.id },
              data: { status: 'INACTIVE' },
            });
          }
        }

        // Delete user
        await tx.user.delete({ where: { id } });
      });
    } catch {
      // Safe fallback if any foreign key locks
      await this.prisma.user.update({
        where: { id },
        data: { status: UserStatus.INACTIVE },
      });
      if (employee) {
        await this.prisma.employee.update({
          where: { id: employee.id },
          data: { status: 'INACTIVE' },
        });
      }
    }

    return {
      message: 'Employee deleted successfully',
      arabicMessage: 'تم حذف حساب الموظف بنجاح.',
    };
  }

  async softDelete(organizationId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود.');
    }
    const roleNames = user.roles.map((r) => r.role.name.toUpperCase());
    if (roleNames.some((n) => ['ADMIN', 'SUPER_ADMIN'].includes(n))) {
      throw new BadRequestException('لا يمكن تعطيل حساب مسؤول النظام.');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: UserStatus.INACTIVE },
    });
    await this.prisma.employee.updateMany({
      where: { organizationId, email: user.email },
      data: { status: 'INACTIVE' },
    });
    return {
      message: 'User deactivated successfully',
      arabicMessage: 'تم تعطيل حساب المستخدم بنجاح.',
    };
  }
}
