import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
type AuthRequest = Request & { user: { organizationId: string } };
@Roles('ADMIN') @Controller('roles')
export class RolesController { constructor(private readonly rolesService: RolesService) {} @Get() findAll(@Req() req: AuthRequest) { return this.rolesService.findAll(req.user.organizationId); } @Post() create(@Req() req: AuthRequest, @Body() dto: CreateRoleDto) { return this.rolesService.create(req.user.organizationId, dto); } @Patch(':id') update(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: UpdateRoleDto) { return this.rolesService.update(req.user.organizationId, id, dto); } @Patch(':id/permissions') updatePermissions(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: UpdateRolePermissionsDto) { return this.rolesService.updatePermissions(req.user.organizationId, id, dto.permissionIds); } @Delete(':id') remove(@Req() req: AuthRequest, @Param('id') id: string) { return this.rolesService.remove(req.user.organizationId, id); } }
