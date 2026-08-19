import { Injectable, NotFoundException } from '@nestjs/common';
import { AssetStatus, MaintenanceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
import { AuditService } from '../audit/audit.service';
@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  findAll(organizationId: string, status?: MaintenanceStatus) { return this.prisma.maintenanceRequest.findMany({ where: { organizationId, status }, include: { asset: true, requestedBy: true }, orderBy: { createdAt: 'desc' } }); }
  async findOne(id: string) { const request = await this.prisma.maintenanceRequest.findUnique({ where: { id }, include: { asset: true, requestedBy: true } }); if (!request) throw new NotFoundException('Maintenance request not found'); return request; }
  async create(dto: CreateMaintenanceRequestDto) { const request = await this.prisma.maintenanceRequest.create({ data: dto }); await this.prisma.asset.update({ where: { id: dto.assetId }, data: { status: AssetStatus.MAINTENANCE } }); await this.audit.record({ organizationId: dto.organizationId, action: 'CREATE', resource: 'maintenance', resourceId: request.id, metadata: { assetId: dto.assetId } }); return request; }
  async update(id: string, dto: UpdateMaintenanceRequestDto) { const existing = await this.findOne(id); const updated = await this.prisma.maintenanceRequest.update({ where: { id }, data: { ...dto, resolvedAt: dto.status === MaintenanceStatus.COMPLETED ? new Date() : undefined } }); if (dto.status === MaintenanceStatus.COMPLETED || dto.status === MaintenanceStatus.CANCELLED) await this.prisma.asset.update({ where: { id: updated.assetId }, data: { status: AssetStatus.AVAILABLE } }); await this.audit.record({ organizationId: existing.organizationId, action: 'UPDATE', resource: 'maintenance', resourceId: id, metadata: { status: dto.status } }); return updated; }
}
