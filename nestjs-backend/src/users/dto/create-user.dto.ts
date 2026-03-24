import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'demo@admanager.com' })
  email: string;

  @ApiProperty({ example: 'demo123' })
  password: string;

  @ApiPropertyOptional({ example: 'admin', description: 'Kullanıcı rolü' })
  role?: string;

  @ApiPropertyOptional({ example: 'Ada' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Lovelace' })
  lastName?: string;
}

