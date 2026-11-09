import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AssetStatus,
  CustodyRequestStatus,
  CustodyStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustodyRecordDto } from './dto/create-custody-record.dto';
import { CreateCustodyRequestDto } from './dto/create-custody-request.dto';
import { ReturnCustodyDto } from './dto/return-custody.dto';

@Injectable()
export class CustodyService {
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

  async findRecords(
    organizationId: string,
    userId: string,
    roles: string[],
    status?: CustodyStatus,
  ) {
    const isAdminOrManager = roles.some((r) =>
      ['ADMIN', 'ASSET_MANAGER', 'SUPER_ADMIN'].includes(r),
    );

    let employeeIdFilter: string | undefined = undefined;
    if (!isAdminOrManager) {
      const employee = await this.getEmployeeForUser(organizationId, userId);
      if (!employee) return [];
      employeeIdFilter = employee.id;
    }

    return this.prisma.custodyRecord.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
        ...(employeeIdFilter ? { employeeId: employeeIdFilter } : {}),
      },
      include: {
        asset: true,
        employee: { include: { department: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRecord(
    organizationId: string,
    userId: string,
    roles: string[],
    id: string,
  ) {
    const record = await this.prisma.custodyRecord.findFirst({
      where: { id, organizationId },
      include: {
        asset: true,
        employee: { include: { department: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!record) {
      throw new NotFoundException('سجل العهدة غير موجود أو لا يتبع لهذه المنشأة.');
    }

    const isAdminOrManager = roles.some((r) =>
      ['ADMIN', 'ASSET_MANAGER', 'SUPER_ADMIN'].includes(r),
    );

    if (!isAdminOrManager) {
      const employee = await this.getEmployeeForUser(organizationId, userId);
      if (!employee || record.employeeId !== employee.id) {
        throw new ForbiddenException('غير مصرح لك بالاطلاع على هذا السجل.');
      }
    }

    return record;
  }

  async assign(
    organizationId: string,
    dto: CreateCustodyRecordDto,
    actorId?: string,
  ) {
    const rawDue = dto.dueAt || dto.dueDate;
    const dueAt = rawDue
      ? new Date(rawDue)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const assignedAt = dto.assignedAt ? new Date(dto.assignedAt) : new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findFirst({
        where: { id: dto.assetId, organizationId },
      });
      if (!asset) {
        throw new NotFoundException('الأصل غير موجود أو لا يتبع لهذه المنشأة.');
      }
      if (asset.status !== AssetStatus.AVAILABLE) {
        throw new BadRequestException(
          'لا يمكن تسليم العهدة: الأصل غير متاح حالياً للتسليم (حالته ليست متاح).',
        );
      }

      const activeExisting = await tx.custodyRecord.findFirst({
        where: { assetId: dto.assetId, returnedAt: null },
      });
      if (activeExisting) {
        throw new BadRequestException('الأصل مسند مسبقاً كعهدة نشطة لموظف آخر.');
      }

      const employee = await tx.employee.findFirst({
        where: { id: dto.employeeId, organizationId },
      });
      if (!employee || employee.status !== 'ACTIVE') {
        throw new NotFoundException('الموظف غير موجود أو غير نشط في هذه المنشأة.');
      }

      const record = await tx.custodyRecord.create({
        data: {
          organizationId,
          assetId: dto.assetId,
          employeeId: dto.employeeId,
          assignedAt,
          dueAt,
          handoverNotes: dto.handoverNotes || dto.notes,
          status: CustodyStatus.ACTIVE,
        },
      });

      await tx.asset.update({
        where: { id: dto.assetId },
        data: { status: AssetStatus.ACTIVE },
      });

      await tx.custodyHistory.create({
        data: {
          custodyId: record.id,
          event: 'ASSIGNED',
          notes: dto.handoverNotes || dto.notes || 'تم تسليم العهدة للموظف',
          performedBy: actorId,
        },
      });

      // Notify employee
      const user = await tx.user.findFirst({
        where: {
          organizationId,
          email: employee.email.trim().toLowerCase(),
        },
      });
      if (user) {
        await tx.notification.create({
          data: {
            organizationId,
            recipientId: user.id,
            type: 'CUSTODY',
            title: 'تم تسليم العهدة وتخصيص الأصل',
            message: `تم تسليمك الأصل (${asset.name}) وتاريخ الاستحقاق: ${dueAt.toLocaleDateString('ar-SA')}.`,
          },
        });
      }

      return tx.custodyRecord.findUnique({
        where: { id: record.id },
        include: { asset: true, employee: true, history: true },
      });
    });

    await this.audit.record({
      organizationId,
      actorId,
      action: 'ASSIGN_CUSTODY',
      resource: 'custody_record',
      resourceId: result?.id,
      metadata: { assetId: dto.assetId, employeeId: dto.employeeId },
    });

    return result;
  }

  async returnRecord(
    organizationId: string,
    id: string,
    dto: ReturnCustodyDto,
    actorId?: string,
  ) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const record = await tx.custodyRecord.findFirst({
        where: { id, organizationId },
        include: { asset: true, employee: true },
      });

      if (!record) {
        throw new NotFoundException('سجل العهدة غير موجود أو لا يتبع لهذه المنشأة.');
      }

      if (record.returnedAt !== null || record.status === CustodyStatus.RETURNED) {
        throw new BadRequestException('تم إرجاع هذه العهدة وإخلاء طرفها مسبقاً.');
      }

      const updatedRecord = await tx.custodyRecord.update({
        where: { id: record.id },
        data: {
          status: CustodyStatus.RETURNED,
          returnedAt: new Date(),
          returnNotes: dto.returnNotes,
        },
      });

      // Check if asset is under active maintenance
      const openMaintenance = await tx.maintenanceRequest.findFirst({
        where: {
          assetId: record.assetId,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      });

      await tx.asset.update({
        where: { id: record.assetId },
        data: {
          status: openMaintenance ? AssetStatus.MAINTENANCE : AssetStatus.AVAILABLE,
        },
      });

      await tx.custodyHistory.create({
        data: {
          custodyId: record.id,
          event: 'RETURNED',
          notes: dto.returnNotes || 'تم استلام الأصل وإعادته للمخزون',
          performedBy: actorId,
        },
      });

      if (record.employee?.email) {
        const user = await tx.user.findFirst({
          where: {
            organizationId,
            email: record.employee.email.trim().toLowerCase(),
          },
        });
        if (user) {
          await tx.notification.create({
            data: {
              organizationId,
              recipientId: user.id,
              type: 'CUSTODY',
              title: 'تم إرجاع العهدة بنجاح',
              message: `تم فحص واستلام الأصل (${record.asset?.name || ''}) وإخلاء طرفك من العهدة.`,
            },
          });
        }
      }

      return updatedRecord;
    });

    await this.audit.record({
      organizationId,
      actorId,
      action: 'RETURN_CUSTODY',
      resource: 'custody_record',
      resourceId: id,
      metadata: { returnNotes: dto.returnNotes },
    });

    return updated;
  }

  async findRequests(
    organizationId: string,
    userId: string,
    roles: string[],
    status?: CustodyRequestStatus,
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

    return this.prisma.custodyRequest.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
        ...(requesterIdFilter ? { requesterId: requesterIdFilter } : {}),
      },
      include: {
        requester: { include: { department: true } },
        asset: true,
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRequest(
    organizationId: string,
    userId: string,
    roles: string[],
    id: string,
  ) {
    const request = await this.prisma.custodyRequest.findFirst({
      where: { id, organizationId },
      include: {
        requester: { include: { department: true } },
        asset: true,
        approvedBy: { select: { id: true, name: true } },
      },
    });

    if (!request) {
      throw new NotFoundException('طلب العهدة غير موجود أو لا يتبع لهذه المنشأة.');
    }

    const isAdminOrManager = roles.some((r) =>
      ['ADMIN', 'ASSET_MANAGER', 'SUPER_ADMIN'].includes(r),
    );

    if (!isAdminOrManager) {
      const employee = await this.getEmployeeForUser(organizationId, userId);
      if (!employee || request.requesterId !== employee.id) {
        throw new ForbiddenException('غير مصرح لك بالاطلاع على هذا الطلب.');
      }
    }

    return request;
  }

  async createRequest(
    organizationId: string,
    userId: string,
    dto: CreateCustodyRequestDto,
  ) {
    const employee = await this.getEmployeeForUser(organizationId, userId);
    if (!employee) {
      throw new BadRequestException('لا يوجد ملف موظف مرتبط بحسابك في هذه المنشأة لتقديم طلب عهدة.');
    }

    if (dto.assetId) {
      const asset = await this.prisma.asset.findFirst({
        where: { id: dto.assetId, organizationId },
      });
      if (!asset) {
        throw new BadRequestException('الأصل المحدد غير صالح أو لا يتبع لهذه المنشأة.');
      }
    }

    return this.prisma.custodyRequest.create({
      data: {
        organizationId,
        requesterId: employee.id,
        assetId: dto.assetId || null,
        category: dto.category.trim(),
        reason: dto.reason.trim(),
        description: dto.description?.trim() || null,
        priority: dto.priority || 'NORMAL',
        status: CustodyRequestStatus.PENDING,
      },
      include: {
        requester: true,
        asset: true,
      },
    });
  }

  async adminApproveRequest(
    organizationId: string,
    id: string,
    approvedById: string,
  ) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const request = await tx.custodyRequest.findFirst({
        where: { id, organizationId },
        include: { requester: true },
      });

      if (!request) {
        throw new NotFoundException('طلب العهدة غير موجود.');
      }
      if (request.status !== CustodyRequestStatus.PENDING) {
        throw new BadRequestException('يمكن اعتماد الطلبات التي بانتظار الموافقة فقط.');
      }

      const res = await tx.custodyRequest.update({
        where: { id: request.id },
        data: {
          status: CustodyRequestStatus.APPROVED,
          approvedById,
          reviewedAt: new Date(),
        },
        include: { requester: true, asset: true },
      });

      const user = await tx.user.findFirst({
        where: {
          organizationId,
          email: request.requester.email.trim().toLowerCase(),
        },
      });
      if (user) {
        await tx.notification.create({
          data: {
            organizationId,
            recipientId: user.id,
            type: 'CUSTODY',
            title: 'تمت الموافقة على طلب العهدة',
            message: 'تم اعتماد طلبك وجاري إعداد الأصل للتسليم.',
          },
        });
      }

      return res;
    });

    await this.audit.record({
      organizationId,
      actorId: approvedById,
      action: 'APPROVE_REQUEST',
      resource: 'custody_request',
      resourceId: id,
    });

    return updated;
  }

  async adminRejectRequest(
    organizationId: string,
    id: string,
    approvedById: string,
    rejectionReason?: string,
  ) {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new BadRequestException('سبب الرفض حقل إجباري لتأكيد رفض طلب العهدة.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const request = await tx.custodyRequest.findFirst({
        where: { id, organizationId },
        include: { requester: true },
      });

      if (!request) {
        throw new NotFoundException('طلب العهدة غير موجود.');
      }
      if (request.status !== CustodyRequestStatus.PENDING) {
        throw new BadRequestException('يمكن رفض الطلبات التي بانتظار الموافقة فقط.');
      }

      const res = await tx.custodyRequest.update({
        where: { id: request.id },
        data: {
          status: CustodyRequestStatus.REJECTED,
          approvedById,
          rejectionReason: rejectionReason.trim(),
          reviewedAt: new Date(),
        },
        include: { requester: true },
      });

      const user = await tx.user.findFirst({
        where: {
          organizationId,
          email: request.requester.email.trim().toLowerCase(),
        },
      });
      if (user) {
        await tx.notification.create({
          data: {
            organizationId,
            recipientId: user.id,
            type: 'CUSTODY',
            title: 'تم رفض طلب العهدة',
            message: `تم رفض طلبك للسبب التالي: ${rejectionReason.trim()}`,
          },
        });
      }

      return res;
    });

    await this.audit.record({
      organizationId,
      actorId: approvedById,
      action: 'REJECT_REQUEST',
      resource: 'custody_request',
      resourceId: id,
      metadata: { reason: rejectionReason.trim() },
    });

    return updated;
  }

  async adminAssignRequest(
    organizationId: string,
    id: string,
    assetId: string,
    actorId: string,
    dueAtRaw?: string,
  ) {
    const dueAt = dueAtRaw
      ? new Date(dueAtRaw)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const result = await this.prisma.$transaction(async (tx) => {
      const request = await tx.custodyRequest.findFirst({
        where: { id, organizationId },
        include: { requester: true },
      });
      if (!request) {
        throw new NotFoundException('طلب العهدة غير موجود.');
      }
      if (
        request.status !== CustodyRequestStatus.APPROVED &&
        request.status !== CustodyRequestStatus.PENDING
      ) {
        throw new BadRequestException('يمكن تسليم أصل للطلبات المعتمدة أو قيد الانتظار فقط.');
      }

      const asset = await tx.asset.findFirst({
        where: { id: assetId, organizationId },
      });
      if (!asset) {
        throw new NotFoundException('الأصل المطلوب تسليمه غير موجود.');
      }
      if (asset.status !== AssetStatus.AVAILABLE) {
        throw new BadRequestException('الأصل المحدد غير متاح حالياً للتسليم.');
      }

      const activeExisting = await tx.custodyRecord.findFirst({
        where: { assetId, returnedAt: null },
      });
      if (activeExisting) {
        throw new BadRequestException('الأصل مسند مسبقاً لموظف آخر كعهدة نشطة.');
      }

      const record = await tx.custodyRecord.create({
        data: {
          organizationId,
          assetId,
          employeeId: request.requesterId,
          assignedAt: new Date(),
          dueAt,
          handoverNotes: `صرف بناء على الطلب رقم ${request.id.slice(0, 8)}`,
          status: CustodyStatus.ACTIVE,
        },
      });

      await tx.asset.update({
        where: { id: assetId },
        data: { status: AssetStatus.ACTIVE },
      });

      await tx.custodyRequest.update({
        where: { id: request.id },
        data: {
          status: CustodyRequestStatus.ASSIGNED,
          assetId,
          approvedById: actorId,
          reviewedAt: new Date(),
        },
      });

      await tx.custodyHistory.create({
        data: {
          custodyId: record.id,
          event: 'ASSIGNED',
          notes: `صرف بناء على اعتماد طلب عهدة`,
          performedBy: actorId,
        },
      });

      const user = await tx.user.findFirst({
        where: {
          organizationId,
          email: request.requester.email.trim().toLowerCase(),
        },
      });
      if (user) {
        await tx.notification.create({
          data: {
            organizationId,
            recipientId: user.id,
            type: 'CUSTODY',
            title: 'تم تسليم العهدة وتخصيص الأصل',
            message: `تم اعتماد طلبك وصرف الأصل (${asset.name}) كعهدة نشطة. تاريخ الاستحقاق: ${dueAt.toLocaleDateString('ar-SA')}.`,
          },
        });
      }

      return record;
    });

    await this.audit.record({
      organizationId,
      actorId,
      action: 'ASSIGN_REQUEST_CUSTODY',
      resource: 'custody_request',
      resourceId: id,
      metadata: { assetId },
    });

    return result;
  }

  async replyRequest(
    organizationId: string,
    userId: string,
    roles: string[],
    id: string,
    employeeReply: string,
  ) {
    const request = await this.findRequest(organizationId, userId, roles, id);
    if (
      request.status === CustodyRequestStatus.ASSIGNED ||
      request.status === CustodyRequestStatus.REJECTED
    ) {
      throw new BadRequestException('لا يمكن الرد أو التعديل على طلب عهدة مكتمل أو مرفوض.');
    }
    return this.prisma.custodyRequest.update({
      where: { id: request.id },
      data: {
        employeeReply: employeeReply.trim(),
        repliedAt: new Date(),
      },
    });
  }

  async deleteRequest(
    organizationId: string,
    userId: string,
    roles: string[],
    id: string,
  ) {
    const request = await this.findRequest(organizationId, userId, roles, id);
    if (request.status !== CustodyRequestStatus.PENDING) {
      throw new BadRequestException('لا يمكن حذف الطلب إلا إذا كان قيد الانتظار.');
    }
    return this.prisma.custodyRequest.delete({ where: { id: request.id } });
  }
}
