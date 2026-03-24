import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileQuota, FileQuotaDocument } from './file-quota.schema';
import { UploadedFile, UploadedFileDocument } from './uploaded-file.schema';
import { UpdateQuotaDto } from './dto/update-quota.dto';

@Injectable()
export class FileManagementService {
  constructor(
    @InjectModel(FileQuota.name) private fileQuotaModel: Model<FileQuotaDocument>,
    @InjectModel(UploadedFile.name) private uploadedFileModel: Model<UploadedFileDocument>
  ) {}

  // File Quota Methods
  async getOrCreateQuota(userId: string): Promise<FileQuota> {
    let quota = await this.fileQuotaModel
      .findOne({ user: new Types.ObjectId(userId) })
      .exec();

    if (!quota) {
      quota = new this.fileQuotaModel({
        user: new Types.ObjectId(userId),
        maxFileSize: 25,
        totalStorageQuota: 1024,
        usedStorage: 0,
      });
      await quota.save();
    }

    return quota;
  }

  async updateQuota(userId: string, updateQuotaDto: UpdateQuotaDto, modifiedBy: string): Promise<FileQuota> {
    const updateData: any = {
      lastModifiedBy: new Types.ObjectId(modifiedBy),
      updatedAt: new Date()
    };
    
    if (updateQuotaDto.maxFileSize !== undefined) {
      updateData.maxFileSize = updateQuotaDto.maxFileSize;
    }
    
    if (updateQuotaDto.totalStorageQuota !== undefined) {
      updateData.totalStorageQuota = updateQuotaDto.totalStorageQuota;
    }
    
    return this.fileQuotaModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      updateData,
      { new: true, upsert: true }
    ).exec();
  }

  async checkQuota(userId: string, fileSize: number): Promise<{ allowed: boolean; message?: string }> {
    const quota = await this.getOrCreateQuota(userId);
    const fileSizeMB = fileSize / (1024 * 1024);

    if (fileSizeMB > quota.maxFileSize) {
      return {
        allowed: false,
        message: `Dosya boyutu limiti aşıldı. Maksimum: ${quota.maxFileSize}MB`,
      };
    }

    if ((quota.usedStorage + fileSizeMB) > quota.totalStorageQuota) {
      return {
        allowed: false,
        message: `Depolama kotası aşılacak. Kullanılabilir: ${quota.totalStorageQuota - quota.usedStorage}MB`,
      };
    }

    return { allowed: true };
  }

  async updateUsedStorage(userId: string, additionalSize: number): Promise<void> {
    const sizeMB = additionalSize / (1024 * 1024);
    await this.fileQuotaModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $inc: { usedStorage: sizeMB } }
    ).exec();
  }

  // Uploaded File Methods
  async recordUpload(
    filename: string,
    originalName: string,
    path: string,
    mimetype: string,
    size: number,
    uploadedBy: string,
    module?: string,
    relatedId?: string
  ): Promise<UploadedFile> {
    const file = new this.uploadedFileModel({
      filename,
      originalName,
      path,
      mimetype,
      size,
      uploadedBy: new Types.ObjectId(uploadedBy),
      module,
      relatedId: relatedId ? new Types.ObjectId(relatedId) : undefined,
    });

    await file.save();
    await this.updateUsedStorage(uploadedBy, size);
    
    return file;
  }

  async getAllFiles(limit: number = 100): Promise<UploadedFile[]> {
    return this.uploadedFileModel
      .find()
      .populate('uploadedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getFilesByUser(userId: string): Promise<UploadedFile[]> {
    return this.uploadedFileModel
      .find({ uploadedBy: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getFilesByModule(module: string): Promise<UploadedFile[]> {
    return this.uploadedFileModel
      .find({ module })
      .populate('uploadedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllQuotas(): Promise<FileQuota[]> {
    return this.fileQuotaModel
      .find()
      .populate('user', 'firstName lastName email role')
      .populate('lastModifiedBy', 'firstName lastName email')
      .exec();
  }
}

