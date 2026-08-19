import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';

@Module({ imports: [ConfigModule, PassportModule, JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'), signOptions: { expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') } }) })], controllers: [AuthController], providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, PermissionsGuard], exports: [AuthService, JwtAuthGuard, RolesGuard, PermissionsGuard] })
export class AuthModule {}
