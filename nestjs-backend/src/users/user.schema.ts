import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ 
    enum: [
      'admin',
      'client', // YENİ - Müşteri rolü
      // Administration
      'office_manager',
      'personal_assistant',
      'receptionist',
      'secretary',
      'clerk_typist',
      'filing_clerk',
      // Accounts
      'accountant',
      'credit_controller',
      'accounts_clerk',
      'purchasing_assistant',
      // Creative
      'director',
      'account_manager',
      'graphic_designer',
      'photographer',
      'copy_writer',
      'editor',
      'audio_technician',
      'resource_librarian',
      // Computing
      'computer_manager',
      'network_support'
    ], 
    default: 'account_manager' 
  })
  role: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop()
  lastLogout?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Client' })
  clientAccount?: Types.ObjectId; // Eğer role = 'client' ise hangi müşteriye ait

  @Prop({ type: Object })
  fileQuota?: {
    maxFileSize: number; // MB
    totalStorage: number; // MB
    usedStorage: number; // MB
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
