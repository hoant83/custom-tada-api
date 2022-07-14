import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { TOKEN_TYPE } from 'src/common/constants/token-types.enum';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { LocationDto } from 'src/common/dtos/location.dto';
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
} from 'src/common/helpers/utility.helper';
import { getExtension } from 'src/common/utils/getExtension.utility';
import { createSession } from 'src/common/utils/request.utility';
import { DriverDetailResponse } from 'src/dto/driver/DriverDetail.dto';
import { OtpVerification } from 'src/dto/driver/OtpVerification.dto';
import { ChangePassword } from 'src/dto/users/ChangePassword.dto';
import { CreateUserDto } from 'src/dto/users/CreateUser.dto';
import { LoginUserDto } from 'src/dto/users/LoginUser.dto';
import { PhoneLoginDto } from 'src/dto/users/PhoneLogin.dto';
import { Driver } from 'src/entities/driver/driver.entity';
import { File } from 'src/entities/file/file.entity';
import { CANCELED_BY } from 'src/entities/order/enums/canceled-by.enum';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { Order } from 'src/entities/order/order.entity';
import { Otp } from 'src/entities/otp/otp.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { DriverRepository } from 'src/repositories/driver.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { Repository } from 'typeorm';
import { GetRequest } from '../../admin/user/dto/GetRequest.dto';
import { ResetPassword } from '../../admin/user/dto/ResetPassword.dto';
import { UpdateDriver } from '../../admin/user/dto/UpdateDriver.dto';
import { SmsService } from '../sms/sms.service';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { SETTING_TYPE } from 'src/entities/admin-setting/enums/adminSettingType.enum';

const FIVE_MIN = 5 * 60 * 1000;
@Injectable()
export class DriverService {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly passwordHelper: PasswordHelper,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly fileHelper: FileHelper,
    private readonly mailHelper: MailHelper,
    private readonly tokenHelper: TokenHelper,
    private readonly orderRepository: OrderRepository,
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
    private readonly smsHelper: SMSHelper,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(AdminSetting)
    private readonly adminSettingRepository: Repository<AdminSetting>,
    private readonly truckOwnerRepository: TruckOwnerRepository,
    private readonly smsService: SmsService,
  ) {}
  private async _createDriver(model: CreateUserDto) {
    let hash = '';
    if (model.password) {
      hash = await this.passwordHelper.createHash(model.password);
    }

    const where = [];
    model.phoneNumber = formatPhone(model.phoneNumber);

    where.push({
      phoneNumber: model.phoneNumber,
    });
    const existed = await this.driverRepository.findOne({
      where: where,
      withDeleted: true,
    });

    if (existed) {
      if (existed.phoneActivated) {
        customThrowError(
          RESPONSE_MESSAGES.PHONE_EXIST,
          HttpStatus.FORBIDDEN,
          RESPONSE_MESSAGES_CODE.PHONE_EXIST,
        );
      }
      const modifiedDriver = existed;
      modifiedDriver.password = hash;
      modifiedDriver.phoneActivated = true;
      const result = await this.driverRepository.update(
        modifiedDriver.id,
        modifiedDriver,
      );
      return result;
    }

    const driver = new Driver();
    driver.password = hash;
    driver.phoneNumber = model.phoneNumber;
    driver.phoneActivated = true;

    const result = await this.driverRepository.save(driver);
    const otp = await this._generateOtp(result);
    await this.smsService.sendOtp(otp, result.phoneNumber);
    return result;
  }

  private async _generateOtp(user: Driver) {
    const existed = await this.otpRepository.findOne({ user: user });
    if (existed) {
      existed.code = Math.floor(100000 + Math.random() * 900000);
      await this.otpRepository.save(existed);
      return existed.code;
    }
    const otp = new Otp();
    otp.user = user;
    otp.code = Math.floor(100000 + Math.random() * 900000);
    await this.otpRepository.save(otp);
    return otp.code;
  }

  async resendOtp(phone: string): Promise<boolean> {
    const phoneNumber = await formatPhone(phone);
    const user = await this.driverRepository.findOne(
      { phoneNumber },
      { select: ['id'] },
    );
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.PHONE_NOT_EXIST,
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
      relations: ['user'],
    });
    if (!otp) {
      customThrowError(
        RESPONSE_MESSAGES.INCORRECT_OTP,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.INCORRECT_OTP,
      );
    }
    if (otp.user.phoneNumber !== phone) {
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
    const phoneNumber = await formatPhone(model.phoneNumber);
    await this._verifyOtp(phoneNumber, model.otpCode);
    const user = await this.driverRepository.findOne(
      { phoneNumber: phoneNumber },
      {
        select: ['id', 'emailVerified', 'phoneActivated'],
      },
    );
    user.emailVerified = true;
    user.phoneActivated = true;
    await this.driverRepository.save(user);
    return true;
  }

  async verifyForgotpasswordOtp(model: OtpVerification): Promise<any> {
    const phoneNumber = await formatPhone(model.phoneNumber);
    await this._verifyOtp(phoneNumber, model.otpCode);
    const user = await this.driverRepository.findOne({
      phoneNumber: phoneNumber,
    });
    const token = this.tokenHelper.createToken({
      id: user.id,
      phoneNumber: user.phoneNumber,
      type: TOKEN_TYPE.FORGOT_PASSWORD,
    });
    return token;
  }

  async registerDriver(model: CreateUserDto): Promise<boolean> {
    const phoneNumber = formatPhone(model.phoneNumber);
    const driver = await this.driverRepository.findOne({
      phoneNumber,
    });
    if (driver && driver.phoneActivated === true) {
      if (driver.emailVerified === true) {
        customThrowError(
          RESPONSE_MESSAGES.PHONE_EXIST,
          HttpStatus.FORBIDDEN,
          RESPONSE_MESSAGES_CODE.PHONE_EXIST,
        );
      }
      let hash = '';
      if (model.password) {
        hash = await this.passwordHelper.createHash(model.password);
      }

      const modifiedDriver = driver;
      modifiedDriver.password = hash;
      await this.driverRepository.update(modifiedDriver.id, modifiedDriver);
      const otp = await this._generateOtp(modifiedDriver);
      await this.smsService.sendOtp(otp, modifiedDriver.phoneNumber);
      return true;
    }
    await this._createDriver(model);
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
    return true;
  }

  async login(model: LoginUserDto): Promise<DriverDetailResponse> {
    const driver = await this.driverRepository.getLoginUserWithOptions({
      email: model.email,
    });

    const truckPool = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.TRUCK_POOL,
    });

    let truckPoolEnable = false;
    if (truckPool && truckPool.enabled) {
      truckPoolEnable = true;
    }

    if (!driver || (!truckPoolEnable && driver.syncCode)) {
      customThrowError(
        RESPONSE_MESSAGES.LOGIN_FAIL,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.LOGIN_FAIL,
      );
    }

    if (!driver.emailVerified) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_OTP_VERIFY,
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this._checkPassword(model.password, driver.password);

    const session = await createSession(driver.id);

    const token = this.tokenHelper.createToken({
      id: driver.id,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      type: TOKEN_TYPE.DRIVER_LOGIN,
      role: TOKEN_ROLE.DRIVER,
      session,
    });

    driver.session = session;
    await this.driverRepository.save(driver);

    const result: DriverDetailResponse = new DriverDetailResponse({
      token,
      ...driver,
    });
    return result;
  }

  async phoneLogin(model: PhoneLoginDto): Promise<DriverDetailResponse> {
    model.phoneNumber = formatPhone(model.phoneNumber);
    const driver = await this.driverRepository.getLoginWithPhone({
      phoneNumber: model.phoneNumber,
    });

    const truckPool = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.TRUCK_POOL,
    });

    let truckPoolEnable = false;
    if (truckPool && truckPool.enabled) {
      truckPoolEnable = true;
    }

    if (!driver || (!truckPoolEnable && driver.syncCode)) {
      customThrowError(
        RESPONSE_MESSAGES.LOGIN_FAIL,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.LOGIN_FAIL,
      );
    }

    if (driver.deletedAt) {
      customThrowError(
        RESPONSE_MESSAGES.DELETED_ACCOUNT,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DELETED_ACCOUNT,
      );
    }

    if (!driver.emailVerified) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_OTP_VERIFY,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.PHONE_OTP_VERIFY,
      );
    }
    await this._checkPassword(model.password, driver.password);
    const session = await createSession(driver.id);

    const token = this.tokenHelper.createToken({
      id: driver.id,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      type: TOKEN_TYPE.DRIVER_LOGIN,
      role: TOKEN_ROLE.DRIVER,
      session,
    });

    driver.session = session;
    await this.driverRepository.save(driver);

    const result: DriverDetailResponse = new DriverDetailResponse({
      token,
      ...driver,
    });
    return result;
  }

  async changePassword(id: number, model: ChangePassword): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const user = await this.driverRepository.findOne(
      { id },
      {
        select: ['id', 'password', 'passwordChangedAt', 'email', 'firstName'],
      },
    );
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    const newHash = await this.passwordHelper.createHash(model.password);

    user.password = newHash;
    user.passwordChangedAt = new Date(now);

    await this.driverRepository.save(user);

    this.mailHelper.sendPasswordChangedEmail(user.email, user.firstName);

    return true;
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.driverRepository.findOne(
      { email },
      {
        select: ['id', 'email'],
      },
    );
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.DRIVER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
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
      TOKEN_ROLE.CUSTOMER,
      getNickname(user),
      user.preferLanguage,
    );

    return true;
  }

  async getDrivers(ownerId: number): Promise<DriverDetailResponse> {
    const result = await this.driverRepository.getDriversWithOptions({
      ownerId: ownerId,
      options: {},
    });
    const driver = new DriverDetailResponse(result);
    return driver;
  }

  async resetPassword(model: ResetPassword): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const data = this.tokenHelper.verifyToken(
      model.token,
      TOKEN_TYPE.FORGOT_PASSWORD,
    );
    const user = await this.driverRepository.findOne(
      {
        phoneNumber: data.phoneNumber,
        id: data.id,
      },
      { select: ['id'] },
    );

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.DRIVER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
      );
    }

    user.password = await this.passwordHelper.createHash(model.password);
    user.passwordChangedAt = new Date(now);

    await this.driverRepository.save(user);

    return true;
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

    const extension = getExtension(file);

    const newFile = new File();

    newFile.id = file.filename.split('.')[0];

    let fileName = '';
    if (file.originalname) {
      fileName = file.originalname;
    }
    newFile.fileName = fileName;
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
    if (targetId !== requestUserId) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    const driver = await this.driverRepository.findOne(targetId, {
      select: ['id', 'ownerId'],
    });

    if (!driver) {
      customThrowError(
        RESPONSE_MESSAGES.DRIVER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
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

  async verifyToken(token: string): Promise<DriverDetailResponse> {
    const data = this.tokenHelper.verifyToken(token);
    const driver = await this.driverRepository.getLoginWithPhone({
      phoneNumber: data.phoneNumber,
    });

    if (!driver) {
      customThrowError(
        RESPONSE_MESSAGES.DRIVER_NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
      );
    }
    if (!driver.phoneActivated) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_OTP_VERIFY,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.PHONE_OTP_VERIFY,
      );
    }
    const result = new DriverDetailResponse({
      ...driver,
      token,
    });
    return result;
  }

  async updateProfile(
    model: UpdateDriver,
    targetId: number,
    currentUserId: number,
  ): Promise<boolean> {
    if (targetId !== currentUserId) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    const driver = await this.driverRepository.findOne(targetId);
    const keys = Object.keys(model);

    keys.forEach(key => {
      driver[key] = model[key];
    });
    await this.driverRepository.save(driver);
    return true;
  }

  async createTracking(
    orderId: number,
    driverId: number,
    location: LocationDto,
    request?: Request,
  ): Promise<boolean> {
    const [order, driver, track] = await Promise.all([
      this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['drivers'],
        select: ['id'],
      }),
      this.driverRepository.findOne({
        where: { id: driverId },
        select: ['id'],
      }),
      this.trackingRepository.findOne({
        where: { orderId, driverId },
        select: ['id'],
      }),
    ]);

    if (!order || !driver) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    if (!order.drivers.filter(d => d.id === driver.id).length) {
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

    const createTrackingModel = this.trackingRepository.create({
      order,
      driver,
      ...location,
    });

    await this.trackingRepository.save(createTrackingModel);
    addBodyToRequest(request, {
      order: order.orderId,
      info: location,
    });
    return true;
  }

  async listOrders(
    driverId: number,
    model: GetRequest,
  ): Promise<[Order[], number]> {
    return await this.orderRepository.getOrderByDriver(driverId, model);
  }

  async changeLanguage(
    language: USER_LANGUAGE,
    userId: number,
  ): Promise<boolean> {
    const user = await this.driverRepository.findOne(userId, {
      select: ['id', 'preferLanguage'],
    });
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.DRIVER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
      );
    }
    user.preferLanguage = language;
    await this.driverRepository.save(user);
    return true;
  }

  async cancelOrderByDriver(
    orderId: number,
    request: Request,
  ): Promise<boolean> {
    const existedOrder = await this.orderRepository.findOne(orderId);
    if (!existedOrder) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }

    if (existedOrder.status !== ORDER_STATUS.ASSIGNED) {
      customThrowError(
        RESPONSE_MESSAGES.DRIVER_CANCEL_ORDER,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.DRIVER_CANCEL_ORDER,
      );
    }
    existedOrder.status = ORDER_STATUS.VERIFIED;
    existedOrder.canceledBy = CANCELED_BY.DRIVER_CANCEL;

    await this.orderRepository.save(existedOrder);

    addBodyToRequest(
      request,
      { order: existedOrder.orderId, existedOrder },
      existedOrder.orderId,
    );

    return true;
  }

  async getOwnerInfo(ownerId: number, driverId: number): Promise<TruckOwner> {
    const [truckOwner, driver] = await Promise.all([
      this.truckOwnerRepository.findOne(ownerId, {
        select: ['id', 'firstName', 'lastName', 'phoneNumber', 'email'],
      }),
      this.driverRepository.findOne({
        select: ['id', 'ownerId'],
        where: { id: driverId, ownerId },
      }),
    ]);
    if (!truckOwner || !driver) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return truckOwner;
  }
}
