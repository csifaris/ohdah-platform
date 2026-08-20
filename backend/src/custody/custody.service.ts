import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssetStatus, CustodyRequestStatus, CustodyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustodyRecordDto } from './dto/create-custody-record.dto';
import { CreateCustodyRequestDto } from './dto/create-custody-request.dto';
import { ReturnCustodyDto } from './dto/return-custody.dto';

@Injectable()
export class CustodyService {
  constructor(private readonly prisma: PrismaService) {}

  findRecords(organizationId?: string, status?: CustodyStatus) {
    return this.prisma.custodyRecord.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        asset: true,
        employee: { include: { department: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRecord(id: string) {
    const record = await this.prisma.custodyRecord.findUnique({
      where: { id },
      include: {
        asset: true,
        employee: { include: { department: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!record) throw new NotFoundException('سجل العهدة غير موجود');
    return record;
  }

  async assign(dto: CreateCustodyRecordDto) {
    const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset) {
      throw new NotFoundException('الأصل غير موجود.');
    }
    if (asset.status !== AssetStatus.AVAILABLE) {
      throw new BadRequestException('لا يمكن تسليم العهدة: الأصل غير متاح حالياً للتسليم.');
    }

    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) {
      throw new NotFoundException('الموظف غير موجود.');
    }

    const organizationId = dto.organizationId || asset.organizationId;
    const rawDue = dto.dueAt || dto.dueDate;
    const dueAt = rawDue ? new Date(rawDue) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const assignedAt = dto.assignedAt ? new Date(dto.assignedAt) : new Date();

    const result = await this.prisma.$transaction(async (tx) => {
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
        },
      });

      return tx.custodyRecord.findUnique({
        where: { id: record.id },
        include: { asset: true, employee: true, history: true },
      });
    });

    // Notify employee
    const user = await this.prisma.user.findFirst({
      where: { organizationId, email: employee.email.trim().toLowerCase() },
    });
    if (user) {
      await this.prisma.notification.create({
        data: {
          organizationId,
          recipientId: user.id,
          type: 'CUSTODY',
          title: 'تم تسليم العهدة وتخصيص الأصل',
          message: `تم تسليمك الأصل (${asset.name}) وتاريخ الاستحقاق: ${dueAt.toLocaleDateString('ar-SA')}.`,
        },
      });
    }

    return result;
  }

  async returnRecord(id: string, dto: ReturnCustodyDto) {
    const record = await this.findRecord(id);
    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.custodyRecord.update({
        where: { id: record.id },
        data: {
          status: CustodyStatus.RETURNED,
          returnedAt: new Date(),
          returnNotes: dto.returnNotes,
        },
      });

      await tx.asset.update({
        where: { id: record.assetId },
        data: { status: AssetStatus.AVAILABLE },
      });

      await tx.custodyHistory.create({
        data: {
          custodyId: record.id,
          event: 'RETURNED',
          notes: dto.returnNotes || 'تم استلام الأصل وإعادته للمخزون',
        },
      });

      return updatedRecord;
    });

    if (record.employee?.email) {
      const user = await this.prisma.user.findFirst({
        where: { organizationId: record.organizationId, email: record.employee.email.trim().toLowerCase() },
      });
      if (user) {
        await this.prisma.notification.create({
          data: {
            organizationId: record.organizationId,
            recipientId: user.id,
            type: 'CUSTODY',
            title: 'تم إرجاع العهدة بنجاح',
            message: `تم فحص واستلام الأصل (${record.asset?.name || ''}) وإخلاء طرفك من العهدة.`,
          },
        });
      }
    }

    return updated;
  }

  findRequests(organizationId?: string, status?: CustodyRequestStatus) {
    return this.prisma.custodyRequest.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        requester: { include: { department: true } },
        asset: true,
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRequest(id: string) {
    const request = await this.prisma.custodyRequest.findUnique({
      where: { id },
      include: {
        requester: { include: { department: true } },
        asset: true,
        approvedBy: { select: { id: true, name: true } },
      },
    });
    if (!request) throw new NotFoundException('طلب العهدة غير موجود');
    return request;
  }

  async createRequest(dto: CreateCustodyRequestDto) {
    return this.prisma.custodyRequest.create({ data: dto });
  }

  async approveRequest(id: string, approvedById: string) {
    return this.adminApproveRequest(id, approvedById);
  }

  async rejectRequest(id: string, approvedById: string, rejectionReason?: string) {
    return this.adminRejectRequest(id, approvedById, rejectionReason);
  }

  async replyRequest(id: string, employeeReply: string) {
    await this.ensureRequest(id);
    return this.prisma.custodyRequest.update({
      where: { id },
      data: { employeeReply, repliedAt: new Date() },
    });
  }

  async adminApproveRequest(id: string, approvedById: string) {
    const request = await this.findRequest(id);
    if (request.status !== CustodyRequestStatus.PENDING) {
      throw new BadRequestException('يمكن اعتماد الطلبات التي بانتظار الموافقة فقط');
    }

    const updated = await this.prisma.custodyRequest.update({
      where: { id },
      data: {
        status: CustodyRequestStatus.APPROVED,
        approvedById,
        reviewedAt: new Date(),
      },
      include: { requester: true },
    });

    const user = await this.prisma.user.findFirst({
      where: { organizationId: request.organizationId, email: request.requester.email.trim().toLowerCase() },
    });
    if (user) {
      await this.prisma.notification.create({
        data: {
          organizationId: request.organizationId,
          recipientId: user.id,
          type: 'CUSTODY',
          title: 'تمت الموافقة على طلب العهدة',
          message: 'تم اعتماد طلبك وجاري إعداد الأصل للتسليم.',
        },
      });
    }
    return updated;
  }

  async adminRejectRequest(id: string, approvedById: string, rejectionReason?: string) {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new BadRequestException('سبب الرفض حقل إجباري لتأكيد رفض طلب العهدة.');
    }
    const request = await this.findRequest(id);
    if (request.status !== CustodyRequestStatus.PENDING) {
      throw new BadRequestException('يمكن رفض الطلبات التي بانتظار الموافقة فقط');
    }

    const trimmedReason = rejectionReason.trim();
    const updated = await this.prisma.custodyRequest.update({
      where: { id },
      data: {
        status: CustodyRequestStatus.REJECTED,
        approvedById,
        reviewedAt: new Date(),
        rejectionReason: trimmedReason,
      },
      include: { requester: true },
    });

    const user = await this.prisma.user.findFirst({
      where: { organizationId: request.organizationId, email: request.requester.email.trim().toLowerCase() },
    });
    if (user) {
      await this.prisma.notification.create({
        data: {
          organizationId: request.organizationId,
          recipientId: user.id,
          type: 'CUSTODY',
          title: `تم رفض طلب العهدة رقم REQ-${request.id.slice(0, 5).toUpperCase()}`,
          message: `تم رفض طلبك بسبب: ${trimmedReason}`,
        },
      });
    }
    return updated;
  }

  async adminAssignRequest(
    id: string,
    assetId: string,
    approvedById: string,
    organizationId?: string,
    rawDueAt?: string | Date,
  ) {
    const request = await this.findRequest(id);
    if (request.status !== CustodyRequestStatus.APPROVED && request.status !== CustodyRequestStatus.PENDING) {
      throw new BadRequestException('يمكن تخصيص الأصل للطلبات المعتمدة أو قيد الانتظار فقط');
    }

    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.status !== AssetStatus.AVAILABLE) {
      throw new BadRequestException('الأصل غير متاح حالياً للتخصيص');
    }

    const orgId = organizationId || request.organizationId;
    const dueAt = rawDueAt ? new Date(rawDueAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const assignedAt = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      const record = await tx.custodyRecord.create({
        data: {
          organizationId: orgId,
          assetId,
          employeeId: request.requesterId,
          status: CustodyStatus.ACTIVE,
          assignedAt,
          dueAt,
        },
      });

      await tx.asset.update({
        where: { id: assetId },
        data: { status: AssetStatus.ACTIVE },
      });

      const updatedRequest = await tx.custodyRequest.update({
        where: { id },
        data: {
          status: CustodyRequestStatus.ASSIGNED,
          assetId,
          approvedById,
          reviewedAt: new Date(),
        },
        include: { requester: true },
      });

      await tx.custodyHistory.create({
        data: {
          custodyId: record.id,
          event: 'ASSIGNED',
          notes: `تم التخصيص بناءً على طلب عهدة (${asset.name})`,
        },
      });

      return updatedRequest;
    });

    const user = await this.prisma.user.findFirst({
      where: { organizationId: orgId, email: request.requester.email.trim().toLowerCase() },
    });
    if (user) {
      await this.prisma.notification.create({
        data: {
          organizationId: orgId,
          recipientId: user.id,
          type: 'CUSTODY',
          title: 'تم تسليم العهدة وتخصيص الأصل',
          message: `تم اعتماد طلبك وصرف الأصل (${asset.name}) كعهدة نشطة. تاريخ الاستحقاق: ${dueAt.toLocaleDateString('ar-SA')}.`,
        },
      });
    }

    return result;
  }

  private async ensureRequest(id: string) {
    if (!(await this.prisma.custodyRequest.findUnique({ where: { id }, select: { id: true } }))) {
      throw new NotFoundException('طلب العهدة غير موجود');
    }
  }

  async deleteRequest(id: string) {
    const request = await this.prisma.custodyRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('الطلب غير موجود');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('لا يمكن حذف الطلب إلا إذا كان قيد الانتظار');
    }
    return this.prisma.custodyRequest.delete({ where: { id } });
  }
}
