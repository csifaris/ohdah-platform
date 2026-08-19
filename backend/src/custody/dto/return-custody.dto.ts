import { IsOptional, IsString } from 'class-validator';
export class ReturnCustodyDto { @IsOptional() @IsString() returnNotes?: string; }
