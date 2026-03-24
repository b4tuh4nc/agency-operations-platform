import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './client.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private clientModel: Model<ClientDocument>) {}

  async findAll(): Promise<ClientDocument[]> {
    return this.clientModel.find().populate('staffContact', 'email firstName lastName').exec();
  }

  async findById(id: string): Promise<ClientDocument | null> {
    return this.clientModel.findById(id).populate('staffContact', 'email firstName lastName').exec();
  }

  async create(createClientDto: CreateClientDto): Promise<ClientDocument> {
    const client = new this.clientModel(createClientDto);
    return client.save();
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<ClientDocument | null> {
    return this.clientModel.findByIdAndUpdate(
      id,
      { ...updateClientDto, updatedAt: new Date() },
      { new: true }
    ).populate('staffContact', 'email firstName lastName').exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.clientModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
