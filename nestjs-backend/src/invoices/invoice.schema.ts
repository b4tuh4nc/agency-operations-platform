import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNumber: string; // Fatura numarası (örn: INV-2024-001)

  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaign: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId;

  @Prop({ type: Date, required: true })
  invoiceDate: Date; // Fatura tarihi

  @Prop({ type: Date, required: true })
  dueDate: Date; // Vade tarihi

  @Prop({ type: Number, required: true, min: 0 })
  subtotal: number; // Ara toplam (KDV hariç)

  @Prop({ type: Number, default: 20, min: 0, max: 100 })
  taxRate: number; // KDV oranı (%)

  @Prop({ type: Number, required: true, min: 0 })
  taxAmount: number; // KDV tutarı

  @Prop({ type: Number, required: true, min: 0 })
  totalAmount: number; // Toplam tutar (KDV dahil)

  @Prop({ type: String, enum: Object.values(InvoiceStatus), default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Prop({ type: String })
  description?: string; // Fatura açıklaması

  @Prop({ type: [Object], default: [] })
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>; // Fatura kalemleri

  @Prop({ type: Date })
  sentDate?: Date; // Gönderilme tarihi

  @Prop({ type: Date })
  paidDate?: Date; // Ödeme tarihi

  @Prop({ type: String })
  notes?: string; // Notlar

  @Prop({ type: Boolean, default: false })
  exportedToAccounting: boolean; // Muhasebe sistemine aktarıldı mı?

  @Prop({ type: Date })
  exportedAt?: Date; // Muhasebe sistemine aktarılma tarihi

  @Prop({ type: Object })
  accountingSystemData?: {
    externalId?: string; // Dış muhasebe sistemindeki ID
    exportFormat?: string; // Aktarım formatı (JSON, XML, vb.)
    lastSyncDate?: Date; // Son senkronizasyon tarihi
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);





