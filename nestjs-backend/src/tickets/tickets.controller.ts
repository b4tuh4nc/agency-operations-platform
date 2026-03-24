import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';

@Controller('tickets')
@ApiTags('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm ticket\'ları listele' })
  @ApiResponse({ status: 200, description: 'Ticket listesi' })
  async findAll(@Query('department') department?: string) {
    if (department) {
      return this.ticketsService.findByDepartment(department);
    }
    return this.ticketsService.findAll();
  }

  @Get('my-tickets')
  @ApiOperation({ summary: 'Kullanıcının ticket\'larını getir' })
  async getMyTickets(@Query('userId') userId: string) {
    return this.ticketsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ticket detayını getir' })
  @ApiResponse({ status: 200, description: 'Ticket detayı' })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni ticket oluştur' })
  @ApiResponse({ status: 201, description: 'Ticket oluşturuldu' })
  async create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Ticket bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Ticket güncellendi' })
  async update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Ticket\'a yanıt ver' })
  @ApiResponse({ status: 200, description: 'Yanıt eklendi' })
  async reply(@Param('id') id: string, @Body() replyDto: ReplyTicketDto) {
    return this.ticketsService.addReply(id, replyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Ticket\'ı sil' })
  @ApiResponse({ status: 200, description: 'Ticket silindi' })
  async delete(@Param('id') id: string) {
    const deleted = await this.ticketsService.delete(id);
    return { success: deleted, message: deleted ? 'Ticket silindi' : 'Ticket bulunamadı' };
  }
}

