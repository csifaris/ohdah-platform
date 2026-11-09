import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { RateLimit, RateLimitGuard } from './rate-limit.guard';
import { RegisterDto } from './dto/register.dto';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}

class RefreshDto {
  @IsString()
  refreshToken!: string;
}

class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

@UseGuards(RateLimitGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @RateLimit(10, 60)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.organizationId);
  }

  @Public()
  @RateLimit(10, 60)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @RateLimit(30, 60)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  logout(
    @Req() req: Request & { user?: { sub?: string } },
    @Body() dto: LogoutDto,
  ) {
    const userId = req.user?.sub || '';
    return this.authService.logout(userId, dto.refreshToken);
  }

  @Post('logout-all')
  logoutAll(@Req() req: Request & { user?: { sub?: string } }) {
    const userId = req.user?.sub || '';
    return this.authService.logoutAll(userId);
  }
}
