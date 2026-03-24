import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PerformanceMetricDocument = PerformanceMetric & Document;

export enum MetricType {
  TASK_COMPLETION = 'task_completion',
  CAMPAIGN_PERFORMANCE = 'campaign_performance',
  USER_ACTIVITY = 'user_activity',
  SYSTEM_PERFORMANCE = 'system_performance',
}

@Schema({ timestamps: true })
export class PerformanceMetric {
  @Prop({ type: String, enum: Object.values(MetricType), required: true })
  metricType: MetricType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId; // Hangi kullanıcı için (opsiyonel)

  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: false })
  campaignId?: Types.ObjectId; // Hangi kampanya için (opsiyonel)

  @Prop({ type: Types.ObjectId, ref: 'Task', required: false })
  taskId?: Types.ObjectId; // Hangi görev için (opsiyonel)

  @Prop({ type: Object, required: true })
  metrics: {
    // Görev metrikleri
    tasksCompleted?: number;
    tasksTotal?: number;
    completionRate?: number;
    averageCompletionTime?: number; // saat cinsinden
    
    // Kampanya metrikleri
    campaignCompletionRate?: number;
    budgetUtilization?: number; // actualCost / budget
    onTimeDelivery?: boolean;
    
    // Kullanıcı aktivite metrikleri
    loginCount?: number;
    tasksAssigned?: number;
    tasksSubmitted?: number;
    averageResponseTime?: number; // saat cinsinden
    
    // Sistem metrikleri
    apiResponseTime?: number; // ms
    errorRate?: number;
    uptime?: number; // yüzde
  };

  @Prop({ type: Date, required: true })
  periodStart: Date;

  @Prop({ type: Date, required: true })
  periodEnd: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PerformanceMetricSchema = SchemaFactory.createForClass(PerformanceMetric);

// Index'ler
PerformanceMetricSchema.index({ metricType: 1, userId: 1, periodStart: 1 });
PerformanceMetricSchema.index({ campaignId: 1, periodStart: 1 });
PerformanceMetricSchema.index({ createdAt: -1 });





