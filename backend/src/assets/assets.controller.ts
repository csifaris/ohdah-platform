import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AssetStatus } from '@prisma/client';
import { AssetsService } from './assets.service';
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}
  @Post() create(@Body() dto: CreateAssetDto) { return this.assets.create(dto); }
  @Get() findAll(@Query('organizationId') organizationId: string, @Query('search') search?: string, @Query('status') status?: AssetStatus) { return this.assets.findAll(organizationId, search, status); }
  @Get('categories') categories(@Query('organizationId') organizationId: string) { return this.assets.findCategories(organizationId); }
  @Post('categories') createCategory(@Body() dto: CreateAssetCategoryDto) { return this.assets.createCategory(dto); }
  @Get(':id') findOne(@Param('id') id: string) { return this.assets.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateAssetDto) { return this.assets.update(id, dto); }
  @Patch(':id/status') updateStatus(@Param('id') id: string, @Body('status') status: AssetStatus) { return this.assets.updateStatus(id, status); }
  @Delete(':id') remove(@Param('id') id: string) { return this.assets.remove(id); }
}
