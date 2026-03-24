import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument, TicketStatus } from './ticket.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { initialMessage, ...ticketData } = createTicketDto;
    
    const ticket = new this.ticketModel({
      ...ticketData,
      messages: [{
        sender: new Types.ObjectId(createTicketDto.createdBy),
        message: initialMessage,
        createdAt: new Date(),
      }],
    });
    
    return ticket.save();
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketModel
      .find()
      .populate('createdBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('messages.sender', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Ticket[]> {
    return this.ticketModel
      .find({
        $or: [
          { createdBy: new Types.ObjectId(userId) },
          { assignedTo: new Types.ObjectId(userId) },
        ],
      })
      .populate('createdBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('messages.sender', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByDepartment(department: string): Promise<Ticket[]> {
    return this.ticketModel
      .find({ department })
      .populate('createdBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('messages.sender', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.ticketModel
      .findById(id)
      .populate('createdBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('messages.sender', 'firstName lastName email role')
      .exec();
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket | null> {
    if (updateTicketDto.status === TicketStatus.RESOLVED) {
      updateTicketDto['resolvedAt'] = new Date();
    }
    
    return this.ticketModel
      .findByIdAndUpdate(id, updateTicketDto, { new: true })
      .populate('createdBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .exec();
  }

  async addReply(id: string, replyDto: ReplyTicketDto): Promise<Ticket | null> {
    const ticket = await this.ticketModel.findById(id);
    
    if (!ticket) {
      throw new Error('Ticket bulunamadı');
    }

    ticket.messages.push({
      sender: new Types.ObjectId(replyDto.sender),
      message: replyDto.message,
      attachments: replyDto.attachments || [],
      createdAt: new Date(),
    } as any);

    ticket.updatedAt = new Date();
    
    await ticket.save();
    
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ticketModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}

