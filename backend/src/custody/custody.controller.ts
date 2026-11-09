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
import { CustodyRequestStatus, CustodyStatus } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { CustodyService } from './custody.service';
import { CreateCustodyRecordDto } from './dto/create-custody-record.dto';
import { CreateCustodyRequestDto } from './dto/create-custody-request.dto';
import { ReturnCustodyDto } from './dto/return-custody.dto';

type AuthRequest = Request & {
  user: {
    sub: string;
    organizationId: string;
    roles: string[];
    permissions?: string[];
  };
};

@Controller('custody')
export class CustodyController {
  constructor(private readonly custody: CustodyService) {}

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Get('records')
  records(
    @Req() req: AuthRequest,
    @Query('status') status?: CustodyStatus,
  ) {
    return this.custody.findRecords(
      req.user.organizationId,
      req.user.sub,
      req.user.roles,
      status,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Post('records')
  assign(@Req() req: AuthRequest, @Body() dto: CreateCustodyRecordDto) {
    return this.custody.assign(req.user.organizationId, dto, req.user.sub);
  }

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Get('records/:id')
  record(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.custody.findRecord(
      req.user.organizationId,
      req.user.sub,
      req.user.roles,
      id,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Patch('records/:id/return')
  returnRecord(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: ReturnCustodyDto,
  ) {
    return this.custody.returnRecord(
      req.user.organizationId,
      id,
      dto,
      req.user.sub,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Get('requests')
  requests(
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

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Get('requests/:id')
  request(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.custody.findRequest(
      req.user.organizationId,
      req.user.sub,
      req.user.roles,
      id,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Post('requests')
  createRequest(
    @Req() req: AuthRequest,
    @Body() dto: CreateCustodyRequestDto,
  ) {
    return this.custody.createRequest(
      req.user.organizationId,
      req.user.sub,
      dto,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Patch('requests/:id/approve')
  approve(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.custody.adminApproveRequest(
      req.user.organizationId,
      id,
      req.user.sub,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER')
  @Patch('requests/:id/reject')
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

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Patch('requests/:id/reply')
  reply(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body('employeeReply') employeeReply: string,
  ) {
    return this.custody.replyRequest(
      req.user.organizationId,
      req.user.sub,
      req.user.roles,
      id,
      employeeReply,
    );
  }

  @Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
  @Delete('requests/:id')
  deleteRequest(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.custody.deleteRequest(
      req.user.organizationId,
      req.user.sub,
      req.user.roles,
      id,
    );
  }
}
