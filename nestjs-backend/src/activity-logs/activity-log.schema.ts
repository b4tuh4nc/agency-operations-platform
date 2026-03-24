import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document;

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ASSIGN = 'assign',
  UPLOAD = 'upload',
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  TICKET_CREATE = 'ticket_create',
  TICKET_REPLY = 'ticket_reply'
}

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(ActivityType), required: true })
  activityType: ActivityType;

  @Prop({ required: true })
  description: string;

  @Prop()
  module?: string; // users, campaigns, tasks, tickets, etc.

  @Prop({ type: Types.ObjectId })
  relatedId?: Types.ObjectId; // İlgili kayıt ID

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Ek bilgiler

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

