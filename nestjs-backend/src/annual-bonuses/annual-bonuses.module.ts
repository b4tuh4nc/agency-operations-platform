import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnualBonusesService } from './annual-bonuses.service';
import { AnnualBonusesController } from './annual-bonuses.controller';
import { AnnualBonus, AnnualBonusSchema } from './annual-bonus.schema';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnnualBonus.name, schema: AnnualBonusSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AnnualBonusesController],
  providers: [AnnualBonusesService],
  exports: [AnnualBonusesService],
})
export class AnnualBonusesModule {}




