import { ApiProperty } from '@nestjs/swagger';

export class ReplyTicketDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  sender: string;

  @ApiProperty({ example: 'Sorununuz çözüldü, lütfen kontrol edin.' })
  message: string;

  @ApiProperty({ required: false, type: [String] })
  attachments?: string[];
}

