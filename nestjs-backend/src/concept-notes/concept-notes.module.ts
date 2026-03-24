import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConceptNotesService } from './concept-notes.service';
import { ConceptNotesController } from './concept-notes.controller';
import { ConceptNote, ConceptNoteSchema } from './concept-note.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ConceptNote.name, schema: ConceptNoteSchema }])],
  controllers: [ConceptNotesController],
  providers: [ConceptNotesService],
  exports: [ConceptNotesService],
})
export class ConceptNotesModule {}

