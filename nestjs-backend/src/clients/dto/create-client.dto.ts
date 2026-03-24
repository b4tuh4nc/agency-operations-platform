import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Acme Corp.' })
  name: string;

  @ApiProperty({ example: 'John Doe' })
  contactPerson: string;

  @ApiProperty({ example: 'contact@acme.com' })
  email: string;

  @ApiPropertyOptional({ example: '+90 555 555 55 55' })
  phone?: string;

  @ApiPropertyOptional({ example: 'İstiklal Cd. No:1' })
  address?: string;

  @ApiPropertyOptional({ example: 'İstanbul' })
  city?: string;

  @ApiPropertyOptional({ example: 'Türkiye' })
  country?: string;

  @ApiPropertyOptional({ example: '34000' })
  postalCode?: string;

  @ApiPropertyOptional({ example: 'internal_user_id' })
  staffContact?: string;

  @ApiPropertyOptional({ example: 'Önemli müşteri, hızlı dönüş yapılmalı.' })
  notes?: string;
}
