import {
  ClassSerializerInterceptor,
  Controller,
  Req,
  UseInterceptors,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommonAuthenticationGuard } from 'src/common/guards/commonAuthentication.guard';
import { Request } from 'express';
import { SyncService } from './sync.service';

@ApiTags('Sync Data')
@Controller('sync-data')
@UseGuards(CommonAuthenticationGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @ApiBearerAuth()
  @Post('')
  async syncData(@Req() request: Request): Promise<boolean> {
    return await this.syncService.syncDataApi(request);
  }
}
