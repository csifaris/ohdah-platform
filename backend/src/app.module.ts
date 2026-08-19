import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { EmployeesModule } from './employees/employees.module';
import { CustodyModule } from './custody/custody.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { AuditModule } from './audit/audit.module';
import { ReportsModule } from './reports/reports.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, cache: true }), PrismaModule, AuthModule, AuditModule, ReportsModule, UsersModule, RolesModule, PermissionsModule, AssetsModule, EmployeesModule, CustodyModule, MaintenanceModule, NotificationsModule], providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }, { provide: APP_GUARD, useClass: RolesGuard }, { provide: APP_GUARD, useClass: PermissionsGuard }] })
export class AppModule {}
