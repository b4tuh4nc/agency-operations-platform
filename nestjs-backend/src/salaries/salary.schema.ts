import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SalaryDocument = Salary & Document;

@Schema({ timestamps: true })
export class Salary {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StaffGrade', required: false })
  gradeId?: Types.ObjectId;

  @Prop({ required: true })
  baseSalary: number; // Aylık maaş

  @Prop({ default: 0 })
  bonus?: number; // Bonus

  @Prop({ default: 0 })
  allowances?: number; // Ödenekler

  @Prop()
  currency: string; // 'TRY', 'USD', 'EUR'

  @Prop()
  effectiveDate: Date; // Geçerlilik tarihi

  @Prop()
  notes?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SalarySchema = SchemaFactory.createForClass(Salary);




