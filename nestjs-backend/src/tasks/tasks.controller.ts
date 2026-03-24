import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
@ApiTags('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm görevleri listele' })
  @ApiResponse({ status: 200, description: 'Görev listesi' })
  async findAll(@Query('userId') userId?: string, @Query('advertId') advertId?: string, @Query('campaignId') campaignId?: string) {
    if (userId) {
      return this.tasksService.findByUser(userId);
    }
    if (advertId) {
      return this.tasksService.findByAdvert(advertId);
    }
    if (campaignId) {
      return this.tasksService.findByCampaign(campaignId);
    }
    return this.tasksService.findAll();
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Kullanıcının görevlerini getir' })
  async getMyTasks(@Query('userId') userId: string) {
    if (!userId) {
      return [];
    }
    return this.tasksService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Görev detayını getir' })
  @ApiResponse({ status: 200, description: 'Görev detayı' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni görev oluştur' })
  @ApiResponse({ status: 201, description: 'Görev oluşturuldu' })
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Görev bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Görev güncellendi' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Göreve dosya yükle' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/tasks',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB default
      },
    }),
  )
  async uploadFile(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) {
      return { success: false, message: 'Dosya yüklenemedi' };
    }
    await this.tasksService.uploadFile(id, file.path);
    return { success: true, message: 'Dosya yüklendi', filePath: file.path };
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Görevi teslim et' })
  async submitTask(
    @Param('id') id: string, 
    @Body() body: { submissionNote?: string; spentAmount?: number }
  ) {
    return this.tasksService.submitTask(id, body.submissionNote, body.spentAmount);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Görevi sil' })
  @ApiResponse({ status: 200, description: 'Görev silindi' })
  async delete(@Param('id') id: string) {
    const deleted = await this.tasksService.delete(id);
    return { success: deleted, message: deleted ? 'Görev silindi' : 'Görev bulunamadı' };
  }
}

