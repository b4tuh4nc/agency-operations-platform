import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdvertsService } from './adverts.service';
import { CreateAdvertDto } from './dto/create-advert.dto';
import { UpdateAdvertDto } from './dto/update-advert.dto';

@Controller('adverts')
@ApiTags('adverts')
export class AdvertsController {
  constructor(private advertsService: AdvertsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm reklamları listele' })
  async findAll(@Query('campaignId') campaignId?: string) {
    if (campaignId) {
      return this.advertsService.findByCampaign(campaignId);
    }
    return this.advertsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Reklam detayını getir' })
  async findOne(@Param('id') id: string) {
    return this.advertsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni reklam oluştur' })
  async create(@Body() createAdvertDto: CreateAdvertDto) {
    return this.advertsService.create(createAdvertDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Reklam bilgilerini güncelle' })
  async update(@Param('id') id: string, @Body() updateAdvertDto: UpdateAdvertDto) {
    return this.advertsService.update(id, updateAdvertDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Reklamı sil' })
  async delete(@Param('id') id: string) {
    const deleted = await this.advertsService.delete(id);
    return { success: deleted };
  }
}

