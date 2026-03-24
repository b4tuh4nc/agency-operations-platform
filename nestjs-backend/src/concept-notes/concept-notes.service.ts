import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConceptNote, ConceptNoteDocument } from './concept-note.schema';
import { CreateConceptNoteDto } from './dto/create-concept-note.dto';
import { UpdateConceptNoteDto } from './dto/update-concept-note.dto';

@Injectable()
export class ConceptNotesService {
  constructor(@InjectModel(ConceptNote.name) private conceptNoteModel: Model<ConceptNoteDocument>) {}

  async findAll(): Promise<ConceptNoteDocument[]> {
    return this.conceptNoteModel.find()
      .populate('author', 'firstName lastName email')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<ConceptNoteDocument | null> {
    return this.conceptNoteModel.findById(id)
      .populate('author', 'firstName lastName email')
      .populate('campaign', 'title')
      .exec();
  }

  async findByAuthor(authorId: string): Promise<ConceptNoteDocument[]> {
    return this.conceptNoteModel.find({ author: authorId })
      .populate('campaign', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCampaign(campaignId: string): Promise<ConceptNoteDocument[]> {
    return this.conceptNoteModel.find({ campaign: campaignId })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(createConceptNoteDto: CreateConceptNoteDto): Promise<ConceptNoteDocument> {
    const conceptNote = new this.conceptNoteModel(createConceptNoteDto);
    return conceptNote.save();
  }

  async update(id: string, updateConceptNoteDto: UpdateConceptNoteDto): Promise<ConceptNoteDocument | null> {
    return this.conceptNoteModel.findByIdAndUpdate(
      id,
      { ...updateConceptNoteDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.conceptNoteModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}

