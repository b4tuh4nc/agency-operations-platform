import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'Acme Corp.' })
  name?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'contact@acme.com' })
  email?: string;

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

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Önemli müşteri, hızlı dönüş yapılmalı.' })
  notes?: string;
}
