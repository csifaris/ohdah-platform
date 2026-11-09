import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AssetStatus } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { AssetsService } from './assets.service';
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

type AuthRequest = Request & {
  user: {
    sub: string;
    organizationId: string;
    roles: string[];
    permissions?: string[];
  };
};

@Controller('assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateAssetDto) {
    return this.assets.create(req.user.organizationId, dto, req.user.sub);
  }

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Get()
  findAll(
    @Req() req: AuthRequest,
    @Query('search') search?: string,
    @Query('status') status?: AssetStatus,
    @Query('category') category?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.assets.findAll(
      req.user.organizationId,
      search,
      status,
      category || categoryId,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Get('categories')
  categories(@Req() req: AuthRequest) {
    return this.assets.findCategories(req.user.organizationId);
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Post('categories')
  createCategory(
    @Req() req: AuthRequest,
    @Body() dto: CreateAssetCategoryDto,
  ) {
    return this.assets.createCategory(
      req.user.organizationId,
      dto,
      req.user.sub,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.assets.findOne(req.user.organizationId, id);
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assets.update(req.user.organizationId, id, dto, req.user.sub);
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Patch(':id/status')
  updateStatus(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body('status') status: AssetStatus,
  ) {
    return this.assets.updateStatus(
      req.user.organizationId,
      id,
      status,
      req.user.sub,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.assets.remove(req.user.organizationId, id, req.user.sub);
  }
}
