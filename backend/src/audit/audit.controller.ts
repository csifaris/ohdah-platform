import { Controller, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from './audit.service';

type AuthRequest = Request & { user: { organizationId: string } };

@Roles('ADMIN')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Req() req: AuthRequest, @Query('resource') resource?: string) {
    return this.auditService.findAll(req.user.organizationId, resource);
  }
}
