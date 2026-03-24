import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DowntimeRecordDocument = DowntimeRecord & Document;

@Schema({ timestamps: true })
export class DowntimeRecord {
  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime?: Date; // Eğer null ise hala devam ediyor demektir

  @Prop()
  duration?: number; // Saniye cinsinden

  @Prop({ default: 'unknown' })
  reason?: string; // Kesinti nedeni

  @Prop({ default: 'system' })
  component?: string; // Hangi bileşen (system, database, api, etc.)

  @Prop({ default: false })
  resolved: boolean; // Çözüldü mü?

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const DowntimeRecordSchema = SchemaFactory.createForClass(DowntimeRecord);

// Index for efficient queries
DowntimeRecordSchema.index({ startTime: -1 });
DowntimeRecordSchema.index({ resolved: 1, startTime: -1 });




