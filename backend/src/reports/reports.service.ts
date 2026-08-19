import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}
  async summary(organizationId: string) { const [assets, employees, custody, maintenance] = await Promise.all([this.prisma.asset.groupBy({ by: ['status'], where: { organizationId }, _count: true }), this.prisma.employee.count({ where: { organizationId } }), this.prisma.custodyRecord.groupBy({ by: ['status'], where: { organizationId }, _count: true }), this.prisma.maintenanceRequest.groupBy({ by: ['status'], where: { organizationId }, _count: true })]); return { organizationId, assets, employees, custody, maintenance, generatedAt: new Date().toISOString() }; }
  async maintenance(organizationId: string) { return this.prisma.maintenanceRequest.groupBy({ by: ['status'], where: { organizationId }, _count: true, _sum: { cost: true } }); }
}
