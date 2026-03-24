import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnualBonusDocument = AnnualBonus & Document;

export enum BonusStatus {
  PENDING = 'pending', // Beklemede
  APPROVED = 'approved', // Onaylandı
  REJECTED = 'rejected', // Reddedildi
  PAID = 'paid', // Ödendi
}

@Schema({ timestamps: true })
export class AnnualBonus {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  year: number; // Örn: 2024, 2025

  @Prop({ required: true })
  bonusAmount: number; // Bonus tutarı

  @Prop({ default: 'TRY' })
  currency: string; // Para birimi

  @Prop({ type: String, enum: Object.values(BonusStatus), default: BonusStatus.PENDING })
  status: BonusStatus;

  // Hesaplama kriterleri
  @Prop({ type: Object, default: {} })
  calculationCriteria: {
    performanceScore?: number; // Performans puanı (0-100)
    tasksCompleted?: number; // Tamamlanan görev sayısı
    tasksCompletedPercentage?: number; // Görev tamamlama yüzdesi
    campaignsCompleted?: number; // Tamamlanan kampanya sayısı
    attendanceRate?: number; // Devam oranı (0-100)
    customFactors?: Record<string, number>; // Özel faktörler
  };

  @Prop()
  calculationNotes?: string; // Hesaplama notları

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId; // Onaylayan kişi

  @Prop()
  approvedAt?: Date; // Onay tarihi

  @Prop()
  rejectionReason?: string; // Red nedeni

  @Prop()
  paidDate?: Date; // Ödeme tarihi

  @Prop()
  notes?: string; // Genel notlar

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AnnualBonusSchema = SchemaFactory.createForClass(AnnualBonus);

// Index for efficient queries
AnnualBonusSchema.index({ userId: 1, year: 1 }, { unique: true }); // Bir kullanıcı için bir yılda sadece bir bonus kaydı




