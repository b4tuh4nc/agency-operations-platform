import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffGradesService } from './staff-grades.service';
import { StaffGradesController } from './staff-grades.controller';
import { StaffGrade, StaffGradeSchema } from './staff-grade.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffGrade.name, schema: StaffGradeSchema },
    ]),
  ],
  controllers: [StaffGradesController],
  providers: [StaffGradesService],
  exports: [StaffGradesService],
})
export class StaffGradesModule {}




