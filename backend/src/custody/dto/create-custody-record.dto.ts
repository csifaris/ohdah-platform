import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateCustodyRecordDto { @IsUUID() organizationId!: string; @IsUUID() assetId!: string; @IsUUID() employeeId!: string; @IsOptional() @IsDateString() dueAt?: string; @IsOptional() @IsString() handoverNotes?: string; }
