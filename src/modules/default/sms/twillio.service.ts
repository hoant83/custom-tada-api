import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.enum';
import { customThrowError } from 'src/common/helpers/throw.helper';
import { LanguageService } from 'src/common/modules/languagues/language.service';
import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { OtpLogRepository } from 'src/repositories/otpLog.repository';
import { Twilio } from 'twilio';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { SmsService } from './sms.service';

interface PrepareTwilioSendMessage {
  to: string;
  body: string;
}

@Injectable()
export class TwillioService extends SmsService {
  twilio: Twilio;

  smsTemplate: string;
  from = '+6582410686';

  testPhoneKhuong = '+84768413509';

  testPhoneTan = '+84978535299';

  testPhoneAn = '+84765277180';

  testPhoneNam = '+84354492324';

  callbackUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly otpLogRepository: OtpLogRepository,
    private readonly languageService: LanguageService,
  ) {
    super();
    const twilioSid = this.configService.get<string>('TWILIO_SID');
    const twilioToken = this.configService.get<string>('TWILIO_TOKEN');
    this.callbackUrl = this.configService.get<string>('TWILIO_CALLBACK_URL');
    this.smsTemplate = this.languageService.getResource('sms');

    this.twilio = new Twilio(twilioSid, twilioToken);
  }
  sendSMS(): void {
    console.log('send with twillio');
  }

  async sendOtp(otp: number, phone: string): Promise<void> {
    try {
      const result = await this.twilio.messages.create(
        this._prepareTwilioMessage({
          to: `+${phone}`,
          body: `[TADA] ${otp} is your Code`,
        }),
      );
      const otpLog = new OtpLog();
      otpLog.phoneNumber = phone;
      otpLog.log = JSON.stringify(result);
      await this.otpLogRepository.save(otpLog);
    } catch (e) {
      if (e.code === 21614) {
        customThrowError(
          RESPONSE_MESSAGES.OTP_FAIL.replace('{{phoneNumber}}', phone),
          HttpStatus.BAD_REQUEST,
          e.code,
          e,
        );
      } else {
        customThrowError(
          RESPONSE_MESSAGES.CMC_FAIL,
          HttpStatus.BAD_REQUEST,
          e.code,
          e,
        );
      }
    }
  }

  async sendOrderNoti(
    customer: Record<string, any>,
    orderId: string,
    type: string,
    partnerId?: string,
  ): Promise<void> {
    let message;
    let lang;
    if (customer.preferLanguage === 'kr') {
      lang = 'en';
    } else {
      lang = customer.preferLanguage;
    }
    if (partnerId) {
      message = await this._getMessage(lang, type, orderId, partnerId);
    } else {
      message = await this._getMessage(lang, type, orderId);
    }

    const result = await this.twilio.messages.create(
      this._prepareTwilioMessage({
        to: `+${customer.phoneNumber}`,
        body: message,
      }),
    );
    const otpLog = new OtpLog();
    otpLog.phoneNumber = customer.phoneNumber;
    otpLog.log = JSON.stringify(result);
    await this.otpLogRepository.save(otpLog);
  }

  private async _getMessage(
    lang: string,
    type: string,
    orderId: string,
    partnerId?: string,
  ): Promise<string> {
    let message = '';
    let truckId = '';
    if (partnerId) {
      truckId = partnerId;
    }
    message = this.smsTemplate[`${lang}`][`${type}`]
      .replace('[orderID]', orderId)
      .replace('[PartnerID]', truckId);
    return message;
  }

  async sendTestSMS(): Promise<void> {
    const to = this.testPhoneNam;
    console.log('still??', {
      body: '[TADA] Testing message!',
      from: this.from,
      to,
      statusCallback: this.callbackUrl,
    });
    const result = await this.twilio.messages.create(
      this._prepareTwilioMessage({
        body: '[TADA] Testing message!',
        to,
      }),
    );
    const otpLog = new OtpLog();
    otpLog.phoneNumber = to;
    otpLog.log = JSON.stringify(result);
    otpLog.twilioMessageId = result.sid;
    otpLog.twilioStatus = result.status;

    await this.otpLogRepository.save(otpLog);
  }

  private _prepareTwilioMessage(
    model: PrepareTwilioSendMessage,
  ): MessageListInstanceCreateOptions {
    const { to, body } = model;
    return { from: this.from, to, body, statusCallback: this.callbackUrl };
  }
}
