import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformanceMonitoringController } from './performance-monitoring.controller';
import { PerformanceMonitoringService } from './performance-monitoring.service';
import {
  PerformanceMetric,
  PerformanceMetricSchema,
} from './performance-metric.schema';
import { Task, TaskSchema } from '../tasks/task.schema';
import { Campaign, CampaignSchema } from '../campaigns/campaign.schema';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PerformanceMetric.name, schema: PerformanceMetricSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PerformanceMonitoringController],
  providers: [PerformanceMonitoringService],
  exports: [PerformanceMonitoringService],
})
export class PerformanceMonitoringModule {}





