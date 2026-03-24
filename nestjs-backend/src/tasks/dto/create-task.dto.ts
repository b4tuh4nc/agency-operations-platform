import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '../task.schema';

export class CreateTaskDto {
  @ApiProperty({ example: 'Logo tasarımı' })
  title: string;

  @ApiProperty({ example: 'Şirket için yeni logo tasarımı yapılması gerekiyor' })
  description: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  advert: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  campaign: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  assignedBy: string;

  @ApiProperty({ 
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
    description: 'Atanan kullanıcıların ID listesi (çoklu atama)'
  })
  assignedTo: string[];

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  priority?: TaskPriority;

  @ApiProperty({ example: '2024-12-31', required: false })
  dueDate?: Date;
}

