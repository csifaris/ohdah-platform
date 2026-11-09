import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CustodyRequestStatus } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CustodyService } from './custody.service';

type AuthRequest = Request & {
  user: {
    sub: string;
    organizationId: string;
    roles: string[];
    permissions?: string[];
  };
};

@Controller('custody/admin/requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ASSET_MANAGER')
export class AdminCustodyController {
  constructor(private readonly custody: CustodyService) {}

  @Get()
  findAll(
    @Req() req: AuthRequest,
    @Query('status') status?: CustodyRequestStatus,
  ) {
    return this.custody.findRequests(
      req.user.organizationId,
      req.user.sub,
      req.user.roles,
      status,
    );
  }

  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.custody.findRequest(
      req.user.organizationId,
      req.user.sub,
      req.user.roles,
      id,
    );
  }

  @Patch(':id/approve')
  approve(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.custody.adminApproveRequest(
      req.user.organizationId,
      id,
      req.user.sub,
    );
  }

  @Patch(':id/reject')
  reject(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.custody.adminRejectRequest(
      req.user.organizationId,
      id,
      req.user.sub,
      rejectionReason,
    );
  }

  @Patch(':id/assign')
  assign(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body('assetId') assetId: string,
    @Body('dueAt') dueAt?: string,
    @Body('dueDate') dueDate?: string,
  ) {
    return this.custody.adminAssignRequest(
      req.user.organizationId,
      id,
      assetId,
      req.user.sub,
      dueAt || dueDate,
    );
  }
}
