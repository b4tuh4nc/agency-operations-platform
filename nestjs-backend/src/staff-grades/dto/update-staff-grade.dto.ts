import { PartialType } from '@nestjs/swagger';
import { CreateStaffGradeDto } from './create-staff-grade.dto';

export class UpdateStaffGradeDto extends PartialType(CreateStaffGradeDto) {}




