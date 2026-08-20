import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { MaintenanceStatus } from '@prisma/client';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
import { Roles } from '../auth/roles.decorator';

@Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenance: MaintenanceService) {}

  @Get()
  findAll(
    @Req() req: Request & { user?: { organizationId?: string } },
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: MaintenanceStatus,
  ) {
    const effectiveOrgId = organizationId || req.user?.organizationId;
    return this.maintenance.findAll(effectiveOrgId, status);
  }

  @Post()
  create(
    @Req() req: Request & { user?: { organizationId?: string } },
    @Body() dto: CreateMaintenanceRequestDto,
  ) {
    if (!dto.organizationId && req.user?.organizationId) {
      dto.organizationId = req.user.organizationId;
    }
    return this.maintenance.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenance.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaintenanceRequestDto) {
    return this.maintenance.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenance.remove(id);
  }
}
