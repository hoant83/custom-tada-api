import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import * as mimeTypes from 'mime-types';
import * as moment from 'moment';
import { MAIL_CONFIG } from 'src/common/constants/mail-config.enum';
import {
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
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { TOKEN_TYPE } from 'src/common/constants/token-types.enum';
import { TYPE_EXPORT_ORDER } from 'src/common/constants/type-export.enum';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { FileHelper } from 'src/common/helpers/file.helper';
import { MailHelper } from 'src/common/helpers/mail.helper';
import { PasswordHelper } from 'src/common/helpers/password.helper';
import { customThrowError } from 'src/common/helpers/throw.helper';
import { TokenHelper } from 'src/common/helpers/token.helper';
import {
  addBodyToRequest,
  formatPhone,
  getNickname,
  removeAccents,
} from 'src/common/helpers/utility.helper';
import { AuditLogService } from 'src/common/modules/audit-logs/audit-log.service';
import { CompanyDetailResponse } from 'src/dto/company/CompanyDetail.dto';
import { CreateCompanyDto } from 'src/dto/company/CreateCompany.dto';
import { DefaultReferenceDto } from 'src/dto/defaultReference/DefaultRef.dto';
import {
  FilterRequestDto,
  FilterRequestDtoV2,
  OrderQueryBuilder,
} from 'src/dto/order/filter-request.dto';
import { OrderRequestDto } from 'src/dto/order/order-request.dto';
import { OrderResponseDto } from 'src/dto/order/OrderResponse.dto';
import { PaymentDoneDto } from 'src/dto/order/payment-done.dto';
import { DefaultPaymentDto } from 'src/dto/payment/DefaultPayment.dto';
import { ChangePassword } from 'src/dto/users/ChangePassword.dto';
import { CreateUserDto } from 'src/dto/users/CreateUser.dto';
import { ExportOrdersByCustomerDto } from 'src/dto/users/ExportOrdersByCustomer.dto';
import { ExportOrdersByCustomerNewDto } from 'src/dto/users/ExportOrdersByCustomerNew.dto';
import { LoginResponseDto } from 'src/dto/users/LoginResponse.dto';
import { LoginUserDto } from 'src/dto/users/LoginUser.dto';
import { Company } from 'src/entities/company/company.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import { ACCOUNT_ROLE } from 'src/entities/customer/enums/accountRole.enum';
import { ACCOUNT_TYPE } from 'src/entities/customer/enums/accountType.enum';
import { DefaultReference } from 'src/entities/default-reference/default-reference.entity';
import { VERIFIED_STATUS } from 'src/entities/enums/verifiedStatus.enum';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { File } from 'src/entities/file/file.entity';
import { CANCELED_BY } from 'src/entities/order/enums/canceled-by.enum';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { Order } from 'src/entities/order/order.entity';
import { DefaultPayment } from 'src/entities/payment/payment.entity';
import { Province } from 'src/entities/province/province.entity';
import { CompanyRepository } from 'src/repositories/company.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import {
  Connection,
  FindConditions,
  FindManyOptions,
  In,
  IsNull,
  Like,
  Raw,
  Repository,
} from 'typeorm';
import { CreateEditNotificationDto } from '../../admin/notification/dto/CreateEditNotification.dto';
import { NotificationService } from '../../admin/notification/notification.service';
import { GetRequest } from '../../admin/user/dto/GetRequest.dto';
import { ResetPassword } from '../../admin/user/dto/ResetPassword.dto';
import { SetPassword } from '../../admin/user/dto/SetPassword.dto';
import { UpdateCompany } from '../../admin/user/dto/UpdateCompany.dto';
import { UpdateCustomer } from '../../admin/user/dto/UpdateCustomer.dto';
import { OrderService } from '../order/order.service';

@Injectable()
export class CustomerService implements OnModuleInit {
  constructor(
    private readonly userRepository: CustomerRepository,
    private readonly passwordHelper: PasswordHelper,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly fileHelper: FileHelper,
    private readonly mailHelper: MailHelper,
    private readonly tokenHelper: TokenHelper,
    private readonly connection: Connection,
    private readonly companyRepository: CompanyRepository,
    private readonly truckOwnerRepository: TruckOwnerRepository,
    private readonly orderRepository: OrderRepository,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
    @InjectRepository(DefaultReference)
    private readonly defaultRefRepository: Repository<DefaultReference>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(DefaultPayment)
    private readonly defaultPaymentRepository: Repository<DefaultPayment>,
    private readonly orderService: OrderService,
  ) {}

  async onModuleInit(): Promise<boolean> {
    await this.mirageData();
    return true;
  }

  private async _createUser(model: CreateUserDto, lang: USER_LANGUAGE) {
    try {
      let hash = '';
      if (model.password) {
        hash = await this.passwordHelper.createHash(model.password);
      }

      const user = new Customer();
      user.email = model.email;
      user.verifyMailSentDate = new Date();
      user.password = hash;
      user.accountType = model.accountType;
      if (model.phoneNumber) {
        user.phoneNumber = model.phoneNumber;
      }
      user.preferLanguage = lang;

      const result = await this.userRepository.save(user);
      user.ownerId = result.id;

      await Promise.all([
        this.userRepository.update(result.id, { ownerId: result.id }),
        this._initDefaultRef(result.id),
        this._initDefaultPayment(result.id),
      ]);
      const tokenData = {
        id: result.id,
        role: TOKEN_ROLE.CUSTOMER,
        type: TOKEN_TYPE.VERIFY,
      };
      const verifyToken = this.tokenHelper.createToken(
        tokenData,
        MAIL_CONFIG.TOKEN_VERIFY_EXPRIED,
      );

      // await this.mailHelper.sendWelcomeMail(
      //   result.email,
      //   TOKEN_ROLE.CUSTOMER,
      //   getNickname(result),
      //   result.preferLanguage,
      // );
      this.mailHelper.sendVerifyEmail(
        result.email,
        verifyToken,
        TOKEN_ROLE.CUSTOMER,
        getNickname(result),
        result.preferLanguage,
      );

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
    const where = [];
    if (model.phoneNumber) {
      model.phoneNumber = formatPhone(model.phoneNumber);
    }

    where.push({
      email: model.email,
    });
    const existed = await this.userRepository.findOne({ where: where });
    if (existed) {
      customThrowError(
        RESPONSE_MESSAGES.EXISTED,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_EXIST,
      );
    }
    await this._createUser(model, lang);
    return true;
  }

  private async _changeVerifyStatus(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne(userId, {
      select: ['id', 'verifiedStatus'],
    });

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
      );
    }

    user.verifiedStatus = VERIFIED_STATUS.PENDING;
    await this.userRepository.save(user);
    return true;
  }

  async uploadFile(
    file: Express.Multer.File,
    targetId: number,
    currentUserId: number,
    referenceType: number,
  ): Promise<boolean> {
    try {
      await this.fileRepository.delete({
        referenceId: targetId,
        referenceType: referenceType,
      });

      const extension = mimeTypes.extension(file.mimetype);

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
      if (
        referenceType === REFERENCE_TYPE.CUSTOMER_ID_CARD_FRONT_IMAGE ||
        referenceType === REFERENCE_TYPE.CUSTOMER_ID_CARD_BACK_IMAGE
      ) {
        await this._changeVerifyStatus(currentUserId);
      }
      return true;
    } catch (e) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        e,
      );
    }
  }

  async deleteFile(
    targetId: number,
    type: number,
    requestUserId: number,
    request: Request,
  ): Promise<boolean> {
    const targetUser = await this.userRepository.findOne(targetId, {
      select: ['id', 'companyId', 'accountRole'],
    });

    const requestUser = await this.userRepository.findOne(requestUserId, {
      select: ['id', 'companyId', 'accountRole'],
    });
    if (targetId !== requestUserId) {
      if (requestUser.companyId !== targetUser.companyId) {
        customThrowError(
          RESPONSE_MESSAGES.ERROR,
          HttpStatus.UNAUTHORIZED,
          RESPONSE_MESSAGES_CODE.ERROR,
        );
      }
      if (
        requestUser.accountRole !== ACCOUNT_ROLE.OWNER &&
        requestUser.accountRole !== ACCOUNT_ROLE.ADMIN
      ) {
        customThrowError(
          RESPONSE_MESSAGES.ERROR,
          HttpStatus.UNAUTHORIZED,
          RESPONSE_MESSAGES_CODE.ERROR,
        );
      }
      this._deleteFile(targetId, type, request);
      return true;
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
    const company = await this.companyRepository.findOne(targetId, {
      select: ['id'],
    });

    if (!company) {
      customThrowError(
        RESPONSE_MESSAGES.COMPANY_NOT_EXISTED,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.COMPANY_NOT_EXISTED,
      );
    }

    const requestUser = await this.userRepository.findOne(requestUserId, {
      select: ['id', 'companyId', 'accountRole'],
    });
    if (requestUser.companyId !== company.id) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    if (
      requestUser.accountRole !== ACCOUNT_ROLE.OWNER &&
      requestUser.accountRole !== ACCOUNT_ROLE.ADMIN
    ) {
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
    await this.fileRepository.delete({
      referenceId: referenceId,
      referenceType: referenceType,
    });
    addBodyToRequest(request, {
      referenceId: referenceId,
      referenceType: referenceType,
    });
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

  async login(model: LoginUserDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.getLoginUserWithOptions({
      email: model.email,
    });

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.LOGIN_FAIL,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.LOGIN_FAIL,
      );
    }

    if (user.deletedAt) {
      customThrowError(
        RESPONSE_MESSAGES.DELETED_ACCOUNT,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DELETED_ACCOUNT,
      );
    }

    if (!user.emailVerified) {
      const { verifyMailSentDate } = user;
      const sentDate = moment(verifyMailSentDate);
      const nowDate = moment(new Date());
      const time = nowDate.diff(sentDate, 'seconds');
      if (time > 60 * 60 * 24) {
        user.verifyMailSentDate = new Date();
        this.userRepository.save(user);
        const tokenData = {
          id: user.id,
          role: TOKEN_ROLE.CUSTOMER,
          type: TOKEN_TYPE.VERIFY,
        };
        const verifyToken = this.tokenHelper.createToken(
          tokenData,
          MAIL_CONFIG.TOKEN_VERIFY_EXPRIED,
        );
        this.mailHelper.resendVerifyEmail(
          user.email,
          verifyToken,
          TOKEN_ROLE.CUSTOMER,
          getNickname(user),
          user.preferLanguage,
        );
      }

      customThrowError(
        RESPONSE_MESSAGES.EMAIL_NOT_VERIFY,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.EMAIL_NOT_VERIFY,
      );
    }
    await this._checkPassword(model.password, user.password);

    const token = this.tokenHelper.createToken({
      id: user.id,
      email: user.email,
      type: TOKEN_TYPE.CUSTOMER_LOGIN,
      role: TOKEN_ROLE.CUSTOMER,
    });

    const result: LoginResponseDto = new LoginResponseDto({ token, ...user });
    return result;
  }

  async changeUserPassword(
    id: number,
    model: ChangePassword,
  ): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const user = await this.userRepository.findOne(
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

    await this.userRepository.save(user);

    this.mailHelper.sendPasswordChangedEmail(user.email, user.firstName);

    return true;
  }

  async changePassword(id: number, model: ChangePassword): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const user = await this.userRepository.findOne(
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

    await this.userRepository.save(user);

    this.mailHelper.sendPasswordChangedEmail(user.email, user.firstName);

    return true;
  }

  async forgotPassword(email: string, lang: USER_LANGUAGE): Promise<boolean> {
    const user = await this.userRepository.findOne(
      { email: email.toLowerCase() },
      {
        select: ['id', 'email', 'firstName'],
      },
    );
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.EMAIL_NOT_FOUND,
      );
    }
    const token = this.tokenHelper.createToken({
      id: user.id,
      email: user.email.toLowerCase(),
      type: TOKEN_TYPE.FORGOT_PASSWORD,
    });
    this.mailHelper.sendForgotPassword(
      token,
      user.email.toLowerCase(),
      TOKEN_ROLE.CUSTOMER,
      getNickname(user),
      lang,
    );

    return true;
  }

  async updateProfile(
    model: UpdateCustomer,
    targetId: number,
  ): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne(targetId);
    if (user.companyId && model.companyId === null) {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const keys = Object.keys(model);

      const employees = await this.userRepository.find({
        where: [{ ownerId: user.id }],
        select: ['id'],
      });
      const modifiedEmployees = employees.map(e => ({
        ...e,
        companyId: model.companyId,
      }));
      keys.forEach(key => {
        user[key] = model[key];
      });
      await Promise.all([
        queryRunner.manager.save(Customer, user),
        queryRunner.manager.save(Customer, modifiedEmployees),
      ]);
      await this.companyRepository.delete({ id: user.companyId });

      await queryRunner.commitTransaction();
      return await this.getUser(user.id);
    }
    const keys = Object.keys(model);
    keys.forEach(key => {
      user[key] = model[key];
    });
    if (user.password) {
      user.password = await this.passwordHelper.createHash(user.password);
      const now = Math.floor(Date.now() / 1000) * 1000;
      user.passwordChangedAt = new Date(now);
    } else {
      delete user.password;
    }
    await this.userRepository.save(user);
    return await this.getUser(user.id);
  }

  async updateCompany(
    model: UpdateCompany,
    currentUserId: number,
  ): Promise<CompanyDetailResponse> {
    const user = await this.userRepository.findOne(currentUserId, {
      select: ['id', 'companyId'],
    });

    if (!user.companyId) {
      const company = await this._createCompany(model);
      user.companyId = company.id;
      await this.userRepository.save(user);
      return await this.getCompany(user.companyId);
    }

    const company = await this.companyRepository.findOne({
      id: user.companyId,
    });

    const keys = Object.keys(model);

    keys.forEach(key => {
      company[key] = model[key];
    });

    await this.companyRepository.save(company);
    return await this.getCompany(user.ownerId);
  }

  private async _createCompany(model: CreateCompanyDto): Promise<Company> {
    try {
      const company = new Company();
      company.name = model.name;
      company.phone = model.phone;
      company.address = model.address;
      company.licenseNo = model.licenseNo;

      const result = await this.companyRepository.save(company);
      return result;
    } catch (error) {
      customThrowError(RESPONSE_MESSAGES.ERROR, HttpStatus.BAD_REQUEST, error);
    }
  }

  async createCompany(
    model: CreateCompanyDto,
    currentUserId: number,
  ): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne(currentUserId, {
        select: ['id', 'companyId'],
      });

      if (user.companyId) {
        customThrowError(RESPONSE_MESSAGES.COMPANY_EXIST, HttpStatus.CONFLICT);
      }

      const company = await this._createCompany(model);
      user.companyId = company.id;
      user.accountRole = ACCOUNT_ROLE.OWNER;
      user.ownerId = user.id;

      const employees = await this.userRepository.find({
        where: [{ ownerId: user.id }],
        select: ['id'],
      });

      const modifiedEmployees = employees.map(e => ({
        ...e,
        companyId: user.companyId,
      }));

      await Promise.all([
        queryRunner.manager.save(Customer, user),
        queryRunner.manager.save(Customer, modifiedEmployees),
      ]);

      await queryRunner.commitTransaction();
      return await this.getCompany(user.id);
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

  async getCompany(currentUserId: number): Promise<CompanyDetailResponse> {
    const user = await this.userRepository.findOne(currentUserId, {
      select: ['id', 'companyId', 'ownerId'],
    });

    if (!user.companyId) {
      const owner = await this.userRepository.findOne(user.ownerId, {
        select: ['id', 'companyId'],
      });
      if (owner.companyId) {
        const company = await this.companyRepository.getCompanyWithOptions({
          id: owner.companyId,
        });
        return new CompanyDetailResponse(company);
      }
      // customThrowError(
      //   RESPONSE_MESSAGES.NOT_FOUND,
      //   HttpStatus.NOT_FOUND,
      //   RESPONSE_MESSAGES_CODE.NOT_FOUND,
      // );
      return new CompanyDetailResponse(null);
    }

    const company = await this.companyRepository.getCompanyWithOptions({
      id: user.companyId,
    });

    if (!company) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    const result = new CompanyDetailResponse(company);

    return result;
  }

  private async _createEmployee(
    model: any,
    ownerId: number,
    companyId: number,
    preferLanguage: USER_LANGUAGE,
  ) {
    try {
      model.phoneNumber = formatPhone(model.phoneNumber);
      const employee = new Customer();
      employee.firstName = model.firstName;
      employee.email = model.email.toLowerCase();
      employee.phoneNumber = model.phoneNumber;
      employee.cardNo = model.cardNo;
      employee.accountRole = model.accountRole;
      employee.accountType = model.accountType;
      employee.companyId = companyId;
      employee.ownerId = ownerId;
      employee.preferLanguage = preferLanguage;

      const result = await this.userRepository.save(employee);
      await Promise.all([
        this._initDefaultRef(result.id),
        this._initDefaultPayment(result.id),
      ]);

      const token = this.tokenHelper.createToken({
        id: employee.id,
        email: employee.email,
        role: TOKEN_ROLE.CUSTOMER,
        type: TOKEN_TYPE.SET_PASSWORD,
      });

      this.mailHelper.sendSetPassword(
        employee.email,
        token,
        result,
        TOKEN_ROLE.CUSTOMER,
        preferLanguage,
      );

      return result;
    } catch (err) {
      customThrowError(
        err.message,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_OR_PHONE_NOT_VERIFY,
      );
    }
  }

  async addEmployee(
    model: Record<string, any>,
    currentUserId: number,
  ): Promise<any> {
    const user = await this.userRepository.findOne(currentUserId, {
      select: ['accountRole', 'id', 'companyId', 'ownerId', 'preferLanguage'],
    });

    if (user.accountRole === ACCOUNT_ROLE.EXECUTIVE) {
      customThrowError(
        RESPONSE_MESSAGES.CREATE_ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.CREATE_ERROR,
      );
    }

    const employee = await this.userRepository.findOne({
      email: model.email.toLowerCase(),
    });

    if (employee) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_EXIST,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.EMAIL_EXIST,
      );
    }

    const employeePhone = await this.userRepository.findOne({
      phoneNumber: model.phoneNumber,
    });

    if (employeePhone) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_EXIST,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.PHONE_EXIST,
      );
    }

    return this._createEmployee(
      model,
      user.ownerId,
      user.companyId,
      user.preferLanguage,
    );
  }

  async getUser(id: number): Promise<LoginResponseDto> {
    const user = await this.userRepository.getCustomerById({
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

  async verifyToken(token: string): Promise<LoginResponseDto> {
    const data = this.tokenHelper.verifyToken(token);

    const user = await this.userRepository.getUserWithOptions({
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
    const user = await this.userRepository.findOne(
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
        RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
      );
    }

    user.password = await this.passwordHelper.createHash(model.password);
    user.passwordChangedAt = new Date(now);
    await this.userRepository.save(user);

    return true;
  }

  async setPassword(model: SetPassword): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const data = this.tokenHelper.verifyToken(
      model.token,
      TOKEN_TYPE.SET_PASSWORD,
    );
    const user = await this.userRepository.findOne(
      {
        email: data.email,
        id: data.id,
      },
      { select: ['id'] },
    );

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
      );
    }

    user.password = await this.passwordHelper.createHash(model.password);
    user.passwordChangedAt = new Date(now);
    user.emailVerified = true;

    await this.userRepository.save(user);

    return true;
  }

  async getEmployees(model: GetRequest, ownerId: number): Promise<any> {
    const owner = await this.userRepository.findOne(ownerId);
    const { search, skip, take } = model;

    const order = {};

    if (model.orderBy) {
      order[model.orderBy] = model.orderDirection;
    } else {
      (order as any).id = 'DESC';
    }

    let where = [];

    const rawWhere = Raw(
      alias => `LOWER(${alias}) like '%${search.toLowerCase()}%'`,
    );

    if (search) {
      where = [
        { email: rawWhere },
        { firstName: rawWhere },
        { lastName: rawWhere },
      ];
    }

    let whereModified;
    if (where.length) {
      whereModified = where.map(condition => {
        const o = Object.assign({}, condition);
        o.ownerId = owner.id;
        return o;
      });
    } else {
      whereModified = { ownerId: owner.id };
    }

    const options: FindManyOptions<Customer> = {
      select: [
        'id',
        'email',
        'createdDate',
        'firstName',
        'lastName',
        'verifiedStatus',
        'status',
        'cardNo',
        'companyId',
        'phoneNumber',
        'accountRole',
      ],
      where: whereModified,
      skip,
      take,
      order,
    };

    const employees = await this.userRepository.findAndCount(options);

    if (!employees) {
      customThrowError(
        RESPONSE_MESSAGES.EMPLOYEE_NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.EMPLOYEE_NOT_FOUND,
      );
    }

    return employees;
  }

  async getEmployeeById(id: number, currentId: number): Promise<any> {
    const currentUser = await this.userRepository.findOne(currentId, {
      select: ['id', 'accountRole', 'ownerId'],
    });

    if (currentUser.accountRole === ACCOUNT_ROLE.EXECUTIVE) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    const employee = await this.userRepository.getEmployeeWithOptions({
      id,
      ownerId: currentUser.ownerId,
    });

    if (!employee) {
      customThrowError(
        RESPONSE_MESSAGES.EMPLOYEE_NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.EMPLOYEE_NOT_FOUND,
      );
    }
    const result = new LoginResponseDto(employee);
    return result;
  }

  async deleteEmployee(
    employeeId: number,
    currentUserId: number,
    request: Request,
  ): Promise<boolean> {
    if (employeeId === currentUserId) {
      customThrowError(
        RESPONSE_MESSAGES.SELF_DELETE,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.SELF_DELETE,
      );
    }

    const currentUser = await this.userRepository.findOne(currentUserId);
    if (
      currentUser.accountRole !== ACCOUNT_ROLE.OWNER &&
      currentUser.accountRole !== ACCOUNT_ROLE.ADMIN
    ) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    const employee = await this.userRepository.findOne(employeeId);

    if (employee.companyId !== currentUser.companyId) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    await this.userRepository.softDelete(employee.id);
    addBodyToRequest(request, employee);
    return true;
  }

  /* ------------------------------------------

  favorite truck owners

  ------------------------------------------ */
  async getFavoriteTruckOwner(publicId: string): Promise<any> {
    const truckOwner = await this.truckOwnerRepository.findOne({
      select: ['id', 'publicId', 'firstName', 'lastName', 'email', 'company'],
      where: { publicId },
      relations: ['company'],
    });
    if (!truckOwner) {
      return null;
    }
    return truckOwner;
  }

  async addFavoriteTruckOwner(
    publicId: string,
    userId: number,
    request: Request,
  ): Promise<boolean> {
    const [truckOwner, customer] = await Promise.all([
      this.truckOwnerRepository.findOne({
        where: { publicId: publicId },
      }),
      this.userRepository.findOne({
        where: { id: userId },
        relations: ['favoriteTruckOwners'],
      }),
    ]);

    if (!truckOwner || !customer) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    customer.favoriteTruckOwners.forEach(truckOwner => {
      if (truckOwner.publicId === publicId) {
        customThrowError(
          RESPONSE_MESSAGES.ALREADY_FAVORITED,
          HttpStatus.CONFLICT,
          RESPONSE_MESSAGES_CODE.ALREADY_FAVORITED,
        );
      }
    });

    customer.favoriteTruckOwners.push(truckOwner);
    await this.userRepository.save(customer);
    await this.mailHelper.sendFavoriteTruck(truckOwner, getNickname(customer));
    const modelNoti = new CreateEditNotificationDto();
    let translateLangContent, translateLangSubject;
    if (truckOwner.preferLanguage === USER_LANGUAGE.VI) {
      translateLangContent = VI_NOTI_CONTENT.FAVORITE_TRUCK;
      translateLangSubject = VI_NOTI_SUBJECT.FAVORITE_TRUCK;
    }
    if (
      truckOwner.preferLanguage === USER_LANGUAGE.EN ||
      truckOwner.preferLanguage === USER_LANGUAGE.ID
    ) {
      translateLangContent = NOTI_CONTENT.FAVORITE_TRUCK;
      translateLangSubject = NOTI_SUBJECT.FAVORITE_TRUCK;
    }
    if (truckOwner.preferLanguage === USER_LANGUAGE.KR) {
      translateLangContent = NOTI_CONTENT.FAVORITE_TRUCK;
      translateLangSubject = NOTI_SUBJECT.FAVORITE_TRUCK;
    }
    const name = await getNickname(customer);
    modelNoti.body = translateLangContent.replace('[customerID]', name);
    modelNoti.title = translateLangSubject;
    this.notificationService.sendNotification(
      modelNoti,
      truckOwner,
      TOKEN_ROLE.TRUCK_OWNER,
    );

    addBodyToRequest(request, truckOwner);
    return true;
  }

  async removeFavoriteTruckOwner(
    truckOwnerId: number,
    userId: number,
  ): Promise<boolean> {
    const customer = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id'],
      relations: ['favoriteTruckOwners'],
    });

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
      );
    }

    const remainFavoriteTruckOwner = [];
    customer.favoriteTruckOwners.forEach(truckOwner => {
      if (truckOwner.id !== truckOwnerId) {
        remainFavoriteTruckOwner.push(truckOwner);
      }
    });

    customer.favoriteTruckOwners = remainFavoriteTruckOwner;
    await this.userRepository.save(customer);
    return true;
  }

  async resetFavoriteTruckOwner(userId: number): Promise<boolean> {
    const customer = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id'],
      relations: ['favoriteTruckOwners'],
    });

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
      );
    }

    customer.favoriteTruckOwners = [];
    await this.userRepository.save(customer);
    return true;
  }

  async listFavoriteTruckOwner(
    userId: number,
    model: FilterRequestDto,
  ): Promise<any> {
    const customer = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id'],
      relations: ['favoriteTruckOwners'],
    });

    const { skip, take } = model;

    const truckOwnerIdList = customer.favoriteTruckOwners.map(to => to.id);
    if (!truckOwnerIdList.length) return [[], 0];
    const where = [{ id: In([...truckOwnerIdList]) }];
    const relations = ['company'];

    const favorite = await this.truckOwnerRepository.findAndCount({
      select: [
        'firstName',
        'lastName',
        'email',
        'id',
        'company',
        'phoneNumber',
        'publicId',
      ],
      where,
      relations,
      skip,
      take,
    });
    return favorite;
  }

  async getOrders(
    customerId: number,
    filterOptionsModel: FilterRequestDto,
  ): Promise<[Order[], number]> {
    if (!filterOptionsModel.order) {
      filterOptionsModel.order = new OrderRequestDto();
    }

    filterOptionsModel.order.createdByCustomerId = customerId;

    const customer = await this.userRepository.findOne(customerId);

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE) {
      filterOptionsModel.order.customerOwnerId = customer.ownerId;
    }

    return await this.orderRepository.getList(filterOptionsModel);
  }

  async getOrdersV2(
    customerId: number,
    filterOptionsModel: FilterRequestDtoV2,
  ): Promise<[Order[], number]> {
    const filter: OrderQueryBuilder = {
      ...filterOptionsModel,
      orderFindCondition: {},
    };
    const customer = await this.userRepository.findOne(customerId);

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE &&
      customer.ownerId !== null
    ) {
      filter.orderFindCondition.customerOwnerId = customer.ownerId;
    } else {
      filter.orderFindCondition.createdByCustomerId = customer.id;
    }

    let preparedFilter = filter;

    if (filterOptionsModel.all) {
      preparedFilter = this.orderService._prepareOrderFilterWithAll(filter);
    }

    return await this.orderRepository.getListv2(
      preparedFilter,
      filterOptionsModel.all ? true : false,
    );
  }

  async getOrdersPayment(
    customerId: number,
    filterOptionsModel: FilterRequestDto,
  ): Promise<[Order[], number]> {
    if (!filterOptionsModel.order) {
      filterOptionsModel.order = new OrderRequestDto();
    }

    filterOptionsModel.order.createdByCustomerId = customerId;

    const customer = await this.userRepository.findOne(customerId);

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE) {
      filterOptionsModel.order.customerOwnerId = customer.ownerId;
    }

    const result = await this.orderRepository.getListPayment(
      filterOptionsModel,
    );

    return result;
  }

  async getReportOrders(
    customerId: number,
    filterOptionsModel: Record<string, any>,
    type: string,
  ): Promise<[OrderResponseDto[], number]> {
    if (!filterOptionsModel.order) {
      filterOptionsModel.order = new OrderRequestDto();
    }

    filterOptionsModel.order.createdByCustomerId = customerId;

    const customer = await this.userRepository.findOne(customerId);

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE) {
      filterOptionsModel.order.customerOwnerId = customer.ownerId;
    }

    return await this.orderRepository.getReportCustomerList(
      filterOptionsModel,
      type,
    );
  }

  async getReportTruckOwnerOrders(
    customerId: number,
    filterOptionsModel: Record<string, any>,
  ): Promise<[OrderResponseDto[], number]> {
    if (!filterOptionsModel.order) {
      filterOptionsModel.order = new OrderRequestDto();
    }

    filterOptionsModel.order.createdByCustomerId = customerId;

    const customer = await this.userRepository.findOne(customerId);

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE) {
      filterOptionsModel.order.customerOwnerId = customer.ownerId;
    }

    const truckOwnerId = await this.truckOwnerRepository.findOne({
      where: { email: filterOptionsModel.nameTruckOwner },
      select: ['id'],
    });

    return await this.orderRepository.getReportTruckownerList(
      filterOptionsModel,
      truckOwnerId.id,
    );
  }

  async exportOrders(
    customerId: number,
    body: Record<string, any>,
    type: TYPE_EXPORT_ORDER,
  ): Promise<ExportOrdersByCustomerNewDto[]> {
    const orderIds = body.ids.map(id => +id);

    const customer = await this.userRepository.findOne({ id: customerId });

    let customerOwnerId = customer.id;
    if (customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE) {
      customerOwnerId = customer.ownerId;
    }

    const options: FindManyOptions<Order> = {
      relations: [
        'owner',
        'owner.company',
        'createdByCustomer',
        'createdByAdmin',
      ],
    };

    // if (type === TYPE_EXPORT_ORDER.MANAGE) {
    //   options.relations = [...options.relations, 'company'];
    // }

    if (type === TYPE_EXPORT_ORDER.PAYMENT) {
      options.relations = [
        ...options.relations,
        'additionalPrices',
        'owner.truckOwnerBankAccount',
      ];
    }

    let where: FindConditions<Order> = {
      createdByCustomerId: customerOwnerId,
    };

    if (!body.isSelectedAll) {
      where = {
        id: In(orderIds),
        customerOwnerId: customerOwnerId,
      };
    }

    options.where = where;
    const orders = await this.orderRepository.find(options);
    const result = orders.map(o => new ExportOrdersByCustomerNewDto({ ...o }));
    return result;
  }

  async exportReportOrders(
    customerId: number,
    body: Record<string, any>,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const customer = await this.userRepository.findOne(customerId);

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    let ownerId = -1;

    if (customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE) {
      ownerId = customer.ownerId;
    }

    const orderIds = body.criteria.ids.map(id => +id);

    const result = await this.orderRepository.exportReportOrdersByCustomer(
      customerId,
      ownerId,
      orderIds,
      body.criteria.isSelectedAll,
      body.thisMonth,
      body.thisYear,
      body.typeOrder.toUpperCase(),
    );

    for (let i = 0; i < result.length; i++) {
      const companyId =
        result[i].owner !== null ? result[i].owner.companyId : null;

      if (companyId) {
        const companyId = result[i].owner.companyId;
        const company = await this.companyRepository.findOne({
          id: companyId,
        });
        result[i].owner.companyName = company.name;
      }
    }

    return result;
  }

  async exportReportTruckOwners(
    customerId: number,
    body: Record<string, any>,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const customer = await this.userRepository.findOne(customerId);

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    let ownerId = -1;

    if (customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE) {
      ownerId = customer.ownerId;
    }

    const orderIds = body.criteria.ids.map(id => +id);

    const truckOwnerId = await this.truckOwnerRepository.findOne({
      where: { email: body.typeOrder },
      select: ['id'],
    });

    const result = await this.orderRepository.exportReportTruckOwnersByCustomer(
      customerId,
      ownerId,
      orderIds,
      body.criteria.isSelectedAll,
      body.thisMonth,
      body.thisYear,
      truckOwnerId.id,
    );

    for (let i = 0; i < result.length; i++) {
      const companyId =
        result[i].owner !== null ? result[i].owner.companyId : null;

      if (companyId) {
        const companyId = result[i].owner.companyId;
        const company = await this.companyRepository.findOne({
          id: companyId,
        });
        result[i].owner.companyName = company.name;
      }
    }
    return result;
  }

  async cancelOrderByCustomer(
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
    const user = await this.userRepository.findOne(
      existedOrder.createdByCustomerId,
    );

    if (
      existedOrder.status !== ORDER_STATUS.CREATED &&
      existedOrder.status !== ORDER_STATUS.ASSIGNING &&
      existedOrder.status !== ORDER_STATUS.ASSIGNED
    ) {
      customThrowError(
        RESPONSE_MESSAGES.CUSTOMER_CANCEL_ORDER,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.CUSTOMER_CANCEL_ORDER,
      );
    }
    existedOrder.status = ORDER_STATUS.CANCELED;
    existedOrder.canceledBy = CANCELED_BY.CUSTOM_CANCEL;

    await this.orderRepository.update(existedOrder.id, existedOrder);
    this.mailHelper.sendCustomerCancelledSuccess(user, existedOrder.orderId);
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
    if (existedOrder.ownerId) {
      const truckOwner = await this.truckOwnerRepository.findOne(
        existedOrder.ownerId,
      );
      const modelNotiTruck = await this.notificationService.createNoti(
        NOTI_TYPE.CUSTOMER_CANCELLED_ORDER,
        existedOrder.orderId,
        user.preferLanguage,
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

  async getReport(userId: number, model: Record<string, any>): Promise<any> {
    const customer = await this.userRepository.findOne({ id: userId });

    const truckownerData = await this.orderRepository.getTruckownerDataReportByCustomer(
      customer,
      model,
    );

    const truckowner = [];

    for (let i = 0; i < truckownerData[0][1]; i++) {
      const truckOwnerInfo = [];
      if (truckownerData[0][0][i].ownerId) {
        if (truckownerData[0][0][i].ownerId.companyId) {
          const company = await this.companyRepository.findOne({
            where: { id: truckownerData[0][0][i].ownerId.companyId },
            select: ['name'],
            withDeleted: true,
          });
          if (company) {
            truckOwnerInfo.push(company.name);
          }
        }
        truckOwnerInfo.push(truckownerData[0][0][i].ownerId.publicId);
        truckOwnerInfo.push(truckownerData[0][0][i].ownerId.email);
        truckowner.push(truckOwnerInfo);
      }
    }

    const countOrdersOfTruckowner = truckowner.reduce(function(acc, curr) {
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

    const listTruckOwner = sortObjByValue(countOrdersOfTruckowner);
    const tenOfTruckOwner = Object.keys(listTruckOwner)
      .slice(0, 10)
      .reduce((result, key) => {
        result[key] = listTruckOwner[key];

        return result;
      }, {});

    const data = await this.orderRepository.getCustomerDataReportByCustomer(
      customer,
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
      tenOfTruckOwner,
    ];
  }

  private async _getProvinceById(id: number): Promise<Province> {
    return await this.provinceRepository.findOne(id);
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

  private _removeProvincePrefix(provinceName: string): string {
    return provinceName
      .replace('Thành phố ', '')
      .replace('Tỉnh ', '')
      .replace('thành phố ', '')
      .replace(' City', '');
  }

  private async _initDefaultRef(customerId: number): Promise<boolean> {
    const defaultRef = await this.defaultRefRepository.findOne({
      where: { customerId },
    });

    const customer = await this.userRepository.findOne(customerId);
    if (!defaultRef) {
      const reference = new DefaultReference();
      reference.orderManagerName = '';
      reference.orderManagerNo = '';
      reference.dropoffAddress = [];
      reference.dropoffAddressText = '';
      reference.pickupAddress = [];
      reference.pickupAddressText = '';
      reference.personInChargePickup = '';
      reference.personInChargePickupNO = '';
      reference.personInChargeDropoff = '';
      reference.personInChargeDropoffNO = '';
      reference.customerId = customer.id;
      const result = await this.defaultRefRepository.save(reference);
      customer.defaultRefId = result.id;
      await this.userRepository.save(customer);
    }
    return true;
  }

  async updateRef(
    model: DefaultReferenceDto,
    userId: number,
  ): Promise<DefaultReference> {
    const defaultRef = await this.defaultRefRepository.findOne({
      customerId: userId,
    });
    const keys = Object.keys(model);
    keys.forEach(key => {
      defaultRef[key] = model[key];
    });
    defaultRef.pickupCity = null;
    const pickupCityNameRaw = model.pickupCity;
    if (pickupCityNameRaw && !Number.isInteger(pickupCityNameRaw)) {
      const pickupCityModified = this._removeProvincePrefix(pickupCityNameRaw);
      const province = await this._getProvinceByName(pickupCityModified);
      if (!province) {
        customThrowError(
          RESPONSE_MESSAGES.CITY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          RESPONSE_MESSAGES_CODE.CITY_NOT_FOUND,
        );
      }
      defaultRef.pickupCity = province.id;
    }
    if (pickupCityNameRaw && Number.isInteger(pickupCityNameRaw)) {
      defaultRef.pickupCity = +pickupCityNameRaw;
    }

    const result = await this.defaultRefRepository.save(defaultRef);
    return result;
  }

  async initOldCustomerRef(): Promise<boolean> {
    const customers = await this.userRepository.find({
      defaultRefId: IsNull(),
    });
    customers.map(async u => {
      await this._initDefaultRef(u.id);
    });
    return true;
  }

  async getDefaultReference(customerId: number): Promise<DefaultReference> {
    return await this.defaultRefRepository.findOne({ customerId });
  }

  private async _initDefaultPayment(customerId: number): Promise<boolean> {
    const defaultRef = await this.defaultPaymentRepository.findOne({
      where: { customerId },
    });

    const customer = await this.userRepository.findOne(customerId);
    if (!defaultRef) {
      const payment = new DefaultPayment();
      payment.needVATInvoice = false;
      payment.companyName = '';
      payment.bussinessLicenseNO = '';
      payment.address = '';
      payment.email = '';
      payment.otherPayment = '';
      payment.customerId = customer.id;
      const result = await this.defaultPaymentRepository.save(payment);
      customer.paymentId = result.id;
      await this.userRepository.save(customer);
    }
    return true;
  }

  async updatePayment(
    model: DefaultPaymentDto,
    userId: number,
  ): Promise<DefaultPayment> {
    const payment = await this.defaultPaymentRepository.findOne({
      customerId: userId,
    });
    const keys = Object.keys(model);
    keys.forEach(key => {
      payment[key] = model[key];
    });

    const result = await this.defaultPaymentRepository.save(payment);
    return result;
  }

  async initOldPayment(): Promise<boolean> {
    const customers = await this.userRepository.find({
      paymentId: IsNull(),
    });
    customers.map(async u => {
      await this._initDefaultPayment(u.id);
    });
    return true;
  }

  async updatePaymentDone(
    orderId: number,
    model: PaymentDoneDto,
  ): Promise<boolean> {
    const order = await this.orderRepository.findOne(orderId, {
      relations: ['owner'],
    });
    if (!order) {
      customThrowError(RESPONSE_MESSAGES.ORDER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.orderRepository.update(
      { id: orderId },
      { isPaymentDoneByCustomer: model.isDone },
    );

    if (model.isDone) {
      if (order.createdByCustomerId) {
        const customerModelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.CUSTOMER_SELF_PAYMENT_DONE,
          order.orderId,
        );
        const customer = await this.userRepository.findOne({
          id: order.createdByCustomerId,
        });

        if (!customer) {
          customThrowError(
            RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }

        this.notificationService.sendNotification(
          customerModelNoti,
          customer,
          TOKEN_ROLE.CUSTOMER,
        );
      }

      if (order.ownerId) {
        const truckModelNoti = await this.notificationService.createNoti(
          NOTI_TYPE.CUSTOMER_PAYMENT_DONE,
          order.orderId,
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
  }

  async getDefaultPayment(customerId: number): Promise<DefaultPayment> {
    return await this.defaultPaymentRepository.findOne({ customerId });
  }

  async mirageData(): Promise<boolean> {
    const customers = await this.userRepository.find({
      accountType: IsNull(),
    });

    if (customers.length > 0) {
      customers.map(async u => {
        await this.userRepository.save({
          id: u.id,
          accountType: ACCOUNT_TYPE.INDIVIDUAL,
        });
      });
    }

    return true;
  }
}
