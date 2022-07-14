import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as firebaseAdmin from 'firebase-admin';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { customThrowError } from 'src/common/helpers/throw.helper';
import { formatPhone } from 'src/common/helpers/utility.helper';
import {
  getNotificationByLanguge,
  replaceInfoNotificationByLanguage,
} from 'src/common/utils/getLanguage.utility';
import { Customer } from 'src/entities/customer/customer.entity';
import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { SOURCE } from 'src/entities/notification/enums/source.enum';
import { Notification } from 'src/entities/notification/notification.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { SmsService } from 'src/modules/default/sms/sms.service';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { NotificationRepository } from 'src/repositories/notification.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { IsNull, Not, Repository } from 'typeorm';
import { GetRequest } from '../user/dto/GetRequest.dto';
import { SendSms } from '../user/dto/SendSms.dto';
import { CreateEditNotificationDto } from './dto/CreateEditNotification.dto';
import { NotificationDetailtResponse } from './dto/NotificationDetailResponse.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require(`${process.cwd()}/account.json`);

@Injectable()
export class NotificationService {
  firebasAdmin;

  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly driverRepository: DriverRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly truckOwnerRepository: TruckOwnerRepository,
    @InjectRepository(NotificationInstance)
    private readonly notificationInstanceRepository: Repository<
      NotificationInstance
    >,
    private readonly notificationRepository: NotificationRepository,
    private readonly smsService: SmsService,
  ) {
    if (!firebaseAdmin.apps.length) {
      this.firebasAdmin = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      });
    }
  }

  async sendTestNoti(token: string): Promise<boolean> {
    this._sendNoti({
      token,
      notification: {
        title: 'test noti',
        body: 'message of a notification',
      },
    });
    return true;
  }

  async _sendNoti(
    message: {
      token: string | string[];
      notification: any;
    },
    specialList?: any[],
  ): Promise<void> {
    try {
      if (!specialList) {
        if (Array.isArray(message.token)) {
          await firebaseAdmin.messaging().sendMulticast({
            tokens: message.token,
            notification: message.notification,
            data: message.notification,
          });
        } else {
          await firebaseAdmin.messaging().send({
            token: message.token,
            notification: message.notification,
            data: message.notification,
          });
        }
      } else {
        specialList.map(async ele => {
          const notification = {
            title: ele.title,
            body: ele.body,
          };
          await firebaseAdmin.messaging().send({
            token: ele.token,
            notification,
            data: notification,
          });
        });
      }
    } catch (error) {
      console.log('error', '-----------------', error);
    }
  }

  async sendMessage(
    notification: Notification,
    referenceType: TOKEN_ROLE,
  ): Promise<boolean> {
    let users: any = [];
    switch (referenceType) {
      case TOKEN_ROLE.CUSTOMER:
        users = await this.customerRepository.find({
          where: [{ notiToken: Not(IsNull()) }, { deviceToken: Not(IsNull()) }],
          select: ['id', 'notiToken', 'deviceToken'],
        });
        break;
      case TOKEN_ROLE.TRUCK_OWNER:
        users = await this.truckOwnerRepository.find({
          where: [{ notiToken: Not(IsNull()) }, { deviceToken: Not(IsNull()) }],
          select: ['id', 'notiToken', 'deviceToken'],
        });
        break;
      case TOKEN_ROLE.DRIVER:
        users = await this.driverRepository.find({
          where: [{ notiToken: Not(IsNull()) }, { deviceToken: Not(IsNull()) }],
          select: ['id', 'notiToken', 'deviceToken'],
        });
        break;
    }

    const instances = users.map(u =>
      this.notificationInstanceRepository.create({
        referenceId: u.id,
        referenceType,
        notification,
      }),
    );

    const list: string[] = users.reduce(
      (previous: string[], current: Customer | TruckOwner) => {
        const init = [...previous];
        if (current.notiToken) init.push(current.notiToken);
        if (current.deviceToken) init.push(current.deviceToken);
        return init;
      },
      [],
    );

    if (!list.length) {
      return true;
    }

    await this.notificationInstanceRepository.save(instances);

    await this._sendNoti({
      token: list,
      notification: {
        title: notification.title,
        body: notification.body,
      },
    });
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async createNoti(type: string, orderId: string, lang?: string) {
    try {
      return replaceInfoNotificationByLanguage(orderId, type);
    } catch (e) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        e,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async sendNotification(
    model: CreateEditNotificationDto,
    user: any,
    referenceType: TOKEN_ROLE,
  ): Promise<boolean> {
    const notiModel = this.notificationRepository.create({
      title: model.title,
      body: model.body,
      titleEN: model.titleEN,
      bodyEN: model.bodyEN,
      titleKR: model.titleKR,
      bodyKR: model.bodyKR,
      titleID: model.titleID,
      bodyID: model.bodyID,
      source: SOURCE.SYSTEM,
      sendToTruck: model.sendToTruckOwner,
      sendToCustomer: model.sendToCustomer,
    });
    const noti = await this.notificationRepository.save(notiModel);

    const instance = new NotificationInstance();
    instance.referenceId = user.id;
    instance.notificationId = noti.id;
    instance.referenceType = referenceType;

    await this.notificationInstanceRepository.save(instance);

    const list = [];
    if (user.notiToken) list.push(user.notiToken);
    if (user.deviceToken) list.push(user.deviceToken);

    if (!list.length) {
      return true;
    }

    const { title, body } = getNotificationByLanguge(
      model,
      user.preferLanguage,
    );

    await this._sendNoti({
      token: list,
      notification: {
        title,
        body,
      },
    });
    return true;
  }

  async sendNotifications(
    model: CreateEditNotificationDto,
    users: TruckOwner[],
    referenceType: TOKEN_ROLE,
  ): Promise<boolean> {
    const notiModel = this.notificationRepository.create({
      title: model.title,
      body: model.body,
      titleEN: model.titleEN,
      bodyEN: model.bodyEN,
      titleKR: model.titleKR,
      bodyKR: model.bodyKR,
      titleID: model.titleID,
      bodyID: model.bodyID,
      source: SOURCE.SYSTEM,
      sendToCustomer: model.sendToCustomer,
      sendToTruck: model.sendToTruckOwner,
    });
    const noti = await this.notificationRepository.save(notiModel);

    const instances = users.map(u =>
      this.notificationInstanceRepository.create({
        referenceId: u.id,
        referenceType,
        notification: noti,
      }),
    );

    await this.notificationInstanceRepository.save(instances);
    const notificationList = [];

    const list: string[] = users.reduce(
      (previous: string[], current: TruckOwner) => {
        const init = [...previous];
        const { title, body } = getNotificationByLanguge(
          model,
          current.preferLanguage,
        );
        if (current.notiToken) {
          init.push(current.notiToken);
          notificationList.push({
            token: current.notiToken,
            title,
            body,
          });
        }
        if (current.deviceToken) {
          init.push(current.deviceToken);
          notificationList.push({
            token: current.deviceToken,
            title,
            body,
          });
        }
        return init;
      },
      [],
    );

    if (!list.length) {
      return true;
    }

    await this._sendNoti(
      {
        token: list,
        notification: {
          title: model.title,
          body: model.body,
        },
      },
      notificationList,
    );
    return true;
  }

  async createNotification(
    model: CreateEditNotificationDto,
    user?: Record<string, any>,
  ): Promise<boolean> {
    const notiModel = this.notificationRepository.create({
      title: model.title,
      body: model.body,
      titleEN: model.titleEN,
      bodyEN: model.bodyEN,
      titleKR: model.titleKR,
      bodyKR: model.bodyKR,
      titleID: model.titleID,
      bodyID: model.bodyID,
      source: SOURCE.MARKETING,
      sendToCustomer: model.sendToCustomer,
      sendToTruck: model.sendToTruckOwner,
      sendToDriver: model.sendToDriver,
      createdByEmail: user ? user.email : null,
    });
    const noti = await this.notificationRepository.save(notiModel);

    if (model.sendToCustomer) {
      this.sendMessage(noti, TOKEN_ROLE.CUSTOMER);
    }

    if (model.sendToTruckOwner) {
      this.sendMessage(noti, TOKEN_ROLE.TRUCK_OWNER);
    }

    if (model.sendToDriver) {
      this.sendMessage(noti, TOKEN_ROLE.DRIVER);
    }

    return true;
  }

  // getNotificationByUser(
  //   model: GetRequest,
  //   tokenData: Record<string, any>,
  // ): Promise<[Notification[], number]> {
  //   const { role, id } = tokenData;
  //   const { skip, take, searchKeyword } = model;

  //   const searchOptions = {
  //     take,
  //     skip,
  //     search: searchKeyword ?? '',
  //   };

  //   const [
  //     notifications,
  //     count,
  //   ] = await this.notificationRepository.findAndCount(searchOptions);
  // }

  async getNotifications(
    model: GetRequest,
  ): Promise<[NotificationDetailtResponse[], number]> {
    const { skip, take, searchKeyword } = model;

    const searchOptions = {
      take,
      skip,
      search: searchKeyword ?? '',
    };

    const [
      notifications,
      count,
    ] = await this.notificationRepository.getFiltered(searchOptions);

    if (!count) {
      customThrowError(RESPONSE_MESSAGES.ERROR, HttpStatus.UNAUTHORIZED);
    }

    const result = [];

    for (let i = 0; i < take; i++) {
      const noti = await this._getRelationData(notifications[i]);
      result.push(noti);
    }

    return [result, count];
  }

  private async _getRelationData(
    noti: Notification,
  ): Promise<NotificationDetailtResponse> {
    const notificationInstances = await this.notificationInstanceRepository.find(
      { notificationId: noti.id },
    );
    const length = notificationInstances.length;

    if (!length) {
      return new NotificationDetailtResponse(noti);
    }

    const customerList = [];
    const truckOwnerList = [];
    const driverList = [];

    for (let i = 0; i < length; i++) {
      const useId = notificationInstances[i].referenceId;
      switch (notificationInstances[i].referenceType) {
        case TOKEN_ROLE.CUSTOMER:
          const customer = await this.customerRepository.findOne(useId);
          customerList.push(customer);
          break;
        case TOKEN_ROLE.TRUCK_OWNER:
          const truck = await this.truckOwnerRepository.findOne(useId);
          truckOwnerList.push(truck);
          break;
        case TOKEN_ROLE.DRIVER:
          const driver = await this.driverRepository.findOne(useId);
          driverList.push(driver);
          break;
        default:
          break;
      }
    }
    noti.sendToCustomerList = customerList;
    noti.sendToTruckownerList = truckOwnerList;
    noti.sendToDriverList = driverList;
    const data: NotificationDetailtResponse = new NotificationDetailtResponse(
      noti,
    );
    return data;
  }

  async getNotification(id: number): Promise<NotificationDetailtResponse> {
    const notification = await this.notificationRepository.findOne(id);
    if (!notification) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const notificationInstances = await this.notificationInstanceRepository.find(
      { notificationId: id },
    );
    const customerList = [];
    const truckOwnerList = [];
    const driverList = [];
    if (notificationInstances.length > 0) {
      const length = notificationInstances.length;
      for (let i = 0; i < length; i++) {
        const useId = notificationInstances[i].referenceId;
        switch (notificationInstances[i].referenceType) {
          case TOKEN_ROLE.CUSTOMER:
            const customer = await this.customerRepository.findOne(useId);
            customerList.push(customer);
            break;
          case TOKEN_ROLE.TRUCK_OWNER:
            const truck = await this.truckOwnerRepository.findOne(useId);
            truckOwnerList.push(truck);
            break;
          case TOKEN_ROLE.DRIVER:
            const driver = await this.driverRepository.findOne(useId);
            driverList.push(driver);
            break;
          default:
            break;
        }
      }
    }
    notification.sendToCustomerList = customerList;
    notification.sendToTruckownerList = truckOwnerList;
    notification.sendToDriverList = driverList;
    const data: NotificationDetailtResponse = new NotificationDetailtResponse(
      notification,
    );
    return data;
  }

  async sendManualSMS(model: SendSms): Promise<boolean> {
    model.phoneNumber = formatPhone(model.phoneNumber);
    await this.smsService.sendManualSMS(model);
    return true;
  }
}
