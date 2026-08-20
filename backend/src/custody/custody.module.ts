import { Module } from '@nestjs/common';
import { CustodyController } from './custody.controller';
import { AdminCustodyController } from './admin-custody.controller';
import { CustodyService } from './custody.service';
@Module({ controllers: [CustodyController, AdminCustodyController], providers: [CustodyService], exports: [CustodyService] })
export class CustodyModule {}
