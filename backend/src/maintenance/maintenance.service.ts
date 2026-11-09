import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetStatus, MaintenanceStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async getEmployeeForUser(organizationId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
      select: { email: true },
    });
    if (!user) return null;
    return this.prisma.employee.findFirst({
      where: { organizationId, email: user.email },
    });
  }

  async findAll(
    organizationId: string,
    userId: string,
    roles: string[],
    status?: MaintenanceStatus,
  ) {
    const isAdminOrManager = roles.some((r) =>
      ['ADMIN', 'ASSET_MANAGER', 'SUPER_ADMIN'].includes(r),
    );

    let requesterIdFilter: string | undefined = undefined;
    if (!isAdminOrManager) {
      const employee = await this.getEmployeeForUser(organizationId, userId);
      if (!employee) return [];
      requesterIdFilter = employee.id;
    }

    return this.prisma.maintenanceRequest.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
        ...(requesterIdFilter ? { requestedById: requesterIdFilter } : {}),
      },
      include: { asset: true, requestedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(
    organizationId: string,
    userId: string,
    roles: string[],
    id: string,
  ) {
    const request = await this.prisma.maintenanceRequest.findFirst({
      where: { id, organizationId },
      include: { asset: true, requestedBy: true },
    });

    if (!request) {
      throw new NotFoundException('طلب الصيانة غير موجود أو لا يتبع لهذه المنشأة.');
    }

    const isAdminOrManager = roles.some((r) =>
      ['ADMIN', 'ASSET_MANAGER', 'SUPER_ADMIN'].includes(r),
    );

    if (!isAdminOrManager) {
      const employee = await this.getEmployeeForUser(organizationId, userId);
      if (!employee || request.requestedById !== employee.id) {
        throw new ForbiddenException('غير مصرح لك بالاطلاع على هذا الطلب.');
      }
    }

    return request;
  }

  async create(
    organizationId: string,
    userId: string,
    roles: string[],
    dto: CreateMaintenanceRequestDto,
  ) {
    const isAdminOrManager = roles.some((r) =>
      ['ADMIN', 'ASSET_MANAGER', 'SUPER_ADMIN'].includes(r),
    );

    let requestedById = dto.requestedById;
    let initialStatus = dto.status || MaintenanceStatus.OPEN;
    let technician = dto.technician;
    let cost = dto.cost;

    if (!isAdminOrManager) {
      const employee = await this.getEmployeeForUser(organizationId, userId);
      if (!employee) {
        throw new BadRequestException('لا يوجد ملف موظف مرتبط بحسابك في هذه المنشأة.');
      }
      requestedById = employee.id;
      initialStatus = MaintenanceStatus.OPEN;
      technician = undefined;
      cost = undefined;
    }

    if (dto.assetId) {
      const asset = await this.prisma.asset.findFirst({
        where: { id: dto.assetId, organizationId },
      });
      if (!asset) {
        throw new BadRequestException('الأصل المحدد غير صالح أو لا يتبع لهذه المنشأة.');
      }
    }

    const request = await this.prisma.maintenanceRequest.create({
      data: {
        organizationId,
        assetId: dto.assetId || null,
        assetType: dto.assetType || null,
        requestedById: requestedById || null,
        issue: dto.issue.trim(),
        priority: dto.priority || 'NORMAL',
        status: initialStatus,
        technician: technician || null,
        cost: cost ?? null,
      },
      include: { asset: true, requestedBy: true },
    });

    if (dto.assetId) {
      await this.prisma.asset.update({
        where: { id: dto.assetId },
        data: { status: AssetStatus.MAINTENANCE },
      });
    }

    await this.audit.record({
      organizationId,
      actorId: userId,
      action: 'CREATE',
      resource: 'maintenance',
      resourceId: request.id,
      metadata: { assetId: dto.assetId },
    });

    return request;
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateMaintenanceRequestDto,
    actorId?: string,
  ) {
    const existing = await this.prisma.maintenanceRequest.findFirst({
      where: { id, organizationId },
      include: { asset: true, requestedBy: true },
    });

    if (!existing) {
      throw new NotFoundException('طلب الصيانة غير موجود.');
    }

    const updated = await this.prisma.maintenanceRequest.update({
      where: { id: existing.id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.technician !== undefined ? { technician: dto.technician } : {}),
        ...(dto.cost !== undefined ? { cost: dto.cost } : {}),
        ...(dto.issue !== undefined ? { issue: dto.issue } : {}),
        resolvedAt: dto.status === MaintenanceStatus.COMPLETED ? new Date() : undefined,
      },
      include: { asset: true, requestedBy: true },
    });

    if (updated.assetId) {
      if (
        dto.status === MaintenanceStatus.COMPLETED ||
        dto.status === MaintenanceStatus.CANCELLED
      ) {
        // Check if asset is actively assigned in custody
        const activeCustody = await this.prisma.custodyRecord.findFirst({
          where: { assetId: updated.assetId, returnedAt: null },
        });

        await this.prisma.asset.update({
          where: { id: updated.assetId },
          data: {
            status: activeCustody ? AssetStatus.ACTIVE : AssetStatus.AVAILABLE,
          },
        });
      } else if (
        dto.status === MaintenanceStatus.IN_PROGRESS ||
        dto.status === MaintenanceStatus.OPEN
      ) {
        await this.prisma.asset.update({
          where: { id: updated.assetId },
          data: { status: AssetStatus.MAINTENANCE },
        });
      }
    }

    await this.audit.record({
      organizationId,
      actorId,
      action: 'UPDATE',
      resource: 'maintenance',
      resourceId: id,
      metadata: { status: dto.status, technician: dto.technician },
    });

    // Notify employee requester
    const empEmail = existing.requestedBy?.email;
    if (empEmail) {
      const user = await this.prisma.user.findFirst({
        where: {
          organizationId,
          email: empEmail.trim().toLowerCase(),
        },
      });

      if (user) {
        let title = 'تم تحديث حالة طلب الصيانة';
        let message = `تم تحديث بلاغ الصيانة الخاص بك (${existing.asset?.name || 'الأصل'})`;

        if (dto.status === MaintenanceStatus.IN_PROGRESS) {
          title = 'تحديث حالة طلب الصيانة';
          message = `تم تحويل الأصل إلى الصيانة وقيد الإصلاح ${dto.technician ? `(الفني: ${dto.technician})` : ''}`;
        } else if (dto.status === MaintenanceStatus.COMPLETED) {
          title = 'تم إكمال الإصلاح';
          message = 'تم إكمال الإصلاح وإعادة الأصل إلى الحالة المعتمدة.';
        } else if (dto.status === MaintenanceStatus.CANCELLED) {
          title = 'إلغاء بلاغ الصيانة';
          message = 'تم إلغاء بلاغ الصيانة.';
        }

        await this.prisma.notification.create({
          data: {
            organizationId,
            recipientId: user.id,
            type: 'MAINTENANCE',
            title,
            message,
          },
        });
      }
    }

    return updated;
  }

  async remove(organizationId: string, id: string, actorId?: string) {
    const request = await this.prisma.maintenanceRequest.findFirst({
      where: { id, organizationId },
    });

    if (!request) {
      throw new NotFoundException('طلب الصيانة غير موجود.');
    }
    if (request.status !== MaintenanceStatus.OPEN) {
      throw new BadRequestException('لا يمكن حذف الطلب إلا إذا كان جديداً وقيد الانتظار.');
    }

    if (request.assetId) {
      const activeCustody = await this.prisma.custodyRecord.findFirst({
        where: { assetId: request.assetId, returnedAt: null },
      });
      await this.prisma.asset.update({
        where: { id: request.assetId },
        data: {
          status: activeCustody ? AssetStatus.ACTIVE : AssetStatus.AVAILABLE,
        },
      });
    }

    await this.audit.record({
      organizationId,
      actorId,
      action: 'DELETE',
      resource: 'maintenance',
      resourceId: id,
    });

    return this.prisma.maintenanceRequest.delete({ where: { id: request.id } });
  }
}
