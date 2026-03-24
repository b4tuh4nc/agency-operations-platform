import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UploadedFileDocument = UploadedFile & Document;

@Schema({ timestamps: true })
export class UploadedFile {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number; // bytes

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop()
  module?: string; // tasks, tickets, etc.

  @Prop({ type: Types.ObjectId })
  relatedId?: Types.ObjectId; // İlgili kayıt ID

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UploadedFileSchema = SchemaFactory.createForClass(UploadedFile);

