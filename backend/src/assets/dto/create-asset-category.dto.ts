import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAssetCategoryDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
