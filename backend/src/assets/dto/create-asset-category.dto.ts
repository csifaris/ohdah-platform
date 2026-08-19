import { IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateAssetCategoryDto { @IsUUID() organizationId!: string; @IsString() name!: string; @IsOptional() @IsString() code?: string; @IsOptional() @IsString() description?: string; }
