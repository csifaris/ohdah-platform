import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AdminCustodyController } from './admin-custody.controller';
import { CustodyController } from './custody.controller';
import { CustodyService } from './custody.service';

@Module({
  imports: [AuditModule],
  controllers: [CustodyController, AdminCustodyController],
  providers: [CustodyService],
  exports: [CustodyService],
})
export class CustodyModule {}
