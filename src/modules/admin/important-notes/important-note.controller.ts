import { METADATA } from '@anpham1925/nestjs';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  IMPORTANT_NOTE_ACTION,
  IMPORTANT_NOTE_MODULE,
} from 'src/common/constants/actions/important-note/important-note.action';
import { AdminAuthenticationGuard } from 'src/common/guards/adminAuthentication.guard';
import { CreateUpdateImportantNote } from 'src/dto/requests/important-notes/create-update.dto';
import { ImportantNote } from 'src/entities/important-notes/important-notes.entity';
import { AdminImportantNoteService } from './important-note.service';

@Controller('admin-important-notes')
@UseGuards(AdminAuthenticationGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Admin - Important note')
@SetMetadata(METADATA.MODULE, IMPORTANT_NOTE_MODULE)
@ApiBearerAuth()
export class ImportantNoteController {
  constructor(
    private readonly importantNoteService: AdminImportantNoteService,
  ) {}

  @Get()
  async list(): Promise<ImportantNote[]> {
    return this.importantNoteService.list();
  }

  @Put(':id')
  @SetMetadata(METADATA.ACTION, IMPORTANT_NOTE_ACTION.UPDATE_IMPORTANT_NOTE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() model: CreateUpdateImportantNote,
  ): Promise<boolean> {
    return this.importantNoteService.update(id, model);
  }

  @SetMetadata(METADATA.IS_PUBLIC, true)
  @Get('init')
  async init(): Promise<boolean> {
    return this.importantNoteService.init();
  }
}
