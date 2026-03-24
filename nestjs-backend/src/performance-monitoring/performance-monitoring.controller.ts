import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceMonitoringService } from './performance-monitoring.service';
import { CreatePerformanceMetricDto } from './dto/create-performance-metric.dto';
import { MetricType } from './performance-metric.schema';

@ApiTags('Performance Monitoring')
@Controller('performance')
@ApiBearerAuth()
export class PerformanceMonitoringController {
  constructor(
    private readonly performanceMonitoringService: PerformanceMonitoringService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Yeni performans metrik kaydı oluştur' })
  async create(@Body() createDto: CreatePerformanceMetricDto) {
    return this.performanceMonitoringService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Performans metriklerini listele' })
  async findAll(
    @Query('metricType') metricType?: MetricType,
    @Query('userId') userId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (metricType) filters.metricType = metricType;
    if (userId) filters.userId = userId;
    if (campaignId) filters.campaignId = campaignId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.performanceMonitoringService.findAll(filters);
  }

  @Get('user')
  @ApiOperation({ summary: 'Kullanıcı performans metriklerini hesapla' })
  async getUserPerformance(
    @Query('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.performanceMonitoringService.calculateUserPerformance(userId, start, end);
  }

  @Get('campaign')
  @ApiOperation({ summary: 'Kampanya performans metriklerini hesapla' })
  async getCampaignPerformance(@Query('campaignId') campaignId: string) {
    return this.performanceMonitoringService.calculateCampaignPerformance(campaignId);
  }

  @Get('users/summary')
  @ApiOperation({ summary: 'Tüm kullanıcıların performans özeti' })
  async getAllUsersSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('userRole') userRole?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.performanceMonitoringService.getAllUsersPerformanceSummary(
      start,
      end,
      userId,
      userRole,
    );
  }

  @Get('system/summary')
  @ApiOperation({ summary: 'Sistem performans özeti' })
  async getSystemSummary() {
    return this.performanceMonitoringService.getSystemPerformanceSummary();
  }
}

