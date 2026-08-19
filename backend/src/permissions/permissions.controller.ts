import { Controller, Get } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Roles } from '../auth/roles.decorator';

@Roles('ADMIN') @Controller('permissions')
export class PermissionsController { constructor(private readonly permissionsService: PermissionsService) {} @Get() findAll() { return this.permissionsService.findAll(); } @Get('matrix') matrix() { return this.permissionsService.findMatrix(); } }
