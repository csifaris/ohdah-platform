import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssetStatus, MaintenanceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(organizationId?: string, status?: MaintenanceStatus) {
    return this.prisma.maintenanceRequest.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(status ? { status } : {}),
      },
      include: { asset: true, requestedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true, requestedBy: true },
    });
    if (!request) throw new NotFoundException('طلب الصيانة غير موجود');
    return request;
  }

  async create(dto: CreateMaintenanceRequestDto) {
    const request = await this.prisma.maintenanceRequest.create({
      data: {
        organizationId: dto.organizationId,
        assetId: dto.assetId,
        assetType: dto.assetType,
        requestedById: dto.requestedById,
        issue: dto.issue,
        priority: dto.priority || 'NORMAL',
        status: dto.status || MaintenanceStatus.OPEN,
        technician: dto.technician,
        cost: dto.cost,
      },
    });

    if (dto.assetId) {
      await this.prisma.asset.update({
        where: { id: dto.assetId },
        data: { status: AssetStatus.MAINTENANCE },
      });
    }

    await this.audit.record({
      organizationId: dto.organizationId,
      action: 'CREATE',
      resource: 'maintenance',
      resourceId: request.id,
      metadata: { assetId: dto.assetId },
    });

    return request;
  }

  async update(id: string, dto: UpdateMaintenanceRequestDto) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.technician !== undefined ? { technician: dto.technician } : {}),
        ...(dto.cost !== undefined ? { cost: dto.cost } : {}),
        ...(dto.issue !== undefined ? { issue: dto.issue } : {}),
        resolvedAt: dto.status === MaintenanceStatus.COMPLETED ? new Date() : undefined,
      },
      include: { asset: true, requestedBy: true },
    });

    if (updated.assetId && (dto.status === MaintenanceStatus.COMPLETED || dto.status === MaintenanceStatus.CANCELLED)) {
      await this.prisma.asset.update({
        where: { id: updated.assetId },
        data: { status: AssetStatus.AVAILABLE },
      });
    } else if (updated.assetId && (dto.status === MaintenanceStatus.IN_PROGRESS || dto.status === MaintenanceStatus.OPEN)) {
      await this.prisma.asset.update({
        where: { id: updated.assetId },
        data: { status: AssetStatus.MAINTENANCE },
      });
    }

    await this.audit.record({
      organizationId: existing.organizationId,
      action: 'UPDATE',
      resource: 'maintenance',
      resourceId: id,
      metadata: { status: dto.status, technician: dto.technician },
    });

    // Notify employee requester
    let empEmail = existing.requestedBy?.email;
    if (!empEmail && existing.requestedById) {
      const emp = await this.prisma.employee.findUnique({ where: { id: existing.requestedById } });
      empEmail = emp?.email;
    }

    if (empEmail) {
      const user = await this.prisma.user.findFirst({
        where: {
          organizationId: existing.organizationId,
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
          message = 'تم إكمال الإصلاح وإعادة الأصل إلى الحالة المتاحة.';
        } else if (dto.status === MaintenanceStatus.CANCELLED) {
          title = 'إلغاء بلاغ الصيانة';
          message = 'تم إلغاء بلاغ الصيانة وإعادة الأصل للمخزون.';
        }

        await this.prisma.notification.create({
          data: {
            organizationId: existing.organizationId,
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

  async remove(id: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('طلب الصيانة غير موجود');
    }
    if (request.status !== MaintenanceStatus.OPEN) {
      throw new BadRequestException('لا يمكن حذف الطلب إلا إذا كان جديداً');
    }
    if (request.assetId) {
      await this.prisma.asset.update({
        where: { id: request.assetId },
        data: { status: AssetStatus.AVAILABLE },
      });
    }
    await this.audit.record({
      organizationId: request.organizationId,
      action: 'DELETE',
      resource: 'maintenance',
      resourceId: id,
    });
    return this.prisma.maintenanceRequest.delete({ where: { id } });
  }
}
