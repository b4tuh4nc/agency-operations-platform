import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExportToAccountingDto {
  @ApiProperty({ example: 'json', description: 'Aktarım formatı: json, xml, csv' })
  format: string;

  @ApiPropertyOptional({ example: 'EXT-12345', description: 'Dış muhasebe sistemindeki ID' })
  externalId?: string;
}





