import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

@Controller('activity-logs')
@ApiTags('activity-logs')
export class ActivityLogsController {
  constructor(private activityLogsService: ActivityLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm aktivite loglarını listele' })
  @ApiResponse({ status: 200, description: 'Log listesi' })
  async findAll(
    @Query('limit') limit?: number, 
    @Query('module') module?: string,
    @Query('activityType') activityType?: string
  ) {
    if (module || activityType) {
      return this.activityLogsService.findWithFilters(limit || 100, module, activityType);
    }
    return this.activityLogsService.findAll(limit || 100);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Son aktiviteleri getir' })
  async getRecent(@Query('limit') limit?: number) {
    return this.activityLogsService.findRecent(limit || 20);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Kullanıcının aktivite loglarını getir' })
  async findByUser(
    @Param('userId') userId: string, 
    @Query('limit') limit?: number,
    @Query('module') module?: string,
    @Query('activityType') activityType?: string
  ) {
    return this.activityLogsService.findByUser(userId, limit || 50, module, activityType);
  }

  @Get('user/:userId/login-history')
  @ApiOperation({ summary: 'Kullanıcının giriş/çıkış geçmişini getir' })
  async getLoginHistory(@Param('userId') userId: string) {
    return this.activityLogsService.getUserLoginHistory(userId);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Tarih aralığına göre logları getir' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.activityLogsService.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post()
  @ApiOperation({ summary: 'Yeni aktivite logu oluştur' })
  @ApiResponse({ status: 201, description: 'Log oluşturuldu' })
  async create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogsService.create(createActivityLogDto);
  }
}

