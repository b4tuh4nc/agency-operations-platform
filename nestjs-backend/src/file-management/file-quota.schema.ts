import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileQuotaDocument = FileQuota & Document;

@Schema({ timestamps: true })
export class FileQuota {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ type: Number, default: 25 }) // MB cinsinden
  maxFileSize: number;

  @Prop({ type: Number, default: 1024 }) // MB cinsinden (1GB)
  totalStorageQuota: number;

  @Prop({ type: Number, default: 0 }) // MB cinsinden
  usedStorage: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastModifiedBy?: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const FileQuotaSchema = SchemaFactory.createForClass(FileQuota);

