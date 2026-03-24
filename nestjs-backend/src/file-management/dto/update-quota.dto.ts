import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuotaDto {
  @ApiProperty({ example: 50, description: 'Maksimum dosya boyutu (MB)' })
  maxFileSize?: number;

  @ApiProperty({ example: 2048, description: 'Toplam depolama kotası (MB)' })
  totalStorageQuota?: number;
}

