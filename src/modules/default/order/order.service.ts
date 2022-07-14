import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { FOLDER_NAME, FOLDER_TYPE } from 'src/common/constants/folderType.enum';
import {
  KR_NOTI_CONTENT,
  NOTI_CONTENT,
  NOTI_SUBJECT,
  NOTI_TYPE,
  VI_NOTI_CONTENT,
  VI_NOTI_SUBJECT,
} from 'src/common/constants/notification.enum';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { SMS_TYPE } from 'src/common/constants/sms-type.enum';
import { STRING_LENGTH } from 'src/common/constants/string-length.enum';
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { LocationDto } from 'src/common/dtos/location.dto';
import { FileHelper } from 'src/common/helpers/file.helper';
import { MailHelper } from 'src/common/helpers/mail.helper';
import { PriceHelper } from 'src/common/helpers/price.helper';
import { SMSHelper } from 'src/common/helpers/sms.helper';
import { customThrowError } from 'src/common/helpers/throw.helper';
import {
  addBodyToRequest,
  generateRandomCode,
  getNickname,
  getTwoDigitsDateString,
  removeAccents,
  removeIgnoredAttributes,
  getDisplayName,
  roundTwoFixed,
} from 'src/common/helpers/utility.helper';
import { addDays } from 'src/common/utils/date.utility';
import { getExtension } from 'src/common/utils/getExtension.utility';
import {
  replaceInfoNotificationByLanguage,
  replaceInfoNotificationByLanguageOrderAssignSuccess,
  replaceInfoNotificationByLanguageWithTruckOwner,
  replaceInfoNotificationByName,
} from 'src/common/utils/getLanguage.utility';
import { FoldersResponseDto } from 'src/dto/folders/FoldersResponse.dto';
import { AdditionalPriceRequest } from 'src/dto/order/additional-price-request.dto';
import { DeleteAdditionalPrice } from 'src/dto/order/delete-additional-price.dto';
import { distanceRequest } from 'src/dto/order/distance-request.dto';
import {
  FilterRequestDto,
  FilterRequestDtoV2,
  OrderQueryBuilder,
} from 'src/dto/order/filter-request.dto';
import { noteRequestDto } from 'src/dto/order/note-request.dto';
import { OrderRequestDto } from 'src/dto/order/order-request.dto';
import { OrderResponseDto } from 'src/dto/order/OrderResponse.dto';
import { PriceDto } from 'src/dto/public/price.dto';
import { GeneralSettupCommissionDto } from 'src/dto/setting/general-setting-commission.dto';
import { BankAccountDetailResponse } from 'src/dto/truckOwner/bankAccount/BankAccountDetailResponse.dto';
import { AdditionalPrice } from 'src/entities/additional-price/additional-price.entity';
import { ADDITIONAL_PROICE_OPTIONS } from 'src/entities/additional-price/enums/additional-price-options.enum';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { SETTING_TYPE } from 'src/entities/admin-setting/enums/adminSettingType.enum';
import { Commission } from 'src/entities/commission/commission.entity';
import { ACCOUNT_ROLE } from 'src/entities/customer/enums/accountRole.enum';
import {
  TRUCK_PAYLOAD,
  TRUCK_TYPE_DEFAULT,
  CONCATENATED_GOODS_PAYLOAD,
  CONTRACT_CAR_PAYLOAD,
} from 'src/entities/default-reference/enums/defaultRef.enum';
import { Driver } from 'src/entities/driver/driver.entity';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { File } from 'src/entities/file/file.entity';
import { Folder } from 'src/entities/folder/folder.entity';
import { Note } from 'src/entities/note/note.entity';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { ORDER_TYPE } from 'src/entities/order/enums/order-type.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { Order } from 'src/entities/order/order.entity';
import { PAYMENT_TYPE } from 'src/entities/payment/enums/payment.enum';
import { DefaultPayment } from 'src/entities/payment/payment.entity';
import { Province } from 'src/entities/province/province.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { FolderRepository } from 'src/repositories/folder.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { PricingRepository } from 'src/repositories/pricing.repository';
import { SettingRepository } from 'src/repositories/setting.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import {
  Connection,
  FindConditions,
  In,
  IsNull,
  Like,
  Raw,
  Repository,
  getConnection,
} from 'typeorm';
import { CreateEditNotificationDto } from '../../admin/notification/dto/CreateEditNotification.dto';
import { NotificationService } from '../../admin/notification/notification.service';
import { SmsService } from '../sms/sms.service';

interface AdditionalDictionary {
  label: ADDITIONAL_PROICE_OPTIONS;
  value: number[];
}
@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    @InjectRepository(Truck)
    private readonly truckRepository: Repository<Truck>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    private readonly customerRepository: CustomerRepository,
    private readonly adminRepository: AdminRepository,
    private readonly truckOwnerRepository: TruckOwnerRepository,
    private readonly orderRepository: OrderRepository,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly fileHelper: FileHelper,
    private readonly connection: Connection,
    private readonly folderRepository: FolderRepository,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    private readonly mailHelper: MailHelper,
    private readonly notificationService: NotificationService,
    private readonly smsHelper: SMSHelper,
    private readonly commonSettingRepository: SettingRepository,
    private readonly smsService: SmsService,
    private readonly pricingRepository: PricingRepository,
    private readonly priceHelper: PriceHelper,
    @InjectRepository(DynamicCharges)
    private readonly dynamicChargesRepository: Repository<DynamicCharges>,
    @InjectRepository(TruckOwnerBankAccount)
    private readonly bankRepository: Repository<TruckOwnerBankAccount>,
    @InjectRepository(AdditionalPrice)
    private readonly additionalPriceRepository: Repository<AdditionalPrice>,
    @InjectRepository(AdminSetting)
    private readonly adminSettingRepository: Repository<AdminSetting>,
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
    @InjectRepository(DefaultPayment)
    private readonly defaultPaymentRepository: Repository<DefaultPayment>,
    @InjectRepository(Commission)
    private readonly commissionRepository: Repository<Commission>,
  ) {}

  async onModuleInit(): Promise<boolean> {
    // await this.mirageData();
    // await this.updateOldOrders();
    return true;
  }

  async getById(id: number): Promise<OrderResponseDto> {
    const existedOrder = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'tracking',
        'notes',
        'drivers',
        'trucks',
        'folders',
        'additionalPrices',
      ],
    });

    if (!existedOrder) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }
    const imgs = await this.fileRepository.find({
      referenceId: id,
      referenceType: REFERENCE_TYPE.ORDER_DOCUMENT,
    });
    let createdBy: any;
    if (existedOrder.createdByCustomerId) {
      createdBy = await this.customerRepository.findOne({
        where: { id: existedOrder.createdByCustomerId },
        withDeleted: true,
      });
    }
    if (existedOrder.createdByAdminId) {
      createdBy = await this.adminRepository.findOne({
        where: { id: existedOrder.createdByAdminId },
        withDeleted: true,
      });
    }

    let assignToFavSelect = null;
    if (existedOrder.assignToFav) {
      const truckOwner = await this.truckOwnerRepository.findOne({
        where: { id: existedOrder.assignToFav },
        relations: ['company'],
      });
      if (truckOwner) {
        assignToFavSelect = {
          value: truckOwner.id,
          label: getDisplayName(truckOwner),
        };
      }
    }

    const resultOrder = { ...existedOrder, createdBy, imgs, assignToFavSelect };

    return new OrderResponseDto(resultOrder);
  }

  async getTruckOwnerByOrderId(id: number): Promise<TruckOwner> {
    const existedOrder = await this.orderRepository.findOne({
      where: { id },
      select: ['id', 'ownerId'],
    });
    if (!existedOrder) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }
    const truckOwner = await this.truckOwnerRepository.findOne(
      { id: existedOrder.ownerId },
      {
        select: [
          'id',
          'firstName',
          'lastName',
          'phoneNumber',
          'email',
          'publicId',
          'company',
        ],
        relations: ['company'],
      },
    );
    return truckOwner;
  }

  async createOrderOld(
    orderRequestDto: OrderRequestDto,
    user: Record<string, unknown>,
  ): Promise<Order> {
    const codeDigit = STRING_LENGTH.ORDER_RANDOM_CODE;
    this._validateRequest(orderRequestDto);

    const pickupCityNameRaw = orderRequestDto.pickupCity;
    const pickupCityModified = this._removeProvincePrefix(pickupCityNameRaw);

    const newOrderModel = this._mappingWithDto(orderRequestDto);
    newOrderModel.status = ORDER_STATUS.CREATED;
    newOrderModel.pickupCode = generateRandomCode(codeDigit);
    newOrderModel.deliveryCode = generateRandomCode(codeDigit);

    const province = await this._getProvinceByName(pickupCityModified);
    const pickupCityCode = province ? province.code : 'P00'; // Other province
    newOrderModel.pickupCity = province.id;

    if (user.role === TOKEN_ROLE.CUSTOMER) {
      newOrderModel.createdByCustomerId = +user.id;
    }

    if (user.role === TOKEN_ROLE.ADMIN) {
      newOrderModel.createdByAdminId = +user.id;
    }

    const createdOrder = await this.orderRepository.save(newOrderModel);
    const generatedOrderId = this._generateOrderId(
      createdOrder,
      pickupCityCode,
    );
    createdOrder.orderId = generatedOrderId;

    await this.orderRepository.update(createdOrder.id, {
      orderId: generatedOrderId,
    });
    return createdOrder;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  private _handlePaymentDueDate = (order: any): Date | null => {
    if (order.dropOffFields.length > 0) {
      const lastDropOff = order.dropOffFields[order.dropOffFields.length - 1];
      const lastDropOffTime = lastDropOff.dropoffTime
        ? lastDropOff.dropoffTime
        : order.createdDate;
      if (lastDropOffTime && lastDropOffTime !== '') {
        return this._calculatePaymentDueDate(
          order.paymentType,
          new Date(lastDropOffTime),
        );
      }
    }

    return this._calculatePaymentDueDate(order.paymentType, order.pickupTime);
  };

  async createOrder(
    orderRequestDto: OrderRequestDto,
    user: Record<string, unknown>,
    request: Request,
  ): Promise<Order> {
    // Temporary fix for demo 4
    if (orderRequestDto.nonMotorizedPayload?.length === 0)
      delete orderRequestDto.nonMotorizedPayload;

    if (orderRequestDto.concatenatedGoodsPayload?.length === 0)
      delete orderRequestDto.concatenatedGoodsPayload;

    if (orderRequestDto.contractCarPayload?.length === 0)
      delete orderRequestDto.contractCarPayload;

    if (
      !orderRequestDto.truckPayload &&
      orderRequestDto.truckPayload !== TRUCK_PAYLOAD.ANY
    )
      delete orderRequestDto.truckPayload;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let customer = null;
    const settingOrder = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.MONTHLY_ORDER,
    });
    if (+settingOrder.remain < 1) {
      customThrowError(
        RESPONSE_MESSAGES.LIMIT_ORDER,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.LIMIT_ORDER,
      );
    }

    try {
      const codeDigit = STRING_LENGTH.ORDER_RANDOM_CODE;
      this._validateRequest(orderRequestDto);
      const pickupCityNameRaw = orderRequestDto.pickupCity;
      const newOrderModel = this._mappingWithDto(orderRequestDto);

      let pickupCityCode = '';
      if (pickupCityNameRaw && !Number.isInteger(pickupCityNameRaw)) {
        const pickupCityModified = this._removeProvincePrefix(
          pickupCityNameRaw,
        );
        const province = await this._getProvinceByName(pickupCityModified);
        if (!province) {
          customThrowError(
            RESPONSE_MESSAGES.CITY_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            RESPONSE_MESSAGES_CODE.CITY_NOT_FOUND,
          );
        }
        pickupCityCode = province ? province.code : 'P00'; // Other province
        newOrderModel.pickupCity = province.id;
      }
      if (pickupCityNameRaw && Number.isInteger(pickupCityNameRaw)) {
        const province = await this._getProvinceById(+pickupCityNameRaw);
        pickupCityCode = province ? province.code : 'P00'; // Other province
        newOrderModel.pickupCity = +pickupCityNameRaw;
      }

      newOrderModel.status = ORDER_STATUS.CREATED;

      const orderSetting = await this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.AUTO_VERIFY_ORDER,
      });
      if (!orderSetting.enabled) {
        newOrderModel.status = ORDER_STATUS.ASSIGNING;
      }

      newOrderModel.pickupCode = generateRandomCode(codeDigit);
      newOrderModel.deliveryCode = generateRandomCode(codeDigit);
      newOrderModel.distance = await this.priceHelper.getDistances(
        orderRequestDto.pickupAddress,
        orderRequestDto.dropOffFields,
      );

      newOrderModel.paymentDueDate = this._handlePaymentDueDate(newOrderModel);

      if (user.role === TOKEN_ROLE.CUSTOMER) {
        customer = await this.customerRepository.findOne({
          where: {
            id: user.id,
          },
          relations: ['favoriteTruckOwners'],
        });
        const payment = await this.defaultPaymentRepository.findOne({
          customerId: customer.id,
        });
        if (payment) {
          if (payment.needVATInvoice) {
            newOrderModel.address = payment.address;
            newOrderModel.companyName = payment.bussinessLicenseNO;
            newOrderModel.bussinessLicenseNO = payment.companyName;
            newOrderModel.email = payment.email;
            newOrderModel.vat = true;
          }
          if (payment.paymentType) {
            newOrderModel.paymentType = payment.paymentType;
            newOrderModel.otherPaymentType = payment.otherPayment;
          }
        }
        newOrderModel.companyId = customer.companyId;
        newOrderModel.customerOwnerId = customer.ownerId;
        newOrderModel.createdByCustomerId = +user.id;
        const length = orderRequestDto.dropOffFields.length;
        const array = new Array(length);
        for (let i = 0; i < length; i++) {
          array[i] = 0;
        }
        newOrderModel.verifiedDelivery = array;
        // favoriteTruckOwners = customer.favoriteTruckOwners;
      }

      if (user.role === TOKEN_ROLE.ADMIN) {
        newOrderModel.createdByAdminId = +user.id;
      }

      const createdOrder = await queryRunner.manager.save(newOrderModel);
      const generatedOrderId = this._generateOrderId(
        createdOrder,
        pickupCityCode,
      );
      createdOrder.orderId = generatedOrderId;

      await queryRunner.manager.update(Order, createdOrder.id, {
        orderId: generatedOrderId,
      });

      await queryRunner.commitTransaction();
      const setting = await this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.MONTHLY_ORDER,
      });
      setting.remain = `${+setting.remain - 1}`;
      await this.adminSettingRepository.save(setting);
      if (customer) {
        if (orderRequestDto.orderType === ORDER_TYPE.QUICK) {
          this.mailHelper.sendNewQuickOrder(customer, createdOrder);
        }
        if (orderRequestDto.orderType === ORDER_TYPE.STANDARD) {
          this.mailHelper.sendNewOrder(customer, createdOrder);
        }
        this.mailHelper.sendOrderCodes(customer, createdOrder);
      }
      const modelNoti = await this.notificationService.createNoti(
        NOTI_TYPE.NEW_ORDER,
        createdOrder.orderId,
        customer.preferLanguage,
      );
      modelNoti.sendToCustomer = true;
      this.notificationService.sendNotification(
        modelNoti,
        customer,
        TOKEN_ROLE.CUSTOMER,
      );

      const modelNotiCode = await this.notificationService.createNoti(
        NOTI_TYPE.PICKUP_AND_DELIVERY_CODE,
        createdOrder.orderId,
        customer.preferLanguage,
      );
      modelNotiCode.sendToCustomer = true;
      this.notificationService.sendNotification(
        modelNotiCode,
        customer,
        TOKEN_ROLE.CUSTOMER,
      );
      await this.createFolder(createdOrder.id);

      addBodyToRequest(
        request,
        {
          order: generatedOrderId,
          info: createdOrder,
        },
        generatedOrderId,
      );

      if (
        createdOrder.serviceType === SERVICE_TYPE.CONCATENATED_GOODS &&
        createdOrder.referenceNo
      ) {
        await getConnection()
          .createQueryBuilder()
          .update(Order)
          .set({
            sort: createdOrder.id,
          })
          .where('"referenceNo" = :ref', { ref: createdOrder.referenceNo })
          .execute();
      } else {
        await getConnection()
          .createQueryBuilder()
          .update(Order)
          .set({
            sort: createdOrder.id,
          })
          .where('id = :id', { id: createdOrder.id })
          .execute();
      }

      return createdOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customThrowError(
        RESPONSE_MESSAGES.CREATE_ORDER_ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.CREATE_ORDER_ERROR,
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private _calculatePaymentDueDate(
    paymentType: PAYMENT_TYPE,
    deliveredTime: Date,
  ): Date | null {
    switch (paymentType) {
      case PAYMENT_TYPE.INSTANT_CASH || PAYMENT_TYPE.INSTANT_BANK:
        return deliveredTime;
      case PAYMENT_TYPE.POST_PAID_15:
        return addDays(deliveredTime, 15);
      case PAYMENT_TYPE.POST_PAID_30:
        return addDays(deliveredTime, 30);
      case PAYMENT_TYPE.POST_PAID_45:
        return addDays(deliveredTime, 45);
      case PAYMENT_TYPE.OTHER:
        return null;
    }
  }

  async update(
    orderId: number,
    orderRequestModel: OrderRequestDto,
    editBy?: Record<string, unknown>,
    request?: Request,
  ): Promise<any> {
    // Temporary fix for demo 4
    if (orderRequestModel.nonMotorizedPayload?.length === 0)
      delete orderRequestModel.nonMotorizedPayload;

    if (orderRequestModel.concatenatedGoodsPayload?.length === 0)
      delete orderRequestModel.concatenatedGoodsPayload;

    if (orderRequestModel.contractCarPayload?.length === 0)
      delete orderRequestModel.contractCarPayload;

    if (!orderRequestModel.truckPayload) delete orderRequestModel.truckPayload;

    let user = null;
    let truckOwner = null;
    let favoriteTruckOwners = [];
    const smsSetting = await this.commonSettingRepository.findOne(1);
    const existedOrder = await this.orderRepository.findOne(orderId);
    if (existedOrder.createdByCustomerId) {
      user = await this.customerRepository.findOne(
        existedOrder.createdByCustomerId,
        { relations: ['favoriteTruckOwners'], withDeleted: true },
      );
      favoriteTruckOwners = user.favoriteTruckOwners;
    }
    if (existedOrder.ownerId) {
      truckOwner = await this.truckOwnerRepository.findOne(
        existedOrder.ownerId,
        { relations: ['company'], withDeleted: true },
      );
    }
    if (!existedOrder) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    if (`${orderRequestModel.assignToFav}` === '') {
      orderRequestModel.assignToFav = null;
    }

    const updateOrder = this._mappingWithDto(orderRequestModel);

    if (
      existedOrder.deliveredTime &&
      updateOrder.status !== ORDER_STATUS.DELIVERED
    ) {
      updateOrder.deliveredTime = null;
    } else if (
      !existedOrder.deliveredTime &&
      updateOrder.status === ORDER_STATUS.DELIVERED
    ) {
      updateOrder.deliveredTime = new Date();
    }

    if (updateOrder.dropOffFields) {
      const dropoffLength = updateOrder.dropOffFields.length;
      if (existedOrder.dropOffFields.length !== dropoffLength) {
        const different = existedOrder.dropOffFields.length > dropoffLength;
        const lengthDifferent = Math.abs(
          existedOrder.dropOffFields.length - dropoffLength,
        );

        if (different) {
          updateOrder.verifiedDelivery = existedOrder.verifiedDelivery.splice(
            lengthDifferent,
          );
        }
        if (!different) {
          const curreentArr = existedOrder.verifiedDelivery;

          for (let i = 0; i < lengthDifferent; i++) {
            curreentArr.push(0);
          }
          updateOrder.verifiedDelivery = curreentArr;
        }
      }
    }

    updateOrder.paymentDueDate = this._handlePaymentDueDate(existedOrder);

    if (
      orderRequestModel.pickupCity &&
      !Number.isInteger(orderRequestModel.pickupCity)
    ) {
      const pickupCityNameRaw = orderRequestModel.pickupCity;
      const pickupCityModified = this._removeProvincePrefix(pickupCityNameRaw);
      const province = await this._getProvinceByName(pickupCityModified);
      updateOrder.pickupCity = province.id;
    }

    // Validate incoming status if it's different with existed one
    if (existedOrder.status !== orderRequestModel.status) {
      const newStatus = this._handleChangeStatus(
        existedOrder,
        orderRequestModel.status,
      );
      if (newStatus) {
        updateOrder.status = newStatus;
      }
    }
    delete updateOrder.tracking;
    delete updateOrder.id;
    delete updateOrder.orderId;
    delete updateOrder.owner;
    delete updateOrder.customerOwnerId;
    delete updateOrder.notes;
    delete updateOrder.drivers;
    delete updateOrder.trucks;
    if (updateOrder.serviceType === SERVICE_TYPE.CONCATENATED_GOODS) {
      updateOrder.concatenatedGoodsPayload = CONCATENATED_GOODS_PAYLOAD.ANY;
      delete updateOrder.contractCarPayload;
    }
    if (updateOrder.serviceType === SERVICE_TYPE.CONTRACT_CAR) {
      updateOrder.contractCarPayload = CONTRACT_CAR_PAYLOAD.ANY;
      delete updateOrder.concatenatedGoodsPayload;
    }
    const result = await this.orderRepository.update(
      existedOrder.id,
      updateOrder,
    );

    const newOrderData = await this.orderRepository.findOne(orderId);
    if (updateOrder.status === ORDER_STATUS.ASSIGNING) {
      newOrderData.ownerId = null;
      newOrderData.trucks = [];
      newOrderData.drivers = [];
      await this.orderRepository.save(newOrderData);
      if (newOrderData.assignToFav) {
        const truckowner = await this.truckOwnerRepository.findOne(
          newOrderData.assignToFav,
        );
        this._handleSendNewOrderNotiToTruckOwner(newOrderData, [truckowner]);
      } else {
        this._handleSendNewOrderNotiToTruckOwner(
          newOrderData,
          favoriteTruckOwners,
        );
      }
    }
    if (updateOrder.status === ORDER_STATUS.CUSTCANCEL) {
      if (newOrderData.ownerId) {
        this.mailHelper.sendCustomerCancelled(truckOwner, existedOrder.orderId);
        const modelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.CUSTOMER_CANCELLED_ORDER,
          existedOrder.orderId,
          truckOwner.preferLanguage,
        );
        modelNoti.sendToTruckOwner = true;
        this.notificationService.sendNotification(
          modelNoti,
          truckOwner,
          TOKEN_ROLE.TRUCK_OWNER,
        );
      }
      if (newOrderData.createdByCustomerId) {
        this.mailHelper.sendCustomerCancelledSuccess(
          user,
          newOrderData.orderId,
        );
        const modelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.ORDER_CANCELLED_SUCCESSFULLY,
          existedOrder.orderId,
          user.preferLanguage,
        );
        modelNoti.sendToCustomer = true;
        this.notificationService.sendNotification(
          modelNoti,
          user,
          TOKEN_ROLE.CUSTOMER,
        );
      }
      const modelNoti = await this.notificationService.createNoti(
        NOTI_TYPE.CUSTOMER_CANCELLED_ORDER,
        existedOrder.orderId,
        user.preferLanguage,
      );
      modelNoti.sendToCustomer = true;
      this.notificationService.sendNotification(
        modelNoti,
        user,
        TOKEN_ROLE.CUSTOMER,
      );
    }
    if (updateOrder.status === ORDER_STATUS.DRIVERCANCEL) {
      if (newOrderData.ownerId) {
        this.mailHelper.sendDriverCancelToTruck(
          truckOwner,
          existedOrder.orderId,
        );
        const modelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.TRUCK_CANCELLED_ORDER_SUCCESS,
          existedOrder.orderId,
          truckOwner.preferLanguage,
        );
        modelNoti.sendToTruckOwner = true;
        this.notificationService.sendNotification(
          modelNoti,
          truckOwner,
          TOKEN_ROLE.TRUCK_OWNER,
        );
      }
      if (newOrderData.createdByCustomerId) {
        this.mailHelper.sendDriverCancelToCustomer(user, existedOrder.orderId);
        const modelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.CANCELLED_AFTER_ASSIGNED,
          existedOrder.orderId,
          user.preferLanguage,
        );
        modelNoti.sendToCustomer = true;
        this.notificationService.sendNotification(
          modelNoti,
          user,
          TOKEN_ROLE.CUSTOMER,
        );
      }
    }
    if (updateOrder.status === ORDER_STATUS.DELIVERED) {
      if (newOrderData.ownerId) {
        this.mailHelper.sendComplete(
          truckOwner,
          newOrderData,
          TOKEN_ROLE.TRUCK_OWNER,
        );
        const modelNotiTruck = await this.notificationService.createNoti(
          NOTI_TYPE.TRUCK_ORDER_COMPLETE,
          existedOrder.orderId,
          truckOwner.preferLanguage,
        );
        modelNotiTruck.sendToTruckOwner = true;
        this.notificationService.sendNotification(
          modelNotiTruck,
          truckOwner,
          TOKEN_ROLE.TRUCK_OWNER,
        );
      }
      if (newOrderData.createdByCustomerId) {
        this.mailHelper.sendComplete(
          user,
          newOrderData,
          TOKEN_ROLE.CUSTOMER,
          truckOwner ?? null,
        );
        const modelNoti = new CreateEditNotificationDto();
        let translateLangContent, translateLangSubject;
        if (user.preferLanguage === USER_LANGUAGE.VI) {
          translateLangContent = VI_NOTI_CONTENT;
          translateLangSubject = VI_NOTI_SUBJECT;
        }
        if (
          user.preferLanguage === USER_LANGUAGE.EN ||
          user.preferLanguage === USER_LANGUAGE.ID
        ) {
          translateLangContent = NOTI_CONTENT;
          translateLangSubject = NOTI_SUBJECT;
        }
        if (user.preferLanguage === USER_LANGUAGE.KR) {
          translateLangContent = KR_NOTI_CONTENT;
          translateLangSubject = NOTI_SUBJECT;
        }
        modelNoti.body = translateLangContent[NOTI_TYPE.ORDER_COMPLETE]
          .replace('[orderID]', newOrderData?.orderId ?? '')
          .replace('[truckID]', truckOwner?.publicId ?? '');
        modelNoti.title = translateLangSubject[NOTI_TYPE.ORDER_COMPLETE];
        modelNoti.sendToCustomer = true;
        this.notificationService.sendNotification(
          modelNoti,
          user,
          TOKEN_ROLE.CUSTOMER,
        );
        if (smsSetting.orderComplete && !newOrderData.orderCompleteSms) {
          try {
            await this.smsService.sendOrderNoti(
              user,
              newOrderData.orderId,
              SMS_TYPE.ORDER_COMPLETE,
              null,
            );
            newOrderData.orderCompleteSms = true;
          } catch (err) {
            console.log('SMS Error: ', err.message);
          }
          await this.orderRepository.save(newOrderData);
        }
      }
    }
    if (updateOrder.status === ORDER_STATUS.PICKING) {
      if (newOrderData.ownerId) {
        const modelNotiTruck = await this.notificationService.createNoti(
          NOTI_TYPE.TRUCK_DRIVER_ON_THE_WAY,
          existedOrder.orderId,
          truckOwner.preferLanguage,
        );
        modelNotiTruck.sendToTruckOwner = true;
        this.notificationService.sendNotification(
          modelNotiTruck,
          truckOwner,
          TOKEN_ROLE.TRUCK_OWNER,
        );
      }
      if (newOrderData.createdByCustomerId) {
        const modelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.DRIVER_ON_THE_WAY,
          existedOrder.orderId,
          user.preferLanguage,
        );
        modelNoti.sendToCustomer = true;
        this.notificationService.sendNotification(
          modelNoti,
          user,
          TOKEN_ROLE.CUSTOMER,
        );
        if (smsSetting.driverPickingUp && !newOrderData.driverPickupSms) {
          try {
            await this.smsService.sendOrderNoti(
              user,
              newOrderData.orderId,
              SMS_TYPE.DRIVER_PICKUP,
              null,
            );
            newOrderData.driverPickupSms = true;
          } catch (err) {
            console.log('SMS Error: ', err.message);
          }
          await this.orderRepository.save(newOrderData);
        }
      }
    }
    if (updateOrder.status === ORDER_STATUS.PICK_ARRIVED) {
      if (newOrderData.ownerId) {
        const modelNotiTruck = await this.notificationService.createNoti(
          NOTI_TYPE.TRUCK_PICKUP_ARRIVED,
          existedOrder.orderId,
          truckOwner.preferLanguage,
        );
        modelNotiTruck.sendToTruckOwner = true;
        this.notificationService.sendNotification(
          modelNotiTruck,
          truckOwner,
          TOKEN_ROLE.TRUCK_OWNER,
        );
      }
      if (newOrderData.createdByCustomerId) {
        const modelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.PICKUP_ARRIVED,
          existedOrder.orderId,
          user.preferLanguage,
        );
        modelNoti.sendToCustomer = true;
        this.notificationService.sendNotification(
          modelNoti,
          user,
          TOKEN_ROLE.CUSTOMER,
        );
      }
    }
    if (updateOrder.status === ORDER_STATUS.DELIVERING) {
      if (newOrderData.ownerId) {
        const modelNotiTruck = await this.notificationService.createNoti(
          NOTI_TYPE.TRUCK_PICKUP_SUCCESSFULLY,
          existedOrder.orderId,
          truckOwner.preferLanguage,
        );
        modelNotiTruck.sendToTruckOwner = true;
        this.notificationService.sendNotification(
          modelNotiTruck,
          truckOwner,
          TOKEN_ROLE.TRUCK_OWNER,
        );
      }
      if (newOrderData.createdByCustomerId) {
        const modelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.PICKUP_SUCCESSFULLY,
          existedOrder.orderId,
          user.preferLanguage,
        );
        modelNoti.sendToCustomer = true;
        this.notificationService.sendNotification(
          modelNoti,
          user,
          TOKEN_ROLE.CUSTOMER,
        );
        if (smsSetting.driverDelivering && !newOrderData.driverDeliverySms) {
          await this.smsService.sendOrderNoti(
            user,
            newOrderData.orderId,
            SMS_TYPE.DRIVER_DELIVERY,
            null,
          );
          newOrderData.driverDeliverySms = true;
          await this.orderRepository.save(newOrderData);
        }
      }
    }
    if (updateOrder.status === ORDER_STATUS.DISPATCHED) {
      const modelNoti = replaceInfoNotificationByLanguageOrderAssignSuccess(
        existedOrder.orderId,
        NOTI_TYPE.ORDER_ASSIGNED_SUCESS,
        truckOwner.publicId,
      );

      modelNoti.sendToCustomer = true;
      this.notificationService.sendNotification(
        modelNoti,
        user,
        TOKEN_ROLE.CUSTOMER,
      );
    }
    if (
      updateOrder.status === ORDER_STATUS.CANCELED &&
      editBy.role === TOKEN_ROLE.CUSTOMER
    ) {
      if (newOrderData.ownerId) {
        this.mailHelper.sendCustomerCancelled(truckOwner, existedOrder.orderId);
        const modelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.CUSTOMER_CANCELLED_ORDER,
          existedOrder.orderId,
          truckOwner.preferLanguage,
        );
        modelNoti.sendToCustomer = true;
        this.notificationService.sendNotification(
          modelNoti,
          truckOwner,
          TOKEN_ROLE.CUSTOMER,
        );
      }
      if (newOrderData.createdByCustomerId) {
        this.mailHelper.sendCustomerCancelledSuccess(
          user,
          existedOrder.orderId,
        );
        const modelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.ORDER_CANCELLED_SUCCESSFULLY,
          existedOrder.orderId,
          user.preferLanguage,
        );
        modelNoti.sendToCustomer = true;
        this.notificationService.sendNotification(
          modelNoti,
          user,
          TOKEN_ROLE.CUSTOMER,
        );
      }
    }
    if (
      editBy.role === TOKEN_ROLE.CUSTOMER &&
      updateOrder.status !== ORDER_STATUS.ASSIGNING
    ) {
      if (newOrderData.createdByCustomerId) {
        this.mailHelper.sendEditOrder(user, newOrderData);
        const modelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.EDIT_ORDER,
          existedOrder.orderId,
          user.preferLanguage,
        );
        modelNoti.sendToCustomer = true;
        this.notificationService.sendNotification(
          modelNoti,
          user,
          TOKEN_ROLE.CUSTOMER,
        );
      }

      if (existedOrder.ownerId) {
        const truckOwner = await this.truckOwnerRepository.findOne(
          existedOrder.ownerId,
        );
        const modelNotiTruck = await this.notificationService.createNoti(
          NOTI_TYPE.TRUCK_CUSTOMER_EDIT_ORDER,
          existedOrder.orderId,
          truckOwner.preferLanguage,
        );
        modelNotiTruck.sendToTruckOwner = true;
        this.notificationService.sendNotification(
          modelNotiTruck,
          truckOwner,
          TOKEN_ROLE.TRUCK_OWNER,
        );
      }
    }

    const afterUpdatedOrder = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    addBodyToRequest(
      request,
      { order: afterUpdatedOrder.orderId, info: afterUpdatedOrder },
      afterUpdatedOrder.orderId,
    );

    if (
      afterUpdatedOrder.serviceType === SERVICE_TYPE.CONCATENATED_GOODS &&
      afterUpdatedOrder.referenceNo
    ) {
      await getConnection()
        .createQueryBuilder()
        .update(Order)
        .set({
          sort: afterUpdatedOrder.id,
        })
        .where('"referenceNo" = :ref', { ref: afterUpdatedOrder.referenceNo })
        .execute();
    } else {
      await getConnection()
        .createQueryBuilder()
        .update(Order)
        .set({
          sort: afterUpdatedOrder.id,
        })
        .where('id = :id', { id: afterUpdatedOrder.id })
        .execute();
    }

    return result;
  }

  async getList(filterOptionsModel: FilterRequestDto): Promise<any> {
    return await this.orderRepository.getList(filterOptionsModel);
  }

  async getListV2(filterOptionsModel: FilterRequestDtoV2): Promise<any> {
    const { all } = filterOptionsModel;
    let preparedFilter: OrderQueryBuilder = {
      ...filterOptionsModel,
      orderFindCondition: {},
    };
    if (all) {
      preparedFilter = this._prepareOrderFilterWithAll(preparedFilter);
    }
    return await this.orderRepository.getListv2(
      preparedFilter,
      all ? true : false,
    );
  }

  public _prepareOrderFilterWithAll(
    filter: OrderQueryBuilder,
  ): OrderQueryBuilder {
    const { all } = filter;
    return {
      ...filter,
      pickupAddress: all,
      orderId: all,
      referenceNo: all,
      dropoffAddress: all,
      orderManagerName: all,
      truckOwnerName: all,
      customerName: all,
      truckOwnerPartnerId: all,
    };
  }

  @Cron('0 0 1 * *')
  async monthlyOrderSync(): Promise<boolean> {
    const setting = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.MONTHLY_ORDER,
    });
    setting.remain = setting.rawHtml;
    const admins = await this.adminRepository.find();
    admins.map(async a => {
      a.notShowAgain = false;
      await this.adminRepository.save(a);
    });
    return true;
  }

  async delete(orderId: number, request: Request): Promise<any> {
    const order = await this.orderRepository.findOne(orderId, {
      relations: ['folders'],
    });
    order.folders = [];
    await this.orderRepository.save(order);
    await this.orderRepository.delete(orderId);

    addBodyToRequest(
      request,
      { order: order.orderId, info: order },
      order.orderId,
    );

    const setting = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.MONTHLY_ORDER,
    });

    setting.remain = `${+setting.remain + 1}`;
    return true;
  }

  async updateStatus(
    orderId: number,
    status: ORDER_STATUS,
    editBy?: Record<string, unknown>,
    request?: Request,
  ): Promise<Order> {
    const orderRequestDto = new OrderRequestDto();
    orderRequestDto.status = status;
    const result = await this.update(orderId, orderRequestDto, editBy, request);
    const newOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      select: ['orderId'],
    });

    addBodyToRequest(
      request,
      { order: newOrder.orderId, status },
      newOrder.orderId,
    );

    return result;
  }

  async getGeneralSettingCommission(
    id: number,
  ): Promise<GeneralSettupCommissionDto> {
    const setting = await this.commonSettingRepository.getGeneralSettingCommisson();
    const commission = await this.commissionRepository.findOne({
      truckOwnerId: id,
    });
    const isEnableSetupDefaultDriversCommission =
      (commission &&
        commission.enabled &&
        setting.isEnableSetupDefaultDriversCommission) ||
      (setting.isEnableSetupDefaultDriversCommission &&
        setting.isEnableAllTruckOwnersCommission);

    setting.isEnableSetupDefaultDriversCommission = isEnableSetupDefaultDriversCommission;
    delete setting.isEnableAllTruckOwnersCommission;

    return setting;
  }

  async updateCommission(
    orderId: number,
    isSetCommission: boolean,
    allowSeeCommission: boolean,
    allowSeePrice: boolean,
    percentCommission: number,
    fixedCommission: number,
  ): Promise<boolean> {
    const order = await this.orderRepository.findOne({ id: orderId });
    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }
    order.isSetCommission = isSetCommission;
    if (isSetCommission) {
      order.allowSeeCommission = allowSeeCommission;
      order.allowSeePrice = allowSeePrice;
      order.percentCommission = roundTwoFixed(percentCommission);
      order.fixedCommission = fixedCommission;
    } else {
      order.allowSeeCommission = false;
      order.allowSeePrice = false;
      order.percentCommission = null;
      order.fixedCommission = null;
    }

    this.orderRepository.save(order);
    return true;
  }

  async getTrucksByOrder(orderId: number): Promise<any> {
    const order = await this.orderRepository.findOne({
      relations: ['trucks'],
      select: ['id'],
      where: [{ id: orderId }],
    });

    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    return order.trucks;
  }

  async getDriversByOrder(orderId: number): Promise<any> {
    const order = await this.orderRepository.findOne({
      relations: ['drivers'],
      select: ['id'],
      where: [{ id: orderId }],
    });

    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    return order.drivers;
  }

  async addTruckOwnerToOrder(
    orderId: number,
    truckOwnerId: number,
    request: Request,
  ): Promise<boolean> {
    const [order, truckOwner] = await Promise.all([
      this.orderRepository.findOne({
        where: { id: orderId },
        select: ['id', 'ownerId', 'status', 'orderId'],
      }),
      this.truckOwnerRepository.findOne({
        where: { id: truckOwnerId },
      }),
    ]);

    if (!order || !truckOwner) {
      customThrowError(
        `${RESPONSE_MESSAGES.ORDER_NOT_FOUND} or ${RESPONSE_MESSAGES.TRUCK_OWNER_NOT_FOUND}`,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    if (order.status !== ORDER_STATUS.ASSIGNING) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_PERMISSION,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_PERMISSION,
      );
    }

    order.ownerId = truckOwnerId;
    order.status = ORDER_STATUS.DISPATCHED;

    await this.orderRepository.update(order.id, order);

    addBodyToRequest(
      request,
      {
        order: order.orderId,
        truckOwner: removeIgnoredAttributes(truckOwner),
      },
      order.orderId,
    );

    return true;
  }

  async addTrucksToOrder(
    orderId: number,
    truckIds: number | number[] | string | string[],
    request: Request,
  ): Promise<boolean> {
    const truckIdsArr = !Array.isArray(truckIds) ? [truckIds] : truckIds;
    const [trucks, order] = await Promise.all([
      this.truckRepository.find({
        where: { id: In(truckIdsArr) },
        select: ['id'],
      }),
      this.orderRepository.findOne({
        where: { id: orderId },
        select: ['id', 'status', 'orderId'],
        relations: ['trucks'],
      }),
    ]);

    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    order.trucks = trucks;
    await this.orderRepository.save(order);
    addBodyToRequest(
      request,
      { order: order.orderId, info: order, trucks },
      order.orderId,
    );
    return true;
  }
  async addDriversToOrder(
    orderId: number,
    driverIds: number | number[] | string | string[],
    request: Request,
  ): Promise<boolean> {
    const driverIdsArr = !Array.isArray(driverIds) ? [driverIds] : driverIds;
    const [drivers, order, trucks] = await Promise.all([
      this.driverRepository.find({
        where: { id: In(driverIdsArr) },
        select: ['id', 'firstName'],
      }),
      this.orderRepository.findOne({
        where: { id: orderId },
        select: ['id', 'ownerId', 'orderId'],
        relations: ['drivers', 'trucks'],
      }),
      this.getTrucksByOrder(orderId),
    ]);

    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }
    let truckOwner = null;

    order.drivers = drivers;
    await this.orderRepository.save(order);
    const list = drivers.reduce((previous, current) => {
      const init = [...previous];
      if (current.firstName) init.push(current.firstName);
      return init;
    }, []);

    const listTruck = trucks.reduce((previous, current) => {
      const initTruck = [...previous];
      if (current.truckNo) initTruck.push(current.truckNo);
      return initTruck;
    }, []);

    if (order.ownerId) {
      truckOwner = await this.truckOwnerRepository.findOne(order.ownerId);
      const modelNoti = replaceInfoNotificationByLanguageWithTruckOwner(
        order.orderId,
        NOTI_TYPE.TRUCK_ASSIGNED_SUCCESS,
        list.toString(),
      );

      modelNoti.sendToTruckOwner = true;
      this.notificationService.sendNotification(
        modelNoti,
        truckOwner,
        TOKEN_ROLE.TRUCK_OWNER,
      );
      this.mailHelper.sendAssignedToTruck(
        truckOwner,
        order.orderId,
        list.toString(),
        listTruck.toString(),
      );
    }

    addBodyToRequest(
      request,
      {
        order: order.orderId,
        drivers: drivers.map(x => removeIgnoredAttributes(x)),
      },
      order.orderId,
    );
    return true;
  }

  async removeTrucksFromOrder(
    orderId: number,
    truckIds: number | number[] | string | string[],
    request: Request,
  ): Promise<boolean> {
    const truckIdsArr = !Array.isArray(truckIds) ? [truckIds] : truckIds;
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      select: ['id', 'orderId'],
      relations: ['trucks'],
    });

    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    const remainTrucks = [];
    const removedTrucks = [];
    order.trucks.forEach(truck => {
      if (!truckIdsArr.includes(truck.id)) {
        remainTrucks.push(truck);
      } else {
        removedTrucks.push(truck);
      }
    });
    order.trucks = remainTrucks;

    await this.orderRepository.save(order);

    addBodyToRequest(
      request,
      {
        order: order.orderId,
        trucks: removedTrucks.map(x => removeIgnoredAttributes(x)),
      },
      order.orderId,
    );
    return true;
  }

  async deleteFolders(
    orderId: number,
    folderIds: number[],
    request: Request,
  ): Promise<Folder[]> {
    try {
      await this.fileRepository
        .createQueryBuilder()
        .delete()
        .where('folderId IN :folderIds', { folderIds: folderIds })
        .execute();
      await this.folderRepository.delete(folderIds);
      const order = await this.orderRepository.findOne(orderId, {
        select: ['id', 'orderId'],
        relations: ['folders'],
      });
      addBodyToRequest(
        request,
        {
          order: order.orderId,
          deletedFolderIds: folderIds,
        },
        order.orderId,
      );
      return order.folders;
    } catch (e) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        e,
      );
    }
  }

  async deleteFolder(
    orderId: number,
    folderId: number,
    request: Request,
  ): Promise<Folder[]> {
    try {
      await this.fileRepository
        .createQueryBuilder()
        .delete()
        .where('"folderId" = :folderId', { folderId: folderId })
        .execute();
      await this.folderRepository.delete(folderId);
      const order = await this.orderRepository.findOne(orderId, {
        select: ['id'],
        relations: ['folders'],
      });
      addBodyToRequest(
        request,
        {
          order: order.orderId,
          deletedFolderId: folderId,
        },
        order.orderId,
      );
      return order.folders;
    } catch (e) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        e,
      );
    }
  }

  async getListFolders(orderId: number): Promise<Folder[]> {
    const order = await this.orderRepository.findOne(orderId, {
      select: ['id'],
      relations: ['folders'],
    });
    return order.folders;
  }

  async getFolderDocuments(
    orderId: number,
    folderId: number,
  ): Promise<FoldersResponseDto> {
    const order = await this.orderRepository.findOne(orderId, {
      select: ['id'],
      relations: ['folders'],
    });
    const folderIds = [];

    order.folders.forEach(folder => {
      folderIds.push(folder.id);
    });
    if (!folderIds.includes(folderId)) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    const folder = await this.folderRepository.getListDocuments({ folderId });
    return folder;
  }

  async removeDriversFromOrder(
    orderId: number,
    driverIds: number | number[] | string | string[],
    request: Request,
  ): Promise<boolean> {
    const driverIdsArr = !Array.isArray(driverIds) ? [driverIds] : driverIds;
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      select: ['id', 'orderId'],
      relations: ['drivers'],
    });

    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    const remainDrivers = [];
    const removedDrivers = [];
    order.drivers.forEach(driver => {
      if (!driverIdsArr.includes(driver.id)) {
        remainDrivers.push(driver);
      } else {
        removedDrivers.push(driver);
      }
    });
    order.drivers = remainDrivers;

    await this.orderRepository.save(order);

    addBodyToRequest(
      request,
      {
        order: order.orderId,
        drivers: removedDrivers.map(d => removeIgnoredAttributes(d)),
      },
      order.orderId,
    );
    return true;
  }

  async clone(
    orderId: string,
    userId: number,
    userRole: TOKEN_ROLE,
  ): Promise<Order> {
    if (userRole === TOKEN_ROLE.DRIVER || userRole === TOKEN_ROLE.TRUCK_OWNER) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    const extraCondition: FindConditions<Order>[] = [
      {
        createdByCustomerId: userId,
      },
    ];
    if (userRole === TOKEN_ROLE.CUSTOMER) {
      const customer = await this.customerRepository.findOne(userId);
      if (!customer) {
        customThrowError(
          RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
        );
      }

      if (customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE) {
        extraCondition.push({
          customerOwnerId: customer.ownerId,
        });
      }
    }

    const existedOrder = await this.orderRepository.findOne({
      // orderId: orderId,
      where: TOKEN_ROLE.CUSTOMER
        ? extraCondition.map(c => ({ ...c, orderId }))
        : { orderId },
    });
    if (!existedOrder) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    return this._customBeforeClone(existedOrder);
  }

  private _customBeforeClone(orderModel: Order): Order {
    // List props need to reset
    const listResetProps = [
      'id',
      'orderId',
      'createdDate',
      'updatedDate',
      'trucks',
      'drivers',
      'createdByCustomer',
      'createdByAdmin',
      'verifiedPickup',
      'verifiedDelivery',
    ];

    for (const prop in orderModel) {
      if (
        orderModel[prop] === null ||
        orderModel[prop] === '' ||
        listResetProps.includes(prop)
      ) {
        delete orderModel[prop];
      }
    }

    return orderModel;
  }

  private _validateRequest(orderRequestDto: OrderRequestDto): boolean {
    if (!orderRequestDto.serviceType || !orderRequestDto.orderType) {
      customThrowError(
        RESPONSE_MESSAGES.SERVICE_TYPE_OR_ORDER_TYPE,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.SERVICE_TYPE_OR_ORDER_TYPE,
      );
    }

    switch (orderRequestDto.orderType) {
      case ORDER_TYPE.QUICK:
        if (!orderRequestDto.detailRequest) {
          customThrowError(
            RESPONSE_MESSAGES.DETAIL_REQUIRED,
            HttpStatus.BAD_REQUEST,
            RESPONSE_MESSAGES_CODE.DETAIL_REQUIRED,
          );
        }
        break;

      case ORDER_TYPE.STANDARD:
        if (!orderRequestDto.cargoType) {
          customThrowError(
            RESPONSE_MESSAGES.CARGO_TYPE_OR_NAME,
            HttpStatus.BAD_REQUEST,
            RESPONSE_MESSAGES_CODE.CARGO_TYPE_OR_NAME,
          );
        }
        this._validateServiceType(orderRequestDto);
        break;
    }

    return true;
  }

  private _validateServiceType(orderRequestDto: OrderRequestDto): boolean {
    switch (orderRequestDto.serviceType) {
      case SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK:
        if (
          !orderRequestDto.containerSize ||
          !orderRequestDto.containerType ||
          !orderRequestDto.containerQuantity
        ) {
          customThrowError(
            RESPONSE_MESSAGES.CONTAINER_REQUIRED,
            HttpStatus.BAD_REQUEST,
            RESPONSE_MESSAGES_CODE.CONTAINER_REQUIRED,
          );
        }
        break;

      case SERVICE_TYPE.NORMAL_TRUCK_VAN:
        if (
          !orderRequestDto.truckQuantity ||
          (!orderRequestDto.truckType &&
            orderRequestDto.truckType !== TRUCK_TYPE_DEFAULT.ANY) ||
          (!orderRequestDto.truckPayload &&
            orderRequestDto.truckPayload !== TRUCK_PAYLOAD.ANY)
        ) {
          console.log(
            '🚀 ~ file: order.service.ts ~ line 2132 ~ OrderService ~ _validateServiceType ~ orderRequestDto',
            orderRequestDto,
          );
          customThrowError(
            RESPONSE_MESSAGES.TRUCK_SPECIAL_OR_QUANTITY,
            HttpStatus.BAD_REQUEST,
            RESPONSE_MESSAGES_CODE.TRUCK_SPECIAL_OR_QUANTITY,
          );
        }
        break;
    }

    return true;
  }
  private _handleChangeStatus(
    order: Order,
    upcomingStatus: ORDER_STATUS,
  ): ORDER_STATUS {
    let newStatus = null;
    if (upcomingStatus === ORDER_STATUS.VERIFIED) {
      newStatus = ORDER_STATUS.ASSIGNING;
    }

    return newStatus;
  }

  private _mappingWithDto(orderRequestDto: OrderRequestDto): Order {
    const orderModel = this.orderRepository.create();

    const keys = Object.keys(orderRequestDto);
    keys.forEach(key => {
      if (key !== 'assignToFavSelect') {
        orderModel[key] = orderRequestDto[key];
      }
    });

    return orderModel;
  }

  // Format: [Q|S][Pickup city - 3letters][ddmmyy][6numbers]
  private _generateOrderId(order: Order, pickupCity: string): string {
    const orderPrefix = order.orderType == ORDER_TYPE.QUICK ? 'Q' : 'S';
    const incrementId = order.id.toString().padStart(6, '0');
    return `${orderPrefix}${pickupCity}${getTwoDigitsDateString(
      new Date(),
    )}${incrementId}`;
  }

  private async _getProvinceByName(provinceName: string): Promise<Province> {
    const slug = removeAccents(provinceName)
      .toLowerCase()
      .replace(' province', '')
      .replace(/ /g, '-');

    const province = await this.provinceRepository.findOne({
      name: Like(`%${provinceName}%`),
      countryCode: process.env.REGION,
    });

    if (province) {
      return province;
    }

    const provinceBySlug = await this.provinceRepository.findOne({
      slug: Like(`%${slug}%`),
      countryCode: process.env.REGION,
    });

    if (provinceBySlug) {
      return provinceBySlug;
    }
  }

  private async _getProvinceById(id: number): Promise<Province> {
    return await this.provinceRepository.findOne(id);
  }

  private _removeProvincePrefix(provinceName: string): string {
    return provinceName
      .replace('Thành phố ', '')
      .replace('Tỉnh ', '')
      .replace('thành phố ', '')
      .replace(' City', '');
  }

  async truckownerGetList(
    filterOptionsModel: FilterRequestDto,
    truckOwnerId: number,
  ): Promise<[Order[], number]> {
    if (!filterOptionsModel.order) {
      filterOptionsModel.order = new OrderRequestDto();
    }
    if (filterOptionsModel.order.status === ORDER_STATUS.ASSIGNING) {
      const customerIdList = await this.customerRepository.getAccessibleCustomers(
        truckOwnerId,
      );

      const truckOwner = await this.truckOwnerRepository.findOne({
        where: { id: truckOwnerId },
        select: [
          'id',
          'pickupZone',
          'verifiedStatus',
          'serviceType',
          'truckPayload',
          'containerSize',
          'nonMotorizedType',
          'concatenatedGoodsType',
          'contractCarType',
        ],
      });
      return await this.orderRepository.getNewOrders(
        customerIdList,
        truckOwner.pickupZone || [],
        truckOwner.truckPayload || [],
        truckOwner.containerSize || [],
        filterOptionsModel,
        truckOwner.serviceType,
        truckOwnerId,
        truckOwner.nonMotorizedType || [],
        truckOwner.concatenatedGoodsType || [],
        truckOwner.contractCarType || [],
      );
    }

    filterOptionsModel.order.ownerId = truckOwnerId;
    return await this.orderRepository.getList(filterOptionsModel);
  }

  async findNewTruck(
    orderId: number,
    editBy: Record<string, unknown>,
    request: Request,
  ): Promise<boolean> {
    let truckOwner,
      customer = null;
    const existedOrder = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: ['drivers', 'trucks'],
    });
    if (existedOrder.ownerId) {
      truckOwner = await this.truckOwnerRepository.findOne(
        existedOrder.ownerId,
      );
    }
    if (existedOrder.createdByCustomerId) {
      customer = await this.customerRepository.findOne(
        existedOrder.createdByCustomerId,
      );
    }
    if (!existedOrder) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    const orderRequestDto = new OrderRequestDto();

    if (existedOrder.status !== ORDER_STATUS.ASSIGNED) {
      customThrowError(
        RESPONSE_MESSAGES.FINDNEWTRUCK_ERROR_STATUS,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.FINDNEWTRUCK_ERROR_STATUS,
      );
    }

    orderRequestDto.status = ORDER_STATUS.VERIFIED;
    orderRequestDto.ownerId = null;

    existedOrder.drivers = [];
    existedOrder.trucks = [];
    await this.orderRepository.save(existedOrder);
    await this.update(orderId, orderRequestDto, editBy);
    const modelNoti = await this.notificationService.createNoti(
      NOTI_TYPE.CUSTOMER_FIND_NEW_TRUCK,
      existedOrder.orderId,
      customer.preferLanguage,
    );
    modelNoti.sendToCustomer = true;
    this.notificationService.sendNotification(
      modelNoti,
      customer,
      TOKEN_ROLE.CUSTOMER,
    );
    if (truckOwner) {
      this.mailHelper.sendCustomerFindNewTruck(
        truckOwner,
        existedOrder.orderId,
      );
      const modelNotiTruck = await this.notificationService.createNoti(
        NOTI_TYPE.FIND_NEW_TRUCK,
        existedOrder.orderId,
        truckOwner.preferLanguage,
      );
      modelNotiTruck.sendToTruckOwner = true;
      this.notificationService.sendNotification(
        modelNotiTruck,
        truckOwner,
        TOKEN_ROLE.TRUCK_OWNER,
      );
    }
    addBodyToRequest(
      request,
      { order: existedOrder.orderId },
      existedOrder.orderId,
    );
    return true;
  }

  async deleteFile(
    targetId: string,
    referenceType: number,
    request: Request,
  ): Promise<boolean> {
    const data = {
      id: targetId,
      referenceType: referenceType,
    };
    await this.fileRepository.delete(data);
    addBodyToRequest(request, data);
    return true;
  }

  async uploadDocument(
    file: Express.Multer.File,
    orderId: number,
    folderId: number,
    referenceType: number,
    request: Request,
  ): Promise<boolean> {
    const order = await this.orderRepository.findOne(orderId, {
      select: ['id', 'ownerId', 'orderId'],
    });

    const folder = await this.folderRepository.findOne(folderId);

    if (!folder) {
      customThrowError(
        RESPONSE_MESSAGES.FOLDER_NOT_EXISTED,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.FOLDER_NOT_EXISTED,
      );
    }

    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    const result = await this._uploadDocument(
      file,
      orderId,
      referenceType,
      folderId,
    );

    addBodyToRequest(
      request,
      {
        order: order.orderId,
        file: file.filename.split('.')[0],
      },
      order.orderId,
    );

    return result;
  }

  async importCsv(
    file: Express.Multer.File,
    request: Request,
  ): Promise<boolean> {
    return true;
  }

  async uploadDocumentWhenCreated(
    file: Express.Multer.File,
    orderId: number,
    referenceType: number,
    request: Request,
  ): Promise<boolean> {
    const order = await this.orderRepository.findOne(orderId, {
      select: ['id', 'ownerId', 'orderId'],
    });
    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    const result = await this._uploadDocument(file, orderId, referenceType);
    addBodyToRequest(
      request,
      {
        order: order.orderId,
        file: file.filename.split('.')[0],
      },
      order.orderId,
    );

    return result;
  }

  private async _uploadDocument(
    file: Express.Multer.File,
    orderId: number,
    referenceType: number,
    folderId?: number,
  ): Promise<boolean> {
    const extension = getExtension(file);
    const newFile = new File();
    let fileName = '';
    if (file.originalname) {
      fileName = file.originalname;
    }
    newFile.fileName = fileName;
    newFile.id = file.filename.split('.')[0];
    newFile.referenceType = referenceType;
    newFile.referenceId = orderId;
    newFile.extension = extension;
    if (folderId) {
      newFile.folderId = folderId;
    }
    await this.fileRepository.save(newFile);

    // this.fileHelper.writeFile(`${fileRecord.id}.${extension}`, file);
    return true;
  }

  async createFolder(orderId: number): Promise<Folder[]> {
    const order = await this.orderRepository.findOne(orderId, {
      select: ['id'],
    });
    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }
    const folders = [];

    const folderReport = new Folder();
    folderReport.name = FOLDER_NAME.REPORTS;
    folderReport.key = FOLDER_TYPE.REPORTS;
    folderReport.orderId = orderId;
    const folderInvoice = new Folder();
    folderInvoice.name = FOLDER_NAME.INVOICES;
    folderInvoice.key = FOLDER_TYPE.INVOICES;
    folderInvoice.orderId = orderId;
    const folderOthers = new Folder();
    folderOthers.name = FOLDER_NAME.OTHERS;
    folderOthers.key = FOLDER_TYPE.OTHERS;
    folderOthers.orderId = orderId;
    folders.push(folderReport, folderInvoice, folderOthers);

    const result = await this.folderRepository.save(folders);
    return result;
  }

  async addNote(
    model: noteRequestDto,
    orderId: number,
    request: Request,
  ): Promise<boolean> {
    const order = await this.orderRepository.findOne(orderId, {
      select: ['id', 'orderId'],
    });
    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    const note = new Note();
    note.content = model.content;
    note.orderId = orderId;

    await this.noteRepository.save(note);
    addBodyToRequest(request, { order: order.orderId, note }, order.orderId);
    return true;
  }

  async deleteNote(
    orderId: number,
    noteId: number,
    request: Request,
  ): Promise<boolean> {
    const [order, note] = await Promise.all([
      this.orderRepository.findOne(orderId, {
        select: ['id', 'orderId'],
      }),
      this.noteRepository.findOne(noteId),
    ]);
    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    await this.noteRepository.delete(note.id);
    addBodyToRequest(request, { order: order.orderId, note }, order.orderId);
    return true;
  }

  async verifyPickupCode(
    orderId: number,
    pickupCode: string,
  ): Promise<boolean> {
    const order = await this.orderRepository.findOne(orderId);
    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }
    if (order.pickupCode !== pickupCode) {
      customThrowError(
        RESPONSE_MESSAGES.PICKUP_CODE_INCORRECT,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.PICKUP_CODE_INCORRECT,
      );
    }
    order.verifiedPickup = true;
    await this.orderRepository.save(order);
    if (order.createdByCustomerId) {
      const customer = await this.customerRepository.findOne(
        order.createdByCustomerId,
      );
      const modelNoti = await this.notificationService.createNoti(
        NOTI_TYPE.PICKUP_CODE,
        order.orderId,
        customer.preferLanguage,
      );
      modelNoti.sendToCustomer = true;
      this.notificationService.sendNotification(
        modelNoti,
        customer,
        TOKEN_ROLE.CUSTOMER,
      );
    }
    if (order.ownerId) {
      const truckOwner = await this.truckOwnerRepository.findOne(order.ownerId);
      const modelNotiTruck = await this.notificationService.createNoti(
        NOTI_TYPE.ENTER_PICKUP_CODE,
        order.orderId,
        truckOwner.preferLanguage,
      );
      modelNotiTruck.sendToTruckOwner = true;
      this.notificationService.sendNotification(
        modelNotiTruck,
        truckOwner,
        TOKEN_ROLE.TRUCK_OWNER,
      );
    }

    return true;
  }

  async verifyDeliveryCode(
    orderId: number,
    deliveryCode: string,
    stepNumber: number,
  ): Promise<boolean> {
    const order = await this.orderRepository.findOne(orderId, {
      select: ['id', 'deliveryCode', 'verifiedDelivery'],
    });
    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }
    if (order.deliveryCode !== deliveryCode && deliveryCode !== 'skip') {
      customThrowError(
        RESPONSE_MESSAGES.DELIVERY_CODE_INCORRECT,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.DELIVERY_CODE_INCORRECT,
      );
    }

    if (deliveryCode === 'skip') {
      order.skippedVerifiedDelivery = true;
    }

    order.verifiedDelivery[stepNumber - 1] = 1;
    await this.orderRepository.save(order);
    if (order.createdByCustomerId) {
      const customer = await this.customerRepository.findOne(
        order.createdByCustomerId,
      );
      const modelNoti = await this.notificationService.createNoti(
        NOTI_TYPE.DELIVERY_CODE,
        order.orderId,
        customer.preferLanguage,
      );
      modelNoti.sendToCustomer = true;
      this.notificationService.sendNotification(
        modelNoti,
        customer,
        TOKEN_ROLE.CUSTOMER,
      );
    }
    if (order.ownerId) {
      const truckOwner = await this.truckOwnerRepository.findOne(order.ownerId);
      const modelNotiTruck = await this.notificationService.createNoti(
        NOTI_TYPE.ENTER_DELIVERY_CODE,
        order.orderId,
        truckOwner.preferLanguage,
      );
      modelNotiTruck.sendToTruckOwner = true;
      this.notificationService.sendNotification(
        modelNotiTruck,
        truckOwner,
        TOKEN_ROLE.TRUCK_OWNER,
      );
    }
    return true;
  }

  async _handleSendNewOrderNotiToTruckOwner(
    order: Order,
    truckOwners: TruckOwner[],
  ): Promise<void> {
    let where;

    where = [
      {
        serviceType: order.serviceType,
      },
      {
        serviceType: IsNull(),
      },
    ];

    where = where.map(condition => ({
      ...condition,
      // pickupZone: Any([order.pickupCity]),
      pickupZone: Raw(
        alias => `cast(${order.pickupCity} as text) = ANY(${alias})`,
      ),
    }));

    if (truckOwners.length) {
      where = where.map(condition => ({
        ...condition,
        id: In([...truckOwners.map(to => +to.id)]),
      }));
    }

    const list = await this.truckOwnerRepository.find({
      where,
      select: ['id', 'deviceToken', 'notiToken', 'preferLanguage'],
    });

    const modelNoti = replaceInfoNotificationByLanguage(
      order.orderId,
      NOTI_TYPE.TRUCK_NEW_ORDER,
    );
    modelNoti.sendToTruckOwner = true;

    this.notificationService.sendNotifications(
      modelNoti,
      list,
      TOKEN_ROLE.TRUCK_OWNER,
    );
  }

  async getDynamicCharges(): Promise<DynamicCharges[] | null> {
    const pricingArray = await this.pricingRepository.find({
      where: { isUsing: true },
    });

    if (!pricingArray || pricingArray.length === 0 || pricingArray.length > 1) {
      return [];
    }

    const dynamicCharges = await this.dynamicChargesRepository.find({
      where: { pricing: pricingArray[0] },
    });
    return dynamicCharges;
  }

  async getDynamicChargesWithDeleted(): Promise<DynamicCharges[] | null> {
    const pricingArray = await this.pricingRepository.find({
      where: { isUsing: true },
    });

    if (!pricingArray || pricingArray.length === 0 || pricingArray.length > 1) {
      return [];
    }

    const dynamicCharges = await this.dynamicChargesRepository.find({
      where: { pricing: pricingArray[0] },
      withDeleted: true,
    });
    return dynamicCharges;
  }

  async getActivePricing(model: OrderRequestDto | PriceDto): Promise<number> {
    const enable = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.PRICING,
    });
    if (!enable) {
      return 0;
    }
    const pricingArray = await this.pricingRepository.find({
      where: { isUsing: true },
      relations: [
        'payloadFares',
        'zonePrices',
        'distancePrices',
        'distancePrices.distances',
        'surCharges',
        'dynamicCharges',
        'truckTypeFares',
        'multipleStopsCharges',
      ],
    });

    if (!pricingArray) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (pricingArray.length === 0 || pricingArray.length > 1) {
      return 0;
    }

    const dynamicCharges = await this.dynamicChargesRepository.find({
      where: { pricing: pricingArray[0] },
    });

    let isGoogleMap = true;
    if (!model.pickupAddress) {
      isGoogleMap = false;
    }

    model.dropOffFields.map(u => {
      if (!u.dropoffAddress) {
        isGoogleMap = false;
      }
    });

    pricingArray[0].dynamicCharges = dynamicCharges;

    const pricing = pricingArray[0];
    let price = 0;
    let basePrice = 0;
    const zonePice = !isGoogleMap
      ? 0
      : await this.priceHelper.zonePrice(pricing.zonePrices, model);

    basePrice = await this.priceHelper.baseFare(
      model.truckType
        ? model.truckType
        : model.nonMotorizedType
        ? model.nonMotorizedType
        : model.concatenatedGoodsType
        ? model.concatenatedGoodsType
        : model.contractCarType
        ? model.contractCarType
        : null,
      model.serviceType,
      pricing,
    );

    let distancePrice = !isGoogleMap
      ? 0
      : await this.priceHelper.handleDistance(
          model.pickupAddress,
          model.dropOffFields,
          pricing.distancePrices,
          model?.truckPayload
            ? model?.truckPayload
            : model?.containerSize
            ? model?.containerSize
            : '0',
          model.truckType
            ? model.truckType
            : model.nonMotorizedType
            ? model.nonMotorizedType
            : model.concatenatedGoodsType
            ? model.concatenatedGoodsType
            : model.contractCarType
            ? model.contractCarType
            : '0',
        );

    const payloadPrice = await this.priceHelper.handlePayload(
      model.truckPayload ? model.truckPayload : model.containerSize,
      pricing.payloadFares,
      basePrice,
    );

    const multipleStopsPrice = !isGoogleMap
      ? 0
      : await this.priceHelper.MultipleStopsCharges(
          pricing.multipleStopsCharges,
          basePrice,
          model,
        );

    const additionalChargesPrice = await this.priceHelper.additionalCharges(
      pricing.surCharges[0],
      basePrice,
      model,
    );

    const dynamicPrice = await this.priceHelper.dynamicPrice(
      pricing.dynamicCharges,
      basePrice,
      model,
    );
    if (zonePice !== 0) {
      distancePrice = 0;
    }
    price =
      basePrice +
      distancePrice +
      payloadPrice +
      additionalChargesPrice +
      zonePice +
      dynamicPrice +
      multipleStopsPrice;

    if (model.truckQuantity && model.truckQuantity !== 0) {
      price = price * model.truckQuantity;
    }

    if (model.containerQuantity && model.containerQuantity !== 0) {
      price = price * model.containerQuantity;
    }

    if (model.nonMotorizedQuantity && model.nonMotorizedQuantity !== 0) {
      price = price * model.nonMotorizedQuantity;
    }

    if (
      model.concatenatedGoodsQuantity &&
      model.concatenatedGoodsQuantity !== 0
    ) {
      price = price * model.concatenatedGoodsQuantity;
    }

    if (model.contractCarQuantity && model.contractCarQuantity !== 0) {
      price = price * model.contractCarQuantity;
    }
    return price;
  }

  async getBankInfo(truckId: number): Promise<BankAccountDetailResponse> {
    const bankInfo = await this.bankRepository.findOne({
      where: { truckOwnerId: truckId },
    });
    if (!bankInfo) {
      return {};
    }
    return bankInfo;
  }

  async updateAdditionalPrice(
    orderId: number,
    model: AdditionalPriceRequest,
  ): Promise<boolean> {
    const promises = [];
    const store: AdditionalDictionary[] = [];

    model.additionalType.map((type, index) => {
      const typeStored = store.find(e => e.label === type);
      if (!typeStored) {
        store.push({
          label: type,
          value: [model.additionalPrice[index]],
        });
        return;
      }
      typeStored.value.push(model.additionalPrice[index]);
    });

    store.map(e => {
      e.value = [e.value.reduce((x, y) => x + y, 0)];
    });

    const typeList = [
      ...store.map(e => {
        return e.label;
      }),
    ];
    const priceList = [
      ...store.map(e => {
        return e.value[0];
      }),
    ];

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      promises.push(
        queryRunner.manager.update(
          Order,
          { id: orderId },
          {
            totalPrice: model.totalPrice,
          },
        ),
      );

      typeList.map((type, index) => {
        promises.push(
          queryRunner.connection
            .createQueryBuilder()
            .insert()
            .into(AdditionalPrice)
            .values({
              orderId,
              type,
              price: +priceList[index],
            })
            .onConflict(`("orderId", "type") DO UPDATE SET "price" = :price`)
            .setParameter('price', +priceList[index])
            .execute(),
        );
      });

      await Promise.all(promises);

      await queryRunner.commitTransaction();
      const order = await this.orderRepository.findOne(orderId);
      if (order.createdByCustomerId) {
        const customer = await this.customerRepository.findOne({
          id: order.createdByCustomerId,
        });

        if (!customer) {
          customThrowError(
            RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }
        const modelNoti = replaceInfoNotificationByName(
          order.orderId,
          NOTI_TYPE.ADJUST_FARE,
          getNickname(customer),
        );

        this.notificationService.sendNotification(
          modelNoti,
          customer,
          TOKEN_ROLE.CUSTOMER,
        );

        if (order.ownerId) {
          const truckModelNoti = replaceInfoNotificationByName(
            order.orderId,
            NOTI_TYPE.CUSTOMER_ADJUST_FARE,
            getNickname(customer),
          );
          const truckowner = await this.truckOwnerRepository.findOne(
            order.ownerId,
          );
          if (!truckowner) {
            customThrowError(
              RESPONSE_MESSAGES.TRUCK_NOT_FOUND,
              HttpStatus.NOT_FOUND,
            );
          }

          this.notificationService.sendNotification(
            truckModelNoti,
            truckowner,
            TOKEN_ROLE.TRUCK_OWNER,
          );
        }
      }
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.ERROR,
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAdditionalPrice(
    orderId: number,
    model: DeleteAdditionalPrice,
  ): Promise<boolean> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await Promise.all([
        queryRunner.manager.update(
          Order,
          { id: orderId },
          {
            totalPrice: model.totalPrice,
          },
        ),
        queryRunner.manager.delete(AdditionalPrice, {
          orderId,
          type: model.additionalType,
        }),
      ]);

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateOldOrders(): Promise<boolean> {
    const orders = await this.orderRepository.find({ distance: null });
    if (orders.length > 0) {
      orders.map(async order => {
        const dropoffAddresses = [];
        order.dropOffFields.map(u => {
          dropoffAddresses.push(JSON.parse(u));
        });
        const distance = await this.priceHelper.getDistances(
          order.pickupAddress,
          dropoffAddresses,
        );
        await this.orderRepository.save({ id: order.id, distance });
      });
    }
    return true;
  }

  async mirageData(): Promise<boolean> {
    const [orders, total] = await this.orderRepository.findAndCount();
    if (total > 0) {
      orders.map(async order => {
        if (order.dropOffFields?.length > 0) {
          await this.orderRepository.save({
            id: order.id,
          });
        } else {
          const updateData = {
            dropoffAddress: order.dropoffAddress,
            dropoffAddressText: order.dropoffAddressText,
            dropoffTime: order?.dropoffTime ?? '',
            dropoffContactNo: '',
          };
          await this.orderRepository.save({
            id: order.id,
            dropOffFields: [JSON.stringify(updateData)],
          });
        }
      });
    }
    return true;
  }

  async calculateDistanceData(model: distanceRequest): Promise<any> {
    const data = await this.priceHelper.getDistanceData(model.start, model.end);

    if (data.length === 0) {
      customThrowError(RESPONSE_MESSAGES.ERROR, HttpStatus.BAD_REQUEST);
    }

    return data;
  }

  async stupidUpdate(): Promise<boolean> {
    const update = [];

    const promises: any[] = [];

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    for (const row of update) {
      promises.push(
        queryRunner.manager.update(
          Order,
          { id: row.id },
          { customerOwnerId: row.customerOwnerId },
        ),
      );
    }

    try {
      await Promise.all(promises);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createTracking(
    orderId: number,
    user: Record<string, any>,
    location: LocationDto,
    request?: Request,
  ): Promise<boolean> {
    const { role, id } = user;

    const isDriver = role === TOKEN_ROLE.TRUCK_OWNER ? false : true;

    const order = await this.orderRepository.findOne(orderId, {
      relations: ['drivers'],
    });

    let driver = null;
    let truckowner = null;
    if (isDriver) {
      driver = await this.driverRepository.findOne({
        where: { id: id },
        select: ['id'],
      });
    } else {
      truckowner = await this.truckOwnerRepository.findOne(id);
      driver = await this.driverRepository.findOne({
        phoneNumber: truckowner.phoneNumber,
      });
    }
    let track = null;
    if (role === TOKEN_ROLE.TRUCK_OWNER) {
      track = await this.trackingRepository.findOne({
        where: { orderId, truckownerId: id },
        select: ['id'],
      });
    } else {
      track = await this.trackingRepository.findOne({
        where: { orderId, driverId: id },
        select: ['id'],
      });
    }

    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    if (
      driver &&
      !truckowner &&
      !order.drivers.filter(d => d.id === driver.id).length
    ) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_ASSIGNED,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.NOT_ASSIGNED,
      );
    }

    if (truckowner && order.ownerId !== truckowner.id) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_ASSIGNED,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.NOT_ASSIGNED,
      );
    }

    if (track) {
      track.lat = location.lat;
      track.lng = location.lng;
      await this.trackingRepository.save(track);
      return true;
    }

    const createTrackingModel = isDriver
      ? this.trackingRepository.create({
          order,
          driver,
          ...location,
        })
      : this.trackingRepository.create({
          order,
          driver,
          truckowner,
          ...location,
        });
    await this.trackingRepository.save(createTrackingModel);
    addBodyToRequest(request, {
      order: order.orderId,
      info: location,
    });
    return true;
  }

  async importData(
    file: Express.Multer.File,
    request: Request,
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const XLSX = require('xlsx');
    const wb = XLSX.read(file.buffer, { type: 'buffer' });

    const trailor = wb.Sheets[wb.SheetNames[0]];
    const normal = wb.Sheets[wb.SheetNames[1]];
    const quick = wb.Sheets[wb.SheetNames[2]];
    const nonMotorized = wb.Sheets[wb.SheetNames[3]];
    const concatenated = wb.Sheets[wb.SheetNames[4]];
    const contractCar = wb.Sheets[wb.SheetNames[5]];

    const dataTrailorTruck = XLSX.utils.sheet_to_csv(trailor);
    const normalTruckSheet = XLSX.utils.sheet_to_csv(normal);
    const quickSheet = XLSX.utils.sheet_to_csv(quick);
    const nonMotorizedSheet = XLSX.utils.sheet_to_csv(nonMotorized);
    const concatenatedSheet = XLSX.utils.sheet_to_csv(concatenated);
    const contractCarSheet = XLSX.utils.sheet_to_csv(contractCar);

    //Trailor
    const data = await this.priceHelper.csvToJson(
      dataTrailorTruck,
      SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK,
    );

    if (!data) {
      customThrowError(RESPONSE_MESSAGES.FILE_FORMAT, HttpStatus.BAD_REQUEST);
    }
    const processedData = await this.priceHelper.processData(
      data,
      ORDER_TYPE.STANDARD,
      SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK,
      (request as any).user,
    );

    //Normal
    const dataNormalTruck = await this.priceHelper.csvToJson(
      normalTruckSheet,
      SERVICE_TYPE.NORMAL_TRUCK_VAN,
    );
    if (!dataNormalTruck) {
      customThrowError(RESPONSE_MESSAGES.FILE_FORMAT, HttpStatus.BAD_REQUEST);
    }
    const processedDataNormalTruck = await this.priceHelper.processDataNormalTruck(
      dataNormalTruck,
      ORDER_TYPE.STANDARD,
      SERVICE_TYPE.NORMAL_TRUCK_VAN,
      (request as any).user,
    );

    //Quick
    const dataQuick = await this.priceHelper.csvToJsonQuick(quickSheet);
    if (!dataQuick) {
      customThrowError(RESPONSE_MESSAGES.FILE_FORMAT, HttpStatus.BAD_REQUEST);
    }
    const processedDataQuickTruck = await this.priceHelper.processDataQuickTruck(
      dataQuick,
      ORDER_TYPE.QUICK,
      (request as any).user,
    );

    //Motor
    const dataNonMotorized = await this.priceHelper.csvToJson(
      nonMotorizedSheet,
      SERVICE_TYPE.NON_MOTORIZED_VEHICLE,
    );
    if (!dataNonMotorized) {
      customThrowError(RESPONSE_MESSAGES.FILE_FORMAT, HttpStatus.BAD_REQUEST);
    }
    const processedDataNonMotorized = await this.priceHelper.processDataNonMotorized(
      dataNonMotorized,
      ORDER_TYPE.STANDARD,
      SERVICE_TYPE.NON_MOTORIZED_VEHICLE,
      (request as any).user,
    );

    //Concatenated
    const dataConcatenated = await this.priceHelper.csvToJson(
      concatenatedSheet,
      SERVICE_TYPE.CONCATENATED_GOODS,
    );
    if (!dataConcatenated) {
      customThrowError(RESPONSE_MESSAGES.FILE_FORMAT, HttpStatus.BAD_REQUEST);
    }
    const processedDataConcatenated = await this.priceHelper.processDataConcatenated(
      dataConcatenated,
      ORDER_TYPE.STANDARD,
      SERVICE_TYPE.CONCATENATED_GOODS,
      (request as any).user,
    );

    //ContractCar
    const dataContractCar = await this.priceHelper.csvToJson(
      contractCarSheet,
      SERVICE_TYPE.CONTRACT_CAR,
    );
    if (!dataContractCar) {
      customThrowError(RESPONSE_MESSAGES.FILE_FORMAT, HttpStatus.BAD_REQUEST);
    }
    const processedDataContractCar = await this.priceHelper.processDataContractCar(
      dataContractCar,
      ORDER_TYPE.STANDARD,
      SERVICE_TYPE.CONTRACT_CAR,
      (request as any).user,
    );

    const createdId = [];
    try {
      if (processedData.length >= 1 && processedData[0].length >= 1) {
        for (let j = 0; j < processedData[0].length; j++) {
          const dataReturn = await this.createOrderByImport(
            processedData[0][j],
            (request as any).user,
            request,
          );
          if (dataReturn && dataReturn.id) {
            createdId.push(dataReturn.id);
          }
        }
      }

      if (
        processedDataNormalTruck.length >= 1 &&
        processedDataNormalTruck[0].length >= 1
      ) {
        for (let j = 0; j < processedDataNormalTruck[0].length; j++) {
          const dataReturn = await this.createOrderByImport(
            processedDataNormalTruck[0][j],
            (request as any).user,
            request,
          );
          if (dataReturn && dataReturn.id) {
            createdId.push(dataReturn.id);
          }
        }
      }

      if (
        processedDataQuickTruck.length >= 1 &&
        processedDataQuickTruck[0].length >= 1
      ) {
        for (let j = 0; j < processedDataQuickTruck[0].length; j++) {
          const dataReturn = await this.createOrderByImport(
            processedDataQuickTruck[0][j],
            (request as any).user,
            request,
          );

          if (dataReturn && dataReturn.id) {
            createdId.push(dataReturn.id);
          }
        }
      }

      if (
        processedDataNonMotorized.length >= 1 &&
        processedDataNonMotorized[0].length >= 1
      ) {
        for (let j = 0; j < processedDataNonMotorized[0].length; j++) {
          const dataReturn = await this.createOrderByImport(
            processedDataNonMotorized[0][j],
            (request as any).user,
            request,
          );

          if (dataReturn && dataReturn.id) {
            createdId.push(dataReturn.id);
          }
        }
      }

      if (
        processedDataConcatenated.length >= 1 &&
        processedDataConcatenated[0].length >= 1
      ) {
        for (let j = 0; j < processedDataConcatenated[0].length; j++) {
          const dataReturn = await this.createOrderByImport(
            processedDataConcatenated[0][j],
            (request as any).user,
            request,
          );

          if (dataReturn && dataReturn.id) {
            createdId.push(dataReturn.id);
          }
        }
      }

      if (
        processedDataContractCar.length >= 1 &&
        processedDataContractCar[0].length >= 1
      ) {
        for (let j = 0; j < processedDataContractCar[0].length; j++) {
          const dataReturn = await this.createOrderByImport(
            processedDataContractCar[0][j],
            (request as any).user,
            request,
          );

          if (dataReturn && dataReturn.id) {
            createdId.push(dataReturn.id);
          }
        }
      }
    } catch (error) {
      await this.orderRepository.remove(createdId);
      customThrowError(
        error.response
          ? error.response.message
          : RESPONSE_MESSAGES.CREATE_ORDER_ERROR,
        HttpStatus.BAD_REQUEST,
        error.response
          ? error.response.errorCode
          : RESPONSE_MESSAGES_CODE.CREATE_ORDER_ERROR,
        error,
      );
      return false;
    }
    return true;
  }

  async validateData(orderRequestDto: OrderRequestDto): Promise<boolean> {
    if (
      !orderRequestDto.pickupAddressText ||
      orderRequestDto.pickupAddressText === '' ||
      !orderRequestDto.dropOffFields[0].dropoffAddressText ||
      orderRequestDto.dropOffFields[0].dropoffAddressText === ''
    ) {
      customThrowError(
        RESPONSE_MESSAGES.PICKUP_DROPOFF_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.PICKUP_DROPOFF_NOT_FOUND,
      );
    }
    return true;
  }

  async createOrderByImport(
    orderRequestDto: OrderRequestDto,
    user: Record<string, unknown>,
    request: Request,
  ): Promise<Order> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let customer = null;
    const settingOrder = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.MONTHLY_ORDER,
    });
    if (+settingOrder.remain < 1) {
      customThrowError(
        RESPONSE_MESSAGES.LIMIT_ORDER,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.LIMIT_ORDER,
      );
    }

    try {
      const codeDigit = STRING_LENGTH.ORDER_RANDOM_CODE;
      this._validateRequest(orderRequestDto);
      const pickupCityNameRaw = orderRequestDto.pickupCity;
      const newOrderModel = this._mappingWithDto(orderRequestDto);
      let pickupCityCode = '';
      if (pickupCityNameRaw && !Number.isInteger(pickupCityNameRaw)) {
        const pickupCityModified = this._removeProvincePrefix(
          pickupCityNameRaw,
        );
        const province = await this._getProvinceByName(pickupCityModified);
        if (!province) {
          newOrderModel.pickupCity = null;
        } else {
          pickupCityCode = province ? province.code : 'P00'; // Other province
          newOrderModel.pickupCity = province.id;
        }
      }
      if (pickupCityNameRaw && Number.isInteger(pickupCityNameRaw)) {
        const province = await this._getProvinceById(+pickupCityNameRaw);
        pickupCityCode = province ? province.code : 'P00'; // Other province
        newOrderModel.pickupCity = +pickupCityNameRaw;
      }

      newOrderModel.status = ORDER_STATUS.CREATED;
      const orderSetting = await this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.AUTO_VERIFY_ORDER,
      });
      if (!orderSetting.enabled) {
        newOrderModel.status = ORDER_STATUS.ASSIGNING;
      }
      newOrderModel.pickupCode = generateRandomCode(codeDigit);
      newOrderModel.deliveryCode = generateRandomCode(codeDigit);
      newOrderModel.distance = await this.priceHelper.getDistances(
        orderRequestDto.pickupAddress,
        orderRequestDto.dropOffFields,
      );

      newOrderModel.paymentDueDate = this._handlePaymentDueDate(newOrderModel);

      if (user.role === TOKEN_ROLE.CUSTOMER) {
        customer = await this.customerRepository.findOne({
          where: {
            id: user.id,
          },
          relations: ['favoriteTruckOwners'],
        });
        if (orderRequestDto.assignToFavEmail) {
          let correctEmail = false;
          for (let i = 0; i < customer.favoriteTruckOwners.length; i++) {
            if (
              customer.favoriteTruckOwners[i].email ===
              orderRequestDto.assignToFavEmail
            ) {
              newOrderModel.assignToFav = customer.favoriteTruckOwners[i].id;
              correctEmail = true;
              break;
            }
          }
          if (!correctEmail) {
            customThrowError(
              RESPONSE_MESSAGES.FAVORITE_TRUCK_INCORRECT,
              HttpStatus.NOT_FOUND,
              RESPONSE_MESSAGES_CODE.FAVORITE_TRUCK_INCORRECT,
            );
          }
        }
        const payment = await this.defaultPaymentRepository.findOne({
          customerId: customer.id,
        });
        if (payment) {
          if (payment.needVATInvoice) {
            newOrderModel.vat = true;
            newOrderModel.address = payment.address;
            newOrderModel.companyName = payment.companyName;
            newOrderModel.bussinessLicenseNO = payment.bussinessLicenseNO;
            newOrderModel.email = payment.email;
          }
        }
        if (payment.paymentType) {
          newOrderModel.paymentType = payment.paymentType;
          newOrderModel.otherPaymentType = payment.otherPayment;
        }
        newOrderModel.companyId = customer.companyId;
        newOrderModel.customerOwnerId = customer.ownerId;
        newOrderModel.createdByCustomerId = +user.id;
        const length = orderRequestDto.dropOffFields.length;
        const array = new Array(length);
        for (let i = 0; i < length; i++) {
          array[i] = 0;
        }
        newOrderModel.verifiedDelivery = array;
        // favoriteTruckOwners = customer.favoriteTruckOwners;
      }

      if (user.role === TOKEN_ROLE.ADMIN) {
        newOrderModel.createdByAdminId = +user.id;
      }

      const createdOrder = await queryRunner.manager.save(newOrderModel);
      const generatedOrderId = this._generateOrderId(
        createdOrder,
        pickupCityCode,
      );
      createdOrder.orderId = generatedOrderId;

      await queryRunner.manager.update(Order, createdOrder.id, {
        orderId: generatedOrderId,
      });

      await queryRunner.commitTransaction();
      const setting = await this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.MONTHLY_ORDER,
      });
      setting.remain = `${+setting.remain - 1}`;
      await this.adminSettingRepository.save(setting);
      if (customer) {
        if (orderRequestDto.orderType === ORDER_TYPE.QUICK) {
          this.mailHelper.sendNewQuickOrder(customer, createdOrder);
        }
        if (orderRequestDto.orderType === ORDER_TYPE.STANDARD) {
          this.mailHelper.sendNewOrder(customer, createdOrder);
        }
        this.mailHelper.sendOrderCodes(customer, createdOrder);
      }
      const modelNoti = await this.notificationService.createNoti(
        NOTI_TYPE.NEW_ORDER,
        createdOrder.orderId,
        customer.preferLanguage,
      );
      modelNoti.sendToCustomer = true;
      this.notificationService.sendNotification(
        modelNoti,
        customer,
        TOKEN_ROLE.CUSTOMER,
      );

      const modelNotiCode = await this.notificationService.createNoti(
        NOTI_TYPE.PICKUP_AND_DELIVERY_CODE,
        createdOrder.orderId,
        customer.preferLanguage,
      );
      modelNotiCode.sendToCustomer = true;
      this.notificationService.sendNotification(
        modelNotiCode,
        customer,
        TOKEN_ROLE.CUSTOMER,
      );
      await this.createFolder(createdOrder.id);

      addBodyToRequest(
        request,
        {
          order: generatedOrderId,
          info: createdOrder,
        },
        generatedOrderId,
      );

      return createdOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customThrowError(
        error.response
          ? error.response.message
          : RESPONSE_MESSAGES.CREATE_ORDER_ERROR,
        HttpStatus.BAD_REQUEST,
        error.response
          ? error.response.errorCode
          : RESPONSE_MESSAGES_CODE.CREATE_ORDER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
