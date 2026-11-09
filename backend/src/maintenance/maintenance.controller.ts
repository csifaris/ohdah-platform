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
import { MaintenanceStatus } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';

type AuthRequest = Request & {
  user: {
    sub: string;
    email: string;
    organizationId: string;
    roles: string[];
    permissions?: string[];
  };
};

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenance: MaintenanceService) {}

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Get()
  findAll(
    @Req() req: AuthRequest,
    @Query('status') status?: MaintenanceStatus,
  ) {
    return this.maintenance.findAll(
      req.user.organizationId,
      req.user.sub,
      req.user.roles,
      status,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() dto: CreateMaintenanceRequestDto,
  ) {
    return this.maintenance.create(
      req.user.organizationId,
      req.user.sub,
      req.user.roles,
      dto,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.maintenance.findOne(
      req.user.organizationId,
      req.user.sub,
      req.user.roles,
      id,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceRequestDto,
  ) {
    return this.maintenance.update(
      req.user.organizationId,
      id,
      dto,
      req.user.sub,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.maintenance.remove(req.user.organizationId, id, req.user.sub);
  }
}
