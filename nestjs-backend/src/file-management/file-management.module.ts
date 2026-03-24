import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileManagementController } from './file-management.controller';
import { FileManagementService } from './file-management.service';
import { FileQuota, FileQuotaSchema } from './file-quota.schema';
import { UploadedFile, UploadedFileSchema } from './uploaded-file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileQuota.name, schema: FileQuotaSchema },
      { name: UploadedFile.name, schema: UploadedFileSchema },
    ]),
  ],
  controllers: [FileManagementController],
  providers: [FileManagementService],
  exports: [FileManagementService],
})
export class FileManagementModule {}

