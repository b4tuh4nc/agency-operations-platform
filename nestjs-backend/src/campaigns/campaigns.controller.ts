import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
@ApiTags('campaigns')
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kampanyaları listele' })
  async findAll(@Query('clientId') clientId?: string) {
    if (clientId) {
      return this.campaignsService.findByClient(clientId);
    }
    return this.campaignsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kampanya detayını getir' })
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni kampanya oluştur' })
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kampanya bilgilerini güncelle' })
  async update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Post(':id/assign-staff')
  @ApiOperation({ summary: 'Kampanyaya personel ata' })
  async assignStaff(@Param('id') id: string, @Body() body: { staffIds: string[] }) {
    return this.campaignsService.assignStaff(id, body.staffIds);
  }

  @Delete(':id/staff/:staffId')
  @ApiOperation({ summary: 'Kampanyadan personel çıkar' })
  async removeStaff(@Param('id') id: string, @Param('staffId') staffId: string) {
    return this.campaignsService.removeStaff(id, staffId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kampanyayı sil' })
  async delete(@Param('id') id: string) {
    const deleted = await this.campaignsService.delete(id);
    return { success: deleted };
  }
}

