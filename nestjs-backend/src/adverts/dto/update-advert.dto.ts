import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdvertDto {
  @ApiPropertyOptional({ example: 'TV Spot 30sn' })
  title?: string;

  @ApiPropertyOptional({ example: 'Güncellenmiş reklam açıklaması' })
  description?: string;

  @ApiPropertyOptional({ example: 'Completed' })
  status?: string;

  @ApiPropertyOptional({ example: '2024-12-10' })
  scheduledStartDate?: Date;

  @ApiPropertyOptional({ example: '2024-12-20' })
  scheduledEndDate?: Date;

  @ApiPropertyOptional({ example: '2024-12-11' })
  actualStartDate?: Date;

  @ApiPropertyOptional({ example: '2024-12-19' })
  actualEndDate?: Date;

  @ApiPropertyOptional({ example: 15000 })
  estimatedCost?: number;

  @ApiPropertyOptional({ example: 14500 })
  actualCost?: number;

  @ApiPropertyOptional({ example: 'TV' })
  medium?: string;

  @ApiPropertyOptional({ example: 'Yayın başarıyla tamamlandı.' })
  notes?: string;
}

