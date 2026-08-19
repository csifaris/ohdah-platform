import { Injectable, NotFoundException } from '@nestjs/common';
import { AssetStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateAssetDto) { return this.prisma.asset.create({ data: { ...dto, status: dto.status ?? AssetStatus.AVAILABLE, purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined, warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd) : undefined, purchaseCost: dto.purchaseCost, currentValue: dto.currentValue } }); }
  findAll(organizationId: string, search?: string, status?: AssetStatus) { return this.prisma.asset.findMany({ where: { organizationId, status, ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { assetNumber: { contains: search, mode: 'insensitive' } }, { serialNumber: { contains: search, mode: 'insensitive' } }] } : {}) }, include: { category: true }, orderBy: { createdAt: 'desc' } }); }
  async findOne(id: string) { const asset = await this.prisma.asset.findUnique({ where: { id }, include: { category: true, custodyRecords: { orderBy: { createdAt: 'desc' }, take: 10 }, maintenanceRequests: { orderBy: { createdAt: 'desc' }, take: 10 } } }); if (!asset) throw new NotFoundException('Asset not found'); return asset; }
  async update(id: string, dto: UpdateAssetDto) { await this.ensureExists(id); return this.prisma.asset.update({ where: { id }, data: { ...dto, purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined, warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd) : undefined } }); }
  async updateStatus(id: string, status: AssetStatus) { await this.ensureExists(id); return this.prisma.asset.update({ where: { id }, data: { status } }); }
  async remove(id: string) { await this.ensureExists(id); return this.prisma.asset.delete({ where: { id } }); }
  createCategory(dto: CreateAssetCategoryDto) { return this.prisma.assetCategory.create({ data: dto }); }
  findCategories(organizationId: string) { return this.prisma.assetCategory.findMany({ where: { organizationId }, orderBy: { name: 'asc' } }); }
  private async ensureExists(id: string) { if (!(await this.prisma.asset.findUnique({ where: { id }, select: { id: true } }))) throw new NotFoundException('Asset not found'); }
}
