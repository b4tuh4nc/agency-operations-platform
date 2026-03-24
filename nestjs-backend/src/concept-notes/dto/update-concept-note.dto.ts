import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConceptNoteDto {
  @ApiPropertyOptional({ example: 'Güncellenmiş konsept başlığı' })
  title?: string;

  @ApiPropertyOptional({ example: 'Güncellenmiş konsept içeriği' })
  content?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439012' })
  campaign?: string;

  @ApiPropertyOptional({ type: [String], example: ['TV', 'Dijital'] })
  tags?: string[];
}

