import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TwilioStatusRequest } from '../../../../dto/TwilioStatusRequest.dto';
import { TwilioHookService } from './twilio.service';

@ApiTags('Twilio Hooks')
@Controller('hooks/twilio')
@UseInterceptors(ClassSerializerInterceptor)
export class TwilioHookController {
  constructor(private readonly twilioHookService: TwilioHookService) {}

  @Post('status')
  async updateStatus(@Body() model: TwilioStatusRequest): Promise<void> {
    console.log('received hooks');
    this.twilioHookService.updateStatus(model);
  }
}
