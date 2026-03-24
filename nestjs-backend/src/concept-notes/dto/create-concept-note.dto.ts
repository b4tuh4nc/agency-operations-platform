import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConceptNoteDto {
  @ApiProperty({ example: 'Yeni Marka Lansman Fikri' })
  title: string;

  @ApiProperty({ example: 'Detaylı konsept açıklaması buraya yazılır.' })
  content: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Konsept notunu oluşturan kullanıcı ID\'si' })
  author: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439012', description: 'İlişkili kampanya ID\'si' })
  campaign?: string;

  @ApiPropertyOptional({ type: [String], example: ['TV', 'Dijital', 'Outdoor'] })
  tags?: string[];
}

