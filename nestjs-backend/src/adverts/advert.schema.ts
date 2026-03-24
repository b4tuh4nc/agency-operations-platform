import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdvertDocument = Advert & Document;

export enum AdvertStatus {
  PLANNING = 'planning', // Hiç görev yoksa
  IN_PROGRESS = 'in_progress', // En az bir tamamlanmamış görev varsa
  COMPLETED = 'completed', // Tüm görevler tamamlanmışsa
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Advert {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaign: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  accountManager?: Types.ObjectId; // Reklamı yöneten Account Manager

  @Prop()
  description?: string;

  @Prop({ type: String, enum: Object.values(AdvertStatus), default: AdvertStatus.PLANNING })
  status: AdvertStatus;

  @Prop({ type: Date })
  scheduledStartDate?: Date;

  @Prop({ type: Date })
  scheduledEndDate?: Date;

  @Prop({ type: Date })
  actualStartDate?: Date;

  @Prop({ type: Date })
  actualEndDate?: Date;

  @Prop({ type: Number, default: 0 })
  estimatedCost: number;

  @Prop({ type: Number, default: 0 })
  actualCost: number;

  @Prop()
  medium?: string; // TV, Radio, Print, Digital, etc.

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  completionPercentage: number; // Görevlere göre otomatik hesaplanacak

  @Prop()
  notes?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AdvertSchema = SchemaFactory.createForClass(Advert);

