import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument, InvoiceStatus } from './invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Campaign, CampaignDocument } from '../campaigns/campaign.schema';
import { Client, ClientDocument } from '../clients/client.schema';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  /**
   * Otomatik fatura numarası oluştur
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    
    const lastInvoice = await this.invoiceModel
      .findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
      .sort({ invoiceNumber: -1 })
      .exec();

    if (!lastInvoice) {
      return `${prefix}001`;
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
    return `${prefix}${nextNumber}`;
  }

  /**
   * Kampanyadan fatura oluştur
   */
  async createFromCampaign(campaignId: string): Promise<InvoiceDocument> {
    const campaign = await this.campaignModel.findById(campaignId)
      .populate('client', 'name contactPerson email address city country postalCode')
      .exec();

    if (!campaign) {
      throw new NotFoundException('Kampanya bulunamadı');
    }

    if (campaign.status !== 'completed') {
      throw new Error('Sadece tamamlanmış kampanyalar için fatura oluşturulabilir');
    }

    // Client ID'yi doğru şekilde al (populate edilmişse _id, değilse direkt)
    let clientId: string;
    const clientRef = campaign.client as any;
    
    if (clientRef && typeof clientRef === 'object') {
      // Populate edilmiş obje
      clientId = clientRef._id?.toString() || clientRef.id?.toString() || String(clientRef);
    } else if (clientRef) {
      // ObjectId veya string
      clientId = String(clientRef);
    } else {
      throw new Error('Kampanyada müşteri bilgisi bulunamadı');
    }

    if (!clientId) {
      throw new Error('Kampanyada müşteri bilgisi bulunamadı');
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const subtotal = campaign.actualCost || campaign.budget || campaign.estimatedCost || 0;
    const taxRate = 20; // Varsayılan KDV oranı %20
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const invoiceData: CreateInvoiceDto = {
      campaign: campaignId,
      client: clientId,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
      subtotal,
      taxRate,
      description: `${campaign.title} kampanyası için fatura`,
      lineItems: [
        {
          description: campaign.title,
          quantity: 1,
          unitPrice: subtotal,
          amount: subtotal,
        },
      ],
      status: InvoiceStatus.DRAFT,
    };

    const createdInvoice = await this.create(invoiceData);
    
    // Populate edilmiş halini döndür
    const invoiceId = (createdInvoice._id as any)?.toString() || String(createdInvoice._id);
    const populatedInvoice = await this.findById(invoiceId);
    
    if (!populatedInvoice) {
      // Eğer populate edilmiş hali bulunamazsa, oluşturulan invoice'u döndür
      return createdInvoice;
    }
    
    return populatedInvoice;
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceDocument> {
    const invoiceNumber = await this.generateInvoiceNumber();
    
    // Eğer subtotal verilmemişse, lineItems'dan hesapla
    let subtotal = createInvoiceDto.subtotal || 0;
    if (!subtotal && createInvoiceDto.lineItems && createInvoiceDto.lineItems.length > 0) {
      subtotal = createInvoiceDto.lineItems.reduce((sum, item) => sum + item.amount, 0);
    }

    const taxRate = createInvoiceDto.taxRate || 20;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const invoice = new this.invoiceModel({
      ...createInvoiceDto,
      invoiceNumber,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: createInvoiceDto.status || InvoiceStatus.DRAFT,
    });

    return invoice.save();
  }

  async findAll(): Promise<InvoiceDocument[]> {
    try {
      // Önce populate olmadan invoice'ları al
      const invoicesWithoutPopulate = await this.invoiceModel.find()
        .sort({ invoiceDate: -1 })
        .lean()
        .exec();
      
      if (!invoicesWithoutPopulate || invoicesWithoutPopulate.length === 0) {
        console.log('No invoices found');
        return [];
      }

      console.log(`Found ${invoicesWithoutPopulate.length} invoices`);

      // Her invoice için populate yap
      const populatedInvoices = await Promise.all(
        invoicesWithoutPopulate.map(async (invoice: any) => {
          try {
            // Campaign populate
            if (invoice.campaign) {
              try {
                const campaign = await this.campaignModel.findById(invoice.campaign)
                  .select('title status completionPercentage')
                  .lean()
                  .exec();
                invoice.campaign = campaign || null;
              } catch (campaignError) {
                console.warn(`Failed to populate campaign for invoice ${invoice._id}:`, campaignError);
                invoice.campaign = null;
              }
            }

            // Client populate
            if (invoice.client) {
              try {
                const client = await this.clientModel.findById(invoice.client)
                  .select('name contactPerson email')
                  .lean()
                  .exec();
                invoice.client = client || null;
              } catch (clientError) {
                console.warn(`Failed to populate client for invoice ${invoice._id}:`, clientError);
                invoice.client = null;
              }
            }

            return invoice;
          } catch (itemError) {
            console.error(`Error populating invoice ${invoice._id}:`, itemError);
            return invoice; // Populate olmasa bile invoice'u döndür
          }
        })
      );

      console.log(`Returning ${populatedInvoices.length} populated invoices`);
      return populatedInvoices as any;
    } catch (error: any) {
      console.error('FindAll invoices error:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      // Hata durumunda boş array döndür, uygulama çökmesin
      return [];
    }
  }

  async findById(id: string): Promise<InvoiceDocument | null> {
    return this.invoiceModel.findById(id)
      .populate('campaign', 'title description status actualCost budget')
      .populate('client', 'name contactPerson email phone address city country postalCode')
      .exec();
  }

  async findByCampaign(campaignId: string): Promise<InvoiceDocument[]> {
    return this.invoiceModel.find({ campaign: campaignId })
      .populate('client', 'name contactPerson email')
      .sort({ invoiceDate: -1 })
      .exec();
  }

  async findByClient(clientId: string): Promise<InvoiceDocument[]> {
    return this.invoiceModel.find({ client: clientId })
      .populate('campaign', 'title status')
      .sort({ invoiceDate: -1 })
      .exec();
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<InvoiceDocument | null> {
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) {
      throw new NotFoundException('Fatura bulunamadı');
    }

    // Eğer status PAID olarak güncelleniyorsa, paidDate'i ayarla
    if (updateInvoiceDto.status === InvoiceStatus.PAID && !invoice.paidDate) {
      updateInvoiceDto.paidDate = new Date();
    }

    // Eğer status SENT olarak güncelleniyorsa, sentDate'i ayarla
    if (updateInvoiceDto.status === InvoiceStatus.SENT && !invoice.sentDate) {
      updateInvoiceDto['sentDate'] = new Date();
    }

    return this.invoiceModel.findByIdAndUpdate(
      id,
      { ...updateInvoiceDto, updatedAt: new Date() },
      { new: true }
    )
      .populate('campaign', 'title status')
      .populate('client', 'name contactPerson email')
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.invoiceModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  /**
   * Muhasebe sistemine aktarım için veri hazırla
   */
  async prepareForAccountingExport(id: string, format: string = 'json'): Promise<any> {
    const invoice = await this.findById(id);
    if (!invoice) {
      throw new NotFoundException('Fatura bulunamadı');
    }

    const invoiceData = invoice.toObject();
    
    // Muhasebe sistemine uygun formata dönüştür
    const accountingData = {
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      client: {
        name: invoiceData.client?.name,
        contactPerson: invoiceData.client?.contactPerson,
        email: invoiceData.client?.email,
        address: invoiceData.client?.address,
        city: invoiceData.client?.city,
        country: invoiceData.client?.country,
        postalCode: invoiceData.client?.postalCode,
      },
      campaign: {
        title: invoiceData.campaign?.title,
        description: invoiceData.campaign?.description,
      },
      lineItems: invoiceData.lineItems,
      subtotal: invoiceData.subtotal,
      taxRate: invoiceData.taxRate,
      taxAmount: invoiceData.taxAmount,
      totalAmount: invoiceData.totalAmount,
      status: invoiceData.status,
      description: invoiceData.description,
      notes: invoiceData.notes,
    };

    // Format'a göre dönüştür
    if (format === 'xml') {
      // XML formatına dönüştür (basit örnek)
      return this.convertToXML(accountingData);
    } else if (format === 'csv') {
      // CSV formatına dönüştür
      return this.convertToCSV(accountingData);
    }

    // Varsayılan: JSON
    return accountingData;
  }

  /**
   * Muhasebe sistemine aktarım işaretle
   */
  async markAsExported(id: string, externalId?: string): Promise<InvoiceDocument | null> {
    return this.invoiceModel.findByIdAndUpdate(
      id,
      {
        exportedToAccounting: true,
        exportedAt: new Date(),
        'accountingSystemData.externalId': externalId,
        'accountingSystemData.lastSyncDate': new Date(),
      },
      { new: true }
    ).exec();
  }

  private convertToXML(data: any): string {
    // Basit XML dönüşümü (gerçek projede daha detaylı olmalı)
    return `<?xml version="1.0" encoding="UTF-8"?>
<invoice>
  <invoiceNumber>${data.invoiceNumber}</invoiceNumber>
  <invoiceDate>${data.invoiceDate}</invoiceDate>
  <dueDate>${data.dueDate}</dueDate>
  <totalAmount>${data.totalAmount}</totalAmount>
  <status>${data.status}</status>
</invoice>`;
  }

  private convertToCSV(data: any): string {
    // Basit CSV dönüşümü
    const headers = ['Invoice Number', 'Date', 'Due Date', 'Total Amount', 'Status'];
    const values = [
      data.invoiceNumber,
      data.invoiceDate,
      data.dueDate,
      data.totalAmount,
      data.status,
    ];
    return `${headers.join(',')}\n${values.join(',')}`;
  }
}

