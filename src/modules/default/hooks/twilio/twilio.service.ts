import { Injectable } from '@nestjs/common';
import { OtpLogRepository } from 'src/repositories/otpLog.repository';
import { TwilioStatusRequest } from '../../../../dto/TwilioStatusRequest.dto';

@Injectable()
export class TwilioHookService {
  constructor(private readonly otpLogRepository: OtpLogRepository) {}
  async updateStatus(body: TwilioStatusRequest): Promise<void> {
    console.log(body.MessageStatus);
    await this.otpLogRepository.update(
      { twilioMessageId: body.SmsSid },
      { twilioStatus: body.MessageStatus },
    );
  }
}
