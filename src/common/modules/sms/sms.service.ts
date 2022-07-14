import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.enum';
import { customThrowError } from 'src/common/helpers/throw.helper';
import { SmsDto } from 'src/dto/sms/Sms.dto';
import { Settings } from 'src/entities/setting/setting.entity';
import { Repository } from 'typeorm';
import { TOKEN_TYPE } from 'src/common/constants/token-types.enum';
import { Order } from 'src/entities/order/order.entity';
import { formatPhone } from 'src/common/helpers/utility.helper';
import { SMSHelper } from 'src/common/helpers/sms.helper';

@Injectable()
export class SmsService {
  constructor(
    @InjectRepository(Settings)
    private readonly smsRepository: Repository<Settings>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly smsHelper: SMSHelper,
  ) {}

  async initSetting(): Promise<boolean> {
    const existingSetting = await this.smsRepository.findOne(1);
    if (existingSetting) {
      customThrowError(RESPONSE_MESSAGES.INVALID, HttpStatus.BAD_REQUEST);
    }
    const smsSetting = new Settings();
    smsSetting.orderAccepted = true;
    smsSetting.orderCancelled = true;
    smsSetting.driverPickingUp = true;
    smsSetting.driverDelivering = true;
    smsSetting.orderComplete = true;
    smsSetting.totalAcceptedSms = 10;
    smsSetting.totalCancelledSms = 10;
    await this.smsRepository.save(smsSetting);
    await this.updateTotalSms();
    return true;
  }

  async updateSetting(
    model: SmsDto,
    user: Record<string, any>,
  ): Promise<boolean> {
    if (user.type !== TOKEN_TYPE.ADMIN_LOGIN) {
      customThrowError(RESPONSE_MESSAGES.INVALID, HttpStatus.UNAUTHORIZED);
    }
    const currentSetting = await this.smsRepository.findOne(1);
    const keys = Object.keys(model);
    keys.forEach(key => {
      currentSetting[key] = model[key];
    });
    await this.smsRepository.save(currentSetting);
    return true;
  }

  async updateTotalSms(): Promise<boolean> {
    const currentSetting = await this.smsRepository.findOne(1);
    const orders = await this.orderRepository.find({
      select: ['id', 'remainAcceptedSms', 'remainCancelledSms'],
    });
    orders.forEach(element => {
      element.remainAcceptedSms = currentSetting.totalAcceptedSms;
      element.remainCancelledSms = currentSetting.totalCancelledSms;
      this.orderRepository.save(element);
    });
    return true;
  }

  async getSetting(user: Record<string, any>): Promise<Settings> {
    if (!user) {
      customThrowError(RESPONSE_MESSAGES.INVALID, HttpStatus.UNAUTHORIZED);
    }
    const currentSetting = await this.smsRepository.findOne(1);
    return currentSetting;
  }

  async testSms(phone: string): Promise<boolean> {
    const phoneNumber = formatPhone(phone);
    await this.smsHelper.sendTestSMSApi(phoneNumber);
    return true;
  }
}
