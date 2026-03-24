import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign, CampaignDocument } from './campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Advert, AdvertDocument } from '../adverts/advert.schema';
import { Task, TaskDocument } from '../tasks/task.schema';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Advert.name) private advertModel: Model<AdvertDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>
  ) {}

  async findAll(): Promise<CampaignDocument[]> {
    return this.campaignModel.find()
      .populate('client', 'name contactPerson email')
      .populate('campaignManager', 'firstName lastName email')
      .populate('assignedStaff', 'firstName lastName email role')
      .exec();
  }

  async findById(id: string): Promise<CampaignDocument | null> {
    return this.campaignModel.findById(id)
      .populate('client', 'name contactPerson email phone')
      .populate('campaignManager', 'firstName lastName email role')
      .populate('assignedStaff', 'firstName lastName email role')
      .exec();
  }

  async findByClient(clientId: string): Promise<CampaignDocument[]> {
    return this.campaignModel.find({ client: clientId })
      .populate('campaignManager', 'firstName lastName email')
      .populate('assignedStaff', 'firstName lastName email role')
      .exec();
  }

  async create(createCampaignDto: CreateCampaignDto): Promise<CampaignDocument> {
    // Yeni kampanya oluşturulurken status'u "planning" olarak ayarla (default zaten planning ama emin olmak için)
    const campaign = new this.campaignModel({
      ...createCampaignDto,
      status: 'planning' // Yeni kampanya her zaman "planning" durumunda başlar
    });
    return campaign.save();
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<CampaignDocument | null> {
    // Status ve completionPercentage otomatik güncellenir, manuel olarak güncellenemez
    const { status, completionPercentage, ...updateData } = updateCampaignDto;
    
    return this.campaignModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
      .populate('client', 'name contactPerson email')
      .populate('campaignManager', 'firstName lastName email')
      .populate('assignedStaff', 'firstName lastName email role')
      .exec();
  }

  async assignStaff(campaignId: string, staffIds: string[]): Promise<CampaignDocument | null> {
    return this.campaignModel.findByIdAndUpdate(
      campaignId,
      { $addToSet: { assignedStaff: { $each: staffIds } }, updatedAt: new Date() },
      { new: true }
    )
      .populate('assignedStaff', 'firstName lastName email role')
      .exec();
  }

  async removeStaff(campaignId: string, staffId: string): Promise<CampaignDocument | null> {
    return this.campaignModel.findByIdAndUpdate(
      campaignId,
      { $pull: { assignedStaff: staffId }, updatedAt: new Date() },
      { new: true }
    )
      .populate('assignedStaff', 'firstName lastName email role')
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Kampanya silindiğinde, o kampanyaya ait tüm reklamları ve görevleri de sil
      const campaignObjectId = new Types.ObjectId(id);
      
      // Kampanyaya ait tüm reklamları bul
      // Önce string olarak dene (findByCampaign gibi)
      let adverts = await this.advertModel.find({ campaign: id }).exec();
      
      // Eğer bulamazsa ObjectId olarak dene
      if (adverts.length === 0) {
        adverts = await this.advertModel.find({ campaign: campaignObjectId }).exec();
      }
      
      console.log(`Found ${adverts.length} adverts for campaign ${id} (searched as: string=${id}, ObjectId=${campaignObjectId})`);
      
      const advertIds = adverts.map(advert => {
        const advertId = (advert as any)._id || advert.id;
        return new Types.ObjectId(advertId.toString());
      });
      
      // Önce tüm görevleri sil (kampanyaya ait tüm görevler)
      // Önce string olarak dene, sonra ObjectId olarak
      let tasksResult = await this.taskModel.deleteMany({ campaign: id }).exec();
      if (tasksResult.deletedCount === 0) {
        tasksResult = await this.taskModel.deleteMany({ campaign: campaignObjectId }).exec();
      }
      console.log(`Deleted ${tasksResult.deletedCount} tasks for campaign ${id}`);
      
      // Reklamlara ait görevleri de sil (eğer varsa)
      if (advertIds.length > 0) {
        const advertTasksResult = await this.taskModel.deleteMany({ 
          advert: { $in: advertIds } 
        }).exec();
        console.log(`Deleted ${advertTasksResult.deletedCount} tasks for ${advertIds.length} adverts`);
      }
      
      // Sonra tüm reklamları sil
      if (adverts.length > 0) {
        // Önce string olarak dene, sonra ObjectId olarak
        let advertsResult = await this.advertModel.deleteMany({ campaign: id }).exec();
        if (advertsResult.deletedCount === 0) {
          advertsResult = await this.advertModel.deleteMany({ campaign: campaignObjectId }).exec();
        }
        console.log(`Deleted ${advertsResult.deletedCount} adverts for campaign ${id}`);
      }
      
      // Son olarak kampanyayı sil
      const result = await this.campaignModel.findByIdAndDelete(id).exec();
      
      if (result) {
        console.log(`✅ Campaign ${id} deleted successfully with ${adverts.length} adverts and ${tasksResult.deletedCount} tasks`);
        return true;
      } else {
        console.log(`❌ Campaign ${id} not found`);
        return false;
      }
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      throw error;
    }
  }
}

