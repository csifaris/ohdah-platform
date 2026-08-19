import { IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateCustodyRequestDto { @IsUUID() organizationId!: string; @IsUUID() requesterId!: string; @IsOptional() @IsUUID() assetId?: string; @IsString() category!: string; @IsString() reason!: string; @IsOptional() @IsString() description?: string; @IsOptional() @IsString() priority?: string; }
