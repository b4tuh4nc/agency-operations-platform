import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HealthCheckRecordDocument = HealthCheckRecord & Document;

@Schema({ timestamps: true })
export class HealthCheckRecord {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true, default: 'up' })
  status: 'up' | 'down'; // Sistem durumu

  @Prop()
  responseTime?: number; // Milisaniye cinsinden

  @Prop({ type: Object, default: {} })
  details?: {
    database?: 'up' | 'down';
    api?: 'up' | 'down';
    memory?: number; // MB
    cpu?: number; // %
  };

  @Prop()
  error?: string; // Hata mesajı varsa

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const HealthCheckRecordSchema = SchemaFactory.createForClass(HealthCheckRecord);

// Index for efficient queries
HealthCheckRecordSchema.index({ timestamp: -1 });
HealthCheckRecordSchema.index({ status: 1, timestamp: -1 });




