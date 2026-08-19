import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '@prisma/client';
export class CreateNotificationDto { @IsUUID() organizationId!: string; @IsUUID() recipientId!: string; @IsEnum(NotificationType) type!: NotificationType; @IsString() title!: string; @IsString() message!: string; @IsOptional() @IsBoolean() isImportant?: boolean; }
