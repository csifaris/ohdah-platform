import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MaintenanceStatus } from '@prisma/client';

export class UpdateMaintenanceRequestDto {
  @IsOptional() @IsEnum(MaintenanceStatus) status?: MaintenanceStatus;
  @IsOptional() @IsString() technician?: string;
  @IsOptional() @IsNumber() @Min(0) cost?: number;
  @IsOptional() @IsString() issue?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() repairNotes?: string;
}
