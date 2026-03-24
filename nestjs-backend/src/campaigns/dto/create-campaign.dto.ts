import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Yılbaşı Kampanyası' })
  title: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Müşteri ID' })
  client: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439012', description: 'Kampanya yöneticisi kullanıcı ID\'si' })
  campaignManager?: string;

  @ApiPropertyOptional({ example: 'Yeni yıl için TV ve dijital reklam kampanyası' })
  description?: string;

  @ApiPropertyOptional({ example: '2024-12-01' })
  plannedStartDate?: Date;

  @ApiPropertyOptional({ example: '2025-01-15' })
  plannedEndDate?: Date;

  @ApiPropertyOptional({ example: 50000 })
  estimatedCost?: number;

  @ApiPropertyOptional({ example: 60000 })
  budget?: number;

  @ApiPropertyOptional({ example: 'Özel şartlar ve notlar buraya yazılabilir.' })
  notes?: string;
}

