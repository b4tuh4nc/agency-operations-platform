import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StaffGradeDocument = StaffGrade & Document;

@Schema({ timestamps: true })
export class StaffGrade {
  @Prop({ required: true, unique: true })
  gradeName: string; // Örn: "Senior Graphic Designer", "Junior Accountant"

  @Prop({ required: true })
  gradeLevel: number; // 1-10 arası seviye (1 en düşük, 10 en yüksek)

  @Prop()
  description?: string;

  @Prop()
  department?: string; // 'creative', 'accounts', 'administration', 'computing'

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const StaffGradeSchema = SchemaFactory.createForClass(StaffGrade);




