import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  @IsUUID() organizationId!: string;
  @IsUUID() categoryId!: string;
  @IsString() assetNumber!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsEnum(AssetStatus) status?: AssetStatus;
  @IsOptional() @IsString() condition?: string;
  @IsOptional() @IsDateString() purchaseDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) purchaseCost?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) currentValue?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsDateString() warrantyEnd?: string;
}
