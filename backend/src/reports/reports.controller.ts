import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
@Controller('reports')
export class ReportsController { constructor(private readonly reports: ReportsService) {} @Get('summary') summary(@Query('organizationId') organizationId: string) { return this.reports.summary(organizationId); } @Get('maintenance') maintenance(@Query('organizationId') organizationId: string) { return this.reports.maintenance(organizationId); } }
