import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityLog, ActivityLogDocument, ActivityType } from './activity-log.schema';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLogDocument>
  ) {}

  async create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
    const log = new this.activityLogModel(createActivityLogDto);
    return log.save();
  }

  async log(
    userId: string,
    activityType: ActivityType,
    description: string,
    module?: string,
    relatedId?: string,
    metadata?: Record<string, any>
  ): Promise<ActivityLog> {
    const log = new this.activityLogModel({
      user: new Types.ObjectId(userId),
      activityType,
      description,
      module,
      relatedId: relatedId ? new Types.ObjectId(relatedId) : undefined,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      metadata,
    });
    return log.save();
  }

  async findAll(limit: number = 100): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find()
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByUser(
    userId: string, 
    limit: number = 50, 
    module?: string, 
    activityType?: string
  ): Promise<ActivityLog[]> {
    const query: any = { user: new Types.ObjectId(userId) };
    
    if (module) {
      query.module = module;
    }
    
    if (activityType) {
      query.activityType = activityType;
    }
    
    return this.activityLogModel
      .find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByModule(module: string, limit: number = 50): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({ module })
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findWithFilters(
    limit: number = 100, 
    module?: string, 
    activityType?: string
  ): Promise<ActivityLog[]> {
    const query: any = {};
    
    if (module) {
      query.module = module;
    }
    
    if (activityType) {
      query.activityType = activityType;
    }
    
    return this.activityLogModel
      .find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findRecent(limit: number = 20): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find()
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserLoginHistory(userId: string): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({
        user: new Types.ObjectId(userId),
        activityType: { $in: [ActivityType.LOGIN, ActivityType.LOGOUT] },
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }
}

