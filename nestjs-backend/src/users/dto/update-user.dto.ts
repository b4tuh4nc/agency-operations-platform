import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'demo@admanager.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'Ada' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Lovelace' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'admin' })
  role?: string;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}

