import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../invoice.schema';

export class LineItemDto {
  @ApiProperty({ example: 'Kampanya yönetimi hizmeti' })
  description: string;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 50000 })
  unitPrice: number;

  @ApiProperty({ example: 50000 })
  amount: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  campaign: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  client: string;

  @ApiProperty({ example: '2024-12-01' })
  invoiceDate: Date;

  @ApiProperty({ example: '2024-12-31' })
  dueDate: Date;

  @ApiProperty({ example: 50000, required: false })
  subtotal?: number;

  @ApiPropertyOptional({ example: 20, description: 'KDV oranı (%)' })
  taxRate?: number;

  @ApiPropertyOptional({ example: 'Kampanya tamamlandı - Fatura' })
  description?: string;

  @ApiPropertyOptional({ type: [LineItemDto] })
  lineItems?: LineItemDto[];

  @ApiPropertyOptional({ enum: InvoiceStatus, example: InvoiceStatus.DRAFT })
  status?: InvoiceStatus;

  @ApiPropertyOptional({ example: 'Ek notlar buraya yazılabilir' })
  notes?: string;
}





