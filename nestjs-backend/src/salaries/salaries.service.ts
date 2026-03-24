import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Salary, SalaryDocument } from './salary.schema';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class SalariesService {
  constructor(
    @InjectModel(Salary.name) private salaryModel: Model<SalaryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createSalaryDto: CreateSalaryDto): Promise<Salary> {
    const salary = new this.salaryModel({
      ...createSalaryDto,
      userId: new Types.ObjectId(createSalaryDto.userId),
      gradeId: createSalaryDto.gradeId ? new Types.ObjectId(createSalaryDto.gradeId) : undefined,
      currency: createSalaryDto.currency || 'TRY',
      effectiveDate: createSalaryDto.effectiveDate ? new Date(createSalaryDto.effectiveDate) : new Date(),
    });
    return salary.save();
  }

  async findAll(): Promise<Salary[]> {
    return this.salaryModel.find().populate('userId', 'firstName lastName email role').populate('gradeId').exec();
  }

  // Hierarchical erişim kontrolü ile ücretleri getir
  async findAccessibleSalaries(userId: string, userRole: string): Promise<Salary[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return [];

    // Admin ve Director tüm ücretleri görebilir
    if (userRole === 'admin' || userRole === 'director') {
      return this.salaryModel
        .find()
        .populate('userId', 'firstName lastName email role')
        .populate('gradeId')
        .exec();
    }

    // Office Manager: Administration Staff + kendi ücreti
    if (userRole === 'office_manager') {
      const adminStaffRoles = ['personal_assistant', 'receptionist', 'secretary', 'clerk_typist', 'filing_clerk'];
      const adminStaff = await this.userModel.find({ role: { $in: adminStaffRoles } }).exec();
      const adminStaffIds = adminStaff.map(u => u._id);
      adminStaffIds.push(user._id); // Kendi ücreti de dahil
      
      return this.salaryModel
        .find({ userId: { $in: adminStaffIds } })
        .populate('userId', 'firstName lastName email role')
        .populate('gradeId')
        .exec();
    }

    // Accountant: Accounts Staff + kendi ücreti
    if (userRole === 'accountant') {
      const accountsStaffRoles = ['credit_controller', 'accounts_clerk', 'purchasing_assistant'];
      const accountsStaff = await this.userModel.find({ role: { $in: accountsStaffRoles } }).exec();
      const accountsStaffIds = accountsStaff.map(u => u._id);
      accountsStaffIds.push(user._id); // Kendi ücreti de dahil
      
      return this.salaryModel
        .find({ userId: { $in: accountsStaffIds } })
        .populate('userId', 'firstName lastName email role')
        .populate('gradeId')
        .exec();
    }

    // Account Manager: Creative Staff + kendi ücreti
    if (userRole === 'account_manager') {
      const creativeStaffRoles = ['graphic_designer', 'photographer', 'copy_writer', 'editor', 'audio_technician', 'resource_librarian'];
      const creativeStaff = await this.userModel.find({ role: { $in: creativeStaffRoles } }).exec();
      const creativeStaffIds = creativeStaff.map(u => u._id);
      creativeStaffIds.push(user._id); // Kendi ücreti de dahil
      
      return this.salaryModel
        .find({ userId: { $in: creativeStaffIds } })
        .populate('userId', 'firstName lastName email role')
        .populate('gradeId')
        .exec();
    }

    // Diğer kullanıcılar: Sadece kendi ücreti
    return this.salaryModel
      .find({ userId: user._id })
      .populate('userId', 'firstName lastName email role')
      .populate('gradeId')
      .exec();
  }

  async findOne(id: string): Promise<Salary | null> {
    return this.salaryModel.findById(id).populate('userId').populate('gradeId').exec();
  }

  async findByUserId(userId: string): Promise<Salary | null> {
    return this.salaryModel.findOne({ userId: new Types.ObjectId(userId) }).populate('userId').populate('gradeId').exec();
  }

  async update(id: string, updateSalaryDto: UpdateSalaryDto): Promise<Salary | null> {
    const updateData: any = { ...updateSalaryDto };
    if (updateSalaryDto.userId) {
      updateData.userId = new Types.ObjectId(updateSalaryDto.userId);
    }
    if (updateSalaryDto.gradeId) {
      updateData.gradeId = new Types.ObjectId(updateSalaryDto.gradeId);
    }
    if (updateSalaryDto.effectiveDate) {
      updateData.effectiveDate = new Date(updateSalaryDto.effectiveDate);
    }

    return this.salaryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId')
      .populate('gradeId')
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.salaryModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}




