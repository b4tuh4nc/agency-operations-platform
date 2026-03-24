import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../task.schema';

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: TaskStatus, required: false })
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority, required: false })
  priority?: TaskPriority;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty({ required: false })
  feedback?: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  completionPercentage?: number;

  @ApiProperty({ required: false })
  submissionNote?: string;

  @ApiProperty({ 
    required: false,
    type: [String],
    description: 'Atanan kullanıcıların ID listesi (çoklu atama)'
  })
  assignedTo?: string[];
}

