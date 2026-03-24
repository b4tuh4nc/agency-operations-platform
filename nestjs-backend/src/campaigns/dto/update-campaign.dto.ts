import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCampaignDto {
  @ApiPropertyOptional({ example: 'Yılbaşı Kampanyası' })
  title?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  client?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439012' })
  campaignManager?: string;

  @ApiPropertyOptional({ example: 'Güncellenmiş kampanya açıklaması' })
  description?: string;

  @ApiPropertyOptional({ example: '2024-12-01' })
  plannedStartDate?: Date;

  @ApiPropertyOptional({ example: '2025-01-15' })
  plannedEndDate?: Date;

  @ApiPropertyOptional({ example: '2024-12-03' })
  actualStartDate?: Date;

  @ApiPropertyOptional({ example: '2025-01-10' })
  actualEndDate?: Date;

  @ApiPropertyOptional({ example: 50000 })
  estimatedCost?: number;

  @ApiPropertyOptional({ example: 60000 })
  budget?: number;

  @ApiPropertyOptional({ example: 52000 })
  actualCost?: number;

  @ApiPropertyOptional({ example: 'In Progress' })
  status?: string;

  @ApiPropertyOptional({ example: 75 })
  completionPercentage?: number;

  @ApiPropertyOptional({ type: [String], example: ['507f1f77bcf86cd799439013'] })
  assignedStaff?: string[];

  @ApiPropertyOptional({ example: 'Müşteri onayı bekleniyor.' })
  notes?: string;
}

