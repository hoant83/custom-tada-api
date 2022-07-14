import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import * as mimeTypes from 'mime-types';
import * as moment from 'moment';
import { NOTI_TYPE } from 'src/common/constants/notification.enum';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { SMS_TYPE } from 'src/common/constants/sms-type.enum';
import { STRING_LENGTH } from 'src/common/constants/string-length.enum';
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { TOKEN_TYPE } from 'src/common/constants/token-types.enum';
import { TYPE_TRUCKOWNER_ORDER } from 'src/common/constants/truckowner-order.enum';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { FileHelper } from 'src/common/helpers/file.helper';
import { MailHelper } from 'src/common/helpers/mail.helper';
import { PasswordHelper } from 'src/common/helpers/password.helper';
import { SMSHelper } from 'src/common/helpers/sms.helper';
import { customThrowError } from 'src/common/helpers/throw.helper';
import { TokenHelper } from 'src/common/helpers/token.helper';
import {
  addBodyToRequest,
  formatPhone,
  getNickname,
  removeIgnoredAttributes,
} from 'src/common/helpers/utility.helper';
import { AuditLogService } from 'src/common/modules/audit-logs/audit-log.service';
import { CompanyDetailResponse } from 'src/dto/company/CompanyDetail.dto';
import { CreateCompanyDto } from 'src/dto/company/CreateCompany.dto';
import { DriverDetailResponse } from 'src/dto/driver/DriverDetail.dto';
import { FilterRequestDto } from 'src/dto/driver/filter-request.dto';
import { TruckOwnerCreateDriver } from 'src/dto/driver/TruckOwnerCreateDriver.dto';
import { JobsResponseDto } from 'src/dto/jobs/JobsResponse.dto';
import { OrderRequestDto } from 'src/dto/order/order-request.dto';
import { OrderResponseDto } from 'src/dto/order/OrderResponse.dto';
import { PaymentDoneDto } from 'src/dto/order/payment-done.dto';
import { TrucksDetailResponse } from 'src/dto/truck/TrucksDetail.dto';
import { CreateUpdateBankAccount } from 'src/dto/truckOwner/bankAccount/CreateUpdateBankAccount.dto';
import { CreateTruckDto } from 'src/dto/truckOwner/CreateTruck.dto';
import { ExportOrdersByTruckOwnerDto } from 'src/dto/truckOwner/ExportOrdersByTruckOwner.dto';
import { ChangePassword } from 'src/dto/users/ChangePassword.dto';
import { CreateUserDto } from 'src/dto/users/CreateUser.dto';
import { LoginResponseDto } from 'src/dto/users/LoginResponse.dto';
import { LoginUserDto } from 'src/dto/users/LoginUser.dto';
import { Admin } from 'src/entities/admin/admin.entity';
import { Company } from 'src/entities/company/company.entity';
import {
  NON_MOTORIZED_TYPE,
  CONCATENATED_GOODS_TYPE,
  CONTRACT_CAR_TYPE,
  TRUCK_PAYLOAD,
} from 'src/entities/default-reference/enums/defaultRef.enum';
import { Driver } from 'src/entities/driver/driver.entity';
import { VERIFIED_STATUS } from 'src/entities/enums/verifiedStatus.enum';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { File } from 'src/entities/file/file.entity';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { Order } from 'src/entities/order/order.entity';
import { Province } from 'src/entities/province/province.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { NotificationService } from 'src/modules/admin/notification/notification.service';
import { ResetPassword } from 'src/modules/admin/user/dto/ResetPassword.dto';
import { UpdateCompany } from 'src/modules/admin/user/dto/UpdateCompany.dto';
import { UpdateDriver } from 'src/modules/admin/user/dto/UpdateDriver.dto';
import { UpdateTruck } from 'src/modules/admin/user/dto/UpdateTruck.dto';
import { UpdateTruckOwner } from 'src/modules/admin/user/dto/UpdateTruckOwner.dto';
import { CompanyRepository } from 'src/repositories/company.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { TruckRepository } from 'src/repositories/truck.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { FindConditions, FindManyOptions, In, Like, Repository } from 'typeorm';
import { OrderService } from '../order/order.service';
import { SmsService } from '../sms/sms.service';
import { BlackBoxService } from '../black-box/black-box.service';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { SETTING_TYPE } from 'src/entities/admin-setting/enums/adminSettingType.enum';
import { Pricing } from 'src/entities/pricing/pricing.entity';
import { Commission } from 'src/entities/commission/commission.entity';
import { SettingRepository } from 'src/repositories/setting.repository';
import { GetDriverEarningRequestDto } from 'src/dto/commission/GetDriverEarningRequest.dto';
import { PayDriverEarningRequestDto } from 'src/dto/commission/PayDriverEarningRequest.dto';
import { DriverPaymentHistoryRepository } from 'src/repositories/driver-payment-history.repository';
import { Otp } from 'src/entities/otp/otp.entity';
import { OtpVerification } from 'src/dto/driver/OtpVerification.dto';
import { MAIL_CONFIG } from 'src/common/constants/mail-config.enum';

const FIVE_MIN = 5 * 60 * 1000;

@Injectable()
export class TruckOwnerService {
  constructor(
    private readonly truckOwnerRepository: TruckOwnerRepository,
    private readonly passwordHelper: PasswordHelper,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly fileHelper: FileHelper,
    private readonly mailHelper: MailHelper,
    private readonly tokenHelper: TokenHelper,
    private readonly companyRepository: CompanyRepository,
    @InjectRepository(Truck)
    private readonly truckRepository: TruckRepository,
    private readonly driverRepository: DriverRepository,
    private readonly orderRepository: OrderRepository,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    private readonly customerRepository: CustomerRepository,
    private readonly notificationService: NotificationService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly auditLogService: AuditLogService,
    private readonly orderService: OrderService,
    private readonly smsHelper: SMSHelper,
    private readonly settingsRepository: SettingRepository,
    private readonly smsService: SmsService,
    @InjectRepository(TruckOwnerBankAccount)
    private readonly truckOwnerBankAccountRepository: Repository<
      TruckOwnerBankAccount
    >,
    @InjectRepository(AdminSetting)
    private readonly adminSettingRepository: Repository<AdminSetting>,
    private readonly blackBoxService: BlackBoxService,
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
    @InjectRepository(Commission)
    private readonly commissionRepository: Repository<Commission>,
    private readonly driverPaymentHistoryRepository: DriverPaymentHistoryRepository,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  private async _getProvinces() {
    const provinces: any[] = [];
    const [result] = await this.provinceRepository.findAndCount({
      where: { countryCode: process.env.REGION },
    });
    result.map((item: any, index: number) => {
      provinces[index] = item.id;
    });
    return provinces;
  }

  private async _createTruckOwner(model: CreateUserDto, lang: USER_LANGUAGE) {
    try {
      let hash = '';
      if (model.password) {
        hash = await this.passwordHelper.createHash(model.password);
      }
      const publicId = await this.generatePublicId();

      const truckOwner = new TruckOwner();
      truckOwner.email = model.email;
      truckOwner.password = hash;
      truckOwner.phoneNumber = model.phoneNumber || null;
      truckOwner.referalCode = model.referalCode || null;
      truckOwner.publicId = publicId;
      truckOwner.preferLanguage = lang;

      const provinces = await this._getProvinces();
      truckOwner.pickupZone = provinces;

      const result = await this.truckOwnerRepository.save(truckOwner);

      return result;
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.CREATE_ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.CREATE_ERROR,
        error,
      );
    }
  }

  async registerAccount(
    model: CreateUserDto,
    lang: USER_LANGUAGE,
  ): Promise<boolean> {
    const modifiedPhone = formatPhone(model.phoneNumber);
    model.phoneNumber = modifiedPhone;
    const [existedEmail, existedPhone] = await Promise.all([
      this.truckOwnerRepository.findOne({ email: model.email }),
      this.truckOwnerRepository.findOne({ phoneNumber: model.phoneNumber }),
    ]);
    if (existedEmail) {
      customThrowError(
        RESPONSE_MESSAGES.EXISTED,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_EXIST,
      );
    }
    if (existedPhone) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_EXIST,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.PHONE_EXIST,
      );
    }

    await this._createTruckOwner(model, lang);
    return true;
  }

  async uploadDriverFile(
    file: Express.Multer.File,
    targetId: number,
    referenceType: number,
    ownerId: number,
  ): Promise<boolean> {
    const driver = await this.driverRepository.findOne(targetId, {
      select: ['id', 'ownerId'],
    });

    if (driver.ownerId !== ownerId) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    return await this.uploadFile(file, targetId, referenceType);
  }

  async uploadFile(
    file: Express.Multer.File,
    targetId: number,
    referenceType: number,
  ): Promise<boolean> {
    await this.fileRepository.delete({
      referenceId: targetId,
      referenceType: referenceType,
    });

    const verifyType = [
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_BACK_IMAGE,
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_FRONT_IMAGE,
    ];

    if (verifyType.includes(referenceType)) {
      await this.truckOwnerRepository.update(
        { id: targetId },
        { verifiedStatus: VERIFIED_STATUS.PENDING },
      );
    }

    const extension = mimeTypes.extension(file.mimetype);

    const newFile = new File();
    let fileName = '';
    if (file.originalname) {
      fileName = file.originalname;
    }
    newFile.fileName = fileName;
    newFile.id = file.filename.split('.')[0];
    newFile.referenceType = referenceType;
    newFile.referenceId = targetId;
    newFile.extension = extension;

    await this.fileRepository.save(newFile);

    // this.fileHelper.writeFile(`${fileRecord.id}.${extension}`, file);
    return true;
  }

  async deleteFile(
    targetId: number,
    type: number,
    requestUserId: number,
    request: Request,
  ): Promise<boolean> {
    const [targetUser, requestUser] = await Promise.all([
      this.truckOwnerRepository.findOne(targetId, {
        select: ['id'],
      }),
      this.truckOwnerRepository.findOne(requestUserId, {
        select: ['id'],
      }),
    ]);

    if (!targetUser || !requestUser) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    if (targetId !== requestUserId) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    this._deleteFile(targetId, type, request);
    return true;
  }

  async deleteCompanyFile(
    targetId: number,
    type: number,
    requestUserId: number,
    request: Request,
  ): Promise<boolean> {
    const [company, requestUser] = await Promise.all([
      this.companyRepository.findOne(targetId, {
        select: ['id'],
      }),
      this.truckOwnerRepository.findOne(requestUserId, {
        select: ['id', 'companyId'],
      }),
    ]);

    if (!company || !requestUser) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    if (requestUser.companyId !== company.id) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    this._deleteFile(targetId, type, request);
    return true;
  }

  async deleteTruckFile(
    targetId: number,
    type: number,
    requestUserId: number,
    request: Request,
  ): Promise<boolean> {
    const [truck, requestUser] = await Promise.all([
      this.truckRepository.findOne(targetId, {
        select: ['id', 'ownerId'],
      }),
      this.truckOwnerRepository.findOne(requestUserId, {
        select: ['id'],
      }),
    ]);

    if (!truck || !requestUser) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    if (requestUser.id !== truck.ownerId) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    this._deleteFile(targetId, type, request);
    return true;
  }

  async deleteDriverFile(
    targetId: number,
    type: number,
    requestUserId: number,
    request: Request,
  ): Promise<boolean> {
    const [driver, requestUser] = await Promise.all([
      this.driverRepository.findOne(targetId, {
        select: ['id', 'ownerId'],
      }),
      this.truckOwnerRepository.findOne(requestUserId, {
        select: ['id'],
      }),
    ]);

    if (!driver || !requestUser) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    if (requestUser.id !== driver.ownerId) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    this._deleteFile(targetId, type, request);
    return true;
  }

  private async _deleteFile(
    referenceId: number,
    referenceType: number,
    request: Request,
  ) {
    const data = {
      referenceId: referenceId,
      referenceType: referenceType,
    };
    await this.fileRepository.delete(data);
    addBodyToRequest(request, data);
    return true;
  }

  private async _checkPassword(plain, hash) {
    const matched = await this.passwordHelper.checkHash(plain, hash);

    if (!matched) {
      customThrowError(
        RESPONSE_MESSAGES.LOGIN_FAIL,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.LOGIN_FAIL,
      );
    }
  }

  async login(model: LoginUserDto): Promise<LoginResponseDto> {
    model.phoneNumber = model.phoneNumber
      ? formatPhone(model.phoneNumber)
      : null;
    const user = await this.truckOwnerRepository.getLoginUserWithOptions({
      email: model.email,
      phoneNumber: model.phoneNumber,
    });
    const truckPool = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.TRUCK_POOL,
    });

    let truckPoolEnable = false;
    if (truckPool && truckPool.enabled) {
      truckPoolEnable = true;
    }

    if (!user || (!truckPoolEnable && user.syncCode)) {
      customThrowError(
        RESPONSE_MESSAGES.LOGIN_FAIL,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.LOGIN_FAIL,
      );
    }
    if (user.deletedAt) {
      customThrowError(
        RESPONSE_MESSAGES.DELETED_ACCOUNT,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.DELETED_ACCOUNT,
      );
    }

    if (!user.phoneVerified && !user.emailVerified) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_OR_PHONE_NOT_VERIFY,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.EMAIL_OR_PHONE_NOT_VERIFY,
      );
    }

    const token = this.tokenHelper.createToken({
      id: user.id,
      email: user.email,
      type: TOKEN_TYPE.TRUCK_OWNER_LOGIN,
      role: TOKEN_ROLE.TRUCK_OWNER,
    });
    await this._checkPassword(model.password, user.password);

    const result: LoginResponseDto = new LoginResponseDto({ token, ...user });
    return result;
  }

  async changeUserPassword(
    id: number,
    model: ChangePassword,
  ): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const user = await this.truckOwnerRepository.findOne(
      { id },
      {
        select: ['id', 'password', 'passwordChangedAt', 'email', 'firstName'],
      },
    );
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_OWNER_NOT_FOUND,
      );
    }

    if (!(await this.passwordHelper.checkHash(model.current, user.password))) {
      customThrowError(
        RESPONSE_MESSAGES.INCORRECT_CURRENT_PASSWORD,
        HttpStatus.OK,
        RESPONSE_MESSAGES_CODE.INCORRECT_CURRENT_PASSWORD,
      );
    }

    const newHash = await this.passwordHelper.createHash(model.password);

    user.password = newHash;
    user.passwordChangedAt = new Date(now);

    await this.truckOwnerRepository.save(user);

    this.mailHelper.sendPasswordChangedEmail(user.email, user.firstName);

    return true;
  }

  async changePassword(id: number, model: ChangePassword): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const user = await this.truckOwnerRepository.findOne(
      { id },
      {
        select: ['id', 'password', 'passwordChangedAt', 'email', 'firstName'],
      },
    );
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_OWNER_NOT_FOUND,
      );
    }

    const newHash = await this.passwordHelper.createHash(model.password);

    user.password = newHash;
    user.passwordChangedAt = new Date(now);

    await this.truckOwnerRepository.save(user);

    this.mailHelper.sendPasswordChangedEmail(user.email, user.firstName);

    return true;
  }

  async forgotPassword(email: string, lang: USER_LANGUAGE): Promise<boolean> {
    const user = await this.truckOwnerRepository.findOne(
      { email: email.toLowerCase() },
      {
        select: ['id', 'email', 'firstName'],
      },
    );
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_OWNER_NOT_FOUND,
      );
    }

    const token = this.tokenHelper.createToken({
      id: user.id,
      email: user.email,
      type: TOKEN_TYPE.FORGOT_PASSWORD,
    });
    await this.mailHelper.sendForgotPassword(
      token,
      user.email,
      TOKEN_ROLE.TRUCK_OWNER,
      getNickname(user),
      lang,
    );
    return true;
  }

  async updateProfile(
    model: UpdateTruckOwner,
    targetId: number,
    currentUserId: number,
  ): Promise<LoginResponseDto> {
    if (targetId !== currentUserId) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    const truckowner = await this.truckOwnerRepository.findOne(targetId);
    const keys = Object.keys(model);

    if (model.phoneNumber) {
      model.phoneNumber = formatPhone(model.phoneNumber);
    }

    if (
      !model.containerSize &&
      !model.truckPayload &&
      !model.nonMotorizedType &&
      !model.concatenatedGoodsType &&
      !model.contractCarType
    ) {
      truckowner.containerSize = Object.values(CONTAINER_SIZE);
      truckowner.truckPayload = Object.values(TRUCK_PAYLOAD).filter(x =>
        Number.isInteger(x),
      );
      truckowner.nonMotorizedType = Object.values(NON_MOTORIZED_TYPE);
      truckowner.concatenatedGoodsType = Object.values(CONCATENATED_GOODS_TYPE);
      truckowner.contractCarType = Object.values(CONTRACT_CAR_TYPE);
    }

    if (model.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
      truckowner.truckPayload = [];
      truckowner.nonMotorizedType = [];
      truckowner.concatenatedGoodsType = [];
      truckowner.contractCarType = [];
    }

    if (model.serviceType === SERVICE_TYPE.NORMAL_TRUCK_VAN) {
      truckowner.containerSize = [];
      truckowner.nonMotorizedType = [];
      truckowner.concatenatedGoodsType = [];
      truckowner.contractCarType = [];
    }

    if (model.serviceType === SERVICE_TYPE.NON_MOTORIZED_VEHICLE) {
      truckowner.containerSize = [];
      truckowner.truckPayload = [];
      truckowner.concatenatedGoodsType = [];
      truckowner.contractCarType = [];
    }

    if (model.serviceType === SERVICE_TYPE.CONCATENATED_GOODS) {
      truckowner.truckPayload = [];
      truckowner.containerSize = [];
      truckowner.nonMotorizedType = [];
      truckowner.contractCarType = [];
    }

    if (model.serviceType === SERVICE_TYPE.CONTRACT_CAR) {
      truckowner.truckPayload = [];
      truckowner.containerSize = [];
      truckowner.nonMotorizedType = [];
      truckowner.concatenatedGoodsType = [];
    }

    keys.forEach(key => {
      truckowner[key] = model[key];
    });

    if (truckowner.password) {
      truckowner.password = await this.passwordHelper.createHash(
        truckowner.password,
      );
      const now = Math.floor(Date.now() / 1000) * 1000;
      truckowner.passwordChangedAt = new Date(now);
    } else {
      delete truckowner.password;
    }

    await this.truckOwnerRepository.save(truckowner);
    return await this.getTruckOwner(truckowner.id);
  }

  async getTruckOwner(id: number): Promise<LoginResponseDto> {
    const user = await this.truckOwnerRepository.getTruckOwnerById({
      id: id,
    });

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    const result = new LoginResponseDto(user);
    return result;
  }

  async getCustomerInfo(id: number): Promise<LoginResponseDto> {
    const user = await this.customerRepository.findOne(id, {
      relations: ['company'],
    });

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    const result = new LoginResponseDto(user);
    return result;
  }

  async getAdminInfo(id: number): Promise<LoginResponseDto> {
    const user = await this.adminRepository.findOne(id);

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    const result = new LoginResponseDto(user);
    return result;
  }

  async verifyToken(token: string): Promise<LoginResponseDto> {
    const data = this.tokenHelper.verifyToken(token);
    const user = await this.truckOwnerRepository.getUserWithOptions({
      email: data.email,
    });

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    const result = new LoginResponseDto({
      ...user,
      token,
    });
    return result;
  }

  async verifyResetToken(token: string): Promise<LoginResponseDto> {
    const data = this.tokenHelper.verifyToken(
      token,
      TOKEN_TYPE.FORGOT_PASSWORD,
    );

    const result = new LoginResponseDto({
      ...data,
      token,
    });

    return result;
  }

  async resetPassword(model: ResetPassword): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const data = this.tokenHelper.verifyToken(
      model.token,
      TOKEN_TYPE.FORGOT_PASSWORD,
    );
    const user = await this.truckOwnerRepository.findOne(
      {
        email: data.email,
        id: data.id,
      },
      // { select: ['id'] },
    );

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    user.password = await this.passwordHelper.createHash(model.password);
    user.passwordChangedAt = new Date(now);

    await this.truckOwnerRepository.save(user);

    return true;
  }

  async getListOrders(
    truckOwnerId: number,
    currentUserId: number,
    filterOptionsModel: FilterRequestDto,
  ): Promise<[Order[], number]> {
    if (truckOwnerId !== currentUserId) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    return await this._getTruckOwnerOrderByStatus(
      truckOwnerId,
      [ORDER_STATUS.ASSIGNED],
      filterOptionsModel,
    );
  }
  async getMyJobs(
    truckOwnerId: number,
    filterOptionsModel: FilterRequestDto,
  ): Promise<[JobsResponseDto[], number]> {
    const truckOwner = await this.truckOwnerRepository.findOne(truckOwnerId, {
      select: ['id', 'verifiedStatus'],
    });
    if (!truckOwner) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    const status = [
      ORDER_STATUS.DISPATCHED,
      ORDER_STATUS.PICKING,
      ORDER_STATUS.PICK_ARRIVED,
      ORDER_STATUS.PICKUPCODE_INPUTED,
      ORDER_STATUS.DELIVERING,
      ORDER_STATUS.DELIVERYCODE_INPUTED,
      ORDER_STATUS.CUSTCANCEL,
      ORDER_STATUS.DRIVERCANCEL,
    ];
    return await this._getTruckOwnerOrderByStatus(
      truckOwnerId,
      status,
      filterOptionsModel,
    );
  }

  async getPastJobs(
    truckOwnerId: number,
    currentUserId: number,
    filterOptionsModel: FilterRequestDto,
  ): Promise<[JobsResponseDto[], number]> {
    if (truckOwnerId !== currentUserId) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    return await this._getPastOrdersByStatus(
      truckOwnerId,
      [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELED],
      filterOptionsModel,
    );
  }

  private async _getTruckOwnerOrderByStatus(
    truckOwnerId: number,
    status: string | string[],
    filterOptionsModel: FilterRequestDto,
  ): Promise<[JobsResponseDto[], number]> {
    const existedTruckOwner = await this.truckOwnerRepository.findOne(
      truckOwnerId,
    );
    if (!existedTruckOwner) {
      customThrowError(
        RESPONSE_MESSAGES.TRUCK_OWNER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_OWNER_NOT_FOUND,
      );
    }

    return this.orderRepository.getJobs(
      truckOwnerId,
      filterOptionsModel,
      status,
    );
  }

  private async _getPastOrdersByStatus(
    truckOwnerId: number,
    status: string | string[],
    filterOptionsModel: FilterRequestDto,
  ): Promise<[JobsResponseDto[], number]> {
    const existedTruckOwner = await this.truckOwnerRepository.findOne(
      truckOwnerId,
    );
    if (!existedTruckOwner) {
      customThrowError(
        RESPONSE_MESSAGES.TRUCK_OWNER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_OWNER_NOT_FOUND,
      );
    }
    return this.orderRepository.getJobs(
      truckOwnerId,
      filterOptionsModel,
      status,
    );
  }

  private async _getOrdersByStatus(
    truckOwnerId: number,
    status: string | string[],
    filterOptionsModel: FilterRequestDto,
  ): Promise<any> {
    const existedTruckOwner = await this.truckOwnerRepository.findOne(
      truckOwnerId,
    );
    if (!existedTruckOwner) {
      customThrowError(
        RESPONSE_MESSAGES.TRUCK_OWNER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_OWNER_NOT_FOUND,
      );
    }

    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;
    const order = {};

    if (filterOptionsModel.orderBy) {
      order[filterOptionsModel.orderBy] = filterOptionsModel.orderDirection;
    } else {
      (order as any).createdDate = 'DESC';
    }

    if (searchBy && searchKeyword) {
      filterOptionsModel.truck[searchBy] = Like(`%${searchKeyword}%`);
    }

    const whereCond = {
      status: Array.isArray(status) ? In(status) : status,
      ownerId: truckOwnerId,
    };

    const options: FindManyOptions<Order> = {
      where: whereCond,
      skip,
      take,
      order,
      relations: ['createdByCustomer', 'createdByCustomer.company'],
    };
    return await this.orderRepository.findAndCount(options);
  }

  async takeOrder(
    orderId: string,
    truckOwnerId: number,
    request: Request,
  ): Promise<boolean> {
    const existedTruckOwner = await this.truckOwnerRepository.findOne(
      truckOwnerId,
      { relations: ['company'] },
    );
    const smsSetting = await this.settingsRepository.findOne(1);
    const order = await this.orderRepository.findOne(orderId);

    if (!existedTruckOwner || !order) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    if (order.ownerId) {
      customThrowError(
        RESPONSE_MESSAGES.TAKEN,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.ORDER_TAKEN,
      );
    }
    if (order.status !== ORDER_STATUS.ASSIGNING) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    order.ownerId = existedTruckOwner.id;
    order.status = ORDER_STATUS.ASSIGNED;
    await this.orderRepository.save(order);
    let customer = null;
    if (order.createdByCustomerId) {
      customer = await this.customerRepository.findOne(
        order.createdByCustomerId,
      );
      this.mailHelper.sendAccepted(existedTruckOwner, order.orderId, customer);
      this.mailHelper.sendAssigned(customer, order.orderId, existedTruckOwner);

      const modelNoti = await this.notificationService.createNoti(
        NOTI_TYPE.ORDER_ACCEPTED,
        order.orderId,
        customer.preferLanguage,
      );
      modelNoti.sendToCustomer = true;
      this.notificationService.sendNotification(
        modelNoti,
        customer,
        TOKEN_ROLE.CUSTOMER,
      );
      if (smsSetting.orderAccepted && order.remainAcceptedSms > 0) {
        try {
          await this.smsService.sendOrderNoti(
            customer,
            order.orderId,
            SMS_TYPE.ORDER_ACCEPTED,
            existedTruckOwner.publicId,
          );
        } catch (err) {
          console.log('TruckOwnerService ~ SMS Error');
        }
        order.remainAcceptedSms -= 1;
        await this.orderRepository.save(order);
      }
    }
    const modelNotiTruck = await this.notificationService.createNoti(
      NOTI_TYPE.TRUCK_ORDER_ACCEPT,
      order.orderId,
      existedTruckOwner.preferLanguage,
    );
    modelNotiTruck.sendToTruckOwner = true;
    this.notificationService.sendNotification(
      modelNotiTruck,
      existedTruckOwner,
      TOKEN_ROLE.TRUCK_OWNER,
    );
    addBodyToRequest(
      request,
      {
        order: order.orderId,
        truckOwner: removeIgnoredAttributes(existedTruckOwner),
      },
      order.orderId,
    );
    return true;
  }
  /* ------------------------------------------

    Company

  ------------------------------------------ */

  private async _createCompany(model: CreateCompanyDto): Promise<Company> {
    const company = new Company();
    company.name = model.name;
    company.phone = model.phone;
    company.address = model.address;
    company.licenseNo = model.licenseNo;

    const result = await this.companyRepository.save(company);
    return result;
  }

  async createCompany(
    model: CreateCompanyDto,
    currentUserId: number,
  ): Promise<CompanyDetailResponse> {
    const user = await this.truckOwnerRepository.findOne(currentUserId, {
      select: ['id', 'companyId'],
    });

    if (user.companyId) {
      customThrowError(
        RESPONSE_MESSAGES.COMPANY_EXIST,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.COMPANY_EXIST,
      );
    }

    const company = await this._createCompany(model);
    user.companyId = company.id;
    user.companyName = company.name;
    await this.truckOwnerRepository.save(user);
    return await this.getCompany(user.id);
  }

  async getCompany(currentUserId: number): Promise<CompanyDetailResponse> {
    const user = await this.truckOwnerRepository.findOne(currentUserId);
    if (!user.companyId) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.COMPANY_NOT_EXISTED,
      );
    }
    const company = await this.companyRepository.getCompanyWithOptions({
      id: user.companyId,
    });
    if (!company) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.COMPANY_NOT_EXISTED,
      );
    }

    const result = new CompanyDetailResponse(company);

    return result;
  }

  async updateCompany(
    model: UpdateCompany,
    currentUserId: number,
  ): Promise<CompanyDetailResponse> {
    const user = await this.truckOwnerRepository.findOne(currentUserId, {
      select: ['id', 'companyId'],
    });

    if (!user.companyId) {
      const company = await this._createCompany(model);
      user.companyId = company.id;
      user.companyName = company.name;
      await this.truckOwnerRepository.save(user);
      return await this.getCompany(user.id);
    }

    const company = await this.companyRepository.findOne({
      id: user.companyId,
    });

    const keys = Object.keys(model);

    keys.forEach(key => {
      company[key] = model[key];
    });
    await this.companyRepository.save(company);
    return await this.getCompany(user.id);
  }

  async createBankAccount(
    model: CreateUpdateBankAccount,
    currentUserId: number,
  ): Promise<TruckOwnerBankAccount> {
    const bankAccount = await this.truckOwnerBankAccountRepository.findOne({
      where: { truckOwnerId: currentUserId },
    });

    if (bankAccount) {
      customThrowError(
        RESPONSE_MESSAGES.BANK_ACCOUNT_EXIST,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.BANK_ACCOUNT_EXIST,
      );
    }

    const result = await this.truckOwnerBankAccountRepository.save(
      this.truckOwnerBankAccountRepository.create({
        truckOwnerId: currentUserId,
        companyName: model.companyName,
        businessLicenseNo: model.businessLicenseNo,
        bankName: model.bankName,
        bankBranch: model.bankBranch,
        bankAccountHolderName: model.bankAccountHolderName,
        bankAccountNumber: model.bankAccountNumber,
      }),
    );
    return await this.getBankAccount(result.truckOwnerId);
  }

  async getBankAccount(truckOwnerId: number): Promise<TruckOwnerBankAccount> {
    return await this.truckOwnerBankAccountRepository.findOne({
      where: { truckOwnerId },
    });
  }

  async updateBankAccount(
    model: CreateUpdateBankAccount,
    currentUserId: number,
  ): Promise<TruckOwnerBankAccount> {
    const bankAccount = await this.truckOwnerBankAccountRepository.findOne({
      where: { truckOwnerId: currentUserId },
    });

    if (!bankAccount) {
      customThrowError(
        RESPONSE_MESSAGES.BANK_ACCOUNT_NOT_EXISTED,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.BANK_ACCOUNT_NOT_EXISTED,
      );
    }

    const keys = Object.keys(model);

    keys.forEach(key => {
      bankAccount[key] = model[key];
    });
    const result = await this.truckOwnerBankAccountRepository.save(bankAccount);
    return await this.getBankAccount(result.truckOwnerId);
  }

  /* ------------------------------------------

    Truck

  ------------------------------------------ */

  async createTruck(
    model: CreateTruckDto,
    currentUserId: number,
  ): Promise<Truck> {
    const truck = new Truck();

    truck.truckType = model.truckType;
    truck.truckNo = model.truckNo;
    truck.truckLoad = model.truckLoad;
    truck.ownerId = currentUserId;
    const blackboxInfo = await this.blackBoxService.getBlackBoxInfo(
      truck.truckNo,
    );
    truck.blackBoxType = blackboxInfo ? blackboxInfo.type : null;
    truck.devId = blackboxInfo ? blackboxInfo.devId : null;
    const result = await this.truckRepository.save(truck);
    return result;
  }

  async getTrucks(
    ownerId: number,
    filterOptionsModel: FilterRequestDto,
  ): Promise<any> {
    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;
    const order = {};
    const where = [];

    if (filterOptionsModel.orderBy) {
      order[filterOptionsModel.orderBy] = filterOptionsModel.orderDirection;
    } else {
      (order as any).createdDate = 'DESC';
    }

    if (searchBy && searchKeyword) {
      filterOptionsModel.truck[searchBy] = Like(`%${searchKeyword}%`);
    }
    where.push(filterOptionsModel.truck ? filterOptionsModel.truck : {});
    const modifiedWhere = where.map(condition => ({
      ...condition,
      ownerId,
    }));
    const options: FindManyOptions<Truck> = {
      where: modifiedWhere,
      skip,
      take,
      order,
    };

    const result = await this.truckRepository.findAndCount(options);
    return result;
  }

  async getTruck(currentUserId: number, truckId: number): Promise<any> {
    const truck = await this.truckRepository.getTruckWithOptions({
      id: truckId,
    });

    if (!truck) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_NOT_FOUND,
      );
    }
    if (truck.ownerId !== currentUserId) {
      customThrowError(
        RESPONSE_MESSAGES.INVALID,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.INVALID,
      );
    }
    const result: TrucksDetailResponse = new TrucksDetailResponse(truck);
    return result;
  }

  async updateTruck(
    model: UpdateTruck,
    currentUserId: number,
    id: number,
  ): Promise<TrucksDetailResponse> {
    const truck = await this.truckRepository.findOne(id);
    if (!truck) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_NOT_FOUND,
      );
    }

    if (truck.ownerId !== currentUserId) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    const keys = Object.keys(model);

    keys.forEach(key => {
      truck[key] = model[key];
    });
    const blackboxInfo = await this.blackBoxService.getBlackBoxInfo(
      truck.truckNo,
    );
    truck.blackBoxType = blackboxInfo ? blackboxInfo.type : null;
    truck.devId = blackboxInfo ? blackboxInfo.devId : null;
    await this.truckRepository.save(truck);

    const result: TrucksDetailResponse = new TrucksDetailResponse(truck);
    return result;
  }

  async deleteTruck(
    id: number,
    truckOwnerId: number,
    request: Request,
  ): Promise<boolean> {
    const truck = await this.truckRepository.findOne(
      { id },
      { relations: ['truckOwner'] },
    );

    if (truck.ownerId !== truckOwnerId) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    if (!truck) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_NOT_FOUND,
      );
    }

    await this.truckRepository.delete({ id });
    addBodyToRequest(request, {
      truckOwner: removeIgnoredAttributes(truck.truckOwner),
      truck,
    });

    return true;
  }

  async deleteDriver(
    id: number,
    truckOwnerId: number,
    request: Request,
  ): Promise<boolean> {
    const driver = await this.driverRepository.findOne(
      { id },
      { relations: ['truckOwner'] },
    );
    if (driver.ownerId !== truckOwnerId) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    if (!driver) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
      );
    }

    driver.ownerId = null;

    await this.driverRepository.save(driver);

    addBodyToRequest(request, {
      truckOwner: removeIgnoredAttributes(driver.truckOwner),
      driver: removeIgnoredAttributes(driver),
    });

    return true;
  }

  async generatePublicId(): Promise<string> {
    const publicId = await this.truckOwnerRepository.find({
      select: ['publicId'],
    });
    let hasMatch = false;
    let string = '';
    do {
      string = await this._randomString();
      for (let index = 0; index < publicId.length; ++index) {
        const id = publicId[index];
        if (id.publicId === string) {
          hasMatch = true;
          break;
        }
      }
    } while (hasMatch === true);
    return string;
  }

  private _randomString() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbs = '0123456789';
    let result = '';
    for (let i = 0; i < STRING_LENGTH.LETTER; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    for (let i = 0; i < STRING_LENGTH.NUMBER; i++) {
      result += numbs.charAt(Math.floor(Math.random() * numbs.length));
    }
    return result;
  }

  private async _createDriver(model: TruckOwnerCreateDriver, ownerId: number) {
    model.phoneNumber = formatPhone(model.phoneNumber);
    const driver = new Driver();
    driver.phoneNumber = model.phoneNumber;
    driver.cardNo = model.cardNo;
    driver.firstName = model.firstName;
    driver.ownerId = ownerId;

    const result = await this.driverRepository.save(driver);

    const token = this.tokenHelper.createToken({
      id: driver.id,
      email: driver.email,
      type: TOKEN_TYPE.RESET_PASSWORD,
    });
    await this.mailHelper.sendResetPassword(token, driver.email);

    return result;
  }

  async getDrivers(
    ownerId: number,
    filterOptionsModel: FilterRequestDto,
  ): Promise<any> {
    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;
    const order = {};
    const where = [];

    if (filterOptionsModel.orderBy) {
      order[filterOptionsModel.orderBy] = filterOptionsModel.orderDirection;
    } else {
      (order as any).createdDate = 'DESC';
    }

    if (searchBy && searchKeyword) {
      filterOptionsModel.driver[searchBy] = Like(`%${searchKeyword}%`);
    }
    where.push(filterOptionsModel.driver ? filterOptionsModel.driver : {});
    const modifiedWhere = where.map(condition => ({ ...condition, ownerId }));
    const options: FindManyOptions<Driver> = {
      where: modifiedWhere,
      skip,
      take,
      order,
    };
    const result = await this.driverRepository.findAndCount(options);
    return result;
  }

  async getDriver(
    currentUserId: number,
    driverId: number,
  ): Promise<DriverDetailResponse> {
    const driver = await this.driverRepository.getDriverWithOptions({
      id: driverId,
    });
    if (!driver) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
      );
    }
    if (driver.ownerId !== currentUserId) {
      customThrowError(
        RESPONSE_MESSAGES.INVALID,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.INVALID,
      );
    }

    const result: DriverDetailResponse = new DriverDetailResponse(driver);
    return result;
  }

  async addDriver(
    model: TruckOwnerCreateDriver,
    currentUserId: number,
  ): Promise<Driver> {
    const user = await this.truckOwnerRepository.findOne(currentUserId, {
      select: ['id'],
    });

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_OWNER_NOT_FOUND,
      );
    }
    model.phoneNumber = formatPhone(model.phoneNumber);

    const driver = await this.driverRepository.getDriver(model.phoneNumber);

    if (!driver) {
      const result = await this._createDriver(model, user.id);
      return result;
    }

    if (driver.deletedAt !== null) {
      customThrowError(
        RESPONSE_MESSAGES.DELETED_ACCOUNT,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DELETED_ACCOUNT,
      );
    }

    if (driver.ownerId) {
      customThrowError(
        RESPONSE_MESSAGES.DRIVER_ALREADY_ADDED,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.DRIVER_ALREADY_ADDED,
      );
    }

    driver.ownerId = user.id;
    driver.cardNo = model.cardNo;
    driver.firstName = model.firstName;
    const result = await this.driverRepository.save(driver);
    return result;
  }

  async updateDriver(
    model: UpdateDriver,
    currentUserId: number,
    id: number,
  ): Promise<DriverDetailResponse> {
    const driver = await this.driverRepository.findOne(id);
    if (!driver) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    if (driver.ownerId !== currentUserId) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    const keys = Object.keys(model);

    keys.forEach(key => {
      driver[key] = model[key];
    });

    await this.driverRepository.save(driver);
    const result: DriverDetailResponse = new DriverDetailResponse(driver);
    return result;
  }

  async acceptOrder(
    truckOwnerId: number,
    orderId: number,
    request: Request,
  ): Promise<boolean> {
    const [truckOwner, order] = await Promise.all([
      this.truckOwnerRepository.findOne(truckOwnerId),
      this.orderRepository.findOne({
        where: {
          id: orderId,
          ownerId: null,
          status: ORDER_STATUS.ASSIGNING,
        },
        select: ['id', 'createdByCustomerId', 'orderId'],
      }),
    ]);

    if (!truckOwner || !order) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    order.status = ORDER_STATUS.ASSIGNED;
    order.ownerId = truckOwner.id;

    await this.orderRepository.save(order);
    let customer = null;
    if (order.createdByCustomerId) {
      customer = await this.customerRepository.findOne(
        order.createdByCustomerId,
      );
    }
    await this.mailHelper.sendAccepted(truckOwner, order.orderId, customer);
    await this.mailHelper.sendAssigned(customer, order.orderId, truckOwner);
    addBodyToRequest(
      request,
      { order: order.orderId, info: order },
      order.orderId,
    );
    return true;
  }

  async assignOrder(
    truckOwnerId: number,
    orderId: number,
    truckIds: number[],
    driverIds: number[],
    request: Request,
  ): Promise<boolean> {
    const order = await this._prepareAssignOrder(
      truckOwnerId,
      orderId,
      truckIds,
      driverIds,
    );
    await this.orderRepository.save(order);

    addBodyToRequest(
      request,
      { order: order.orderId, info: order },
      order.orderId,
    );

    return true;
  }

  async _prepareAssignOrder(
    truckOwnerId: number,
    orderId: number,
    truckIds: number[],
    driverIds: number[],
  ): Promise<Order> {
    const truckCondition: any = {};
    const driverCondition: any = {};

    if (truckIds.length) {
      truckCondition.id = In(truckIds);
    }
    if (driverIds.length) {
      driverCondition.id = In(driverIds);
    }
    const [truckOwner, order, trucks, drivers] = await Promise.all([
      this.truckOwnerRepository.findOne({
        where: {
          id: truckOwnerId,
        },
        select: ['id'],
      }),
      this.orderRepository.findOne({
        where: {
          id: orderId,
          ownerId: null,
          status: ORDER_STATUS.ASSIGNING,
        },
        select: ['id', 'orderId'],
      }),
      this.truckRepository.find({
        where: {
          ownerId: truckOwnerId,
          ...truckCondition,
        },
        select: ['id'],
      }),
      this.driverRepository.find({
        where: {
          ownerId: truckOwnerId,
          ...driverCondition,
        },
        select: ['id'],
      }),
    ]);

    if (!truckOwner || !order) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    order.drivers = drivers;
    order.trucks = trucks;
    return order;
  }

  async assignOrderAndDispatch(
    truckOwnerId: number,
    orderId: number,
    truckIds: number[],
    driverIds: number[],
    request: Request,
  ): Promise<boolean> {
    const order = await this._prepareAssignOrder(
      truckOwnerId,
      orderId,
      truckIds,
      driverIds,
    );
    if (!order.drivers.length || !order.trucks.length) {
      customThrowError(
        RESPONSE_MESSAGES.LACK_DRIVER_OR_TRUCK,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.LACK_DRIVER_OR_TRUCK,
      );
    }
    order.status = ORDER_STATUS.DISPATCHED;

    await this.orderRepository.save(order);

    addBodyToRequest(
      request,
      { order: order.orderId, info: order },
      order.orderId,
    );

    return true;
  }

  async untakeOrder(
    truckOwnerId: number,
    orderId: number,
    request: Request,
  ): Promise<boolean> {
    const [truckOwner, order] = await Promise.all([
      this.truckOwnerRepository.findOne(truckOwnerId),
      this.orderRepository.findOne({
        where: {
          id: orderId,
          ownerId: truckOwnerId,
          status: In([ORDER_STATUS.ASSIGNED]),
        },
      }),
    ]);
    const smsSetting = await this.settingsRepository.findOne(1);
    if (!truckOwner || !order) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    order.status = ORDER_STATUS.ASSIGNING;
    order.ownerId = null;
    order.drivers = [];
    order.trucks = [];
    let customer = null;
    let favoriteTruckOwners = [];
    await this.orderRepository.save(order);
    if (order.createdByCustomerId) {
      customer = await this.customerRepository.findOne(
        order.createdByCustomerId,
        { relations: ['favoriteTruckOwners'], withDeleted: true },
      );
      favoriteTruckOwners = customer.favoriteTruckOwners;
      this.mailHelper.sendFindNewTruck(
        customer,
        order.orderId,
        getNickname(truckOwner),
      );
      this.mailHelper.sendTruckCancelledSuccess(truckOwner, order.orderId);
      const modelNoti = await this.notificationService.createNoti(
        NOTI_TYPE.CANCELLED_BEFORE_ASSIGNED,
        order.orderId,
        customer.preferLanguage,
      );
      modelNoti.sendToCustomer = true;
      this.notificationService.sendNotification(
        modelNoti,
        customer,
        TOKEN_ROLE.CUSTOMER,
      );
      this.orderService._handleSendNewOrderNotiToTruckOwner(
        order,
        favoriteTruckOwners,
      );
      if (smsSetting.orderCancelled && order.remainCancelledSms > 0) {
        await this.smsService.sendOrderNoti(
          customer,
          order.orderId,
          SMS_TYPE.ORDER_CANCELLED,
          truckOwner.publicId,
        );
        order.remainCancelledSms -= 1;
        await this.orderRepository.save(order);
      }
    }

    const modelNotiTruck = await this.notificationService.createNoti(
      NOTI_TYPE.TRUCK_CANCELLED_ORDER_SUCCESS,
      order.orderId,
      truckOwner.preferLanguage,
    );
    modelNotiTruck.sendToTruckOwner = true;
    this.notificationService.sendNotification(
      modelNotiTruck,
      truckOwner,
      TOKEN_ROLE.TRUCK_OWNER,
    );

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

  async exportOrders(
    truckOwnerId: number,
    body: Record<string, any>,
    type: TYPE_TRUCKOWNER_ORDER,
  ): Promise<ExportOrdersByTruckOwnerDto[]> {
    const orderIds = body.ids.map(id => +id);
    const statusPendings = [ORDER_STATUS.ASSIGNED];
    const statusMyJobs = [
      ORDER_STATUS.DISPATCHED,
      ORDER_STATUS.PICKING,
      ORDER_STATUS.PICK_ARRIVED,
      ORDER_STATUS.PICKUPCODE_INPUTED,
      ORDER_STATUS.DELIVERING,
      ORDER_STATUS.DELIVERYCODE_INPUTED,
      ORDER_STATUS.CUSTCANCEL,
      ORDER_STATUS.DRIVERCANCEL,
    ];
    const statusPastJobs = [ORDER_STATUS.DELIVERED];

    let where: FindConditions<Order> = {
      ownerId: truckOwnerId,
    };

    // Default TYPE_TRUCKOWNER_ORDER.PENDING
    let status = In(statusPendings);

    if (type === TYPE_TRUCKOWNER_ORDER.MYJOBS) {
      status = In(statusMyJobs);
    }

    if (type === TYPE_TRUCKOWNER_ORDER.PASTJOBS) {
      status = In(statusPastJobs);
    }

    where = {
      ...where,
      status,
    };

    if (!body.isSelectedAll) {
      where = {
        ...where,
        id: In(orderIds),
      };
    }

    const orders = await this.orderRepository.find({
      relations: ['drivers', 'trucks', 'createdByCustomer'],
      where: where,
    });

    const result = orders.map(o => new ExportOrdersByTruckOwnerDto({ ...o }));
    return result;
  }

  async updatePaymentDone(
    orderId: number,
    model: PaymentDoneDto,
  ): Promise<boolean> {
    await this.orderRepository.update(
      { id: orderId },
      { isPaymentDoneByTruckOwner: model.isDone },
    );

    return true;
  }

  async getReport(userId: number, model: Record<string, any>): Promise<any> {
    const truckowner = await this.truckOwnerRepository.findOne({ id: userId });

    const customerData = await this.orderRepository.getCustomerDataReportByTruckOwner(
      truckowner,
      model,
    );

    const customer = [];

    for (let i = 0; i < customerData[0][1]; i++) {
      const customerInfo = [];
      if (customerData[0][0][i].createdByCustomer.companyId) {
        const company = await this.companyRepository.findOne({
          where: { id: customerData[0][0][i].createdByCustomer.companyId },
          select: ['name'],
          withDeleted: true,
        });
        if (company) {
          customerInfo.push(company.name);
        }
      } else {
        customerInfo.push(
          `${customerData[0][0][i].createdByCustomer.firstName ??
            ''} ${customerData[0][0][i].createdByCustomer.lastName ?? ''}`,
        );
      }
      customerInfo.push(customerData[0][0][i].createdByCustomer.email);

      customer.push(customerInfo);
    }

    const countOrdersOfCustomer = customer.reduce(function(acc, curr) {
      acc[curr] ? acc[curr]++ : (acc[curr] = 1);
      return acc;
    }, {});

    function sortObjByValue(list) {
      const sortedObj = {};
      Object.keys(list)
        .map(key => [key, list[key]])
        .sort((a, b) => (a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0))
        .forEach(data => (sortedObj[data[0]] = data[1]));
      return sortedObj;
    }

    const listCustomer = sortObjByValue(countOrdersOfCustomer);

    const tenOfCustomer = Object.keys(listCustomer)
      .slice(0, 10)
      .reduce((result, key) => {
        result[key] = listCustomer[key];
        return result;
      }, {});

    const revenue = Object.keys(listCustomer).map(c => {
      const email = c.split(',')[1];
      const eachOrders = customerData[0][0].filter(
        d => d.createdByCustomer?.email === email,
      );
      return eachOrders.reduce((x, y) => {
        return x.totalPrice ?? 0 + y.totalPrice ?? 0;
      }, 0);
    });

    const data = await this.orderRepository.getOrderDataReportByTruckOwner(
      truckowner,
      model,
    );

    let beginYear: number = moment().year();
    let endYear: number = moment().year();

    if (data[1].createdDate && data[2].createdDate) {
      beginYear = +moment(data[1].createdDate).format('YYYY');
      endYear = +moment(data[2].createdDate).format('YYYY');
    }

    let numberOfDeliveredOrder = 0;
    let numberOfPendingOrder = 0;
    let numberOfCancelledOrder = 0;

    for (let i = 0; i < data[0][1]; i++) {
      if (data[0][0][i].status === ORDER_STATUS.DELIVERED) {
        numberOfDeliveredOrder = numberOfDeliveredOrder + 1;
      } else if (data[0][0][i].status !== ORDER_STATUS.CANCELED) {
        numberOfPendingOrder = numberOfPendingOrder + 1;
      } else if (data[0][0][i].status === ORDER_STATUS.CANCELED) {
        numberOfCancelledOrder = numberOfCancelledOrder + 1;
      }
    }

    return [
      data,
      numberOfDeliveredOrder,
      numberOfPendingOrder,
      numberOfCancelledOrder,
      [beginYear, endYear],
      tenOfCustomer,
      revenue,
    ];
  }

  async getReportOrders(
    truckOwnerId: number,
    filterOptionsModel: Record<string, any>,
    type: string,
  ): Promise<[OrderResponseDto[], number]> {
    if (!filterOptionsModel.order) {
      filterOptionsModel.order = new OrderRequestDto();
    }

    filterOptionsModel.order.ownerId = truckOwnerId;

    const truckOwner = await this.truckOwnerRepository.findOne(truckOwnerId);

    if (!truckOwner) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.orderRepository.getReportTruckOwnerList(
      filterOptionsModel,
      type,
      truckOwner.id,
    );
  }

  async getReportCustomerOrders(
    truckOwnerId: number,
    filterOptionsModel: Record<string, any>,
  ): Promise<[OrderResponseDto[], number]> {
    if (!filterOptionsModel.order) {
      filterOptionsModel.order = new OrderRequestDto();
    }

    filterOptionsModel.order.ownerId = truckOwnerId;

    const truckOwner = await this.truckOwnerRepository.findOne(truckOwnerId);

    if (!truckOwner) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    const customer = await this.customerRepository.findOne({
      where: { email: filterOptionsModel.nameCustomer },
      select: ['id'],
      withDeleted: true,
    });

    return await this.orderRepository.getReportCustomerListByTruckOwner(
      filterOptionsModel,
      customer.id,
    );
  }

  async uploadMultipleFile(
    files: Express.Multer.File[],
    targetId: number,
    referenceType: number,
    request: Request,
  ): Promise<boolean> {
    const newFiles: File[] = [];

    files.forEach(file => {
      const extension = mimeTypes.extension(file.mimetype);

      const newFile = new File();
      let fileName = '';
      if (file.originalname) {
        fileName = file.originalname;
      }
      newFile.fileName = fileName;
      newFile.id = file.filename.split('.')[0];
      newFile.referenceType = referenceType;
      newFile.referenceId = targetId;
      newFile.extension = extension;

      newFiles.push(newFile);
    });

    await this.fileRepository.save(newFiles);
    addBodyToRequest(request, { files, targetId, referenceType });
    return true;
  }

  async deleteTruckFileByFileId(
    targetId: number,
    fileId: string,
    referenceType: number,
    requestUserId: number,
    request: Request,
  ): Promise<boolean> {
    const [truck, requestUser] = await Promise.all([
      this.truckRepository.findOne(targetId, {
        select: ['id', 'ownerId'],
      }),
      this.truckOwnerRepository.findOne(requestUserId, {
        select: ['id'],
      }),
    ]);

    if (!truck || !requestUser) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    if (requestUser.id !== truck.ownerId) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    const file = await this.fileRepository.findOne({ id: fileId });
    await this.fileRepository.delete({ id: fileId });
    addBodyToRequest(request, { file, targetId, referenceType, requestUserId });
    return true;
  }

  async deleteDriverFileByFileId(
    targetId: number,
    fileId: string,
    referenceType: number,
    requestUserId: number,
    request: Request,
  ): Promise<boolean> {
    const [driver, requestUser] = await Promise.all([
      this.driverRepository.findOne(targetId, {
        select: ['id', 'ownerId'],
      }),
      this.truckOwnerRepository.findOne(requestUserId, {
        select: ['id'],
      }),
    ]);

    if (!driver || !requestUser) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    if (requestUser.id !== driver.ownerId) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    const file = await this.fileRepository.findOne({ id: fileId });
    await this.fileRepository.delete({ id: fileId });
    addBodyToRequest(request, { file, targetId, referenceType, requestUserId });
    return true;
  }

  async getDefaultCommission(): Promise<any> {
    //const data = await this.commissionRepository.findOne();
    return {
      // percentCommission: data?.percentCommission ?? 0,
      // fixedCommission: data?.fixedCommission ?? 0,
    };
  }

  async getDriversEarning(
    model: GetDriverEarningRequestDto,
    ownerId: number,
  ): Promise<any> {
    const drivers = await this.driverRepository.getDriversEarning(
      model,
      ownerId,
    );
    const result = [
      drivers[0].map((driver: Driver) => {
        const earnings = this._getDriverEarnings(driver.orders);
        const paid = this._getDriverPaid(driver.paymentHistory);
        return {
          id: driver.id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          phoneNumber: driver.phoneNumber,
          noOfTrips: driver.orders.length,
          earnings,
          paid,
          remainingBal: earnings - paid,
        };
      }),
      drivers[1],
    ];
    return result;
  }

  private _getDriverPaid(paymentHistory: any[]) {
    if (paymentHistory.length === 0) return 0;
    return paymentHistory
      .map(payment => payment.amount)
      .reduce((total, current) => total + current);
  }

  private _getDriverEarnings(orders: Order[]) {
    let earnings = 0;
    orders.forEach(order => {
      const {
        priceRequest,
        useSuggestedPrice,
        suggestedPrice,
        additionalPrices = [],
        percentCommission = 0,
        fixedCommission = 0,
      } = order;
      let priceOrder = useSuggestedPrice ? suggestedPrice : priceRequest;
      if (!priceOrder) priceOrder = 0;
      additionalPrices.forEach(
        additionalPrice => (priceOrder += additionalPrice.price),
      );
      earnings +=
        (priceOrder * (percentCommission || 0)) / 100 + (fixedCommission || 0);
    });
    return earnings;
  }

  async payDriverEarning(
    id: number,
    model: PayDriverEarningRequestDto,
    ownerId: number,
  ) {
    const driver = await this.driverRepository.findOne({ id, ownerId });
    if (!driver) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
      return false;
    }
    await this.driverPaymentHistoryRepository.insert({ driver, ...model });
    return true;
  }

  private async _generateOtp(user: TruckOwner) {
    const existed = await this.otpRepository.findOne({ truckOwner: user });
    if (existed) {
      existed.code = Math.floor(100000 + Math.random() * 900000);
      await this.otpRepository.save(existed);
      return existed.code;
    }
    const otp = new Otp();
    otp.truckOwner = user;
    otp.code = Math.floor(100000 + Math.random() * 900000);
    await this.otpRepository.save(otp);
    return otp.code;
  }

  async sendOtp(phone: string): Promise<boolean> {
    const phoneNumber = await formatPhone(phone);
    const user = await this.truckOwnerRepository.findOne(
      { phoneNumber },
      { select: ['id', 'phoneVerified'] },
    );

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.PHONE_NOT_EXIST,
      );
    }

    if (user.phoneVerified) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_ALREADY_VERIFIED,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.PHONE_ALREADY_VERIFIED,
      );
    }

    const otp = await this._generateOtp(user);
    await this.smsService.sendOtp(otp, phoneNumber);
    return true;
  }

  private async _verifyOtp(phone: string, otpCode: number): Promise<boolean> {
    const where = {
      code: otpCode,
    };
    const otp = await this.otpRepository.findOne({
      where,
      select: ['id', 'updatedDate'],
      relations: ['truckOwner'],
    });
    if (!otp) {
      customThrowError(
        RESPONSE_MESSAGES.INCORRECT_OTP,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.INCORRECT_OTP,
      );
    }
    if (otp.truckOwner.phoneNumber !== phone) {
      customThrowError(
        RESPONSE_MESSAGES.INCORRECT_OTP,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.INCORRECT_OTP,
      );
    }
    const now = Math.floor(Date.now() / 1000) * 1000;
    if (now - otp.updatedDate.getTime() > FIVE_MIN) {
      customThrowError(
        RESPONSE_MESSAGES.OTP_EXPIRED,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.OTP_EXPIRED,
      );
    }
    return true;
  }

  async verifyOtp(model: OtpVerification): Promise<boolean> {
    const phoneNumber = formatPhone(model.phoneNumber);
    await this._verifyOtp(phoneNumber, model.otpCode);
    const truckOwner = await this.truckOwnerRepository.findOne(
      { phoneNumber: phoneNumber },
      {
        select: ['id', 'emailVerified', 'phoneVerified'],
      },
    );
    truckOwner.emailVerified = true;
    truckOwner.phoneVerified = true;
    await this.truckOwnerRepository.save(truckOwner);
    return true;
  }

  async sendMailVerify(phoneNumber: string): Promise<boolean> {
    const truckOwner = await this.truckOwnerRepository.findOne({
      phoneNumber,
    });
    if (!truckOwner) {
      customThrowError(
        RESPONSE_MESSAGES.TRUCK_OWNER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_OWNER_NOT_FOUND,
      );
    }

    const tokenData = {
      id: truckOwner.id,
      role: TOKEN_ROLE.TRUCK_OWNER,
      type: TOKEN_TYPE.VERIFY,
    };
    const verifyToken = this.tokenHelper.createToken(
      tokenData,
      MAIL_CONFIG.TOKEN_VERIFY_EXPRIED,
    );
    await this.mailHelper.sendVerifyEmail(
      truckOwner.email,
      verifyToken,
      TOKEN_ROLE.TRUCK_OWNER,
      getNickname(truckOwner),
      truckOwner.preferLanguage,
    );
    return true;
  }
}
