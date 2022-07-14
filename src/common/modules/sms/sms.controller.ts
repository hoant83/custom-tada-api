import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Post,
  SetMetadata,
  Req,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { Request } from 'express';
import { SmsService } from './sms.service';
import { SmsDto } from 'src/dto/sms/Sms.dto';
import { Settings } from 'src/entities/setting/setting.entity';
import { ADMIN_ACTION } from 'src/common/constants/actions/admin/admin.action';

@ApiTags('Sms')
@Controller('sms')
@UseInterceptors(ClassSerializerInterceptor)
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_SMS_SETTING)
  updateSmsSetting(
    @Body() model: SmsDto,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.smsService.updateSetting(model, (request as any).user);
  }

  @Get('init')
  initSetting(): Promise<boolean> {
    return this.smsService.initSetting();
  }

  @Get('test-sms-to/:number')
  testSms(@Param('number') number: string): Promise<boolean> {
    return this.smsService.testSms(number);
  }

  @Post('update-remaining-sms')
  updateSetting(): Promise<boolean> {
    return this.smsService.updateTotalSms();
  }

  @Get()
  getSetting(@Req() request: Request): Promise<Settings> {
    return this.smsService.getSetting((request as any).user);
  }
}
