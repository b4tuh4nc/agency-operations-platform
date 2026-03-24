import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { Request } from 'express';

class LoginDto {
  username: string;
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiResponse({ 
    status: 200, 
    description: 'Başarılı giriş',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: { 
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' }
          }
        },
        message: { type: 'string', example: 'Login successful' }
      }
    }
  })
  @ApiBody({
    description: 'Giriş bilgileri',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'demo@admanager.com' },
        password: { type: 'string', example: 'demo123' }
      },
      required: ['username', 'password']
    }
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.login(loginDto.username, loginDto.password, ipAddress, userAgent);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Kullanıcı çıkışı' })
  @ApiResponse({ status: 200, description: 'Başarılı çıkış' })
  async logout(@Body() body: { userId: string }, @Req() req: Request) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.logout(body.userId, ipAddress, userAgent);
  }
}
