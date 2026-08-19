import { Injectable, NotFoundException } from '@nestjs/common';
import { AssetStatus, CustodyRequestStatus, CustodyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustodyRecordDto } from './dto/create-custody-record.dto';
import { CreateCustodyRequestDto } from './dto/create-custody-request.dto';
import { ReturnCustodyDto } from './dto/return-custody.dto';

@Injectable()
export class CustodyService {
  constructor(private readonly prisma: PrismaService) {}
  findRecords(organizationId: string, status?: CustodyStatus) { return this.prisma.custodyRecord.findMany({ where: { organizationId, status }, include: { asset: true, employee: { include: { department: true } }, history: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } }); }
  async findRecord(id: string) { const record = await this.prisma.custodyRecord.findUnique({ where: { id }, include: { asset: true, employee: { include: { department: true } }, history: { orderBy: { createdAt: 'desc' } } } }); if (!record) throw new NotFoundException('Custody record not found'); return record; }
  async assign(dto: CreateCustodyRecordDto) { return this.prisma.$transaction(async (tx) => { const record = await tx.custodyRecord.create({ data: { organizationId: dto.organizationId, assetId: dto.assetId, employeeId: dto.employeeId, dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined, handoverNotes: dto.handoverNotes, status: CustodyStatus.ACTIVE } }); await tx.asset.update({ where: { id: dto.assetId }, data: { status: AssetStatus.ACTIVE } }); await tx.custodyHistory.create({ data: { custodyId: record.id, event: 'ASSIGNED', notes: dto.handoverNotes } }); return tx.custodyRecord.findUnique({ where: { id: record.id }, include: { asset: true, employee: true, history: true } }); }); }
  async returnRecord(id: string, dto: ReturnCustodyDto) { const record = await this.findRecord(id); return this.prisma.$transaction(async (tx) => { const updated = await tx.custodyRecord.update({ where: { id: record.id }, data: { status: CustodyStatus.RETURNED, returnedAt: new Date(), returnNotes: dto.returnNotes } }); await tx.asset.update({ where: { id: record.assetId }, data: { status: AssetStatus.AVAILABLE } }); await tx.custodyHistory.create({ data: { custodyId: record.id, event: 'RETURNED', notes: dto.returnNotes } }); return updated; }); }
  findRequests(organizationId: string, status?: CustodyRequestStatus) { return this.prisma.custodyRequest.findMany({ where: { organizationId, status }, include: { requester: true, asset: true, approvedBy: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } }); }
  createRequest(dto: CreateCustodyRequestDto) { return this.prisma.custodyRequest.create({ data: dto }); }
  async approveRequest(id: string, approvedById: string) { await this.ensureRequest(id); return this.prisma.custodyRequest.update({ where: { id }, data: { status: CustodyRequestStatus.APPROVED, approvedById, reviewedAt: new Date() } }); }
  async rejectRequest(id: string, approvedById: string) { await this.ensureRequest(id); return this.prisma.custodyRequest.update({ where: { id }, data: { status: CustodyRequestStatus.REJECTED, approvedById, reviewedAt: new Date() } }); }
  private async ensureRequest(id: string) { if (!(await this.prisma.custodyRequest.findUnique({ where: { id }, select: { id: true } }))) throw new NotFoundException('Custody request not found'); }
}
