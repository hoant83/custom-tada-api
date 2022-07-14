import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LanguageService } from 'src/common/modules/languagues/language.service';
import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { OtpLogRepository } from 'src/repositories/otpLog.repository';
import { SendSms } from '../../admin/user/dto/SendSms.dto';
import { SmsService } from './sms.service';

@Injectable()
export class CmcService extends SmsService {
  user: string;
  password: string;
  endpoint: string;
  viEndpoint: string;
  brand: string;
  testNumber = '84765277180';
  smsTemplate: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly otpLogRepository: OtpLogRepository,
    private readonly languageService: LanguageService,
  ) {
    super();
    this.user = this.configService.get('CMC_USER');
    this.password = this.configService.get('CMC_PASSWORD');
    this.endpoint = this.configService.get('SMS_ENDPOINT');
    this.viEndpoint = this.configService.get('SMS_ENDPOINT_UNICODE');
    this.brand = this.configService.get('CMC_BRAND');
    this.smsTemplate = this.languageService.getResource('sms');
  }

  async sendTestSMS(): Promise<void> {
    const data = {
      Brandname: this.brand,
      Message: 'I need to send this to check sms module',
      Phonenumber: this.testNumber,
      user: this.user,
      pass: this.password,
    };
    await this.httpService.post(this.endpoint, data).toPromise();
  }

  async sendOtp(otp: number, phone: string): Promise<void> {
    const data = {
      Brandname: this.brand,
      Message: `[TADA] ${otp} is your Code`,
      Phonenumber: phone,
      user: this.user,
      pass: this.password,
    };
    const result = await this.httpService.post(this.endpoint, data).toPromise();
    const otpLog = new OtpLog();
    otpLog.phoneNumber = phone;
    otpLog.log = JSON.stringify(result.data);
    await this.otpLogRepository.save(otpLog);
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
    const data = {
      Brandname: this.brand,
      Message: message,
      Phonenumber: customer.phoneNumber,
      user: this.user,
      pass: this.password,
    };
    const result = await this.httpService
      .post(lang === 'vi' ? this.viEndpoint : this.endpoint, data)
      .toPromise();
    const otpLog = new OtpLog();
    otpLog.phoneNumber = customer.phoneNumber;
    otpLog.log = JSON.stringify(result.data);
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

  sendSMS(): void {
    console.log('send with cmc');
  }

  async sendManualSMS(model: SendSms): Promise<void> {
    const phone = `${model.phoneNumber}`;
    const data = {
      Brandname: this.brand,
      Message: model.message,
      Phonenumber: phone,
      user: this.user,
      pass: this.password,
    };
    const result = await this.httpService.post(this.endpoint, data).toPromise();
    const otpLog = new OtpLog();
    otpLog.phoneNumber = phone;
    otpLog.log = JSON.stringify(result.data);
    await this.otpLogRepository.save(otpLog);
  }
}
