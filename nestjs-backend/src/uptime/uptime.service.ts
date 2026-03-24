import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DowntimeRecord, DowntimeRecordDocument } from './downtime-record.schema';
import { HealthCheckRecord, HealthCheckRecordDocument } from './health-check-record.schema';

@Injectable()
export class UptimeService {
  private readonly logger = new Logger(UptimeService.name);
  private isSystemUp = true;
  private lastHealthCheck: Date | null = null;
  private currentDowntime: DowntimeRecordDocument | null = null;

  constructor(
    @InjectModel(DowntimeRecord.name) private downtimeModel: Model<DowntimeRecordDocument>,
    @InjectModel(HealthCheckRecord.name) private healthCheckModel: Model<HealthCheckRecordDocument>,
  ) {}

  // Health check yap ve kaydet
  async performHealthCheck(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Basit health check - database bağlantısını kontrol et
      await this.downtimeModel.findOne().limit(1).exec();
      
      const responseTime = Date.now() - startTime;
      const status: 'up' | 'down' = 'up';
      
      // Health check kaydı oluştur
      await this.healthCheckModel.create({
        timestamp: new Date(),
        status,
        responseTime,
        details: {
          database: 'up',
          api: 'up',
        },
      });

      // Eğer sistem daha önce down ise, şimdi up oldu
      if (!this.isSystemUp && this.currentDowntime) {
        await this.resolveDowntime();
      }

      this.isSystemUp = true;
      this.lastHealthCheck = new Date();
    } catch (error) {
      this.logger.error('Health check failed:', error);
      
      // Health check kaydı oluştur (down)
      await this.healthCheckModel.create({
        timestamp: new Date(),
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          database: 'down',
        },
      });

      // Eğer sistem daha önce up ise, şimdi down oldu
      if (this.isSystemUp) {
        await this.recordDowntime('Health check failed');
      }

      this.isSystemUp = false;
      this.lastHealthCheck = new Date();
    }
  }

  // Downtime kaydı oluştur
  private async recordDowntime(reason: string): Promise<void> {
    if (this.currentDowntime) {
      return; // Zaten bir downtime kaydı var
    }

    this.currentDowntime = await this.downtimeModel.create({
      startTime: new Date(),
      reason,
      component: 'system',
      resolved: false,
    });

    this.logger.warn(`System downtime recorded: ${reason}`);
  }

  // Downtime'ı çöz (sistem tekrar up oldu)
  private async resolveDowntime(): Promise<void> {
    if (!this.currentDowntime) {
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - this.currentDowntime.startTime.getTime()) / 1000); // Saniye

    await this.downtimeModel.findByIdAndUpdate(this.currentDowntime._id, {
      endTime,
      duration,
      resolved: true,
    });

    this.logger.log(`System downtime resolved. Duration: ${duration} seconds`);
    this.currentDowntime = null;
  }

  // Uptime istatistiklerini getir
  async getUptimeStats(period: '24h' | '7d' | '30d' = '7d'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // Toplam süre (saniye)
    const totalSeconds = Math.floor((now.getTime() - startDate.getTime()) / 1000);

    // Downtime kayıtlarını getir
    const downtimes = await this.downtimeModel
      .find({
        $or: [
          { startTime: { $gte: startDate } },
          { endTime: { $gte: startDate } },
          { resolved: false }, // Devam eden downtime'lar
        ],
      })
      .sort({ startTime: -1 })
      .exec();

    // Toplam downtime süresi (saniye)
    let totalDowntimeSeconds = 0;
    for (const downtime of downtimes) {
      if (downtime.resolved && downtime.duration) {
        totalDowntimeSeconds += downtime.duration;
      } else if (!downtime.resolved) {
        // Devam eden downtime
        const currentDowntime = Math.floor((now.getTime() - downtime.startTime.getTime()) / 1000);
        totalDowntimeSeconds += currentDowntime;
      }
    }

    // Uptime yüzdesi
    const uptimeSeconds = totalSeconds - totalDowntimeSeconds;
    const uptimePercentage = totalSeconds > 0 ? (uptimeSeconds / totalSeconds) * 100 : 100;

    // Haftalık SLA kontrolü (1 saat = 3600 saniye limit)
    const weeklyStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyDowntimes = await this.downtimeModel
      .find({
        $or: [
          { startTime: { $gte: weeklyStartDate } },
          { endTime: { $gte: weeklyStartDate } },
          { resolved: false },
        ],
      })
      .exec();

    let weeklyDowntimeSeconds = 0;
    for (const downtime of weeklyDowntimes) {
      if (downtime.resolved && downtime.duration) {
        weeklyDowntimeSeconds += downtime.duration;
      } else if (!downtime.resolved) {
        const currentDowntime = Math.floor((now.getTime() - downtime.startTime.getTime()) / 1000);
        weeklyDowntimeSeconds += currentDowntime;
      }
    }

    const slaLimit = 3600; // 1 saat = 3600 saniye
    const slaStatus = weeklyDowntimeSeconds <= slaLimit ? 'ok' : 'violated';
    const slaRemaining = Math.max(0, slaLimit - weeklyDowntimeSeconds);

    return {
      period,
      totalSeconds,
      uptimeSeconds,
      downtimeSeconds: totalDowntimeSeconds,
      uptimePercentage: Math.round(uptimePercentage * 100) / 100,
      downtimeCount: downtimes.length,
      downtimes: downtimes.map((d) => ({
        _id: d._id,
        startTime: d.startTime,
        endTime: d.endTime,
        duration: d.duration || (d.resolved ? null : Math.floor((now.getTime() - d.startTime.getTime()) / 1000)),
        reason: d.reason,
        component: d.component,
        resolved: d.resolved,
      })),
      sla: {
        limit: slaLimit,
        used: weeklyDowntimeSeconds,
        remaining: slaRemaining,
        status: slaStatus,
        percentage: Math.round((weeklyDowntimeSeconds / slaLimit) * 100 * 100) / 100,
      },
      currentStatus: this.isSystemUp ? 'up' : 'down',
      lastHealthCheck: this.lastHealthCheck,
    };
  }

  // Son downtime kayıtlarını getir
  async getRecentDowntimes(limit: number = 10): Promise<any[]> {
    return this.downtimeModel
      .find()
      .sort({ startTime: -1 })
      .limit(limit)
      .exec();
  }

  // Sistem durumunu getir
  getSystemStatus(): { isUp: boolean; lastHealthCheck: Date | null } {
    return {
      isUp: this.isSystemUp,
      lastHealthCheck: this.lastHealthCheck,
    };
  }
}




