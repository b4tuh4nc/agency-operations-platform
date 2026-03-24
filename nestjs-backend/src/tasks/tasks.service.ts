import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Campaign, CampaignDocument } from '../campaigns/campaign.schema';
import { Advert, AdvertDocument } from '../adverts/advert.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Advert.name) private advertModel: Model<AdvertDocument>
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = new this.taskModel(createTaskDto);
    const savedTask = await task.save();
    
    // Yeni görev eklendiğinde reklam durumunu ve kampanyayı güncelle
    if (savedTask.advert) {
      await this.updateAdvertStatus(savedTask.advert.toString());
    }
    if (savedTask.campaign) {
      await this.updateCampaignCompletionPercentage(savedTask.campaign.toString());
      await this.updateCampaignStatus(savedTask.campaign.toString());
    }
    
    return savedTask;
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel
      .find()
      .populate('assignedBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('campaign', 'title')
      .populate('advert', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Task[]> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      console.log('Invalid userId:', userId);
      return [];
    }
    
    console.log('Finding tasks for userId:', userId);
    
    // assignedTo array içinde userId'yi ara
    const tasks = await this.taskModel
      .find({ assignedTo: { $in: [new Types.ObjectId(userId)] } })
      .populate('assignedBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('campaign', 'title')
      .populate('advert', 'title')
      .sort({ createdAt: -1 })
      .exec();
    
    console.log('Found tasks:', tasks.length);
    
    return tasks;
  }

  async findByAdvert(advertId: string): Promise<Task[]> {
    return this.taskModel
      .find({ advert: new Types.ObjectId(advertId) })
      .populate('assignedBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCampaign(campaignId: string): Promise<Task[]> {
    return this.taskModel
      .find({ campaign: new Types.ObjectId(campaignId) })
      .populate('assignedBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Task | null> {
    return this.taskModel
      .findById(id)
      .populate('assignedBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('campaign', 'title client')
      .populate('advert', 'title')
      .exec();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      return null;
    }

    // completionPercentage'ı 0-100 arasında sınırla (spentAmount ile karışmaması için)
    if (updateTaskDto.completionPercentage !== undefined) {
      updateTaskDto.completionPercentage = Math.max(0, Math.min(100, updateTaskDto.completionPercentage));
    }

    // Görevi güncelle
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .exec();

    if (!updatedTask) {
      return null;
    }

    // Görev durumu değiştiğinde reklam ve kampanyayı güncelle
    const advertId = updatedTask.advert?.toString() || task.advert?.toString();
    const campaignId = updatedTask.campaign?.toString() || task.campaign?.toString();
    const statusChanged = task.status !== updatedTask.status;
    
    if (advertId && statusChanged) {
      // Önce reklam durumunu güncelle (çünkü kampanya yüzdesi reklamlara göre hesaplanıyor)
      await this.updateAdvertStatus(advertId);
    }
    
    if (campaignId && statusChanged) {
      // Reklam durumu zaten updateAdvertStatus içinde güncellendi ve kampanya yüzdesi de orada güncellendi
      // Burada sadece actualCost ve status'u güncelle (completionPercentage reklam güncellemesinde zaten yapıldı)
      await this.updateCampaignActualCost(campaignId);
      await this.updateCampaignStatus(campaignId);
      console.log(`Campaign ${campaignId} updated after task status change: ${task.status} -> ${updatedTask.status}`);
    }

    return updatedTask;
  }

  async uploadFile(id: string, filePath: string): Promise<Task | null> {
    return this.taskModel
      .findByIdAndUpdate(
        id,
        { $push: { uploadedFiles: filePath } },
        { new: true }
      )
      .exec();
  }

  async submitTask(id: string, submissionNote?: string, spentAmount?: number): Promise<Task | null> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      return null;
    }

    // Eğer görev zaten submit edilmişse, sadece spentAmount güncelle (kampanya maliyetini güncellemek için)
    const isAlreadySubmitted = task.status === 'submitted' || task.status === 'completed' || task.status === 'approved';
    const previousSpentAmount = task.spentAmount || 0;
    const newSpentAmount = spentAmount || 0;
    const spentAmountDifference = newSpentAmount - previousSpentAmount;

    // completionPercentage'ı her zaman 0-100 arasında tut (spentAmount ile karışmaması için)
    // Görev submit edildiğinde completionPercentage 100 olmalı
    const completionPercentage = 100;

    // Görevi güncelle
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(
        id,
        {
          status: isAlreadySubmitted ? task.status : 'submitted',
          submittedAt: isAlreadySubmitted ? task.submittedAt : new Date(),
          submissionNote: submissionNote || task.submissionNote,
          completionPercentage: completionPercentage, // Her zaman 100, spentAmount ile karışmamalı
          spentAmount: newSpentAmount // spentAmount ayrı bir field
        },
        { new: true }
      )
      .exec();

    // Reklam ve kampanyanın completionPercentage ve status'unu güncelle (sadece yeni submit edildiyse)
    // ActualCost sadece görev onaylandığında güncellenir, submit edildiğinde değil
    if (updatedTask && task.advert && !isAlreadySubmitted) {
      await this.updateAdvertStatus(task.advert.toString());
    }
    if (updatedTask && task.campaign && !isAlreadySubmitted) {
      await this.updateCampaignCompletionPercentage(task.campaign.toString());
      await this.updateCampaignStatus(task.campaign.toString());
    }

    return updatedTask;
  }

  // Reklamın durumunu ve tamamlanma yüzdesini görevlere göre otomatik güncelle
  // - Hiç görev yoksa: "planning", %0
  // - En az bir tamamlanmamış görev varsa: "in_progress", tamamlanan görev yüzdesi
  // - Tüm görevler tamamlanmışsa: "completed", %100
  async updateAdvertStatus(advertId: string): Promise<void> {
    const tasks = await this.findByAdvert(advertId);
    const advert = await this.advertModel.findById(advertId).exec();
    
    if (!advert) {
      return;
    }

    let newStatus: string;
    let completionPercentage: number;

    if (tasks.length === 0) {
      // Hiç görev yoksa "planning", %0
      newStatus = 'planning';
      completionPercentage = 0;
    } else {
      // Tamamlanan görevleri say (approved veya completed)
      const completedTasks = tasks.filter(task => 
        task.status === 'approved' || task.status === 'completed'
      );
      
      // Tamamlanma yüzdesini hesapla
      completionPercentage = Math.round((completedTasks.length / tasks.length) * 100);
      
      // Tüm görevler tamamlanmış mı?
      const allCompleted = completedTasks.length === tasks.length;
      
      if (allCompleted) {
        // Tüm görevler tamamlandıysa "completed", %100
        newStatus = 'completed';
        completionPercentage = 100;
      } else {
        // En az bir görev var ama hepsi tamamlanmamışsa "in_progress"
        newStatus = 'in_progress';
      }
    }

    // Reklamın actualCost'unu tamamlanan görevlerin spentAmount toplamına göre güncelle
    const completedTasks = tasks.filter(task => 
      task.status === 'approved' || task.status === 'completed'
    );
    const actualCost = completedTasks.reduce((sum, task) => {
      return sum + (task.spentAmount || 0);
    }, 0);

    // Durum veya yüzde değiştiyse güncelle
    const statusChanged = advert.status !== newStatus;
    const percentageChanged = advert.completionPercentage !== completionPercentage;
    const costChanged = advert.actualCost !== actualCost;
    
    if (statusChanged || percentageChanged || costChanged) {
      await this.advertModel.findByIdAndUpdate(
        advertId,
        { 
          status: newStatus,
          completionPercentage: completionPercentage,
          actualCost: actualCost
        },
        { new: true }
      ).exec();
      
      if (statusChanged) {
        console.log(`Advert ${advertId} status updated: ${advert.status} -> ${newStatus}`);
      }
      if (percentageChanged) {
        console.log(`Advert ${advertId} completionPercentage updated: ${advert.completionPercentage}% -> ${completionPercentage}%`);
      }
      if (costChanged) {
        console.log(`Advert ${advertId} actualCost updated: ${advert.actualCost} -> ${actualCost}`);
      }
      
      // Reklam durumu değiştiyse (özellikle completed olduysa), kampanyanın yüzdesini de güncelle
      if (statusChanged && advert.campaign) {
        await this.updateCampaignCompletionPercentage(advert.campaign.toString());
        console.log(`Campaign ${advert.campaign} completionPercentage updated after advert status change to ${newStatus}`);
      }
    }
  }

  // Kampanyanın completionPercentage'ını reklamlara göre güncelle
  // Tamamlanan reklam sayısı / Toplam reklam sayısı * 100
  async updateCampaignCompletionPercentage(campaignId: string): Promise<void> {
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

  // Kampanyanın actualCost'unu onaylanan veya tamamlanan görevlerin spentAmount'larının toplamına göre güncelle
  async updateCampaignActualCost(campaignId: string): Promise<void> {
    const tasks = await this.findByCampaign(campaignId);
    
    // Onaylanan veya tamamlanan görevlerin spentAmount'larını topla
    const completedTasks = tasks.filter(task => task.status === 'approved' || task.status === 'completed');
    const totalSpentAmount = completedTasks.reduce((sum, task) => {
      return sum + (task.spentAmount || 0);
    }, 0);

    await this.campaignModel.findByIdAndUpdate(
      campaignId,
      { actualCost: totalSpentAmount },
      { new: true }
    ).exec();

    console.log(`Campaign ${campaignId} actualCost updated to ${totalSpentAmount} (from ${completedTasks.length} completed tasks)`);
  }

  // Kampanyanın durumunu otomatik güncelle
  // - Yeni kampanya: "planning" (default)
  // - Görev atanırsa: "in_progress"
  // - Tüm görevler onaylanmışsa: "completed"
  async updateCampaignStatus(campaignId: string): Promise<void> {
    const tasks = await this.findByCampaign(campaignId);
    const campaign = await this.campaignModel.findById(campaignId).exec();
    
    if (!campaign) {
      return;
    }

    let newStatus: string;

    if (tasks.length === 0) {
      // Hiç görev yoksa "planning"
      newStatus = 'planning';
    } else {
      // Tüm görevler onaylanmış veya tamamlanmış mı?
      const allCompleted = tasks.every(task => 
        task.status === 'approved' || task.status === 'completed'
      );
      
      if (allCompleted) {
        // Tüm görevler tamamlandıysa "completed"
        newStatus = 'completed';
      } else {
        // En az bir görev var ama hepsi tamamlanmamışsa "in_progress"
        newStatus = 'in_progress';
      }
    }

    // Sadece durum değiştiyse güncelle
    if (campaign.status !== newStatus) {
      await this.campaignModel.findByIdAndUpdate(
        campaignId,
        { status: newStatus },
        { new: true }
      ).exec();
      console.log(`Campaign ${campaignId} status updated: ${campaign.status} -> ${newStatus}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      return false;
    }
    
    const campaignId = task.campaign?.toString();
    const wasApproved = task.status === 'approved';
    const result = await this.taskModel.findByIdAndDelete(id).exec();
    
    // Görev silindiğinde reklam ve kampanyayı güncelle
    const advertId = task.advert?.toString();
    
    if (result && advertId) {
      // Reklam durumunu güncelle
      await this.updateAdvertStatus(advertId);
    }
    
    if (result && campaignId) {
      // Kampanyanın completionPercentage, actualCost ve status'unu güncelle
      await this.updateCampaignCompletionPercentage(campaignId);
      // Tüm görevleri yeniden hesapla
      await this.updateCampaignActualCost(campaignId);
      await this.updateCampaignStatus(campaignId);
      console.log(`Campaign ${campaignId} updated after task deletion (was approved: ${wasApproved})`);
    }
    
    return !!result;
  }

  async updateCompletionPercentage(advertId: string): Promise<void> {
    const tasks = await this.findByAdvert(advertId);
    if (tasks.length === 0) return;

    const totalPercentage = tasks.reduce((sum, task) => sum + task.completionPercentage, 0);
    const averagePercentage = Math.round(totalPercentage / tasks.length);

    // Advert'in completionPercentage'ini güncelle
    // Bu işlem adverts.service'den çağrılacak
  }
}

