import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MaintenanceStatus } from '@prisma/client';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
@Controller('maintenance')
export class MaintenanceController { constructor(private readonly maintenance: MaintenanceService) {} @Get() findAll(@Query('organizationId') organizationId: string, @Query('status') status?: MaintenanceStatus) { return this.maintenance.findAll(organizationId, status); } @Post() create(@Body() dto: CreateMaintenanceRequestDto) { return this.maintenance.create(dto); } @Get(':id') findOne(@Param('id') id: string) { return this.maintenance.findOne(id); } @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateMaintenanceRequestDto) { return this.maintenance.update(id, dto); } }
