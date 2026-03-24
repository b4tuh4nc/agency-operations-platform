import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UptimeService } from './uptime.service';

@Injectable()
export class UptimeScheduler implements OnModuleInit {
  private readonly logger = new Logger(UptimeScheduler.name);
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private readonly uptimeService: UptimeService) {}

  onModuleInit() {
    // Her 30 saniyede bir health check yap
    this.intervalId = setInterval(async () => {
      this.logger.debug('Running scheduled health check...');
      await this.uptimeService.performHealthCheck();
    }, 30000); // 30 saniye = 30000 ms

    // İlk health check'i hemen yap
    this.uptimeService.performHealthCheck().catch(err => {
      this.logger.error('Initial health check failed:', err);
    });
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

