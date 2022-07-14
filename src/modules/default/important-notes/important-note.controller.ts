import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Put,
  Req,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  IMPORTANT_NOTE_ACTION,
  IMPORTANT_NOTE_MODULE,
} from 'src/common/constants/actions/important-note/important-note.action';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { ImportantNote } from 'src/entities/important-notes/important-notes.entity';
import { ImportantNoteService } from './important-note.service';

@Controller('important-notes')
@UseInterceptors(ClassSerializerInterceptor)
@SetMetadata(METADATA.MODULE, IMPORTANT_NOTE_MODULE)
@ApiTags('Important note')
@ApiBearerAuth()
export class ImportantNoteController {
  constructor(private readonly importantNoteService: ImportantNoteService) {}

  @Put('')
  @SetMetadata(METADATA.ACTION, IMPORTANT_NOTE_ACTION.NOT_SHOW_AGAIN)
  async turnOffImportantNote(@Req() request: Request): Promise<boolean> {
    return this.importantNoteService.turnOffImportantNote(
      (request as any).user,
    );
  }

  @Get('')
  async retrieveImportantNote(@Req() request: Request): Promise<ImportantNote> {
    return this.importantNoteService.retrieveImportantNote(
      (request as any).user,
    );
  }
}
