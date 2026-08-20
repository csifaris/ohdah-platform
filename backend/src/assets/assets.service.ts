import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssetStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssetDto) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('اسم الأصل مطلوب.');
    }
    if (!dto.assetNumber || !dto.assetNumber.trim()) {
      throw new BadRequestException('كود الأصل مطلوب.');
    }
    if (!dto.serialNumber || !dto.serialNumber.trim()) {
      throw new BadRequestException('الرقم التسلسلي مطلوب.');
    }

    let organizationId = dto.organizationId;
    if (!organizationId) {
      const defaultOrg = await this.prisma.organization.findFirst();
      if (!defaultOrg) throw new BadRequestException('المؤسسة غير موجودة.');
      organizationId = defaultOrg.id;
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
    } else if (!categoryId) {
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
      return await this.prisma.asset.create({
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
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('كود الأصل أو الرقم التسلسلي مستخدم مسبقاً.');
      }
      throw new BadRequestException(err?.message || 'تعذر إضافة الأصل في قاعدة البيانات.');
    }
  }

  async findAll(organizationId?: string, search?: string, status?: AssetStatus, category?: string) {
    let orgId = organizationId;
    if (!orgId) {
      const defaultOrg = await this.prisma.organization.findFirst();
      orgId = defaultOrg?.id;
    }

    return this.prisma.asset.findMany({
      where: {
        ...(orgId ? { organizationId: orgId } : {}),
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

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
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
    if (!asset) throw new NotFoundException('الأصل غير موجود.');
    return asset;
  }

  async update(id: string, dto: UpdateAssetDto) {
    await this.ensureExists(id);
    let categoryId = dto.categoryId;
    if (!categoryId && dto.category) {
      const asset = await this.prisma.asset.findUnique({ where: { id } });
      if (asset) {
        let cat = await this.prisma.assetCategory.findFirst({
          where: { organizationId: asset.organizationId, name: dto.category.trim() },
        });
        if (!cat) {
          cat = await this.prisma.assetCategory.create({
            data: { organizationId: asset.organizationId, name: dto.category.trim() },
          });
        }
        categoryId = cat.id;
      }
    }

    const extraDetails: string[] = [];
    if (dto.manufacturer) extraDetails.push(`الشركة المصنعة: ${dto.manufacturer}`);
    if (dto.department) extraDetails.push(`القسم: ${dto.department}`);
    if (dto.notes) extraDetails.push(dto.notes);
    if (dto.description && !extraDetails.includes(dto.description)) extraDetails.unshift(dto.description);

    const description = extraDetails.length > 0 ? extraDetails.join(' | ') : undefined;

    try {
      return await this.prisma.asset.update({
        where: { id },
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
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('كود الأصل أو الرقم التسلسلي مستخدم مسبقاً.');
      }
      throw new BadRequestException(err?.message || 'تعذر تعديل الأصل في قاعدة البيانات.');
    }
  }

  async updateStatus(id: string, status: AssetStatus) {
    await this.ensureExists(id);
    return this.prisma.asset.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        custodyRecords: {
          where: { returnedAt: null },
        },
      },
    });
    if (!asset) {
      throw new NotFoundException('الأصل غير موجود.');
    }
    if (asset.status === AssetStatus.ACTIVE || asset.custodyRecords.length > 0) {
      throw new BadRequestException('لا يمكن حذف أصل مسلّم كعهدة نشطة حالياً. يرجى استرجاع العهدة أولاً.');
    }
    return this.prisma.asset.delete({ where: { id } });
  }

  createCategory(dto: CreateAssetCategoryDto) {
    return this.prisma.assetCategory.create({ data: dto });
  }

  async findCategories(organizationId?: string) {
    let orgId = organizationId;
    if (!orgId) {
      const defaultOrg = await this.prisma.organization.findFirst();
      orgId = defaultOrg?.id;
    }
    return this.prisma.assetCategory.findMany({
      where: { ...(orgId ? { organizationId: orgId } : {}) },
      orderBy: { name: 'asc' },
    });
  }

  private async ensureExists(id: string) {
    if (!(await this.prisma.asset.findUnique({ where: { id }, select: { id: true } }))) {
      throw new NotFoundException('الأصل غير موجود.');
    }
  }
}
