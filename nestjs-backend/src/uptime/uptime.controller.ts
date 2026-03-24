import { Controller, Get, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UptimeService } from './uptime.service';

@Controller('uptime')
@ApiTags('uptime')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UptimeController {
  constructor(private readonly uptimeService: UptimeService) {}

  // Admin ve Computer Manager erişebilir kontrolü
  private checkAdminOrComputerManagerAccess(user: any): void {
    if (!user || (user.role !== 'admin' && user.role !== 'computer_manager')) {
      throw new ForbiddenException('Bu işlem için sistem yöneticisi veya bilgisayar yöneticisi yetkisi gereklidir.');
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Uptime istatistiklerini getir (Admin ve Computer Manager)' })
  @ApiResponse({ status: 200, description: 'Uptime istatistikleri' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  async getStats(@Request() req: any, @Query('period') period?: '24h' | '7d' | '30d') {
    this.checkAdminOrComputerManagerAccess(req.user);
    return this.uptimeService.getUptimeStats(period || '7d');
  }

  @Get('status')
  @ApiOperation({ summary: 'Sistem durumunu getir (Admin ve Computer Manager)' })
  @ApiResponse({ status: 200, description: 'Sistem durumu' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  getStatus(@Request() req: any) {
    this.checkAdminOrComputerManagerAccess(req.user);
    return this.uptimeService.getSystemStatus();
  }

  @Get('downtimes')
  @ApiOperation({ summary: 'Son downtime kayıtlarını getir (Admin ve Computer Manager)' })
  @ApiResponse({ status: 200, description: 'Downtime kayıtları' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  async getDowntimes(@Request() req: any, @Query('limit') limit?: string) {
    this.checkAdminOrComputerManagerAccess(req.user);
    return this.uptimeService.getRecentDowntimes(limit ? parseInt(limit) : 10);
  }
}

