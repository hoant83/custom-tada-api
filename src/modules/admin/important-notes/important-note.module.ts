import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRepository } from 'src/repositories/admin.repository';
import { ImportantNoteRepository } from 'src/repositories/important-note.repository';
import { ImportantNoteController } from './important-note.controller';
import { AdminImportantNoteService } from './important-note.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImportantNoteRepository, AdminRepository]),
  ],
  controllers: [ImportantNoteController],
  providers: [AdminImportantNoteService],
})
export class AdminImportantNoteModule {}
