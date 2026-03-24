import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../invoice.schema';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ example: '2024-12-31' })
  dueDate?: Date;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  status?: InvoiceStatus;

  @ApiPropertyOptional({ example: 'Güncellenmiş açıklama' })
  description?: string;

  @ApiPropertyOptional({ example: 'Güncellenmiş notlar' })
  notes?: string;

  @ApiPropertyOptional({ example: '2024-12-15' })
  paidDate?: Date;
}





