import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateCustodyRecordDto {
  @IsOptional() @IsString() organizationId?: string;
  @IsString() assetId!: string;
  @IsString() employeeId!: string;
  @IsOptional() @IsDateString() dueAt?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsDateString() assignedAt?: string;
  @IsOptional() @IsString() handoverNotes?: string;
  @IsOptional() @IsString() notes?: string;
}
