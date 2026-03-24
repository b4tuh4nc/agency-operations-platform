import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StaffGrade, StaffGradeDocument } from './staff-grade.schema';
import { CreateStaffGradeDto } from './dto/create-staff-grade.dto';
import { UpdateStaffGradeDto } from './dto/update-staff-grade.dto';

@Injectable()
export class StaffGradesService {
  constructor(
    @InjectModel(StaffGrade.name) private staffGradeModel: Model<StaffGradeDocument>,
  ) {}

  async create(createStaffGradeDto: CreateStaffGradeDto): Promise<StaffGrade> {
    const grade = new this.staffGradeModel(createStaffGradeDto);
    return grade.save();
  }

  async findAll(): Promise<StaffGrade[]> {
    return this.staffGradeModel.find({ isActive: true }).sort({ gradeLevel: 1 }).exec();
  }

  async findOne(id: string): Promise<StaffGrade | null> {
    return this.staffGradeModel.findById(id).exec();
  }

  async update(id: string, updateStaffGradeDto: UpdateStaffGradeDto): Promise<StaffGrade | null> {
    return this.staffGradeModel
      .findByIdAndUpdate(id, updateStaffGradeDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.staffGradeModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}




