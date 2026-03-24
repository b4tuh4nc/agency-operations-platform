import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdvertsService } from './adverts.service';
import { AdvertsController } from './adverts.controller';
import { Advert, AdvertSchema } from './advert.schema';
import { Campaign, CampaignSchema } from '../campaigns/campaign.schema';
import { Task, TaskSchema } from '../tasks/task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Advert.name, schema: AdvertSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  controllers: [AdvertsController],
  providers: [AdvertsService],
  exports: [AdvertsService],
})
export class AdvertsModule {}

