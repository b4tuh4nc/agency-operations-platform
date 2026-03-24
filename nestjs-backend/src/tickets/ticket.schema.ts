import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Schema()
export class TicketMessage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

const TicketMessageSchema = SchemaFactory.createForClass(TicketMessage);

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ required: true })
  subject: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ required: true })
  department: string; // Administration, Accounts, Creative, Computing

  @Prop({ type: String, enum: Object.values(TicketStatus), default: TicketStatus.OPEN })
  status: TicketStatus;

  @Prop({ type: String, enum: Object.values(TicketPriority), default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Prop({ type: [TicketMessageSchema], default: [] })
  messages: TicketMessage[];

  @Prop({ type: Date })
  resolvedAt?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

