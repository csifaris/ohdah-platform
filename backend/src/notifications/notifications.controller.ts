import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';
@Controller('notifications')
export class NotificationsController { constructor(private readonly notifications: NotificationsService) {} @Post() create(@Body() dto: CreateNotificationDto) { return this.notifications.create(dto); } @Get() findAll(@Query('recipientId') recipientId: string, @Query('unreadOnly') unreadOnly?: string) { return this.notifications.findAll(recipientId, unreadOnly === 'true'); } @Patch(':id/read') markRead(@Param('id') id: string) { return this.notifications.markRead(id); } @Patch('read-all/:recipientId') markAllRead(@Param('recipientId') recipientId: string) { return this.notifications.markAllRead(recipientId); } }
