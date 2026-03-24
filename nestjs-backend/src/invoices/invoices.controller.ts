import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { ExportToAccountingDto } from './dto/export-to-accounting.dto';

@Controller('invoices')
@ApiTags('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni fatura oluştur' })
  @ApiResponse({ status: 201, description: 'Fatura oluşturuldu' })
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Post('from-campaign/:campaignId')
  @ApiOperation({ summary: 'Kampanyadan otomatik fatura oluştur' })
  @ApiResponse({ status: 201, description: 'Kampanyadan fatura oluşturuldu' })
  async createFromCampaign(@Param('campaignId') campaignId: string) {
    return this.invoicesService.createFromCampaign(campaignId);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm faturaları listele' })
  @ApiQuery({ name: 'campaignId', required: false, description: 'Kampanya ID ile filtrele' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Müşteri ID ile filtrele' })
  @ApiResponse({ status: 200, description: 'Fatura listesi' })
  async findAll(
    @Query('campaignId') campaignId?: string,
    @Query('clientId') clientId?: string,
  ) {
    try {
      if (campaignId) {
        return this.invoicesService.findByCampaign(campaignId);
      }
      if (clientId) {
        return this.invoicesService.findByClient(clientId);
      }
      return this.invoicesService.findAll();
    } catch (error: any) {
      console.error('FindAll invoices controller error:', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fatura detayını getir' })
  @ApiResponse({ status: 200, description: 'Fatura detayı' })
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Fatura bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Fatura güncellendi' })
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Faturayı sil' })
  @ApiResponse({ status: 200, description: 'Fatura silindi' })
  async delete(@Param('id') id: string) {
    const deleted = await this.invoicesService.delete(id);
    return { success: deleted, message: deleted ? 'Fatura silindi' : 'Fatura bulunamadı' };
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Muhasebe sistemine aktarım için veri hazırla' })
  @ApiQuery({ name: 'format', required: false, description: 'Aktarım formatı: json, xml, csv', example: 'json' })
  @ApiResponse({ status: 200, description: 'Muhasebe sistemine uygun format' })
  async exportToAccounting(
    @Param('id') id: string,
    @Query('format') format: string = 'json',
  ) {
    return this.invoicesService.prepareForAccountingExport(id, format);
  }

  @Post(':id/mark-exported')
  @ApiOperation({ summary: 'Faturayı muhasebe sistemine aktarıldı olarak işaretle' })
  @ApiResponse({ status: 200, description: 'Fatura aktarıldı olarak işaretlendi' })
  async markAsExported(
    @Param('id') id: string,
    @Body() exportDto: ExportToAccountingDto,
  ) {
    return this.invoicesService.markAsExported(id, exportDto.externalId);
  }
}

