import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UptimeService } from './uptime.service';
import { UptimeController } from './uptime.controller';
import { DowntimeRecord, DowntimeRecordSchema } from './downtime-record.schema';
import { HealthCheckRecord, HealthCheckRecordSchema } from './health-check-record.schema';
import { UptimeScheduler } from './uptime.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DowntimeRecord.name, schema: DowntimeRecordSchema },
      { name: HealthCheckRecord.name, schema: HealthCheckRecordSchema },
    ]),
  ],
  controllers: [UptimeController],
  providers: [UptimeService, UptimeScheduler],
  exports: [UptimeService],
})
export class UptimeModule {}

