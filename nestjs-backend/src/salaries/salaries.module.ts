import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalariesService } from './salaries.service';
import { SalariesController } from './salaries.controller';
import { Salary, SalarySchema } from './salary.schema';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Salary.name, schema: SalarySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SalariesController],
  providers: [SalariesService],
  exports: [SalariesService],
})
export class SalariesModule {}




