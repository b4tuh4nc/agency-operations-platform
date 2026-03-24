import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
@ApiTags('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm müşterileri listele' })
  @ApiResponse({ status: 200, description: 'Müşteri listesi' })
  async findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Müşteri detayını getir' })
  @ApiResponse({ status: 200, description: 'Müşteri detayı' })
  async findOne(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni müşteri oluştur' })
  @ApiResponse({ status: 201, description: 'Müşteri oluşturuldu' })
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Müşteri bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Müşteri güncellendi' })
  async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Müşteriyi sil' })
  @ApiResponse({ status: 200, description: 'Müşteri silindi' })
  async delete(@Param('id') id: string) {
    const deleted = await this.clientsService.delete(id);
    return { success: deleted, message: deleted ? 'Müşteri silindi' : 'Müşteri bulunamadı' };
  }
}
