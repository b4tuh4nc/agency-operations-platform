import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return user.save();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      id, 
      { ...updateUserDto, updatedAt: new Date() }, 
      { new: true }
    ).select('-password').exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }

  async updateLastLogout(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogout: new Date() }).exec();
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Hierarchical erişim kontrolü ile kullanıcıları getir
  async findAccessibleUsers(userId: string, userRole: string): Promise<UserDocument[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return [];

    // Admin ve Director tüm kullanıcıları görebilir
    if (userRole === 'admin' || userRole === 'director') {
      return this.userModel.find({ isActive: { $ne: false } }).select('-password').exec();
    }

    // Office Manager: Administration Staff + kendi
    if (userRole === 'office_manager') {
      const adminStaffRoles = ['personal_assistant', 'receptionist', 'secretary', 'clerk_typist', 'filing_clerk'];
      return this.userModel.find({ 
        $or: [
          { role: { $in: adminStaffRoles } },
          { _id: user._id }
        ],
        isActive: { $ne: false }
      }).select('-password').exec();
    }

    // Accountant: Accounts Staff + kendi
    if (userRole === 'accountant') {
      const accountsStaffRoles = ['credit_controller', 'accounts_clerk', 'purchasing_assistant'];
      return this.userModel.find({ 
        $or: [
          { role: { $in: accountsStaffRoles } },
          { _id: user._id }
        ],
        isActive: { $ne: false }
      }).select('-password').exec();
    }

    // Account Manager: Creative Staff + kendi
    if (userRole === 'account_manager') {
      const creativeStaffRoles = ['graphic_designer', 'photographer', 'copy_writer', 'editor', 'audio_technician', 'resource_librarian'];
      return this.userModel.find({ 
        $or: [
          { role: { $in: creativeStaffRoles } },
          { _id: user._id }
        ],
        isActive: { $ne: false }
      }).select('-password').exec();
    }

    // Diğer kullanıcılar: Sadece kendi
    return this.userModel.find({ _id: user._id, isActive: { $ne: false } }).select('-password').exec();
  }
}
