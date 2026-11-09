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
import { Roles } from '../auth/roles.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

type AuthRequest = Request & {
  user: {
    sub: string;
    email: string;
    organizationId: string;
    roles: string[];
    permissions?: string[];
  };
};

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.employees.findMe(req.user.organizationId, req.user.email);
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Get()
  findAll(
    @Req() req: AuthRequest,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.employees.findAll(req.user.organizationId, search, departmentId);
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.employees.findOne(req.user.organizationId, id);
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateEmployeeDto) {
    return this.employees.create(req.user.organizationId, dto, req.user.sub);
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employees.update(
      req.user.organizationId,
      id,
      dto,
      req.user.sub,
    );
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.employees.remove(req.user.organizationId, id, req.user.sub);
  }
}
