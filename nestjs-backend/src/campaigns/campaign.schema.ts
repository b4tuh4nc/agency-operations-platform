import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampaignDocument = Campaign & Document;

export enum CampaignStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  campaignManager?: Types.ObjectId; // Account Manager veya Director

  @Prop()
  description?: string;

  @Prop({ type: Date })
  plannedStartDate?: Date;

  @Prop({ type: Date })
  plannedEndDate?: Date;

  @Prop({ type: Date })
  actualStartDate?: Date;

  @Prop({ type: Date })
  actualEndDate?: Date;

  @Prop({ type: Number, default: 0 })
  estimatedCost: number;

  @Prop({ type: Number, default: 0 })
  budget: number;

  @Prop({ type: Number, default: 0 })
  actualCost: number;

  @Prop({ type: String, enum: Object.values(CampaignStatus), default: CampaignStatus.PLANNING })
  status: CampaignStatus;

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  completionPercentage: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  assignedStaff: Types.ObjectId[]; // Kampanyada çalışan personel

  @Prop()
  notes?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
