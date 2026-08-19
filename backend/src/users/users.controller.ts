import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

type AuthRequest = Request & { user: { organizationId: string } };
@Roles('ADMIN')
@Controller('users')
export class UsersController { constructor(private readonly usersService: UsersService) {} @Get() findAll(@Req() req: AuthRequest, @Query('search') search?: string, @Query('roleId') roleId?: string, @Query('status') status?: UpdateStatusDto['status'], @Query('page') page?: string, @Query('limit') limit?: string) { return this.usersService.findAll(req.user.organizationId, { search, roleId, status, page: Number(page), limit: Number(limit) }); } @Get(':id') findOne(@Req() req: AuthRequest, @Param('id') id: string) { return this.usersService.findOne(req.user.organizationId, id); } @Post() create(@Req() req: AuthRequest, @Body() dto: CreateUserDto) { return this.usersService.create(req.user.organizationId, dto); } @Patch(':id') update(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: UpdateUserDto) { return this.usersService.update(req.user.organizationId, id, dto); } @Patch(':id/status') updateStatus(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: UpdateStatusDto) { return this.usersService.updateStatus(req.user.organizationId, id, dto.status); } @Delete(':id') remove(@Req() req: AuthRequest, @Param('id') id: string) { return this.usersService.softDelete(req.user.organizationId, id); } }
