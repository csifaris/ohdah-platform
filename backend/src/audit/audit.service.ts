import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  record(input: { organizationId: string; actorId?: string; action: string; resource: string; resourceId?: string; metadata?: unknown }) { return this.prisma.auditLog.create({ data: { organizationId: input.organizationId, actorId: input.actorId, action: input.action, resource: input.resource, resourceId: input.resourceId, metadata: input.metadata as object | undefined } }); }
  findAll(organizationId: string, resource?: string) { return this.prisma.auditLog.findMany({ where: { organizationId, resource }, orderBy: { createdAt: 'desc' }, take: 100 }); }
}
