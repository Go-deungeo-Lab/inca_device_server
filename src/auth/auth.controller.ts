import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): LoginResponse {
    const user = this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.authService.login(user);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verifyToken(@Body() body: { token: string }): { valid: boolean } {
    try {
      const isValid = this.authService.verifyToken(body.token);
      return { valid: isValid };
    } catch (error) {
      return { valid: false };
    }
  }
}
