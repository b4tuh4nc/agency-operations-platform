import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdvertDto {
  @ApiProperty({ example: 'TV Spot 30sn' })
  title: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Bağlı olduğu kampanya ID\'si' })
  campaign: string;

  @ApiPropertyOptional({ example: 'Ana haber bülteninde yayınlanacak TV reklamı' })
  description?: string;

  @ApiPropertyOptional({ example: '2024-12-10' })
  scheduledStartDate?: Date;

  @ApiPropertyOptional({ example: '2024-12-20' })
  scheduledEndDate?: Date;

  @ApiPropertyOptional({ example: 15000 })
  estimatedCost?: number;

  @ApiPropertyOptional({ example: 'TV' })
  medium?: string;

  @ApiPropertyOptional({ example: 'Prime-time yayın talep edildi.' })
  notes?: string;
}

