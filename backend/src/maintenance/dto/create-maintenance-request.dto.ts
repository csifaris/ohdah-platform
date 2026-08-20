import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { MaintenanceStatus } from '@prisma/client';

export class CreateMaintenanceRequestDto {
  @IsUUID() organizationId!: string;
  @IsOptional() @IsUUID() assetId?: string;
  @IsOptional() @IsString() assetType?: string;
  @IsOptional() @IsUUID() requestedById?: string;
  @IsString() issue!: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsEnum(MaintenanceStatus) status?: MaintenanceStatus;
  @IsOptional() @IsString() technician?: string;
  @IsOptional() @IsNumber() @Min(0) cost?: number;
}
