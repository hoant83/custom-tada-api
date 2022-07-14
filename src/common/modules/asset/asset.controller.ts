import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { Response } from 'express';

@ApiTags('Asset')
@ApiBearerAuth()
@Controller('assets')
@UseInterceptors(ClassSerializerInterceptor)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get(':name')
  retrieve(@Param('name') name: string, @Res() res: Response): Promise<any> {
    return this.assetService.retrieve(name, res);
  }
}
