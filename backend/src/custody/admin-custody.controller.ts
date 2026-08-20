import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CustodyRequestStatus } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CustodyService } from './custody.service';

@Controller('custody/admin/requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ASSET_MANAGER')
export class AdminCustodyController {
  constructor(private readonly custody: CustodyService) {}

  @Get()
  findAll(@Query('organizationId') organizationId: string, @Query('status') status?: CustodyRequestStatus) {
    return this.custody.findRequests(organizationId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.custody.findRequest(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Req() request: Request & { user: { sub: string } }) {
    return this.custody.adminApproveRequest(id, request.user.sub);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Req() request: Request & { user: { sub: string } },
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.custody.adminRejectRequest(id, request.user.sub, rejectionReason);
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Req() request: Request & { user: { sub: string; organizationId: string } },
    @Body('assetId') assetId: string,
    @Body('dueAt') dueAt?: string,
    @Body('dueDate') dueDate?: string,
  ) {
    return this.custody.adminAssignRequest(
      id,
      assetId,
      request.user.sub,
      request.user.organizationId,
      dueAt || dueDate,
    );
  }
}
