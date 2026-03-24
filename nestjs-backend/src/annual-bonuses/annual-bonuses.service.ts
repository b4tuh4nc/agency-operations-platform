import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnnualBonus, AnnualBonusDocument, BonusStatus } from './annual-bonus.schema';
import { CreateAnnualBonusDto } from './dto/create-annual-bonus.dto';
import { UpdateAnnualBonusDto, ApproveBonusDto, RejectBonusDto } from './dto/update-annual-bonus.dto';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class AnnualBonusesService {
  constructor(
    @InjectModel(AnnualBonus.name) private annualBonusModel: Model<AnnualBonusDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createAnnualBonusDto: CreateAnnualBonusDto): Promise<AnnualBonus> {
    const bonus = new this.annualBonusModel({
      ...createAnnualBonusDto,
      userId: new Types.ObjectId(createAnnualBonusDto.userId),
      currency: createAnnualBonusDto.currency || 'TRY',
      status: createAnnualBonusDto.status || BonusStatus.PENDING,
    });
    return bonus.save();
  }

  async findAll(): Promise<AnnualBonus[]> {
    return this.annualBonusModel
      .find()
      .populate('userId', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ year: -1, createdAt: -1 })
      .exec();
  }

  // Hierarchical erişim kontrolü ile bonusları getir
  async findAccessibleBonuses(userId: string, userRole: string): Promise<AnnualBonus[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return [];

    // Admin ve Director tüm bonusları görebilir
    if (userRole === 'admin' || userRole === 'director') {
      return this.annualBonusModel
        .find()
        .populate('userId', 'firstName lastName email role')
        .populate('approvedBy', 'firstName lastName email')
        .sort({ year: -1, createdAt: -1 })
        .exec();
    }

    // Office Manager: Administration Staff + kendi bonusu
    if (userRole === 'office_manager') {
      const adminStaffRoles = ['personal_assistant', 'receptionist', 'secretary', 'clerk_typist', 'filing_clerk'];
      const adminStaff = await this.userModel.find({ role: { $in: adminStaffRoles } }).exec();
      const adminStaffIds = adminStaff.map(u => u._id);
      adminStaffIds.push(user._id); // Kendi bonusu da dahil
      
      return this.annualBonusModel
        .find({ userId: { $in: adminStaffIds } })
        .populate('userId', 'firstName lastName email role')
        .populate('approvedBy', 'firstName lastName email')
        .sort({ year: -1, createdAt: -1 })
        .exec();
    }

    // Accountant: Accounts Staff + kendi bonusu
    if (userRole === 'accountant') {
      const accountsStaffRoles = ['credit_controller', 'accounts_clerk', 'purchasing_assistant'];
      const accountsStaff = await this.userModel.find({ role: { $in: accountsStaffRoles } }).exec();
      const accountsStaffIds = accountsStaff.map(u => u._id);
      accountsStaffIds.push(user._id); // Kendi bonusu da dahil
      
      return this.annualBonusModel
        .find({ userId: { $in: accountsStaffIds } })
        .populate('userId', 'firstName lastName email role')
        .populate('approvedBy', 'firstName lastName email')
        .sort({ year: -1, createdAt: -1 })
        .exec();
    }

    // Account Manager: Creative Staff + kendi bonusu
    if (userRole === 'account_manager') {
      const creativeStaffRoles = ['graphic_designer', 'photographer', 'copy_writer', 'editor', 'audio_technician', 'resource_librarian'];
      const creativeStaff = await this.userModel.find({ role: { $in: creativeStaffRoles } }).exec();
      const creativeStaffIds = creativeStaff.map(u => u._id);
      creativeStaffIds.push(user._id); // Kendi bonusu da dahil
      
      return this.annualBonusModel
        .find({ userId: { $in: creativeStaffIds } })
        .populate('userId', 'firstName lastName email role')
        .populate('approvedBy', 'firstName lastName email')
        .sort({ year: -1, createdAt: -1 })
        .exec();
    }

    // Diğer kullanıcılar: Sadece kendi bonusu
    return this.annualBonusModel
      .find({ userId: user._id })
      .populate('userId', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ year: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<AnnualBonus | null> {
    return this.annualBonusModel
      .findById(id)
      .populate('userId', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email')
      .exec();
  }

  async findByUserIdAndYear(userId: string, year: number): Promise<AnnualBonus | null> {
    return this.annualBonusModel
      .findOne({ userId: new Types.ObjectId(userId), year })
      .populate('userId', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email')
      .exec();
  }

  async update(id: string, updateAnnualBonusDto: UpdateAnnualBonusDto): Promise<AnnualBonus | null> {
    const updateData: any = { ...updateAnnualBonusDto };
    if (updateAnnualBonusDto.userId) {
      updateData.userId = new Types.ObjectId(updateAnnualBonusDto.userId);
    }

    return this.annualBonusModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email')
      .exec();
  }

  async approve(id: string, approverId: string, approveDto?: ApproveBonusDto): Promise<AnnualBonus | null> {
    const updateData: any = {
      status: BonusStatus.APPROVED,
      approvedBy: new Types.ObjectId(approverId),
      approvedAt: new Date(),
    };
    if (approveDto?.notes) {
      updateData.notes = approveDto.notes;
    }

    return this.annualBonusModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email')
      .exec();
  }

  async reject(id: string, approverId: string, rejectDto: RejectBonusDto): Promise<AnnualBonus | null> {
    return this.annualBonusModel
      .findByIdAndUpdate(
        id,
        {
          status: BonusStatus.REJECTED,
          approvedBy: new Types.ObjectId(approverId),
          approvedAt: new Date(),
          rejectionReason: rejectDto.rejectionReason,
        },
        { new: true }
      )
      .populate('userId', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email')
      .exec();
  }

  async markAsPaid(id: string): Promise<AnnualBonus | null> {
    return this.annualBonusModel
      .findByIdAndUpdate(
        id,
        {
          status: BonusStatus.PAID,
          paidDate: new Date(),
        },
        { new: true }
      )
      .populate('userId', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email')
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.annualBonusModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  // Bonus hesaplama yardımcı fonksiyonu (opsiyonel - gelecekte genişletilebilir)
  async calculateBonus(userId: string, year: number, criteria: any): Promise<number> {
    // Bu fonksiyon performans verilerine göre otomatik bonus hesaplayabilir
    // Şimdilik basit bir örnek:
    let baseBonus = 0;

    if (criteria.performanceScore) {
      baseBonus += (criteria.performanceScore / 100) * 10000; // Performans puanına göre
    }

    if (criteria.tasksCompletedPercentage) {
      baseBonus += (criteria.tasksCompletedPercentage / 100) * 5000; // Görev tamamlama yüzdesine göre
    }

    if (criteria.campaignsCompleted) {
      baseBonus += criteria.campaignsCompleted * 1000; // Kampanya başına
    }

    return Math.round(baseBonus);
  }
}




