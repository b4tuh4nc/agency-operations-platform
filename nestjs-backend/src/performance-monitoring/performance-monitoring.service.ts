import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PerformanceMetric, PerformanceMetricDocument, MetricType } from './performance-metric.schema';
import { CreatePerformanceMetricDto } from './dto/create-performance-metric.dto';
import { Task, TaskDocument } from '../tasks/task.schema';
import { Campaign, CampaignDocument } from '../campaigns/campaign.schema';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class PerformanceMonitoringService {
  constructor(
    @InjectModel(PerformanceMetric.name)
    private performanceMetricModel: Model<PerformanceMetricDocument>,
    @InjectModel(Task.name)
    private taskModel: Model<TaskDocument>,
    @InjectModel(Campaign.name)
    private campaignModel: Model<CampaignDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(createDto: CreatePerformanceMetricDto): Promise<PerformanceMetric> {
    const metric = new this.performanceMetricModel(createDto);
    return metric.save();
  }

  async findAll(filters?: {
    metricType?: MetricType;
    userId?: string;
    campaignId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PerformanceMetric[]> {
    const query: any = {};

    if (filters?.metricType) {
      query.metricType = filters.metricType;
    }

    if (filters?.userId) {
      query.userId = new Types.ObjectId(filters.userId);
    }

    if (filters?.campaignId) {
      query.campaignId = new Types.ObjectId(filters.campaignId);
    }

    if (filters?.startDate || filters?.endDate) {
      query.periodStart = {};
      if (filters.startDate) {
        query.periodStart.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.periodStart.$lte = filters.endDate;
      }
    }

    return this.performanceMetricModel
      .find(query)
      .populate('userId', 'firstName lastName email role')
      .populate('campaignId', 'title')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Kullanıcı performans metriklerini hesapla
  async calculateUserPerformance(userId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Son 30 gün
    const end = endDate || new Date();

    // Kullanıcının görevlerini getir
    const tasks = await this.taskModel
      .find({
        assignedTo: { $in: [new Types.ObjectId(userId)] },
        createdAt: { $gte: start, $lte: end },
      })
      .exec();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) => t.status === 'completed' || t.status === 'approved' || t.status === 'submitted',
    ).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Ortalama tamamlanma süresi hesapla
    const completedTasksWithDates = tasks.filter(
      (t) => t.status === 'completed' && t.submittedAt && t.createdAt,
    );
    let averageCompletionTime = 0;
    if (completedTasksWithDates.length > 0) {
      const totalTime = completedTasksWithDates.reduce((sum, task) => {
        const timeDiff = task.submittedAt!.getTime() - task.createdAt.getTime();
        return sum + timeDiff;
      }, 0);
      averageCompletionTime = totalTime / completedTasksWithDates.length / (1000 * 60 * 60); // Saat cinsinden
    }

    return {
      userId,
      periodStart: start,
      periodEnd: end,
      metrics: {
        tasksTotal: totalTasks,
        tasksCompleted: completedTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
      },
    };
  }

  // Kampanya performans metriklerini hesapla
  async calculateCampaignPerformance(campaignId: string): Promise<any> {
    const campaign = await this.campaignModel.findById(campaignId).exec();
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Kampanyaya ait görevleri getir
    const tasks = await this.taskModel.find({ campaign: new Types.ObjectId(campaignId) }).exec();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) => t.status === 'completed' || t.status === 'approved',
    ).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Bütçe kullanımı
    const budgetUtilization =
      campaign.budget > 0 ? (campaign.actualCost / campaign.budget) * 100 : 0;

    // Zamanında teslimat kontrolü
    const onTimeDelivery =
      campaign.actualEndDate && campaign.plannedEndDate
        ? campaign.actualEndDate <= campaign.plannedEndDate
        : null;

    return {
      campaignId,
      metrics: {
        campaignCompletionRate: Math.round(completionRate * 100) / 100,
        budgetUtilization: Math.round(budgetUtilization * 100) / 100,
        onTimeDelivery,
        totalTasks,
        completedTasks,
      },
    };
  }

  // Tüm kullanıcıların performans özeti
  async getAllUsersPerformanceSummary(
    startDate?: Date,
    endDate?: Date,
    userId?: string,
    userRole?: string,
  ): Promise<any[]> {
    let targetUserIds: string[] = [];

    // Eğer userId ve userRole varsa, kullanıcının departmanına göre filtrele
    if (userId && userRole) {
      const teamMemberIds = new Set<string>();

      // Director (Board of Directors) - Tüm personeli görmeli
      if (userRole === 'director') {
        const allUsers = await this.userModel.find({ isActive: true }).exec();
        allUsers
          .filter((u) => u.role !== 'client' && u.role !== 'admin' && u.role !== 'director')
          .forEach((user) => {
            teamMemberIds.add((user._id as any).toString());
          });
      }
      // Office Manager (Administration Department) - Administration personelini görmeli
      else if (userRole === 'office_manager') {
        const administrationRoles = [
          'personal_assistant',
          'receptionist',
          'secretary',
          'clerk_typist',
          'filing_clerk',
        ];
        const adminStaff = await this.userModel
          .find({
            isActive: true,
            role: { $in: administrationRoles },
          })
          .exec();
        adminStaff.forEach((user) => {
          teamMemberIds.add((user._id as any).toString());
        });
      }
      // Accountant (Accounts Department) - Accounts personelini görmeli
      else if (userRole === 'accountant') {
        const accountsRoles = [
          'credit_controller',
          'accounts_clerk',
          'purchasing_assistant',
        ];
        const accountsStaff = await this.userModel
          .find({
            isActive: true,
            role: { $in: accountsRoles },
          })
          .exec();
        accountsStaff.forEach((user) => {
          teamMemberIds.add((user._id as any).toString());
        });
      }
      // Account Manager (Creative Department) - Creative Staff'ı görmeli
      else if (userRole === 'account_manager') {
        const creativeStaffRoles = [
          'graphic_designer',
          'photographer',
          'copy_writer',
          'editor',
          'audio_technician',
          'resource_librarian',
        ];
        const creativeStaff = await this.userModel
          .find({
            isActive: true,
            role: { $in: creativeStaffRoles },
          })
          .exec();
        creativeStaff.forEach((user) => {
          teamMemberIds.add((user._id as any).toString());
        });

        // Ayrıca Account Manager'ın yönettiği kampanyalardaki ve atadığı görevlerdeki personelleri de ekle
        const managedCampaigns = await this.campaignModel
          .find({ campaignManager: new Types.ObjectId(userId) })
          .exec();

        for (const campaign of managedCampaigns) {
          if (campaign.assignedStaff && Array.isArray(campaign.assignedStaff)) {
            campaign.assignedStaff.forEach((staffId: any) => {
              teamMemberIds.add(staffId.toString());
            });
          }
        }

        const assignedTasks = await this.taskModel
          .find({ assignedBy: new Types.ObjectId(userId) })
          .exec();

        for (const task of assignedTasks) {
          if (task.assignedTo && Array.isArray(task.assignedTo)) {
            task.assignedTo.forEach((taskUserId: any) => {
              teamMemberIds.add(taskUserId.toString());
            });
          }
        }
      }
      // Computer Manager (Computing Department) - Computing personelini görmeli
      else if (userRole === 'computer_manager') {
        const computingRoles = ['network_support'];
        const computingStaff = await this.userModel
          .find({
            isActive: true,
            role: { $in: computingRoles },
          })
          .exec();
        computingStaff.forEach((user) => {
          teamMemberIds.add((user._id as any).toString());
        });
      }

      targetUserIds = Array.from(teamMemberIds);
    } else {
      // Tüm aktif kullanıcıları getir (admin, director gibi tam erişimi olanlar için)
      const users = await this.userModel.find({ isActive: true }).exec();
      targetUserIds = users
        .filter((u) => u.role !== 'client' && u.role !== 'admin')
        .map((u) => (u._id as any).toString());
    }

    const performanceData: any[] = [];

    for (const userId of targetUserIds) {
      const user = await this.userModel.findById(userId).exec();
      if (!user || user.role === 'client' || user.role === 'admin') continue;

      const userPerf = await this.calculateUserPerformance(userId, startDate, endDate);
      performanceData.push({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        ...userPerf,
      });
    }

    return performanceData;
  }

  // Sistem performans özeti
  async getSystemPerformanceSummary(): Promise<any> {
    const totalUsers = await this.userModel.countDocuments({ isActive: true });
    const totalCampaigns = await this.campaignModel.countDocuments();
    const totalTasks = await this.taskModel.countDocuments();
    const completedTasks = await this.taskModel.countDocuments({
      status: { $in: ['completed', 'approved'] },
    });

    return {
      totalUsers,
      totalCampaigns,
      totalTasks,
      completedTasks,
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }
}

