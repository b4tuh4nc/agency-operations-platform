import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '../ticket.schema';

export class UpdateTicketDto {
  @ApiProperty({ required: false })
  subject?: string;

  @ApiProperty({ enum: TicketStatus, required: false })
  status?: TicketStatus;

  @ApiProperty({ enum: TicketPriority, required: false })
  priority?: TicketPriority;

  @ApiProperty({ required: false })
  assignedTo?: string;

  @ApiProperty({ required: false })
  department?: string;
}

