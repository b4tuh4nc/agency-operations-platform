import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority } from '../ticket.schema';

export class CreateTicketDto {
  @ApiProperty({ example: 'Sistemde giriş sorunu' })
  subject: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  createdBy: string;

  @ApiProperty({ example: 'Computing' })
  department: string;

  @ApiProperty({ enum: TicketPriority, example: TicketPriority.MEDIUM })
  priority?: TicketPriority;

  @ApiProperty({ example: 'Sisteme giriş yapamıyorum, şifre sıfırlama gerekiyor.' })
  initialMessage: string;

  @ApiProperty({ required: false })
  assignedTo?: string;
}

