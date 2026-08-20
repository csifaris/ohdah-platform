import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';
import { Roles } from '../auth/roles.decorator';

@Roles('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notifications.create(dto);
  }

  @Get()
  findAll(
    @Req() req: Request & { user?: { sub?: string } },
    @Query('recipientId') recipientId?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const effectiveRecipientId = recipientId || req.user?.sub || '';
    return this.notifications.findAll(effectiveRecipientId, unreadOnly === 'true');
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.notifications.markRead(id);
  }

  @Patch('read-all/:recipientId')
  markAllReadByRecipient(@Param('recipientId') recipientId: string) {
    return this.notifications.markAllRead(recipientId);
  }

  @Patch('read-all')
  markAllRead(
    @Req() req: Request & { user?: { sub?: string } },
    @Body('recipientId') recipientId?: string,
  ) {
    const effectiveRecipientId = recipientId || req.user?.sub || '';
    return this.notifications.markAllRead(effectiveRecipientId);
  }
}
