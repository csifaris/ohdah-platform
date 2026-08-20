import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  @IsOptional() @IsString() organizationId?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() category?: string;
  @IsString() assetNumber!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() notes?: string;
  @IsString() serialNumber!: string;
  @IsOptional() @IsEnum(AssetStatus) status?: AssetStatus;
  @IsOptional() @IsString() condition?: string;
  @IsOptional() @IsString() manufacturer?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsDateString() purchaseDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) purchaseCost?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) currentValue?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsDateString() warrantyEnd?: string;
}
