import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileManagementService } from './file-management.service';
import { UpdateQuotaDto } from './dto/update-quota.dto';

@Controller('file-management')
@ApiTags('file-management')
export class FileManagementController {
  constructor(private fileManagementService: FileManagementService) {}

  @Get('quotas')
  @ApiOperation({ summary: 'Tüm kullanıcı kotalarını listele' })
  @ApiResponse({ status: 200, description: 'Kota listesi' })
  async getAllQuotas() {
    return this.fileManagementService.getAllQuotas();
  }

  @Get('quota/:userId')
  @ApiOperation({ summary: 'Kullanıcının kotasını getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı kotası' })
  async getQuota(@Param('userId') userId: string) {
    return this.fileManagementService.getOrCreateQuota(userId);
  }

  @Put('quota/:userId')
  @ApiOperation({ summary: 'Kullanıcının kotasını güncelle' })
  @ApiResponse({ status: 200, description: 'Kota güncellendi' })
  async updateQuota(
    @Param('userId') userId: string,
    @Body() updateQuotaDto: UpdateQuotaDto,
    @Query('modifiedBy') modifiedBy: string
  ) {
    return this.fileManagementService.updateQuota(userId, updateQuotaDto, modifiedBy);
  }

  @Get('files')
  @ApiOperation({ summary: 'Tüm yüklenen dosyaları listele' })
  @ApiResponse({ status: 200, description: 'Dosya listesi' })
  async getAllFiles(@Query('limit') limit?: number, @Query('userId') userId?: string, @Query('module') module?: string) {
    if (userId) {
      return this.fileManagementService.getFilesByUser(userId);
    }
    if (module) {
      return this.fileManagementService.getFilesByModule(module);
    }
    return this.fileManagementService.getAllFiles(limit || 100);
  }

  @Get('files/user/:userId')
  @ApiOperation({ summary: 'Kullanıcının dosyalarını getir' })
  async getFilesByUser(@Param('userId') userId: string) {
    return this.fileManagementService.getFilesByUser(userId);
  }
}

