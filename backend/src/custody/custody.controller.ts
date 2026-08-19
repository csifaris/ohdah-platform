import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CustodyRequestStatus, CustodyStatus } from '@prisma/client';
import { CustodyService } from './custody.service';
import { CreateCustodyRecordDto } from './dto/create-custody-record.dto';
import { CreateCustodyRequestDto } from './dto/create-custody-request.dto';
import { ReturnCustodyDto } from './dto/return-custody.dto';
@Controller('custody')
export class CustodyController {
  constructor(private readonly custody: CustodyService) {}
  @Get('records') records(@Query('organizationId') organizationId: string, @Query('status') status?: CustodyStatus) { return this.custody.findRecords(organizationId, status); }
  @Post('records') assign(@Body() dto: CreateCustodyRecordDto) { return this.custody.assign(dto); }
  @Get('records/:id') record(@Param('id') id: string) { return this.custody.findRecord(id); }
  @Patch('records/:id/return') returnRecord(@Param('id') id: string, @Body() dto: ReturnCustodyDto) { return this.custody.returnRecord(id, dto); }
  @Get('requests') requests(@Query('organizationId') organizationId: string, @Query('status') status?: CustodyRequestStatus) { return this.custody.findRequests(organizationId, status); }
  @Post('requests') createRequest(@Body() dto: CreateCustodyRequestDto) { return this.custody.createRequest(dto); }
  @Patch('requests/:id/approve') approve(@Param('id') id: string, @Req() request: Request & { user: { sub: string } }) { return this.custody.approveRequest(id, request.user.sub); }
  @Patch('requests/:id/reject') reject(@Param('id') id: string, @Req() request: Request & { user: { sub: string } }) { return this.custody.rejectRequest(id, request.user.sub); }
}
