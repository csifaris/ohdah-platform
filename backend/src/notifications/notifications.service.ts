import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateNotificationDto) {
    const recipient = await this.prisma.user.findFirst({
      where: { id: dto.recipientId, organizationId },
    });
    if (!recipient) {
      throw new BadRequestException('المستخدم المستلم غير موجود في هذه المنشأة.');
    }

    return this.prisma.notification.create({
      data: {
        organizationId,
        recipientId: dto.recipientId,
        type: dto.type,
        title: dto.title.trim(),
        message: dto.message.trim(),
        isImportant: dto.isImportant ?? false,
      },
    });
  }

  async findAll(organizationId: string, recipientId: string, unreadOnly = false) {
    if (!recipientId || recipientId.trim() === '') {
      return [];
    }
    return this.prisma.notification.findMany({
      where: {
        organizationId,
        recipientId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(organizationId: string, recipientId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, organizationId, recipientId },
    });
    if (!notification) {
      throw new NotFoundException('الإشعار غير موجود أو لا يخص حسابك.');
    }
    return this.prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });
  }

  async markAllRead(organizationId: string, recipientId: string) {
    if (!recipientId) return { count: 0 };
    return this.prisma.notification.updateMany({
      where: { organizationId, recipientId, isRead: false },
      data: { isRead: true },
    });
  }
}
