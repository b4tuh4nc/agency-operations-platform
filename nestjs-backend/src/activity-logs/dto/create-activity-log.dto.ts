import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '../activity-log.schema';

export class CreateActivityLogDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  user: string;

  @ApiProperty({ enum: ActivityType })
  activityType: ActivityType;

  @ApiProperty({ example: 'User logged in successfully' })
  description: string;

  @ApiProperty({ required: false })
  module?: string;

  @ApiProperty({ required: false })
  relatedId?: string;

  @ApiProperty({ required: false })
  ipAddress?: string;

  @ApiProperty({ required: false })
  userAgent?: string;

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;
}

