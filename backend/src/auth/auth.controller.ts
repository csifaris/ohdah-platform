import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { RegisterDto } from './dto/register.dto';

class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(8) password!: string; }

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public() @Post('login') login(@Body() dto: LoginDto) { return this.authService.login(dto.email, dto.password); }
  @Public() @Post('register') register(@Body() dto: RegisterDto) { return this.authService.register(dto); }
}
