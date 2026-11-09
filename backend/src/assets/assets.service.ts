import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, dto: CreateAssetDto, actorId?: string) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('اسم الأصل مطلوب.');
    }
    if (!dto.assetNumber || !dto.assetNumber.trim()) {
      throw new BadRequestException('كود الأصل مطلوب.');
    }
    if (!dto.serialNumber || !dto.serialNumber.trim()) {
      throw new BadRequestException('الرقم التسلسلي مطلوب.');
    }

    let categoryId = dto.categoryId;
    if (!categoryId && dto.category) {
      let cat = await this.prisma.assetCategory.findFirst({
        where: { organizationId, name: dto.category.trim() },
      });
      if (!cat) {
        cat = await this.prisma.assetCategory.create({
          data: { organizationId, name: dto.category.trim() },
        });
      }
      categoryId = cat.id;
    } else if (categoryId) {
      const cat = await this.prisma.assetCategory.findFirst({
        where: { id: categoryId, organizationId },
      });
      if (!cat) {
        throw new BadRequestException('التصنيف المحدد غير صالح أو لا يتبع لهذه المنشأة.');
      }
    } else {
      let firstCat = await this.prisma.assetCategory.findFirst({
        where: { organizationId },
      });
      if (!firstCat) {
        firstCat = await this.prisma.assetCategory.create({
          data: { organizationId, name: 'أجهزة عامة' },
        });
      }
      categoryId = firstCat.id;
    }

    const extraDetails: string[] = [];
    if (dto.manufacturer) extraDetails.push(`الشركة المصنعة: ${dto.manufacturer}`);
    if (dto.department) extraDetails.push(`القسم: ${dto.department}`);
    if (dto.notes) extraDetails.push(dto.notes);
    if (dto.description && !extraDetails.includes(dto.description)) extraDetails.unshift(dto.description);

    const description = extraDetails.length > 0 ? extraDetails.join(' | ') : null;

    try {
      const asset = await this.prisma.asset.create({
        data: {
          organizationId,
          categoryId,
          assetNumber: dto.assetNumber.trim(),
          name: dto.name.trim(),
          serialNumber: dto.serialNumber?.trim() || null,
          description,
          status: dto.status ?? AssetStatus.AVAILABLE,
          condition: dto.condition || null,
          location: dto.location || null,
          currency: dto.currency || 'SAR',
          purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
          purchaseCost: dto.purchaseCost ?? null,
          currentValue: dto.currentValue ?? null,
          warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd) : null,
          image: dto.image || null,
        },
        include: { category: true },
      });

      await this.audit.record({
        organizationId,
        actorId,
        action: 'CREATE',
        resource: 'asset',
        resourceId: asset.id,
        metadata: { assetNumber: asset.assetNumber, name: asset.name },
      });

      return asset;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === 'P2002') {
        throw new BadRequestException('كود الأصل أو الرقم التسلسلي مستخدم مسبقاً.');
      }
      throw new BadRequestException(error?.message || 'تعذر إضافة الأصل في قاعدة البيانات.');
    }
  }

  async findAll(organizationId: string, search?: string, status?: AssetStatus, category?: string) {
    return this.prisma.asset.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
        ...(category ? { OR: [{ categoryId: category }, { category: { name: category } }] } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { assetNumber: { contains: search, mode: 'insensitive' } },
                { serialNumber: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        custodyRecords: {
          where: { returnedAt: null },
          include: { employee: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCategories(organizationId: string) {
    return this.prisma.assetCategory.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(organizationId: string, dto: CreateAssetCategoryDto, actorId?: string) {
    const existing = await this.prisma.assetCategory.findFirst({
      where: { organizationId, name: dto.name.trim() },
    });
    if (existing) {
      throw new BadRequestException('اسم التصنيف مستخدم مسبقاً.');
    }

    const cat = await this.prisma.assetCategory.create({
      data: {
        organizationId,
        name: dto.name.trim(),
        code: dto.code?.trim() || null,
        description: dto.description?.trim() || null,
      },
    });

    await this.audit.record({
      organizationId,
      actorId,
      action: 'CREATE',
      resource: 'asset_category',
      resourceId: cat.id,
      metadata: { name: cat.name },
    });

    return cat;
  }

  async findOne(organizationId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, organizationId },
      include: {
        category: true,
        custodyRecords: {
          include: { employee: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        maintenanceRequests: {
          include: { requestedBy: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!asset) throw new NotFoundException('الأصل غير موجود أو لا يتبع لهذه المنشأة.');
    return asset;
  }

  async update(organizationId: string, id: string, dto: UpdateAssetDto, actorId?: string) {
    const existing = await this.findOne(organizationId, id);

    let categoryId = dto.categoryId;
    if (!categoryId && dto.category) {
      let cat = await this.prisma.assetCategory.findFirst({
        where: { organizationId, name: dto.category.trim() },
      });
      if (!cat) {
        cat = await this.prisma.assetCategory.create({
          data: { organizationId, name: dto.category.trim() },
        });
      }
      categoryId = cat.id;
    } else if (categoryId) {
      const cat = await this.prisma.assetCategory.findFirst({
        where: { id: categoryId, organizationId },
      });
      if (!cat) {
        throw new BadRequestException('التصنيف المحدد غير صالح أو لا يتبع لهذه المنشأة.');
      }
    }

    const extraDetails: string[] = [];
    if (dto.manufacturer) extraDetails.push(`الشركة المصنعة: ${dto.manufacturer}`);
    if (dto.department) extraDetails.push(`القسم: ${dto.department}`);
    if (dto.notes) extraDetails.push(dto.notes);
    if (dto.description && !extraDetails.includes(dto.description)) extraDetails.unshift(dto.description);

    const description = extraDetails.length > 0 ? extraDetails.join(' | ') : undefined;

    try {
      const updated = await this.prisma.asset.update({
        where: { id: existing.id },
        data: {
          ...(categoryId ? { categoryId } : {}),
          ...(dto.assetNumber ? { assetNumber: dto.assetNumber.trim() } : {}),
          ...(dto.name ? { name: dto.name.trim() } : {}),
          ...(dto.serialNumber !== undefined ? { serialNumber: dto.serialNumber?.trim() || null } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.condition !== undefined ? { condition: dto.condition } : {}),
          ...(dto.location !== undefined ? { location: dto.location } : {}),
          ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
          ...(dto.purchaseDate !== undefined ? { purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null } : {}),
          ...(dto.purchaseCost !== undefined ? { purchaseCost: dto.purchaseCost } : {}),
          ...(dto.currentValue !== undefined ? { currentValue: dto.currentValue } : {}),
          ...(dto.warrantyEnd !== undefined ? { warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd) : null } : {}),
          ...(dto.image !== undefined ? { image: dto.image } : {}),
        },
        include: { category: true },
      });

      await this.audit.record({
        organizationId,
        actorId,
        action: 'UPDATE',
        resource: 'asset',
        resourceId: id,
        metadata: { changes: Object.keys(dto) },
      });

      return updated;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === 'P2002') {
        throw new BadRequestException('كود الأصل أو الرقم التسلسلي مستخدم مسبقاً.');
      }
      throw new BadRequestException(error?.message || 'تعذر تعديل الأصل في قاعدة البيانات.');
    }
  }

  async updateStatus(organizationId: string, id: string, status: AssetStatus, actorId?: string) {
    const asset = await this.findOne(organizationId, id);
    const updated = await this.prisma.asset.update({
      where: { id: asset.id },
      data: { status },
      include: { category: true },
    });

    await this.audit.record({
      organizationId,
      actorId,
      action: 'UPDATE_STATUS',
      resource: 'asset',
      resourceId: id,
      metadata: { oldStatus: asset.status, newStatus: status },
    });

    return updated;
  }

  async remove(organizationId: string, id: string, actorId?: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, organizationId },
      include: {
        custodyRecords: {
          where: { returnedAt: null },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('الأصل غير موجود أو لا يتبع لهذه المنشأة.');
    }

    if (asset.custodyRecords.length > 0) {
      throw new BadRequestException('لا يمكن حذف أصل مرتبط بعهدة نشطة لموظف.');
    }

    await this.audit.record({
      organizationId,
      actorId,
      action: 'DELETE',
      resource: 'asset',
      resourceId: id,
      metadata: { assetNumber: asset.assetNumber, name: asset.name },
    });

    return this.prisma.asset.delete({ where: { id: asset.id } });
  }
}
