import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

type AuthRequest = Request & {
  user: {
    sub: string;
    organizationId: string;
    roles: string[];
    permissions?: string[];
  };
};

@Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateNotificationDto) {
    return this.notifications.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(
    @Req() req: AuthRequest,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notifications.findAll(
      req.user.organizationId,
      req.user.sub,
      unreadOnly === 'true',
    );
  }

  @Patch(':id/read')
  markRead(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notifications.markRead(
      req.user.organizationId,
      req.user.sub,
      id,
    );
  }

  @Patch('read-all')
  markAllRead(@Req() req: AuthRequest) {
    return this.notifications.markAllRead(
      req.user.organizationId,
      req.user.sub,
    );
  }

  @Patch('read-all/:recipientId')
  markAllReadByRecipient(
    @Req() req: AuthRequest,
  ) {
    // Enforce self-only regardless of param in URL
    return this.notifications.markAllRead(
      req.user.organizationId,
      req.user.sub,
    );
  }
}
