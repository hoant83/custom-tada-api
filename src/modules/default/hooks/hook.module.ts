import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpLogRepository } from 'src/repositories/otpLog.repository';
import { TwilioHookController } from './twilio/twilio.controller';
import { TwilioHookService } from './twilio/twilio.service';

@Module({
  imports: [TypeOrmModule.forFeature([OtpLogRepository])],
  providers: [TwilioHookService],
  exports: [],
  controllers: [TwilioHookController],
})
export class HookModule {}
