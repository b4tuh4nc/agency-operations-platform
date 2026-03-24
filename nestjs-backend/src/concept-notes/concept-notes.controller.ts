import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConceptNotesService } from './concept-notes.service';
import { CreateConceptNoteDto } from './dto/create-concept-note.dto';
import { UpdateConceptNoteDto } from './dto/update-concept-note.dto';

@Controller('concept-notes')
@ApiTags('concept-notes')
export class ConceptNotesController {
  constructor(private conceptNotesService: ConceptNotesService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm konsept notlarını listele' })
  async findAll(@Query('authorId') authorId?: string, @Query('campaignId') campaignId?: string) {
    if (authorId) {
      return this.conceptNotesService.findByAuthor(authorId);
    }
    if (campaignId) {
      return this.conceptNotesService.findByCampaign(campaignId);
    }
    return this.conceptNotesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Konsept notu detayını getir' })
  async findOne(@Param('id') id: string) {
    return this.conceptNotesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni konsept notu oluştur' })
  async create(@Body() createConceptNoteDto: CreateConceptNoteDto) {
    return this.conceptNotesService.create(createConceptNoteDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Konsept notunu güncelle' })
  async update(@Param('id') id: string, @Body() updateConceptNoteDto: UpdateConceptNoteDto) {
    return this.conceptNotesService.update(id, updateConceptNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Konsept notunu sil' })
  async delete(@Param('id') id: string) {
    const deleted = await this.conceptNotesService.delete(id);
    return { success: deleted };
  }
}

