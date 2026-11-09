import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { ReportsService } from './reports.service';

type AuthRequest = Request & {
  user: {
    sub: string;
    organizationId: string;
    roles: string[];
    permissions?: string[];
  };
};

@Roles('ADMIN', 'ASSET_MANAGER')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('summary')
  summary(@Req() req: AuthRequest) {
    return this.reports.summary(req.user.organizationId);
  }

  @Get('maintenance')
  maintenance(@Req() req: AuthRequest) {
    return this.reports.maintenance(req.user.organizationId);
  }
}
