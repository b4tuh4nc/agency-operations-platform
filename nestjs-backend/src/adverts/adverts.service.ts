import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Advert, AdvertDocument } from './advert.schema';
import { CreateAdvertDto } from './dto/create-advert.dto';
import { UpdateAdvertDto } from './dto/update-advert.dto';
import { Campaign, CampaignDocument } from '../campaigns/campaign.schema';
import { Task, TaskDocument } from '../tasks/task.schema';

@Injectable()
export class AdvertsService {
  constructor(
    @InjectModel(Advert.name) private advertModel: Model<AdvertDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>
  ) {}

  async findAll(): Promise<AdvertDocument[]> {
    return this.advertModel.find()
      .populate({
        path: 'campaign',
        select: 'title client',
        populate: { path: 'client', select: 'name' }
      })
      .exec();
  }

  async findById(id: string): Promise<AdvertDocument | null> {
    return this.advertModel.findById(id)
      .populate({
        path: 'campaign',
        select: 'title client campaignManager',
        populate: [
          { path: 'client', select: 'name contactPerson' },
          { path: 'campaignManager', select: 'firstName lastName' }
        ]
      })
      .exec();
  }

  async findByCampaign(campaignId: string): Promise<AdvertDocument[]> {
    return this.advertModel.find({ campaign: campaignId }).exec();
  }

  async create(createAdvertDto: CreateAdvertDto): Promise<AdvertDocument> {
    // Yeni reklam oluşturulurken status'u "planning" olarak ayarla (default zaten planning ama emin olmak için)
    const advert = new this.advertModel({
      ...createAdvertDto,
      status: 'planning' // Yeni reklam her zaman "planning" durumunda başlar
    });
    const savedAdvert = await advert.save();
    
    // Reklam oluşturulduğunda kampanyanın durumunu güncelle
    if (savedAdvert.campaign) {
      await this.updateCampaignAfterAdvertChange(savedAdvert.campaign.toString());
    }
    
    return savedAdvert;
  }

  async update(id: string, updateAdvertDto: UpdateAdvertDto): Promise<AdvertDocument | null> {
    // Status otomatik güncellenir, manuel olarak güncellenemez
    const { status, ...updateData } = updateAdvertDto;
    
    const advert = await this.advertModel.findById(id).exec();
    if (!advert) {
      return null;
    }
    
    const updatedAdvert = await this.advertModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).exec();
    
    return updatedAdvert;
  }

  async delete(id: string): Promise<boolean> {
    const advert = await this.advertModel.findById(id).exec();
    if (!advert) {
      return false;
    }
    
    const campaignId = advert.campaign?.toString();
    
    // Reklam silindiğinde, o reklama ait tüm görevleri de sil
    const tasks = await this.taskModel.find({ advert: id }).exec();
    
    // Önce tüm görevleri sil
    if (tasks.length > 0) {
      await this.taskModel.deleteMany({ advert: id }).exec();
      console.log(`Deleted ${tasks.length} tasks for advert ${id}`);
    }
    
    // Sonra reklamı sil
    const result = await this.advertModel.findByIdAndDelete(id).exec();
    
    // Reklam silindiğinde kampanyanın completionPercentage'ını güncelle
    if (result && campaignId) {
      await this.updateCampaignAfterAdvertChange(campaignId);
      console.log(`Campaign ${campaignId} updated after advert deletion`);
    }
    
    if (result) {
      console.log(`Advert ${id} and its ${tasks.length} tasks deleted`);
    }
    
    return !!result;
  }

  // Reklam değişikliğinden sonra kampanyanın completionPercentage'ını güncelle
  private async updateCampaignAfterAdvertChange(campaignId: string): Promise<void> {
    // Kampanyanın tüm reklamlarını al
    const adverts = await this.advertModel.find({ campaign: campaignId }).exec();
    
    if (adverts.length === 0) {
      // Eğer hiç reklam yoksa, yüzdeyi 0 yap
      await this.campaignModel.findByIdAndUpdate(
        campaignId,
        { completionPercentage: 0 },
        { new: true }
      ).exec();
      return;
    }

    // Tamamlanan reklamları say (status === 'completed')
    const completedAdverts = adverts.filter(advert => advert.status === 'completed');
    const completionPercentage = Math.round((completedAdverts.length / adverts.length) * 100);

    await this.campaignModel.findByIdAndUpdate(
      campaignId,
      { completionPercentage },
      { new: true }
    ).exec();

    console.log(`Campaign ${campaignId} completionPercentage updated to ${completionPercentage}% (${completedAdverts.length}/${adverts.length} adverts completed)`);
  }
}

