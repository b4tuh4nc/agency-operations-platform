import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Advert', required: true })
  advert: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaign: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedBy: Types.ObjectId; // Account Manager

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  assignedTo: Types.ObjectId[]; // Creative Staff (çoklu atama)

  @Prop({ type: String, enum: Object.values(TaskStatus), default: TaskStatus.PENDING })
  status: TaskStatus;

  @Prop({ type: String, enum: Object.values(TaskPriority), default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: [String], default: [] })
  uploadedFiles: string[]; // File paths

  @Prop()
  submissionNote?: string;

  @Prop({ type: Date })
  submittedAt?: Date;

  @Prop()
  feedback?: string; // Account Manager'dan geri bildirim

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  completionPercentage: number;

  @Prop({ type: Number, min: 0, default: 0 })
  spentAmount?: number; // Görev için harcanan tutar

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

