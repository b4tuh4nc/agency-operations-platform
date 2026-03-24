import { ApiProperty } from '@nestjs/swagger';
import { MetricType } from '../performance-metric.schema';

export class CreatePerformanceMetricDto {
  @ApiProperty({ enum: MetricType, example: MetricType.TASK_COMPLETION })
  metricType: MetricType;

  @ApiProperty({ required: false })
  userId?: string;

  @ApiProperty({ required: false })
  campaignId?: string;

  @ApiProperty({ required: false })
  taskId?: string;

  @ApiProperty({
    example: {
      tasksCompleted: 10,
      tasksTotal: 15,
      completionRate: 66.67,
    },
  })
  metrics: {
    tasksCompleted?: number;
    tasksTotal?: number;
    completionRate?: number;
    averageCompletionTime?: number;
    campaignCompletionRate?: number;
    budgetUtilization?: number;
    onTimeDelivery?: boolean;
    loginCount?: number;
    tasksAssigned?: number;
    tasksSubmitted?: number;
    averageResponseTime?: number;
    apiResponseTime?: number;
    errorRate?: number;
    uptime?: number;
  };

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  periodStart: Date;

  @ApiProperty({ example: '2024-01-31T23:59:59Z' })
  periodEnd: Date;
}





