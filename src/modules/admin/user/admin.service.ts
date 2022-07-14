import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import * as mimeTypes from 'mime-types';
import * as moment from 'moment';
import {
  KR_NOTI_CONTENT,
  NOTI_CONTENT,
  NOTI_SUBJECT,
  VI_NOTI_CONTENT,
} from 'src/common/constants/notification.enum';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { STRING_LENGTH } from 'src/common/constants/string-length.enum';
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
  generateRandomCode,
  getNickname,
  getTwoDigitsDateString,
  removeIgnoredAttributes,
  roundTwoFixed,
} from 'src/common/helpers/utility.helper';
import { AuditLogService } from 'src/common/modules/audit-logs/audit-log.service';
import { AdminDetailResponse } from 'src/dto/admin/AdminDetail.dto';
import { CreateAdminDto } from 'src/dto/admin/CreateAdmin.dto';
import { CompanyDetailResponse } from 'src/dto/company/CompanyDetail.dto';
import { CreateCompanyDto } from 'src/dto/company/CreateCompany.dto';
import { CreateEmployeeDto } from 'src/dto/company/CreateEmployee.dto';
import { AdminCreateDriver } from 'src/dto/driver/AdminCreateDriver.dto';
import { DriverDetailResponse } from 'src/dto/driver/DriverDetail.dto';
import { TruckOwnerCreateDriver } from 'src/dto/driver/TruckOwnerCreateDriver.dto';
import { OrderResponseDto } from 'src/dto/order/OrderResponse.dto';
import { TrucksDetailResponse } from 'src/dto/truck/TrucksDetail.dto';
import { CreateUpdateBankAccount } from 'src/dto/truckOwner/bankAccount/CreateUpdateBankAccount.dto';
import { CreateTruckDto } from 'src/dto/truckOwner/CreateTruck.dto';
import { TruckOwnerResponseDto } from 'src/dto/truckOwner/TruckOwnerResponse.dto';
import { ChangePassword } from 'src/dto/users/ChangePassword.dto';
import { CreateUserByAdminDto } from 'src/dto/users/CreateUserByAdmin.dto';
import { CustomerDetailResponse } from 'src/dto/users/CustomerDetail.dto';
import { ExportOrdersByCustomerDto } from 'src/dto/users/ExportOrdersByCustomer.dto';
import { ExportOrdersByCustomerNewDto } from 'src/dto/users/ExportOrdersByCustomerNew.dto';
import { LoginResponseDto } from 'src/dto/users/LoginResponse.dto';
import { LoginUserDto } from 'src/dto/users/LoginUser.dto';
import { TruckOwnerDetailResponse } from 'src/dto/users/TruckOwnerDetail.dto';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { SETTING_TYPE } from 'src/entities/admin-setting/enums/adminSettingType.enum';
import { Admin } from 'src/entities/admin/admin.entity';
import { USER_TYPE } from 'src/entities/admin/enums/userType.enum';
import { Company } from 'src/entities/company/company.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import { ACCOUNT_ROLE } from 'src/entities/customer/enums/accountRole.enum';
import { TRUCK_PAYLOAD } from 'src/entities/default-reference/enums/defaultRef.enum';
import { DistancePrice } from 'src/entities/distance-price/distance-price.entity';
import { Distance } from 'src/entities/distance/distance.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { VERIFIED_STATUS } from 'src/entities/enums/verifiedStatus.enum';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { File } from 'src/entities/file/file.entity';
import { MultipleStopsCharges } from 'src/entities/multiple-stops-price/multiple-stops-price.entity';
import { CANCELED_BY } from 'src/entities/order/enums/canceled-by.enum';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { ORDER_TYPE } from 'src/entities/order/enums/order-type.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { Order } from 'src/entities/order/order.entity';
import { PayloadFare } from 'src/entities/payload-fare/payload-fare.entity';
import { DYNAMIC_DEFAULT_OPTION } from 'src/entities/pricing/enums/priceOption.enum';
import { Pricing } from 'src/entities/pricing/pricing.entity';
import { Province } from 'src/entities/province/province.entity';
import { SurCharges } from 'src/entities/surcharges/surcharges.entity';
import { TruckTypeFare } from 'src/entities/truck-type-fare/truck-type-fare.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { ZonePrice } from 'src/entities/zone-price/zone-price.entity';
import { CustomerFilterRequestDto } from 'src/dto/customer/filter-request.dto';
import { PaymentDoneDto } from 'src/dto/order/payment-done.dto';
import { OrderService } from 'src/modules/default/order/order.service';
import { TruckOwnerService } from 'src/modules/default/truckOwner/truckOwner.service';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CompanyRepository } from 'src/repositories/company.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { PricingRepository } from 'src/repositories/pricing.repository';
import { TruckRepository } from 'src/repositories/truck.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import {
  Connection,
  FindConditions,
  FindManyOptions,
  getRepository,
  In,
  IsNull,
  Like,
  Not,
  Raw,
  Repository,
  getConnection,
} from 'typeorm';
import { CreateEditNotificationDto } from '../notification/dto/CreateEditNotification.dto';
import { NotificationService } from '../notification/notification.service';
import { CreateUpdateDistance } from './dto/CreateUpdateDistance.dto';
import { CreateUpdateDistancePrice } from './dto/CreateUpdateDistancePrice.dto';
import { CreateUpdateDynamicItem } from './dto/CreateUpdateDynamicItemdto';
import { CreateUpdateMultipleStop } from './dto/CreateUpdateMultipleStop.dto';
import { CreateUpdatePayloadFare } from './dto/CreateUpdatePayloadFare.dto';
import { CreateUpdateSetting } from './dto/CreateUpdateSetting.dto';
import { CreateUpdateTruckTypeFare } from './dto/CreateUpdateTruckTypeFare.dto';
import { CreateUpdateZoneFare } from './dto/CreateUpdateZoneFare.dto';
import { GetRequest } from './dto/GetRequest.dto';
import { ResetPassword } from './dto/ResetPassword.dto';
import { UpdateCompany } from './dto/UpdateCompany.dto';
import { AdminUpdateCustomer } from './dto/UpdateCustomer.dto';
import { UpdateDriver } from './dto/UpdateDriver.dto';
import { UpdatePricingSetting } from './dto/UpdatePricingSetting.dto';
import { UpdateTruck } from './dto/UpdateTruck.dto';
import {
  AdminUpdateTruckOwner,
  UpdateTruckOwner,
} from './dto/UpdateTruckOwner.dto';
import { FilterRequestDto } from 'src/dto/driver/filter-request.dto';
import { OrderRequestDto } from 'src/dto/order/order-request.dto';
import { PriceHelper } from 'src/common/helpers/price.helper';
import { LicenseMail } from './dto/LicenseMail.dto';
import { BlackBoxService } from 'src/modules/default/black-box/black-box.service';
import { Settings } from 'src/entities/setting/setting.entity';
import { UpdateLicenseSetting } from './dto/UpdateLicenseSetting.dto';
import { LICENSE } from 'src/entities/admin/enums/userLicense.enum';
import { ApiKey } from 'src/entities/api-key/api-key.entity';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import { PERMISSION } from 'src/entities/api-key/enums/permission.enum';
import { DefaultReference } from 'src/entities/default-reference/default-reference.entity';
import { DefaultPayment } from 'src/entities/payment/payment.entity';
import { UpdateCommissionSetting } from './dto/UpdateCommissionSetting.dto';
import { Commission } from 'src/entities/commission/commission.entity';
import { SettingRepository } from 'src/repositories/setting.repository';
import { PayDriverEarningRequestDto } from 'src/dto/commission/PayDriverEarningRequest.dto';
import { DriverPaymentHistoryRepository } from 'src/repositories/driver-payment-history.repository';
import { GetDriverEarningRequestDto } from 'src/dto/commission/GetDriverEarningRequest.dto';
import { ExportCustomersByAdminDto } from 'src/dto/users/ExportCustomersByAdmin.dto';
import { ExportTruckOwnersByAdminDto } from 'src/dto/users/ExportTruckOwnersByAdmin.dto';
import { ExportDriversByAdminDto } from 'src/dto/users/ExportDriversByAdmin.dto';

@Injectable()
export class AdminUserService implements OnModuleInit {
  constructor(
    private readonly connection: Connection,
    private readonly configService: ConfigService,
    @InjectRepository(Customer)
    private readonly customerRepository: CustomerRepository,
    private readonly passwordHelper: PasswordHelper,
    private readonly tokenHelper: TokenHelper,
    private readonly adminRepository: AdminRepository,
    @InjectRepository(TruckOwner)
    private readonly truckOwnerRepository: TruckOwnerRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly mailHelper: MailHelper,
    private readonly driverRepository: DriverRepository,
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: CustomerRepository,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly fileHelper: FileHelper,
    private readonly truckRepository: TruckRepository,
    private readonly truckOwnerService: TruckOwnerService,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    private readonly notificationService: NotificationService,
    private readonly orderService: OrderService,
    private readonly auditLogService: AuditLogService,
    @InjectRepository(AdminSetting)
    private readonly adminSettingRepository: Repository<AdminSetting>,
    private readonly pricingRepository: PricingRepository,
    @InjectRepository(TruckTypeFare)
    private readonly truckTypeFareRepository: Repository<TruckTypeFare>,
    @InjectRepository(PayloadFare)
    private readonly payloadFareRepository: Repository<PayloadFare>,
    @InjectRepository(ZonePrice)
    private readonly zonePriceRepository: Repository<ZonePrice>,
    @InjectRepository(DistancePrice)
    private readonly distancePriceRepository: Repository<DistancePrice>,
    @InjectRepository(SurCharges)
    private readonly surChargesRepository: Repository<SurCharges>,
    @InjectRepository(DynamicCharges)
    private readonly dynamicChargesRepository: Repository<DynamicCharges>,
    @InjectRepository(Distance)
    private readonly distanceRepository: Repository<Distance>,
    @InjectRepository(MultipleStopsCharges)
    private readonly multipleStopRepository: Repository<MultipleStopsCharges>,
    private readonly commonSettingsRepository: SettingRepository,
    @InjectRepository(TruckOwnerBankAccount)
    private readonly truckOwnerBankAccountRepository: Repository<
      TruckOwnerBankAccount
    >,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(DefaultReference)
    private readonly defaultRefRepository: Repository<DefaultReference>,
    @InjectRepository(DefaultPayment)
    private readonly defaultPaymentRepository: Repository<DefaultPayment>,
    private readonly priceHelper: PriceHelper,
    private readonly blackBoxService: BlackBoxService,
    @InjectRepository(Commission)
    private readonly commissionRepository: Repository<Commission>,
    private readonly driverPaymentHistoryRepository: DriverPaymentHistoryRepository,
  ) {}

  async onModuleInit(): Promise<boolean> {
    await this.initMultipleStops();
    await this.initLicense();
    return true;
  }

  private async _createCustomer(model: any, preferLanguage: USER_LANGUAGE) {
    model.phoneNumber = formatPhone(model.phoneNumber);
    const customer = new Customer();
    customer.email = model.email;
    customer.firstName = model.firstName;
    customer.lastName = model.lastName;
    customer.phoneNumber = model.phoneNumber;
    customer.accountRole = model.accountRole;
    customer.preferLanguage = preferLanguage;

    const userPhone = await this.customerRepository.findOne({
      phoneNumber: customer.phoneNumber,
    });

    if (userPhone) {
      customThrowError(RESPONSE_MESSAGES.PHONE_EXIST, HttpStatus.CONFLICT);
    }

    const result = await this.customerRepository.save(customer);
    customer.ownerId = result.id;
    await this.customerRepository.save(customer);

    await Promise.all([
      this._initDefaultRef(result.id),
      this._initDefaultPayment(result.id),
    ]);

    const token = this.tokenHelper.createToken({
      id: result.id,
      email: customer.email,
      role: TOKEN_ROLE.CUSTOMER,
      type: TOKEN_TYPE.SET_PASSWORD,
    });

    this.mailHelper.sendSetPassword(
      customer.email,
      token,
      result,
      TOKEN_ROLE.CUSTOMER,
      preferLanguage,
    );

    return customer.email;
  }

  async createCustomerAccount(
    model: CreateUserByAdminDto,
    currentUserId: number,
  ): Promise<boolean> {
    const admin = await this.adminRepository.findOne(currentUserId, {
      select: ['id', 'preferLanguage'],
    });

    const existed = await this.customerRepository.getCustomerByEmail(
      model.email.toLowerCase(),
    );

    if (existed !== null && existed?.deletedAt !== null) {
      customThrowError(RESPONSE_MESSAGES.DELETED_ACCOUNT, HttpStatus.NOT_FOUND);
    }

    if (existed !== null) {
      customThrowError(RESPONSE_MESSAGES.EMAIL_EXIST, HttpStatus.NOT_FOUND);
    }

    await this._createCustomer(model, admin.preferLanguage);

    return true;
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

  private async _createAdmin(model: any, lang?: USER_LANGUAGE) {
    let hash = '';
    if (model?.password) {
      hash = await this.passwordHelper.createHash(model?.password);
    }
    const admin = new Admin();
    admin.email = model.email.toLowerCase();
    admin.firstName = model.firstName;
    admin.lastName = model.lastName;
    admin.password = hash;
    admin.cardNo = model.cardNo;
    admin.phoneNumber = model.phoneNumber;
    admin.userType = model.userType;
    if (lang) {
      admin.preferLanguage = lang;
    }
    return await this.adminRepository.save(admin);
  }

  async createAdminAccount(
    model: CreateAdminDto,
    requestId?: number,
  ): Promise<boolean> {
    const existed = await this.adminRepository.findOne(
      { email: model.email },
      {
        select: ['id', 'preferLanguage'],
      },
    );
    if (existed) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_EXIST,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.EMAIL_EXIST,
      );
    }

    if (requestId) {
      const requestUser = await this.adminRepository.findOne(requestId, {
        select: ['id', 'preferLanguage'],
      });
      const admin = await this._createAdmin(model, requestUser.preferLanguage);

      const token = this.tokenHelper.createToken({
        id: admin.id,
        email: admin.email,
        role: TOKEN_ROLE.ADMIN,
        type: TOKEN_TYPE.SET_PASSWORD,
      });

      await this.mailHelper.sendSetPassword(
        admin.email,
        token,
        admin,
        TOKEN_ROLE.ADMIN,
        admin.preferLanguage,
      );
      return true;
    }

    await this._createAdmin(model);
    return true;
  }

  async createTruckOwnerAccount(
    model: CreateUserByAdminDto,
    adminId: number,
  ): Promise<boolean> {
    const admin = await this.adminRepository.findOne(adminId, {
      select: ['id', 'preferLanguage'],
    });
    if (!admin) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    const existed = await this.truckOwnerRepository.findOne(
      { email: model.email },
      {
        select: ['id'],
      },
    );
    if (existed) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_EXIST,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.EMAIL_EXIST,
      );
    }

    const truckOwner = await this._createTruckOwner(
      model,
      admin.preferLanguage,
    );

    const token = this.tokenHelper.createToken({
      id: truckOwner.id,
      email: truckOwner.email,
      role: TOKEN_ROLE.TRUCK_OWNER,
      type: TOKEN_TYPE.SET_PASSWORD,
    });

    await this.mailHelper.sendSetPassword(
      truckOwner.email,
      token,
      truckOwner,
      TOKEN_ROLE.CUSTOMER,
      truckOwner.preferLanguage,
    );
    return true;
  }

  private async _createTruckOwner(model: any, lang: USER_LANGUAGE) {
    model.phoneNumber = formatPhone(model.phoneNumber);
    const truckOwner = new TruckOwner();
    const publicId = await this.truckOwnerService.generatePublicId();
    truckOwner.email = model.email;
    truckOwner.firstName = model.firstName;
    truckOwner.lastName = model.lastName;
    truckOwner.phoneNumber = model.phoneNumber;
    truckOwner.preferLanguage = lang;
    truckOwner.publicId = publicId;

    const userPhone = await this.truckOwnerRepository.findOne({
      phoneNumber: truckOwner.phoneNumber,
    });

    if (userPhone) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_EXIST,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.PHONE_EXIST,
      );
    }

    return await this.truckOwnerRepository.save(truckOwner);
  }

  /* Customer detail */
  async getCustomerDetail(id: number): Promise<LoginResponseDto> {
    const customer = await this.customerRepository.getCustomerById({ id });

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    const result = new LoginResponseDto(customer);

    return result;
  }

  async getCustomerAPI(id: number, user: any): Promise<any> {
    const customer = await this.customerRepository.getCustomerById({ id });

    if (!customer) {
      return null;
    }

    if (user) {
      const admin = await this.adminRepository.findOne({
        id: user.id,
      });
      if (admin.userType === USER_TYPE.SUPER_ADMIN) {
        const api = await this.apiKeyRepository.findOne({
          customerId: customer.id,
        });
        if (api) {
          const publicApiSalt = this.configService.get('PUBLIC_API_SALT');
          if (!publicApiSalt) {
            return null;
          }
          const ciphertext = CryptoJS.AES.encrypt(
            api.code,
            publicApiSalt,
          ).toString();
          api['key'] = ciphertext;
          return api;
        }
      }
    }

    return null;
  }

  async createCustomerAPI(id: number, user: any): Promise<any> {
    const customer = await this.customerRepository.getCustomerById({ id });

    if (!customer) {
      return false;
    }

    if (user) {
      const admin = await this.adminRepository.findOne({
        id: user.id,
      });
      if (admin.userType === USER_TYPE.SUPER_ADMIN) {
        await this.apiKeyRepository.delete({ customerId: customer.id });
        const api = new ApiKey();
        api.customerId = customer.id;
        api.code = '';
        api.permission = [
          PERMISSION.CREATE_ORDER,
          PERMISSION.UPDATE_ORDER,
          PERMISSION.DELETE_ORDER,
        ];
        const apiSaved = await this.apiKeyRepository.save(api);
        api.code = `customer_api_key_${apiSaved.id}`;
        const newApi = await this.apiKeyRepository.save(api);
        const publicApiSalt = this.configService.get('PUBLIC_API_SALT');
        if (!publicApiSalt) {
          return null;
        }
        const ciphertext = CryptoJS.AES.encrypt(
          newApi.code,
          publicApiSalt,
        ).toString();
        api['key'] = ciphertext;
        return newApi;
      }
    }

    return false;
  }

  async deleteCustomerAPI(id: number, user: any): Promise<any> {
    const customer = await this.customerRepository.getCustomerById({ id });

    if (!customer) {
      return false;
    }

    if (user) {
      const admin = await this.adminRepository.findOne({
        id: user.id,
      });
      if (admin.userType === USER_TYPE.SUPER_ADMIN) {
        return await this.apiKeyRepository.delete({ customerId: customer.id });
      }
    }

    return false;
  }

  /* TruckOwner detail */
  async getTruckOwnerDetail(
    id: number,
    adminId: number,
  ): Promise<LoginResponseDto> {
    const truckOwner = await this.truckOwnerRepository.getTruckOwnerById({
      id,
    });

    const admin = await this.adminRepository.findOne(adminId, {
      select: ['id', 'userType'],
    });

    const truckPoolSetting = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.TRUCK_POOL,
    });

    let truckPool = false;
    if (
      admin &&
      admin.userType === USER_TYPE.SUPER_ADMIN &&
      truckPoolSetting &&
      truckPoolSetting.enabled
    ) {
      truckPool = true;
    }

    if (!truckOwner || (!truckPool && truckOwner.syncCode)) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    const result = new LoginResponseDto(truckOwner);

    return result;
  }

  /* all customer */
  async getCustomers(
    model: CustomerFilterRequestDto,
  ): Promise<[CustomerDetailResponse[], number]> {
    const {
      skip,
      take,
      searchBy,
      searchKeyword,
      order: filterCustomer,
    } = model;
    const order = {};
    const filterCondition = {} as any;
    const where = [];
    let search = '';

    if (model.orderBy) {
      order[model.orderBy] = model.orderDirection;
    } else {
      (order as any).createdDate = 'DESC';
    }

    if (searchBy && searchKeyword) {
      filterCondition[searchBy] = Raw(
        alias => `LOWER(${alias}) like '%${searchKeyword.toLowerCase()}%'`,
      );
    }

    if (
      searchBy === 'verifiedStatus' ||
      searchBy === 'status' ||
      searchBy === 'accountRole' ||
      searchBy === 'accountType'
    ) {
      filterCondition[searchBy] = searchKeyword;
    }

    if (searchBy === 'companyId') {
      filterCondition[searchBy] =
        searchKeyword === 'company' ? Not(IsNull()) : IsNull();
    }
    if (searchBy === 'companyName') {
      search = `LOWER("Customer__company"."name") like '%${searchKeyword.toLowerCase()}%'`;
      const options: FindManyOptions<Customer> = {
        select: [
          'accountRole',
          'cardNo',
          'companyId',
          'createdDate',
          'email',
          'firstName',
          'id',
          'lastName',
          'phoneNumber',
          'status',
          'updatedDate',
          'verifiedStatus',
          'emailVerified',
          'accountType',
          'lastActiveDate',
        ],
        where: search,
        skip,
        take,
        order,
        relations: ['company'],
      };
      const [customer, number] = await this.customerRepository.findAndCount(
        options,
      );
      const modifiedCustomers = customer.map(
        o => new CustomerDetailResponse(o),
      );
      return [modifiedCustomers, number];
    }
    where.push({ ...filterCustomer, ...filterCondition });
    const options: FindManyOptions<Customer> = {
      select: [
        'accountRole',
        'cardNo',
        'companyId',
        'createdDate',
        'email',
        'firstName',
        'id',
        'lastName',
        'phoneNumber',
        'status',
        'updatedDate',
        'verifiedStatus',
        'emailVerified',
        'accountType',
        'lastActiveDate',
      ],
      where,
      skip,
      take,
      order,
      relations: ['company'],
    };

    const [customer, number] = await this.customerRepository.findAndCount(
      options,
    );
    const modifiedCustomers = customer.map(o => new CustomerDetailResponse(o));
    return [modifiedCustomers, number];
  }

  async exportCustomers(body: Record<string, any>, user: any): Promise<any> {
    const admin = await this.adminRepository.findOne({ id: user.id });
    if (admin.userType === USER_TYPE.ADMIN) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    const customerIds = body.ids.map(id => +id);

    const options: FindManyOptions<Customer> = {
      relations: ['company', 'owner'],
    };

    let where: FindConditions<Customer> = {};
    if (!body.isSelectedAll) {
      where = {
        id: In(customerIds),
      };
    }
    options.where = where;
    const customers = await this.customerRepository.find(options);
    const result = customers.map(o => new ExportCustomersByAdminDto({ ...o }));
    return result;
  }

  async getDeletedCustomers(model: CustomerFilterRequestDto): Promise<any> {
    const { skip, take, searchBy, searchKeyword } = model;

    let search = '';

    if (searchBy && searchKeyword) {
      search = `AND "${searchBy}" like '%${searchKeyword.toLowerCase()}%'`;
    }
    return await this.customerRepository.getDeletedCustomers({
      take,
      skip,
      search,
    });
  }

  async getTruckOwners(
    model: GetRequest,
    adminId: number,
  ): Promise<[TruckOwnerDetailResponse[], number]> {
    const {
      skip,
      take,
      searchBy,
      searchKeyword,
      order: filterTruckOwner,
    } = model;

    const order = {};
    const filterCondition = {} as any;
    const where = [];
    let search = '';

    const admin = await this.adminRepository.findOne(adminId, {
      select: ['id', 'userType'],
    });

    const truckPoolSetting = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.TRUCK_POOL,
    });

    let truckPool = false;
    if (
      admin &&
      admin.userType === USER_TYPE.SUPER_ADMIN &&
      truckPoolSetting &&
      truckPoolSetting.enabled
    ) {
      truckPool = true;
    }

    if (model.orderBy) {
      order[model.orderBy] = model.orderDirection;
    } else {
      (order as any).id = 'DESC';
    }

    if (searchBy && searchKeyword) {
      filterCondition[searchBy] = Raw(
        alias => `LOWER(${alias}) like '%${searchKeyword.toLowerCase()}%'`,
      );
    }

    if (
      searchBy === 'verifiedStatus' ||
      searchBy === 'status' ||
      searchBy === 'accountRole'
    ) {
      filterCondition[searchBy] = searchKeyword;
    }

    if (searchBy === 'companyId') {
      filterCondition[searchBy] =
        searchKeyword === 'company' ? Not(IsNull()) : IsNull();
    }
    if (searchBy === 'companyName') {
      search = `LOWER("TruckOwner__company"."name") like '%${searchKeyword.toLowerCase()}%'`;
      if (!truckPool) {
        search += ' AND "TruckOwner"."syncCode" IS NULL';
      }
      const options: FindManyOptions<TruckOwner> = {
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
          'truckService',
          'pickupZone',
          'phoneNumber',
          'publicId',
          'emailVerified',
          'lastActiveDate',
          'referalCode',
          'phoneVerified',
        ],
        where: search,
        skip,
        take,
        order,
        relations: ['company'],
      };
      const [
        truckOwners,
        number,
      ] = await this.truckOwnerRepository.findAndCount(options);
      const modifiedTruckOwners = truckOwners.map(
        o => new TruckOwnerDetailResponse(o),
      );
      return [modifiedTruckOwners, number];
    }
    if (!truckPool) {
      filterCondition['syncCode'] = IsNull();
    }
    where.push({ ...filterTruckOwner, ...filterCondition });
    const options: FindManyOptions<TruckOwner> = {
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
        'truckService',
        'pickupZone',
        'phoneNumber',
        'publicId',
        'emailVerified',
        'lastActiveDate',
        'referalCode',
        'phoneVerified',
      ],
      where,
      skip,
      take,
      order,
      relations: ['company'],
    };

    const [truckOwners, number] = await this.truckOwnerRepository.findAndCount(
      options,
    );
    const modifiedTruckOwners = truckOwners.map(
      o => new TruckOwnerDetailResponse(o),
    );
    return [modifiedTruckOwners, number];
  }

  async exportTruckOwners(body: Record<string, any>, user: any): Promise<any> {
    const admin = await this.adminRepository.findOne({ id: user.id });
    if (admin.userType === USER_TYPE.ADMIN) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    const truckOwnerIds = body.ids.map(id => +id);

    const options: FindManyOptions<TruckOwner> = {
      relations: ['company'],
    };

    let where: FindConditions<TruckOwner> = {};
    if (!body.isSelectedAll) {
      where = {
        id: In(truckOwnerIds),
      };
    }
    options.where = where;
    const truckOwners = await this.truckOwnerRepository.find(options);
    const result = truckOwners.map(
      o => new ExportTruckOwnersByAdminDto({ ...o }),
    );
    return result;
  }

  async getDeletedTruckOwners(model: GetRequest): Promise<any> {
    const { skip, take, searchBy, searchKeyword } = model;

    let search = '';

    if (searchBy && searchKeyword) {
      search = `AND "${searchBy}" like '%${searchKeyword.toLowerCase()}%'`;
    }
    return await this.truckOwnerRepository.getDeletedTruckOwners({
      take,
      skip,
      search,
    });
  }

  async getAdmins(model: GetRequest): Promise<any> {
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
    const options: FindManyOptions<Admin> = {
      select: [
        'id',
        'email',
        'createdDate',
        'firstName',
        'lastName',
        'phoneNumber',
        'userType',
        'verifiedStatus',
        'status',
        'cardNo',
      ],
      where,
      skip,
      take,
      order,
    };

    const admins = await this.adminRepository.findAndCount(options);
    return admins;
  }

  async getDeletedAdmins(model: GetRequest): Promise<any> {
    const { skip, take, searchBy, searchKeyword } = model;

    let search = '';

    if (searchBy && searchKeyword) {
      search = `AND "${searchBy}" like '%${searchKeyword.toLowerCase()}%'`;
    }
    return await this.adminRepository.getDeletedAdmins({
      take,
      skip,
      search,
    });
  }

  async addDriver(model: AdminCreateDriver, adminId: number): Promise<Driver> {
    model.phoneNumber = formatPhone(model.phoneNumber);
    const [admin, driver] = await Promise.all([
      this.adminRepository.findOne(adminId, {
        select: ['id', 'preferLanguage'],
      }),
      this.driverRepository.getDriver(model.phoneNumber),
    ]);

    if (!admin) {
      customThrowError(
        RESPONSE_MESSAGES.ADMIN_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ADMIN_NOT_FOUND,
      );
    }

    if (driver) {
      customThrowError(
        RESPONSE_MESSAGES.DRIVER_EXISTED,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.DRIVER_EXISTED,
      );
    }

    return await this._createDriver(model, admin.preferLanguage);
  }

  private async _createDriver(model: AdminCreateDriver, lang: USER_LANGUAGE) {
    const driver = new Driver();
    driver.phoneNumber = model.phoneNumber;
    driver.cardNo = model.cardNo;
    driver.firstName = model.firstName;
    driver.preferLanguage = lang;

    const result = await this.driverRepository.save(driver);

    const token = this.tokenHelper.createToken({
      id: driver.id,
      email: driver.email,
      type: TOKEN_TYPE.RESET_PASSWORD,
    });
    await this.mailHelper.sendResetPassword(token, driver.email);
    return result;
  }

  /* Customer detail */
  async getAdminDetail(id: number): Promise<AdminDetailResponse> {
    const admin = await this.adminRepository.findOne({ id });

    if (!admin) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ADMIN_NOT_FOUND,
      );
    }

    const result = new AdminDetailResponse(admin);

    return result;
  }

  async getDrivers(model: GetRequest, adminId: number): Promise<any> {
    const { skip, take, searchBy, searchKeyword } = model;

    const order = {};

    if (model.orderBy) {
      order[model.orderBy] = model.orderDirection;
    } else {
      (order as any).id = 'DESC';
    }

    const admin = await this.adminRepository.findOne(adminId, {
      select: ['id', 'userType'],
    });

    const truckPoolSetting = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.TRUCK_POOL,
    });

    let truckPool = false;
    if (
      admin &&
      admin.userType === USER_TYPE.SUPER_ADMIN &&
      truckPoolSetting &&
      truckPoolSetting.enabled
    ) {
      truckPool = true;
    }

    let where = [];
    if (!truckPool) {
      where = [{ syncCode: IsNull() }];
    }
    if (searchBy && searchKeyword) {
      const rawWhere = Raw(
        alias => `LOWER(${alias}) like '%${searchKeyword.toLowerCase()}%'`,
      );

      if (searchBy === 'all') {
        where = [
          { cardNo: rawWhere },
          { phoneNumber: rawWhere },
          { firstName: rawWhere },
        ];
      }
      if (searchBy === 'cardNo') {
        where = [{ cardNo: rawWhere }];
      }
      if (searchBy === 'phoneNumber') {
        where = [{ phoneNumber: rawWhere }];
      }

      if (searchBy === 'verifiedStatus') {
        where = [{ verifiedStatus: +searchKeyword }];
      }

      if (searchBy === 'firstName') {
        where = [{ firstName: rawWhere }];
      }
    }
    const options: FindManyOptions<Driver> = {
      select: [
        'id',
        'email',
        'createdDate',
        'firstName',
        'verifiedStatus',
        'status',
        'cardNo',
        'ownerId',
        'phoneNumber',
        'lastActiveDate',
      ],
      where,
      skip,
      take,
      order,
    };

    const drivers = await this.driverRepository.findAndCount(options);

    if (!drivers) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const returnData = [];
    const driversData = drivers[0];
    for (const driver of driversData) {
      if (driver.ownerId) {
        const truckowner = await this.truckOwnerRepository.findOne(
          driver.ownerId,
        );
        if (truckowner) {
          driver.publicId = truckowner.publicId;
          driver.truckOwnerEmail = truckowner.email;
          driver.truckOwnerName = truckowner.firstName
            ? truckowner.firstName
            : null;
        }
      }
      if (searchBy === 'publicId' && searchKeyword) {
        if (driver?.publicId && driver?.publicId.includes(searchKeyword)) {
          returnData.push(driver);
        }
      } else if (searchBy === 'truckownerName' && searchKeyword) {
        if (
          driver?.truckOwnerName &&
          driver?.truckOwnerName.includes(searchKeyword)
        ) {
          returnData.push(driver);
        }
      } else if (searchBy === 'truckownerEmail' && searchKeyword) {
        if (
          driver?.truckOwnerEmail &&
          driver?.truckOwnerEmail.includes(searchKeyword)
        ) {
          returnData.push(driver);
        }
      } else {
        returnData.push(driver);
      }
    }
    return [returnData, drivers[1]];
  }

  async exportDrivers(body: Record<string, any>, user: any): Promise<any> {
    const admin = await this.adminRepository.findOne({ id: user.id });
    if (admin.userType === USER_TYPE.ADMIN) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    const driverIds = body.ids.map(id => +id);

    const options: FindManyOptions<Driver> = {
      relations: [],
    };

    let where: FindConditions<Driver> = {};
    if (!body.isSelectedAll) {
      where = {
        id: In(driverIds),
      };
    }
    options.where = where;
    const drivers = await this.driverRepository.find(options);
    const result = drivers.map(o => new ExportDriversByAdminDto({ ...o }));
    return result;
  }

  async getDriversEarning(model: GetDriverEarningRequestDto): Promise<any> {
    const truckOwner =
      model.searchBy &&
      model.searchKeyword &&
      (await this.truckOwnerRepository.findOne({
        [model.searchBy]: model.searchKeyword,
      }));

    const drivers = await this.driverRepository.getDriversEarning(
      model,
      truckOwner ? truckOwner.id : null,
    );
    const result = [
      drivers[0].map((driver: Driver) => {
        const earnings = this._getDriverEarnings(driver.orders);
        const paid = this._getDriverPaid(driver.paymentHistory);
        const res: any = {
          id: driver.id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          phoneNumber: driver.phoneNumber,
          noOfTrips: driver.orders.length,
          earnings,
          paid,
          remainingBal: earnings - paid,
        };
        if (model.isExport === 'true') {
          res.paymentHistory = driver.paymentHistory;
        }
        return res;
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

  async payDriverEarning(id: number, model: PayDriverEarningRequestDto) {
    const driver = await this.driverRepository.findOne({ id });
    this.driverPaymentHistoryRepository.insert({ driver, ...model });
    return true;
  }

  async getDeletedDrivers(model: GetRequest): Promise<any> {
    const { skip, take, searchBy, searchKeyword } = model;

    let search = '';

    if (searchBy && searchKeyword) {
      search = `AND "${searchBy}" like '%${searchKeyword.toLowerCase()}%'`;
    }

    return await this.driverRepository.getDeletedDrivers({
      take,
      skip,
      search,
    });
  }

  async getDriversByOwnerId(
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
    driverId: number,
    adminId: number,
  ): Promise<DriverDetailResponse> {
    const driver = await this.driverRepository.getDriverWithOptions({
      id: driverId,
    });

    const admin = await this.adminRepository.findOne(adminId, {
      select: ['id', 'userType'],
    });

    const truckPoolSetting = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.TRUCK_POOL,
    });

    let truckPool = false;
    if (
      admin &&
      admin.userType === USER_TYPE.SUPER_ADMIN &&
      truckPoolSetting &&
      truckPoolSetting.enabled
    ) {
      truckPool = true;
    }

    if (!driver || (!truckPool && driver.syncCode)) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
      );
    }
    const result: DriverDetailResponse = new DriverDetailResponse(driver);
    return result;
  }

  async uploadFile(
    file: Express.Multer.File,
    targetId: number | null,
    referenceType: number,
    request?: Request,
  ): Promise<boolean> {
    await this.fileRepository.delete({
      referenceId: targetId,
      referenceType: referenceType,
    });

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

    if (
      [
        REFERENCE_TYPE.ORDER_DOCUMENT,
        REFERENCE_TYPE.OTHER_DRIVER_DOCUMENT,
        REFERENCE_TYPE.OTHER_TRUCK_DOCUMENT,
      ].includes(referenceType)
    ) {
      const order = await this.orderRepository.findOne({
        where: { id: targetId },
      });
      addBodyToRequest(request, {
        order: order.orderId,
        info: order,
      });
    }

    return true;
  }

  async initSuperAdmin(): Promise<boolean> {
    const admin = await this.adminRepository.find({
      select: ['id'],
      where: {
        email: 'superadmin@admin.com',
      },
    });

    if (admin.length) {
      customThrowError(
        RESPONSE_MESSAGES.SUPPER_EXIST,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.SUPPER_EXIST,
      );
    }

    await this.createAdminAccount({
      email: 'superadmin@admin.com',
      password: process.env.SUPERADMIN_INIT_PASSWORD || 'abc123',
      firstName: 'super',
      lastName: 'admin',
      phoneNumber: '09090090909',
      cardNo: '001',
      userType: USER_TYPE.SUPER_ADMIN,
    });

    return true;
  }

  async deleteAdmin(
    id: number,
    currentUserId: number,
    request: Request,
  ): Promise<boolean> {
    const admin = await this.adminRepository.findOne({ id });

    if (!admin) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    if (admin.id === currentUserId) {
      customThrowError(
        RESPONSE_MESSAGES.SELF_DELETE,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.SELF_DELETE,
      );
    }

    if (admin.userType === USER_TYPE.SUPER_ADMIN) {
      customThrowError(
        RESPONSE_MESSAGES.SUPER_ADMIN_DELETE,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.SUPER_ADMIN_DELETE,
      );
    }

    await getRepository(Admin).softDelete(id);

    // writeLog && writeLog(admin);
    addBodyToRequest(request, admin);
    return true;
  }

  async restoreAdmin(id: number, request: Request): Promise<boolean> {
    const admin = await this.adminRepository.findOne(
      { id },
      { withDeleted: true },
    );

    if (!admin) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    await getRepository(Admin).restore(id);
    addBodyToRequest(request, admin);
    return true;
  }

  async deleteTruckOwner(id: number, request: Request): Promise<boolean> {
    const truckOwner = await this.truckOwnerRepository.findOne({ id });

    if (!truckOwner) {
      customThrowError(
        RESPONSE_MESSAGES.TRUCK_OWNER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_OWNER_NOT_FOUND,
      );
    }

    await getRepository(TruckOwner).softDelete(id);

    addBodyToRequest(request, truckOwner);

    return true;
  }

  async restoreTruckOwner(id: number): Promise<boolean> {
    await getRepository(TruckOwner).restore(id);
    return true;
  }

  async deleteDriver(id: number, request: Request): Promise<boolean> {
    const driver = await this.driverRepository.findOne({ id });

    if (!driver) {
      customThrowError(
        RESPONSE_MESSAGES.DRIVER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
      );
    }
    await getRepository(Driver).softDelete(id);

    addBodyToRequest(request, driver);

    return true;
  }

  async restoreDriver(id: number, request: Request): Promise<boolean> {
    const driver = await this.driverRepository.findOne(
      { id },
      { withDeleted: true },
    );

    await getRepository(Driver).restore(id);

    addBodyToRequest(request, driver);

    return true;
  }

  async deleteFile(
    targetId: number,
    type: number,
    request: Request,
  ): Promise<boolean> {
    try {
      await this._deleteFile(targetId, type);
      addBodyToRequest(request, { referenceId: targetId, referenceType: type });
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

  private async _deleteFile(referenceId: number, referenceType: number) {
    await this.fileRepository.delete({
      referenceId: referenceId,
      referenceType: referenceType,
    });
    return true;
  }

  async deleteSystemFile(type: number, request: Request): Promise<boolean> {
    try {
      await this.fileRepository.delete({
        referenceType: type,
      });
      addBodyToRequest(request, { referenceType: type });
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

  async updateDriver(
    model: UpdateDriver,
    id: number,
  ): Promise<DriverDetailResponse> {
    const driver = await this.driverRepository.findOne(id);
    if (!driver) {
      customThrowError(
        RESPONSE_MESSAGES.DRIVER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
      );
    }

    if (model.phoneNumber) {
      model.phoneNumber = formatPhone(model.phoneNumber);
    }
    const keys = Object.keys(model);

    keys.forEach(key => {
      driver[key] = model[key];
    });

    if (driver.password) {
      driver.password = await this.passwordHelper.createHash(driver.password);
      const now = Math.floor(Date.now() / 1000) * 1000;
      driver.passwordChangedAt = new Date(now);
    } else {
      delete driver.password;
    }

    await this.driverRepository.save(driver);
    const result: DriverDetailResponse = new DriverDetailResponse(driver);
    return result;
  }

  async deleteCustomer(id: number, request: Request): Promise<boolean> {
    const existed = await this.customerRepository.findOne({ id });

    if (!existed) {
      customThrowError(
        RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
      );
    }
    await getRepository(Customer).softDelete(id);
    addBodyToRequest(request, existed);

    return true;
  }

  async restoreCustomer(id: number, request: Request): Promise<boolean> {
    const existed = await this.customerRepository.findOne(
      { id },
      { withDeleted: true },
    );

    if (!existed) {
      customThrowError(
        RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
      );
    }

    await getRepository(Customer).restore(id);
    addBodyToRequest(request, existed);
    return true;
  }

  async deleteCompany(id: number, request: Request): Promise<boolean> {
    const company = await this.companyRepository.findOne({ id });

    if (!company) {
      customThrowError(
        RESPONSE_MESSAGES.COMPANY_NOT_EXISTED,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.COMPANY_NOT_EXISTED,
      );
    }

    await this.companyRepository.delete({ id });

    addBodyToRequest(request, company);

    return true;
  }

  async getCustomerCompany(companyId: number): Promise<any> {
    const company = await this.companyRepository.getCompanyWithOptions({
      id: companyId,
    });

    if (!company) {
      customThrowError(
        RESPONSE_MESSAGES.COMPANY_NOT_EXISTED,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.COMPANY_NOT_EXISTED,
      );
    }
    const result = new CompanyDetailResponse(company);

    return result;
  }

  async createCustomerCompany(body: Record<string, any>): Promise<boolean> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userRepository.findOne(body.id, {
        select: ['id', 'companyId'],
      });

      if (user.companyId) {
        customThrowError(
          RESPONSE_MESSAGES.COMPANY_EXIST,
          HttpStatus.CONFLICT,
          RESPONSE_MESSAGES_CODE.COMPANY_EXIST,
        );
      }

      const company = await this._createCompany(body.model);
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
      return await this.getCustomerCompany(user.companyId);
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

  async updateCustomerCompany(body: Record<string, any>): Promise<boolean> {
    const user = await this.userRepository.findOne(body.id, {
      select: ['id', 'companyId'],
    });

    if (!user.companyId) {
      const company = await this._createCompany(body.model);
      user.companyId = company.id;
      await this.userRepository.save(user);
      return await this.getCustomerCompany(user.companyId);
    }

    const company = await this.companyRepository.findOne({
      id: user.companyId,
    });

    const keys = Object.keys(body.model);

    keys.forEach(key => {
      company[key] = body.model[key];
    });
    await this.companyRepository.save(company);
    return await this.getCustomerCompany(user.companyId);
  }

  async verifyCustomerAccount(id: number): Promise<boolean> {
    const customer = await this.customerRepository.findOne(id);
    customer.emailVerified = true;
    await this.customerRepository.save(customer);
    const name = getNickname(customer);
    this.mailHelper.sendVerifiedEmail(
      customer.email,
      null,
      TOKEN_ROLE.CUSTOMER,
      name,
      customer.preferLanguage,
    );
    return true;
  }

  async verifyTruckOwnerAccount(id: number): Promise<boolean> {
    const truckOwner = await this.truckOwnerRepository.findOne(id);
    truckOwner.emailVerified = true;
    await this.truckOwnerRepository.save(truckOwner);
    const name = await getNickname(truckOwner);
    this.mailHelper.sendVerifiedEmail(
      truckOwner.email,
      null,
      TOKEN_ROLE.TRUCK_OWNER,
      name,
      truckOwner.preferLanguage,
    );
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async updateAdmin(id: number, model: any): Promise<any> {
    const admin = await this.adminRepository.findOne(id, {
      select: ['id'],
    });

    if (!admin) {
      customThrowError(
        RESPONSE_MESSAGES.ADMIN_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ADMIN_NOT_FOUND,
      );
    }
    const keys = Object.keys(model);

    keys.forEach(key => {
      admin[key] = model[key];
    });

    if (admin.password) {
      admin.password = await this.passwordHelper.createHash(admin.password);
      const now = Math.floor(Date.now() / 1000) * 1000;
      admin.passwordChangedAt = new Date(now);
    } else {
      delete admin.password;
    }

    await this.adminRepository.save(admin);

    return true;
  }

  async updateCustomer(id: number, model: AdminUpdateCustomer): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await this.customerRepository.findOne(id);

      if (!customer) {
        customThrowError(
          RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
        );
      }

      if (model.email) {
        const customerExist = await this.customerRepository.findOne({
          email: model.email,
        });
        if (customerExist && customerExist.email !== customer.email) {
          customThrowError(
            RESPONSE_MESSAGES.EMAIL_EXIST,
            HttpStatus.BAD_REQUEST,
            RESPONSE_MESSAGES_CODE.EMAIL_EXIST,
          );
        }
      }

      if (
        customer.verifiedStatus !== VERIFIED_STATUS.VERIFIED &&
        model.verifiedStatus === VERIFIED_STATUS.VERIFIED
      ) {
        const model = new CreateEditNotificationDto();
        model.title = NOTI_SUBJECT.ACCOUNT_VERIFIED;
        if (customer.preferLanguage === USER_LANGUAGE.VI) {
          model.body = VI_NOTI_CONTENT.ACCOUNT_VERIFIED;
        }
        if (
          customer.preferLanguage === USER_LANGUAGE.EN ||
          customer.preferLanguage === USER_LANGUAGE.ID
        ) {
          model.body = NOTI_CONTENT.ACCOUNT_VERIFIED;
        }
        if (customer.preferLanguage === USER_LANGUAGE.KR) {
          model.body = KR_NOTI_CONTENT.ACCOUNT_VERIFIED;
        }
        if (customer.notiToken) {
          model.sendToCustomer = true;
          await this.notificationService.sendNotification(
            model,
            customer,
            TOKEN_ROLE.CUSTOMER,
          );
        }
        const name = await getNickname(customer);
        await this.mailHelper.sendVerifiedEmail(
          customer.email,
          null,
          TOKEN_ROLE.CUSTOMER,
          name,
          customer.preferLanguage,
        );
      }
      const keys = Object.keys(model);
      keys.forEach(key => {
        customer[key] = model[key];
      });

      if (customer.password) {
        customer.password = await this.passwordHelper.createHash(
          customer.password,
        );
        const now = Math.floor(Date.now() / 1000) * 1000;
        customer.passwordChangedAt = new Date(now);
      } else {
        delete customer.password;
      }

      const employees = await this.userRepository.find({
        where: [{ ownerId: customer.id }],
        select: ['id'],
      });

      const modifiedEmployees = employees.map(e => ({
        ...e,
        companyId: customer.companyId,
      }));
      await Promise.all([
        queryRunner.manager.save(Customer, customer),
        queryRunner.manager.save(Customer, modifiedEmployees),
      ]);

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.response && error.status) {
        customThrowError(
          error.response.message,
          error.status,
          error.response.code,
        );
      }
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateEmployee(
    userId: number,
    model: Record<string, any>,
  ): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne(userId);

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

  async getUser(id: number): Promise<LoginResponseDto> {
    const user = await this.userRepository.getCustomerById({
      id: id,
    });

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
      );
    }
    const result = new LoginResponseDto(user);

    return result;
  }

  async updateTruckOwner(
    id: number,
    model: AdminUpdateTruckOwner,
  ): Promise<any> {
    const truckOwner = await this.truckOwnerRepository.findOne(id);

    if (!truckOwner) {
      customThrowError(
        RESPONSE_MESSAGES.TRUCK_OWNER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.TRUCK_OWNER_NOT_FOUND,
      );
    }

    if (model.email) {
      const truckOwnerExist = await this.truckOwnerRepository.findOne({
        email: model.email,
      });
      if (truckOwnerExist && truckOwnerExist.email !== truckOwner.email) {
        customThrowError(
          RESPONSE_MESSAGES.EMAIL_EXIST,
          HttpStatus.BAD_REQUEST,
          RESPONSE_MESSAGES_CODE.EMAIL_EXIST,
        );
      }
    }

    if (model.phoneNumber) {
      const truckOwnerExist = await this.truckOwnerRepository.findOne({
        phoneNumber: model.phoneNumber,
      });
      if (
        truckOwnerExist &&
        truckOwnerExist.phoneNumber !== truckOwner.phoneNumber
      ) {
        customThrowError(
          RESPONSE_MESSAGES.PHONE_EXIST,
          HttpStatus.BAD_REQUEST,
          RESPONSE_MESSAGES_CODE.PHONE_EXIST,
        );
      }
    }

    if (model.phoneNumber) {
      model.phoneNumber = formatPhone(model.phoneNumber);
    }
    const keys = Object.keys(model);
    if (
      truckOwner.verifiedStatus !== VERIFIED_STATUS.VERIFIED &&
      model.verifiedStatus === VERIFIED_STATUS.VERIFIED
    ) {
      const model = new CreateEditNotificationDto();
      model.title = NOTI_SUBJECT.ACCOUNT_VERIFIED;
      if (truckOwner.preferLanguage === USER_LANGUAGE.VI) {
        model.body = VI_NOTI_CONTENT.ACCOUNT_VERIFIED;
        model.sendToCustomer = true;
      }
      if (
        truckOwner.preferLanguage === USER_LANGUAGE.EN ||
        truckOwner.preferLanguage === USER_LANGUAGE.ID
      ) {
        model.body = NOTI_CONTENT.ACCOUNT_VERIFIED;
        model.sendToCustomer = true;
      }
      if (truckOwner.notiToken) {
        model.sendToTruckOwner = true;
        await this.notificationService.sendNotification(
          model,
          truckOwner,
          TOKEN_ROLE.TRUCK_OWNER,
        );
      }
      this.mailHelper.sendVerifiedEmail(
        truckOwner.email,
        null,
        TOKEN_ROLE.TRUCK_OWNER,
        getNickname(truckOwner),
        truckOwner.preferLanguage,
      );
    }
    keys.forEach(key => {
      truckOwner[key] = model[key];
    });

    if (truckOwner.password) {
      truckOwner.password = await this.passwordHelper.createHash(
        truckOwner.password,
      );
      const now = Math.floor(Date.now() / 1000) * 1000;
      truckOwner.passwordChangedAt = new Date(now);
    } else {
      delete truckOwner.password;
    }

    await this.truckOwnerRepository.save(truckOwner);

    return true;
  }

  async getCompanies(model: GetRequest): Promise<any> {
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
      where = [{ name: rawWhere }, { address: rawWhere }];
    }
    const options: FindManyOptions<Company> = {
      select: ['id', 'name', 'phone', 'address', 'licenseNo'],
      where,
      skip,
      take,
      order,
      relations: ['customers'],
    };

    const companies = await this.companyRepository.findAndCount(options);
    return companies;
  }

  private async _createCompany(model: CreateCompanyDto): Promise<Company> {
    const company = new Company();
    company.name = model.name;
    company.phone = model.phone;
    company.address = model.address;
    company.licenseNo = model.licenseNo;

    const result = await this.companyRepository.save(company);
    return result;
  }

  async updateTruckOwnerCompany(
    model: UpdateCompany,
    ownerId: number,
  ): Promise<CompanyDetailResponse> {
    const user = await this.truckOwnerRepository.findOne(ownerId, {
      select: ['id', 'companyId'],
    });

    if (!user.companyId) {
      const company = await this._createCompany(model);
      user.companyId = company.id;
      await this.truckOwnerRepository.save(user);
      return await this.getTruckOwnerCompany(user.id);
    }

    const company = await this.companyRepository.findOne({
      id: user.companyId,
    });

    const keys = Object.keys(model);

    keys.forEach(key => {
      company[key] = model[key];
    });
    await this.companyRepository.save(company);
    return await this.getTruckOwnerCompany(user.id);
  }

  async getTruckOwnerCompany(ownerId: number): Promise<CompanyDetailResponse> {
    const user = await this.truckOwnerRepository.findOne(ownerId);
    if (!user.companyId) {
      customThrowError(
        RESPONSE_MESSAGES.COMPANY_NOT_EXISTED,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.COMPANY_NOT_EXISTED,
      );
    }
    const company = await this.companyRepository.getCompanyWithOptions({
      id: user.companyId,
    });
    if (!company) {
      customThrowError(
        RESPONSE_MESSAGES.COMPANY_NOT_EXISTED,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.COMPANY_NOT_EXISTED,
      );
    }

    const result = new CompanyDetailResponse(company);

    return result;
  }

  async createTruckOwnerCompany(body: Record<string, any>): Promise<boolean> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.truckOwnerRepository.findOne(body.id, {
        select: ['id', 'companyId'],
      });

      if (user.companyId) {
        customThrowError(
          RESPONSE_MESSAGES.COMPANY_EXIST,
          HttpStatus.CONFLICT,
          RESPONSE_MESSAGES_CODE.COMPANY_EXIST,
        );
      }

      const company = await this._createCompany(body.model);
      user.companyId = company.id;
      // user.accountRole = ACCOUNT_ROLE.OWNER;
      // user.ownerId = user.id;

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
      return await this.getCustomerCompany(user.companyId);
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

  async getTruckById(truckId: number): Promise<any> {
    const truck = await this.truckRepository.getTruckWithOptions({
      id: truckId,
    });
    if (!truck) {
      customThrowError(
        RESPONSE_MESSAGES.TRUCK_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_NOT_FOUND,
      );
    }
    const result: TrucksDetailResponse = new TrucksDetailResponse(truck);
    return result;
  }

  async getTrucksByOwnerId(
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

  async getAllTrucksByOwnerId(ownerId: number): Promise<any> {
    const options: FindManyOptions<Truck> = {
      where: { ownerId: ownerId },
    };

    const result = await this.truckRepository.find(options);
    return result;
  }

  async createTruck(model: CreateTruckDto, id: number): Promise<Truck> {
    const truck = new Truck();

    truck.truckType = model.truckType;
    truck.truckNo = model.truckNo;
    truck.truckLoad = model.truckLoad;
    truck.ownerId = id;
    const blackboxInfo = await this.blackBoxService.getBlackBoxInfo(
      truck.truckNo,
    );
    truck.blackBoxType = blackboxInfo ? blackboxInfo.type : null;
    truck.devId = blackboxInfo ? blackboxInfo.devId : null;
    const result = await this.truckRepository.save(truck);
    return result;
  }

  async updateTruck(
    model: UpdateTruck,
    id: number,
  ): Promise<TrucksDetailResponse> {
    const truck = await this.truckRepository.findOne(id);
    if (!truck) {
      customThrowError(
        RESPONSE_MESSAGES.TRUCK_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_NOT_FOUND,
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

  async deleteTruck(id: number, request: Request): Promise<boolean> {
    const truck = await this.truckRepository.findOne({ id });

    if (!truck) {
      customThrowError(
        RESPONSE_MESSAGES.TRUCK_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.TRUCK_NOT_FOUND,
      );
    }

    await this.truckRepository.delete({ id });
    addBodyToRequest(request, truck);

    return true;
  }

  async getTruckOwnerDrivers(
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

  async getAllTruckOwnerDrivers(ownerId: number): Promise<any> {
    const options: FindManyOptions<Driver> = {
      where: { ownerId: ownerId },
    };
    const result = await this.driverRepository.find(options);
    return result;
  }

  async getTruckOwnerDriver(driverId: number): Promise<DriverDetailResponse> {
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
    const result: DriverDetailResponse = new DriverDetailResponse(driver);
    return result;
  }

  async deleteTruckOwnerDriver(id: number, request: Request): Promise<boolean> {
    const driver = await this.driverRepository.findOne({ id });
    if (!driver) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.DRIVER_NOT_FOUND,
      );
    }

    driver.ownerId = null;

    await this.driverRepository.save(driver);
    addBodyToRequest(request, driver);

    return true;
  }

  private async _createTruckOwnerDriver(
    model: TruckOwnerCreateDriver,
    ownerId: number,
  ) {
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

  async addTruckOwnerDriver(
    model: TruckOwnerCreateDriver,
    ownerId: number,
  ): Promise<Driver> {
    const user = await this.truckOwnerRepository.findOne(ownerId, {
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
      const result = await this._createTruckOwnerDriver(model, user.id);
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
    const result = await this.driverRepository.save(driver);
    return result;
  }

  async updateTruckOwnerDriver(
    model: UpdateDriver,
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

    const keys = Object.keys(model);

    keys.forEach(key => {
      driver[key] = model[key];
    });

    await this.driverRepository.save(driver);
    const result: DriverDetailResponse = new DriverDetailResponse(driver);
    return result;
  }

  async login(model: LoginUserDto): Promise<LoginResponseDto> {
    const user = await this.adminRepository.getLoginUserWithOptions({
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
    await this._checkPassword(model.password, user.password);

    const token = this.tokenHelper.createToken({
      id: user.id,
      email: user.email,
      type: TOKEN_TYPE.ADMIN_LOGIN,
      role: TOKEN_ROLE.ADMIN,
    });
    await this.adminRepository.save(user);
    const result: LoginResponseDto = new LoginResponseDto({ token, ...user });
    return result;
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

  async verifyToken(token: string): Promise<LoginResponseDto> {
    const data = this.tokenHelper.verifyToken(token);

    const user = await this.adminRepository.getUserWithOptions({
      email: data.email,
    });

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.TOKEN_ERROR,
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

  async changePassword(id: number, model: ChangePassword): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000) * 1000;
    const user = await this.adminRepository.findOne(
      { id },
      {
        select: ['id', 'password', 'passwordChangedAt', 'email', 'firstName'],
      },
    );
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.ADMIN_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ADMIN_NOT_FOUND,
      );
    }

    const newHash = await this.passwordHelper.createHash(model.password);

    user.password = newHash;
    user.passwordChangedAt = new Date(now);

    await this.adminRepository.save(user);

    return true;
  }

  async forgotPassword(email: string, lang: USER_LANGUAGE): Promise<boolean> {
    const user = await this.adminRepository.findOne(
      { email: email.toLowerCase() },
      {
        select: ['id', 'email', 'firstName'],
      },
    );
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.ADMIN_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ADMIN_NOT_FOUND,
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
      TOKEN_ROLE.ADMIN,
      getNickname(user),
      lang,
    );
    return true;
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
    const user = await this.adminRepository.findOne(
      {
        email: data.email,
        id: data.id,
      },
      // { select: ['id'] },
    );

    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.ADMIN_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ADMIN_NOT_FOUND,
      );
    }

    user.password = await this.passwordHelper.createHash(model.password);
    user.passwordChangedAt = new Date(now);

    await this.adminRepository.save(user);

    return true;
  }

  async exportOrders(
    adminId: number,
    body: Record<string, any>,
    type: TYPE_EXPORT_ORDER,
  ): Promise<any> {
    const admin = await this.adminRepository.findOne({ id: adminId });
    if (admin.userType === USER_TYPE.ADMIN) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    let orderIds = null;
    if (body.criteria !== undefined && body.criteria) {
      orderIds = body.criteria.ids.map(id => +id);
    }
    if (body.criteriaPayment !== undefined && body.criteriaPayment) {
      orderIds = body.criteriaPayment.ids.map(id => +id);
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
    let where: FindConditions<Order> = {};
    if (body.criteria !== undefined) {
      if (!body.criteria.isSelectedAll) {
        where = {
          id: In(orderIds),
        };
      }
    }
    if (body.criteriaPayment !== undefined) {
      if (!body.criteriaPayment.isSelectedAll) {
        where = {
          id: In(orderIds),
        };
      }
    }

    options.where = where;

    if (body.dataConditionFilter !== undefined) {
      body.dataConditionFilter.skip = 0;
      body.dataConditionFilter.take = Number.MAX_SAFE_INTEGER;
    }
    if (body.dataFilterPayment !== undefined) {
      body.dataFilterPayment.skip = 0;
      body.dataFilterPayment.take = Number.MAX_SAFE_INTEGER;
    }

    // if-else - check the dataConditionFilter assign, if there is dataConditionFilter => it is called from Orders Manage - else => it is called from Orders Payment
    if (orderIds[0] === -1 && body.dataConditionFilter !== undefined) {
      const dataAfterFilter = await this.orderService.getListV2(
        body.dataConditionFilter,
      );
      const result = dataAfterFilter[0].map(
        o => new ExportOrdersByCustomerNewDto({ ...o }),
      );
      return result;
    }
    if (orderIds[0] === -1 && body.dataFilterPayment !== undefined) {
      const dataAfterFilter = await this.orderService.getList(
        body.dataFilterPayment,
      );
      const result = dataAfterFilter[0].map(
        o => new ExportOrdersByCustomerNewDto({ ...o }),
      );
      return result;
    } else {
      const orders = await this.orderRepository.find(options);
      const result = orders.map(
        o => new ExportOrdersByCustomerNewDto({ ...o }),
      );
      return result;
    }
  }

  async getEmployees(model: Record<string, any>): Promise<any> {
    const owner = await this.userRepository.findOne(model.customerId);
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
    } else whereModified = { ownerId: owner.id };

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
        'ownerId',
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
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.EMPLOYEE_NOT_FOUND,
      );
    }

    return employees;
  }

  async getEmployeeById(id: number, ownerId: number): Promise<any> {
    const currentUser = await this.userRepository.findOne(ownerId, {
      select: ['id'],
    });

    const employee = await this.userRepository.getEmployeeWithOptions({
      id,
      ownerId: currentUser.id,
    });

    if (!employee) {
      customThrowError(
        RESPONSE_MESSAGES.EMPLOYEE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
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
    const currentUser = await this.userRepository.findOne(currentUserId, {
      select: ['companyId', 'id', 'email', 'phoneNumber'],
    });

    const employee = await this.userRepository.findOne(employeeId, {
      select: ['companyId', 'id', 'email', 'phoneNumber'],
    });

    if (employee.companyId !== currentUser.companyId) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    await this.userRepository.softDelete(employee.id);
    addBodyToRequest(request, {
      employee: removeIgnoredAttributes(employee),
      owner: removeIgnoredAttributes(currentUser),
    });
    return true;
  }

  async addEmployee(body: Record<string, any>): Promise<any> {
    const user = await this.userRepository.findOne(body.customerId, {
      select: ['id', 'companyId'],
    });

    const employee = await this.userRepository.findOne({
      email: body.model.email,
    });

    if (employee) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_EXIST,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.EMAIL_EXIST,
      );
    }

    const employeePhone = await this.userRepository.findOne(
      {
        phoneNumber: body.model.phoneNumber,
      },
      {
        withDeleted: true,
      },
    );

    if (employeePhone) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_EXIST,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.PHONE_EXIST,
      );
    }

    return this._createEmployee(body.model, user.id, user.companyId);
  }

  private async _createEmployee(
    model: CreateEmployeeDto,
    ownerId: number,
    companyId: number,
  ) {
    const employee = new Customer();
    employee.firstName = model.firstName;
    employee.email = model.email;
    employee.phoneNumber = model.phoneNumber;
    employee.cardNo = model.cardNo;
    employee.accountRole = model.accountRole;
    employee.companyId = companyId;
    employee.ownerId = ownerId;

    const result = await this.userRepository.save(employee);

    await Promise.all([
      this._initDefaultRef(result.id),
      this._initDefaultPayment(result.id),
    ]);

    const token = this.tokenHelper.createToken({
      id: employee.id,
      email: employee.email,
      type: TOKEN_TYPE.REGISTER,
    });
    this.mailHelper.sendResetPassword(token, employee.email);

    return result;
  }

  async listFavoriteTruckOwner(body: Record<string, any>): Promise<any> {
    const customer = await this.userRepository.findOne({
      where: { id: body.customerId },
      select: ['id'],
      relations: ['favoriteTruckOwners'],
    });

    const skip = body.skip;
    const take = body.take;

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

  async listAllFavoriteTruckOwner(body: Record<string, any>): Promise<any> {
    const order = await this.orderRepository.findOne(body.orderId);
    if (order.createdByCustomerId) {
      const customer = await this.userRepository.findOne({
        where: { id: order.createdByCustomerId },
        select: ['id'],
        relations: ['favoriteTruckOwners'],
      });
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
      });
      return favorite;
    }
    return [];
  }

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
        select: ['id', 'publicId', 'email'],
      }),
      this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email'],
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

    addBodyToRequest(request, {
      customer: removeIgnoredAttributes(customer),
      truckOwner: removeIgnoredAttributes(truckOwner),
    });
    return true;
  }

  async removeFavoriteTruckOwner(
    truckOwnerId: number,
    userId: number,
    request: Request,
  ): Promise<boolean> {
    const customer = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email'],
      relations: ['favoriteTruckOwners'],
    });

    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
      );
    }

    const remainFavoriteTruckOwner = [];
    let removedTruckOwner;
    customer.favoriteTruckOwners.forEach(truckOwner => {
      if (truckOwner.id !== truckOwnerId) {
        remainFavoriteTruckOwner.push(truckOwner);
      } else {
        removedTruckOwner = truckOwner;
      }
    });

    customer.favoriteTruckOwners = remainFavoriteTruckOwner;
    await this.userRepository.save(customer);

    addBodyToRequest(request, {
      customer: removeIgnoredAttributes(customer),
      removedTruckOwner: removeIgnoredAttributes(removedTruckOwner),
    });

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
        RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.CUSTOMER_NOT_FOUND,
      );
    }

    customer.favoriteTruckOwners = [];
    await this.userRepository.save(customer);
    return true;
  }

  async customerCancellingOrder(
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

    if (existedOrder.status === ORDER_STATUS.CANCELED) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_CANCELED,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.ORDER_CANCELED,
      );
    }
    existedOrder.beforeCancel = existedOrder.status;
    existedOrder.status = ORDER_STATUS.CUSTCANCEL;
    existedOrder.canceledBy = CANCELED_BY.CUSTOM_CANCEL;

    await this.orderRepository.save(existedOrder);

    addBodyToRequest(
      request,
      { order: existedOrder.orderId, info: existedOrder },
      existedOrder.orderId,
    );

    return true;
  }

  async driverCancellingOrder(
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

    if (existedOrder.status === ORDER_STATUS.CANCELED) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_CANCELED,
        HttpStatus.CONFLICT,
        RESPONSE_MESSAGES_CODE.ORDER_CANCELED,
      );
    }
    existedOrder.beforeCancel = existedOrder.status;
    existedOrder.status = ORDER_STATUS.DRIVERCANCEL;
    existedOrder.canceledBy = CANCELED_BY.DRIVER_CANCEL;

    await this.orderRepository.save(existedOrder);

    if (existedOrder.createdByCustomerId) {
      const customer = await this.customerRepository.findOne(
        existedOrder.createdByCustomerId,
      );
      if (customer) {
        this.mailHelper.sendCancelledAfterassign(
          customer,
          existedOrder.orderId,
        );
      }
    }

    addBodyToRequest(
      request,
      { order: existedOrder.orderId, existedOrder },
      existedOrder.orderId,
    );

    return true;
  }

  async getReport(model: Record<string, any>): Promise<any> {
    const truckownerData = await this.orderRepository.getTruckownerDataReportByAdmin(
      model,
    );

    const truckowner = [];

    for (let i = 0; i < truckownerData[0][1]; i++) {
      const truckOwnerInfo = [];
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

    const data = await this.orderRepository.getCustomerDataReportByAdmin(model);

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

  async getReportOrdersByAdmin(
    filterOptionsModel: Record<string, any>,
    type: string,
  ): Promise<[OrderResponseDto[], number]> {
    if (!filterOptionsModel.order) {
      filterOptionsModel.order = new OrderRequestDto();
    }

    return await this.orderRepository.getReportAdminList(
      filterOptionsModel,
      type,
    );
  }

  async getCustomerStatistics(
    filterOptionsModel: Record<string, any>,
  ): Promise<[any[], number]> {
    return await this.orderRepository.getCustomerStatistics(filterOptionsModel);
  }

  async getTruckOwnerStatistics(
    filterOptionsModel: Record<string, any>,
  ): Promise<[any[], number]> {
    return await this.orderRepository.getTruckOwnerStatistics(
      filterOptionsModel,
    );
  }

  async getReportTruckOwnerOrdersByAdmin(
    filterOptionsModel: Record<string, any>,
  ): Promise<[OrderResponseDto[], number]> {
    if (!filterOptionsModel.order) {
      filterOptionsModel.order = new OrderRequestDto();
    }

    const truckOwnerId = await this.truckOwnerRepository.findOne({
      where: { email: filterOptionsModel.nameTruckOwner },
      select: ['id'],
    });

    return await this.orderRepository.getReportTruckownerListByAdmin(
      filterOptionsModel,
      truckOwnerId.id,
    );
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
        if (!orderRequestDto.cargoType || !orderRequestDto.cargoName) {
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
      case SERVICE_TYPE.NORMAL_TRUCK_VAN:
        if (!orderRequestDto.truckQuantity) {
          customThrowError(
            RESPONSE_MESSAGES.TRUCK_SPECIAL_OR_QUANTITY,
            HttpStatus.BAD_REQUEST,
            RESPONSE_MESSAGES_CODE.TRUCK_SPECIAL_OR_QUANTITY,
          );
        }
        break;

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
    }

    return true;
  }

  private _mappingWithDto(orderRequestDto: OrderRequestDto): Order {
    const orderModel = this.orderRepository.create();

    const keys = Object.keys(orderRequestDto);
    keys.forEach(key => {
      orderModel[key] = orderRequestDto[key];
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
    return await this.provinceRepository.findOne({
      name: Like(`%${provinceName}%`),
      countryCode: process.env.REGION,
    });
  }

  private _removeProvincePrefix(provinceName: string): string {
    return provinceName
      .replace('Thành phố ', '')
      .replace('Tỉnh ', '')
      .replace('thành phố ', '');
  }

  async createOrder(
    orderRequestDto: OrderRequestDto,
    user: Record<string, unknown>,
    request: Request,
  ): Promise<Order> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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
        pickupCityCode = province ? province.code : 'P00'; // Other province
        newOrderModel.pickupCity = province.id;
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

      // const customer = await this.adminRepository.findOne(user.id);

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
      // this.mailHelper.sendNewOrder(customer, createdOrder);
      await this.orderService.createFolder(createdOrder.id);
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
      console.log(
        '🚀 ~ file: admin.service.ts ~ line 3536 ~ AdminUserService ~ error',
        error,
      );
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

  async untakeOrder(orderId: number, request: Request): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        status: In([ORDER_STATUS.ASSIGNED, ORDER_STATUS.DISPATCHED]),
      },
    });

    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }
    const truckOwner = await this.truckOwnerRepository.findOne(order.ownerId);
    const name = getNickname(truckOwner);
    order.status = ORDER_STATUS.ASSIGNING;
    order.ownerId = null;
    order.drivers = [];
    order.trucks = [];
    let customer = null;
    await this.orderRepository.save(order);
    if (order.createdByCustomerId) {
      customer = await this.customerRepository.findOne(
        order.createdByCustomerId,
      );
    }

    if (order.createdByAdminId) {
      customer = await this.adminRepository.findOne(order.createdByAdminId);
    }
    this.mailHelper.sendFindNewTruck(customer, order.orderId, name);
    addBodyToRequest(request, { order: order.orderId }, order.orderId);
    return true;
  }

  async getAllTruckOwners(): Promise<TruckOwnerResponseDto[]> {
    const truckOwners = await this.truckOwnerRepository.find();
    const modifiedTruckOwners = truckOwners.map(
      t => new TruckOwnerResponseDto(t),
    );
    return modifiedTruckOwners;
  }

  async exportReportOrders(
    body: Record<string, any>,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const orderIds = body.criteria.ids.map(id => +id);

    const result = await this.orderRepository.exportReportOrdersByAdmin(
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
    body: Record<string, any>,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const orderIds = body.criteria.ids.map(id => +id);

    const truckOwnerId = await this.truckOwnerRepository.findOne({
      where: { email: body.typeOrder },
      select: ['id'],
    });

    const result = await this.orderRepository.exportReportTruckOwnersByAdmin(
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

  async getSetting(type: number): Promise<AdminSetting> {
    return await this.adminSettingRepository.findOne({ settingType: type });
  }

  async getSettings(): Promise<AdminSetting[]> {
    return await this.adminSettingRepository.find();
  }

  async getSystemImg(): Promise<any> {
    const [logo, qr] = await Promise.all([
      this.fileRepository.findOne({
        referenceType: REFERENCE_TYPE.CUSTOMER_LOGO,
      }),
      this.fileRepository.findOne({
        referenceType: REFERENCE_TYPE.FOOTER_QR,
      }),
    ]);
    const model = {
      logo: null,
      qr: null,
      logoId: null,
      qrId: null,
      logoUrl: null,
      qrUrl: null,
    };
    if (logo) {
      model.logo = logo.fileName;
      model.logoId = logo.id;
      model.logoUrl = `${process.env.BACKEND_HOST}/api/assets/${logo.id}.${logo.extension}`;
    }
    if (qr) {
      model.qr = qr.fileName;
      model.qrId = qr.id;
      model.qrUrl = `${process.env.BACKEND_HOST}/api/assets/${qr.id}.${qr.extension}`;
    }
    return model;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async updateSettings(_model: any): Promise<boolean> {
    const [
      fbLink,
      fbText,
      qrText,
      email,
      phoneNumber,
      companyName,
      defaultColor,
      monthlyOrder,
    ] = await Promise.all([
      this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.FB_LINK,
      }),
      this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.FB_TEXT,
      }),
      this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.QR_TEXT,
      }),
      this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.EMAIL,
      }),
      this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.PHONE_NUMBER,
      }),
      this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.COMPANY_NAME,
      }),
      this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.DEFAULT_COLOR,
      }),
      this.adminSettingRepository.findOne({
        settingType: SETTING_TYPE.MONTHLY_ORDER,
      }),
    ]);

    fbLink.rawHtml = _model.fbLink;
    fbText.rawHtml = _model.fbLabel;
    qrText.rawHtml = _model.qrLabel;
    email.rawHtml = _model.email;
    phoneNumber.rawHtml = _model.phoneNumber;
    companyName.rawHtml = _model.companyName;
    defaultColor.rawHtml = _model.defaultColor;
    monthlyOrder.rawHtml = _model.monthlyOrder;
    if (monthlyOrder.rawHtml === '') {
      monthlyOrder.remain = '999999';
    } else {
      monthlyOrder.remain = _model.monthlyOrder;
    }

    await Promise.all([
      this.adminSettingRepository.save(fbLink),
      this.adminSettingRepository.save(fbText),
      this.adminSettingRepository.save(qrText),
      this.adminSettingRepository.save(email),
      this.adminSettingRepository.save(phoneNumber),
      this.adminSettingRepository.save(companyName),
      this.adminSettingRepository.save(defaultColor),
      this.adminSettingRepository.save(monthlyOrder),
    ]);

    const admins = await this.adminRepository.find();
    admins.map(async a => {
      a.notShowAgain = false;
      await this.adminRepository.save(a);
    });

    if (+_model.monthlyOrder >= 0 && _model.monthlyOrder != '') {
      const users = await this.customerRepository.find();
      users.map(async u => {
        u.limitOrder = +_model.monthlyOrder;
        await this.customerRepository.save(u);
      });
    } else if (_model.monthlyOrder == '') {
      const users = await this.customerRepository.find();
      users.map(async u => {
        u.limitOrder = 99999;
        await this.customerRepository.save(u);
      });
    }
    return true;
  }

  async updateCreateOrderSettings(_model: any): Promise<boolean> {
    const autoVerifyOrder = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.AUTO_VERIFY_ORDER,
    });
    autoVerifyOrder.enabled = _model.autoVerifyOrder;
    await this.adminSettingRepository.save(autoVerifyOrder);
    return true;
  }

  async updateTruckPoolSettings(_model: any): Promise<boolean> {
    const truckPool = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.TRUCK_POOL,
    });
    truckPool.enabled = _model.truckPool;
    await this.adminSettingRepository.save(truckPool);
    return true;
  }

  async initPriceSetting(): Promise<boolean> {
    const priceSetting = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.PRICING,
    });
    if (priceSetting) {
      return true;
    }
    const setting = new AdminSetting();
    setting.settingType = SETTING_TYPE.PRICING;
    setting.enabled = false;
    await this.adminSettingRepository.save(setting);
    return true;
  }

  async createUpdateSetting(model: CreateUpdateSetting): Promise<boolean> {
    if (model.id) {
      const currentSetting = await this.adminSettingRepository.findOne(
        model.id,
      );
      if (!currentSetting) {
        customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      await this.adminSettingRepository.save(model);
      return true;
    }
    const newSetting = new AdminSetting();
    const keys = Object.keys(model);
    keys.forEach(key => {
      newSetting[key] = model[key];
    });
    await this.adminSettingRepository.save(newSetting);
    return true;
  }

  async deletePriceSetting(id: number, request: Request): Promise<boolean> {
    const priceSetting = await this.pricingRepository.findOne(id, {
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
    if (!priceSetting) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    priceSetting.distancePrices.map(async u => {
      await this.deleteDistancePrice(u.id);
    });
    await Promise.all([
      this.payloadFareRepository.remove(priceSetting.payloadFares),
      this.zonePriceRepository.remove(priceSetting.zonePrices),
      this.surChargesRepository.remove(priceSetting.surCharges),
      this.dynamicChargesRepository.remove(priceSetting.dynamicCharges),
      this.truckTypeFareRepository.remove(priceSetting.truckTypeFares),
      this.multipleStopRepository.remove(priceSetting.multipleStopsCharges),
    ]);

    await this.pricingRepository.delete(priceSetting.id);
    addBodyToRequest(request, priceSetting);
    return true;
  }

  async createPricingSetting(): Promise<boolean> {
    const pricing = new Pricing();
    const data = await this.pricingRepository.save(pricing);
    const newModel = [
      new PayloadFare(),
      new ZonePrice(),
      new SurCharges(),
      new TruckTypeFare(),
      new MultipleStopsCharges(),
    ];
    for (let i = 0; i < newModel.length; i++) {
      newModel[i].pricing = data;
    }
    await Promise.all([
      this.payloadFareRepository.save(newModel[0]),
      this.zonePriceRepository.save(newModel[1]),
      this.surChargesRepository.save(newModel[2]),
      this.truckTypeFareRepository.save(newModel[3]),
      this.multipleStopRepository.save(newModel[4]),
    ]);
    await this._defaultDynamicCharges(data);
    await this.createDistancePrice(data.id);

    return true;
  }

  private async _defaultDynamicCharges(pricing: Pricing): Promise<boolean> {
    const mixed = new DynamicCharges();
    const forklift = new DynamicCharges();
    mixed.name = DYNAMIC_DEFAULT_OPTION.MIXED;
    mixed.pricing = pricing;
    forklift.name = DYNAMIC_DEFAULT_OPTION.FORKLIFT;
    forklift.pricing = pricing;
    await Promise.all([
      this.dynamicChargesRepository.save(mixed),
      this.dynamicChargesRepository.save(forklift),
    ]);
    return true;
  }

  async updateOldPriceSetting(): Promise<boolean> {
    const pricings = await this.pricingRepository.find({
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
    for (let i = 0; i < pricings.length; i++) {
      const dynamicCharges = pricings[i].dynamicCharges;
      let mixed = false;
      let forklift = false;
      dynamicCharges.map(u => {
        if (u.name === DYNAMIC_DEFAULT_OPTION.MIXED) {
          mixed = true;
        }
        if (u.name === DYNAMIC_DEFAULT_OPTION.FORKLIFT) {
          forklift = true;
        }
      });
      if (!mixed) {
        const data = new DynamicCharges();
        data.name = DYNAMIC_DEFAULT_OPTION.MIXED;
        data.pricing = pricings[i];
        await this.dynamicChargesRepository.save(data);
      }
      if (!forklift) {
        const data = new DynamicCharges();
        data.name = DYNAMIC_DEFAULT_OPTION.FORKLIFT;
        data.pricing = pricings[i];
        await this.dynamicChargesRepository.save(data);
      }
    }
    return true;
  }

  async getPricingSettings(): Promise<[Pricing[], number]> {
    const [pricings, count] = await this.pricingRepository.findAndCount({
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

    for (let i = 0; i < pricings.length; i++) {
      const dynamicCharges = await this.dynamicChargesRepository.find({
        where: { pricing: pricings[i] },
      });
      pricings[i].dynamicCharges = dynamicCharges;
    }

    return [pricings, count];
  }

  async updateDistance(models: CreateUpdateDistance[]): Promise<boolean> {
    models.map(async (model: any) => {
      const distance = await this.distanceRepository.findOne(model.id);
      if (!distance) {
        customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      await this.distanceRepository.save(model);
    });
    return true;
  }

  async getCommission(): Promise<UpdateCommissionSetting> {
    const commonSetting = await this.commonSettingsRepository.getGeneralSettingCommisson();
    const truckOwnersEnabled = await this.commissionRepository.find({
      enabled: true,
    });
    const result = {
      ...commonSetting,
      truckOwnersId: truckOwnersEnabled.map(e => e.truckOwnerId),
    };

    return result;
  }

  async updateCommission(model: UpdateCommissionSetting): Promise<boolean> {
    const commonSetting = await this.commonSettingsRepository.findOne();
    commonSetting.enableCommission = model.isEnableCommissionFeature;
    commonSetting.defaultSettingCommission =
      model.isEnableSetupDefaultDriversCommission;
    commonSetting.allTruckOwnersCommisson =
      model.isEnableAllTruckOwnersCommission || false;
    commonSetting.percentCommission =
      model.defaultPercentCommission &&
      roundTwoFixed(model.defaultPercentCommission);
    commonSetting.fixedCommission = model.defaultFixedCommission;

    const listTruckOwners = new Array<{
      truckOwnerId: number;
      enabled: boolean;
    }>();

    if (model.truckOwnersId) {
      model.truckOwnersId.forEach(truckOwner =>
        listTruckOwners.push({ truckOwnerId: truckOwner, enabled: true }),
      );
      await getConnection()
        .createQueryBuilder()
        .update(Commission)
        .set({ enabled: false })
        .where(
          listTruckOwners.length
            ? '("truckOwnerId") NOT IN (:...truckOwnersId)'
            : '',
          {
            truckOwnersId: model.truckOwnersId,
          },
        )
        .execute();
      if (listTruckOwners.length) {
        await getConnection()
          .createQueryBuilder()
          .insert()
          .into(Commission)
          .values(listTruckOwners)
          .onConflict(`("truckOwnerId") DO UPDATE SET "enabled" = true`)
          .execute();
      }
    }
    await this.commonSettingsRepository.save(commonSetting);
    return true;
  }

  async updatePricing(model: UpdatePricingSetting): Promise<boolean> {
    const pricing = await this.pricingRepository.findOne(model.id);
    if (!pricing) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    for (let i = 0; i < model.distancePrices.length; i++) {
      this.updateDistance(model.distancePrices[i].distances);
    }

    model.truckTypeFares.map(async u => {
      await this.truckTypeFareRepository.save({ id: u.id, price: u.price });
    });

    model.payloadFares.map(async u => {
      await this.payloadFareRepository.save({
        id: u.id,
        price: u.price,
        priceOption: u.priceOption,
      });
    });

    model.zonePrices.map(async u => {
      await this.zonePriceRepository.save({
        id: u.id,
        sameZone: u.sameZone,
        pickupZoneArea: u.pickupZoneArea,
        dropoffZoneArea: u.dropoffZoneArea,
        cost: u.cost,
      });
    });

    model.distancePrices.map(async u => {
      const distanceFare = await this.distancePriceRepository.findOne(u.id, {
        relations: ['distances'],
      });
      distanceFare.distances = u.distances;
      await this.distancePriceRepository.save(distanceFare);
    });

    model.dynamicCharges.map(async u => {
      await this.dynamicChargesRepository.save({
        id: u.id,
        name: u.name,
        priceOption: u.priceOption,
        cost: `${u.cost}` === '' ? null : u.cost,
      });
    });

    model.multipleStopsCharges.map(async u => {
      await this.multipleStopRepository.save({
        id: u.id,
        multipleStopPriceOption: u.multipleStopPriceOption,
        multipleStopPrice:
          `${u.multipleStopPrice}` === '' ? null : u.multipleStopPrice,
      });
    });

    if (model.surCharges && model.surCharges?.length > 0) {
      await this.surChargesRepository.save({
        id: model.surCharges[0].id,
        specialGoodsPrice:
          `${model.surCharges[0].specialGoodsPrice}` === ''
            ? null
            : model.surCharges[0].specialGoodsPrice,
        heavyCargoPrice:
          `${model.surCharges[0].heavyCargoPrice}` === ''
            ? null
            : model.surCharges[0].heavyCargoPrice,
      });
    }

    await this.pricingRepository.save({
      id: pricing.id,
      baseFareNormal: model.baseFareNormal,
      baseFareTractor: model.baseFareTractor,
      baseFareNonMotorized: model.baseFareNonMotorized,
      baseFareConcatenatedGoods: model.baseFareConcatenatedGoods,
      baseFareContractCar: model.baseFareContractCar,
      isUsing: model.isUsing,
    });
    return true;
  }

  async updateTruckTypeFare(
    model: CreateUpdateTruckTypeFare,
    id: number,
  ): Promise<boolean> {
    const truckTypeFare = await this.truckTypeFareRepository.findOne(id);
    if (!truckTypeFare) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    delete model.id;
    await this.truckTypeFareRepository.update(truckTypeFare.id, model);
    return true;
  }

  async deleteTruckTypeFare(id: number, request: Request): Promise<boolean> {
    const truckTypeFare = await this.truckTypeFareRepository.findOne(id);
    if (!truckTypeFare) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.truckTypeFareRepository.delete(id);
    addBodyToRequest(request, truckTypeFare);
    return true;
  }

  async addTruckTypeFare(priceSettingId: number): Promise<boolean> {
    const priceSetting = await this.pricingRepository.findOne(priceSettingId);
    if (!priceSetting) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const truckTypeFare = new TruckTypeFare();
    truckTypeFare.pricing = priceSetting;
    truckTypeFare.truckType = [];
    await this.truckTypeFareRepository.save(truckTypeFare);
    return true;
  }

  async updatePayloadFare(
    model: CreateUpdatePayloadFare,
    id: number,
  ): Promise<boolean> {
    const payloadFare = await this.payloadFareRepository.findOne(id);
    if (!payloadFare) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    delete model.id;
    await this.payloadFareRepository.update(payloadFare.id, model);
    return true;
  }

  async deletePayloadFare(id: number, request: Request): Promise<boolean> {
    const payloadFare = await this.payloadFareRepository.findOne(id);
    if (!payloadFare) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.payloadFareRepository.delete(id);
    addBodyToRequest(request, payloadFare);
    return true;
  }

  async addPayloadFare(priceSettingId: number): Promise<boolean> {
    const priceSetting = await this.pricingRepository.findOne(priceSettingId);
    if (!priceSetting) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const payloadFare = new PayloadFare();
    payloadFare.pricing = priceSetting;
    payloadFare.payload = [];
    await this.payloadFareRepository.save(payloadFare);
    return true;
  }

  async updateZoneFare(
    model: CreateUpdateZoneFare,
    id: number,
  ): Promise<boolean> {
    const zoneFare = await this.zonePriceRepository.findOne(id);
    if (!zoneFare) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    delete model.id;
    await this.zonePriceRepository.update(zoneFare.id, model);
    return true;
  }

  async createZoneFare(pricingId: number): Promise<boolean> {
    const pricing = await this.pricingRepository.findOne(pricingId);
    if (!pricing) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const zoneFare = new ZonePrice();
    zoneFare.pricing = pricing;
    zoneFare.payload = [];
    await this.zonePriceRepository.save(zoneFare);
    return true;
  }

  async deleteZoneFare(id: number, request: Request): Promise<boolean> {
    const zoneFare = await this.zonePriceRepository.findOne(id);
    if (!zoneFare) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.zonePriceRepository.delete(zoneFare.id);
    addBodyToRequest(request, zoneFare);
    return true;
  }

  async updateDynamicItem(
    model: CreateUpdateDynamicItem,
    id: number,
  ): Promise<boolean> {
    const dynamicItem = await this.dynamicChargesRepository.findOne(id);
    if (!dynamicItem) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    delete model.id;
    await this.dynamicChargesRepository.update(dynamicItem.id, model);
    return true;
  }

  async createDynamicItem(pricingId: number): Promise<boolean> {
    const pricing = await this.pricingRepository.findOne(pricingId);
    if (!pricing) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const dynamicItem = new DynamicCharges();
    dynamicItem.pricing = pricing;
    await this.dynamicChargesRepository.save(dynamicItem);
    return true;
  }

  async deleteDynamicItem(id: number, request: Request): Promise<boolean> {
    const dynamicItem = await this.dynamicChargesRepository.findOne(id);
    if (!dynamicItem) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.dynamicChargesRepository.softDelete(dynamicItem.id);
    addBodyToRequest(request, dynamicItem);
    return true;
  }

  async createDistancePrice(pricingId: number): Promise<boolean> {
    const pricing = await this.pricingRepository.findOne(pricingId);
    if (!pricing) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const distancePrice = new DistancePrice();
    distancePrice.pricing = pricing;
    const data = await this.distancePriceRepository.save(distancePrice);

    const distance = new Distance();
    distance.distancePrice = data;
    await this.distanceRepository.save(distance);
    return true;
  }

  async updateDistancePrice(
    model: CreateUpdateDistancePrice,
    id: number,
  ): Promise<boolean> {
    const distancePrice = await this.distancePriceRepository.findOne(id);
    if (!distancePrice) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    delete model.id;
    await this.distancePriceRepository.update(distancePrice.id, model);
    return true;
  }

  async deleteDistancePrice(id: number, request?: Request): Promise<boolean> {
    const distancePrice = await this.distancePriceRepository.findOne(id, {
      relations: ['distances'],
    });
    if (!distancePrice) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.distanceRepository.remove(distancePrice.distances);
    await this.distancePriceRepository.delete(distancePrice.id);
    request && addBodyToRequest(request, distancePrice);
    return true;
  }

  async getDistances(id: number): Promise<[Distance[], number]> {
    const [distances, count] = await this.distanceRepository.findAndCount({
      where: { distancePriceId: id },
    });
    return [distances, count];
  }

  async createDistance(distancePriceId: number): Promise<boolean> {
    const distancePrice = await this.distancePriceRepository.findOne(
      distancePriceId,
    );
    if (!distancePrice) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const distance = new Distance();
    distance.distancePrice = distancePrice;
    await this.distanceRepository.save(distance);
    return true;
  }

  async deleteDistance(id: number, request: Request): Promise<boolean> {
    const distance = await this.distanceRepository.findOne(id);
    if (!distance) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.distanceRepository.delete(distance.id);
    addBodyToRequest(request, distance);
    return true;
  }

  async updatePaymentDoneByCustomer(
    orderId: number,
    model: PaymentDoneDto,
  ): Promise<boolean> {
    await this.orderRepository.update(
      { id: orderId },
      { isPaymentDoneByCustomer: model.isDone },
    );

    return true;
  }

  async updatePaymentDoneByTruckOwner(
    orderId: number,
    model: PaymentDoneDto,
  ): Promise<boolean> {
    await this.orderRepository.update(
      { id: orderId },
      { isPaymentDoneByTruckOwner: model.isDone },
    );

    return true;
  }
  async updateMultipleStops(
    model: CreateUpdateMultipleStop,
    id: number,
  ): Promise<boolean> {
    const multipleStop = await this.multipleStopRepository.findOne(id);
    if (!multipleStop) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    delete model.id;
    await this.multipleStopRepository.update(multipleStop.id, model);
    return true;
  }

  async deleteMultipleStops(id: number, request: Request): Promise<boolean> {
    const multipleStop = await this.multipleStopRepository.findOne(id);
    if (!multipleStop) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this.multipleStopRepository.delete(id);
    addBodyToRequest(request, multipleStop);
    return true;
  }

  async addMultipleStops(priceSettingId: number): Promise<boolean> {
    const priceSetting = await this.pricingRepository.findOne(priceSettingId);
    if (!priceSetting) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const multipleStopCharge = new MultipleStopsCharges();
    multipleStopCharge.pricing = priceSetting;
    multipleStopCharge.truckType = [];
    await this.multipleStopRepository.save(multipleStopCharge);
    return true;
  }

  async initMultipleStops(): Promise<boolean> {
    const [priceSetting, length] = await this.pricingRepository.findAndCount({
      relations: ['multipleStopsCharges'],
    });
    if (length === 0) {
      return true;
    }

    for (let i = 0; i < length; i++) {
      if (priceSetting[i].multipleStopsCharges.length === 0) {
        await this.addMultipleStops(priceSetting[i].id);
      }
    }

    return true;
  }

  async initSettings(): Promise<boolean> {
    const qrText = new AdminSetting();
    qrText.settingType = SETTING_TYPE.QR_TEXT;

    const fbText = new AdminSetting();
    fbText.settingType = SETTING_TYPE.FB_TEXT;

    const fbLink = new AdminSetting();
    fbLink.settingType = SETTING_TYPE.FB_LINK;

    const email = new AdminSetting();
    email.settingType = SETTING_TYPE.EMAIL;

    const phoneNumber = new AdminSetting();
    phoneNumber.settingType = SETTING_TYPE.PHONE_NUMBER;

    const companyName = new AdminSetting();
    companyName.settingType = SETTING_TYPE.COMPANY_NAME;

    const defaultColor = new AdminSetting();
    defaultColor.settingType = SETTING_TYPE.DEFAULT_COLOR;
    defaultColor.rawHtml = 'yellow';

    const monthlyOrder = new AdminSetting();
    defaultColor.settingType = SETTING_TYPE.MONTHLY_ORDER;

    const createdVerifiedOrder = new AdminSetting();
    createdVerifiedOrder.settingType = SETTING_TYPE.AUTO_VERIFY_ORDER;

    const truckPool = new AdminSetting();
    truckPool.settingType = SETTING_TYPE.TRUCK_POOL;

    await Promise.all([
      this.adminSettingRepository.save(qrText),
      this.adminSettingRepository.save(fbText),
      this.adminSettingRepository.save(fbLink),
      this.adminSettingRepository.save(email),
      this.adminSettingRepository.save(phoneNumber),
      this.adminSettingRepository.save(companyName),
      this.adminSettingRepository.save(defaultColor),
      this.adminSettingRepository.save(monthlyOrder),
      this.adminSettingRepository.save(createdVerifiedOrder),
      this.adminSettingRepository.save(truckPool),
    ]);

    return true;
  }

  async createTruckOwnerBankAccount(
    model: CreateUpdateBankAccount,
    truckOwnerId: number,
  ): Promise<TruckOwnerBankAccount> {
    const bankAccount = await this.truckOwnerBankAccountRepository.findOne({
      where: { truckOwnerId },
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
        truckOwnerId,
        companyName: model.companyName,
        businessLicenseNo: model.businessLicenseNo,
        bankName: model.bankName,
        bankBranch: model.bankBranch,
        bankAccountHolderName: model.bankAccountHolderName,
        bankAccountNumber: model.bankAccountNumber,
      }),
    );
    return await this.getTruckOwnerBankAccount(result.truckOwnerId);
  }

  async getTruckOwnerBankAccount(
    truckOwnerId: number,
  ): Promise<TruckOwnerBankAccount> {
    return await this.truckOwnerBankAccountRepository.findOne({
      where: { truckOwnerId },
    });
  }

  async updateTruckOwnerBankAccount(
    model: CreateUpdateBankAccount,
    truckOwnerId: number,
  ): Promise<TruckOwnerBankAccount> {
    const bankAccount = await this.truckOwnerBankAccountRepository.findOne({
      where: { truckOwnerId },
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
    return await this.getTruckOwnerBankAccount(result.truckOwnerId);
  }

  async updateTruckOwnerProfile(
    model: UpdateTruckOwner,
    truckOwnerId: number,
  ): Promise<LoginResponseDto> {
    const truckowner = await this.truckOwnerRepository.findOne(truckOwnerId);
    const keys = Object.keys(model);

    if (!model.containerSize && !model.truckPayload) {
      truckowner.containerSize = Object.values(CONTAINER_SIZE);
      truckowner.truckPayload = Object.values(TRUCK_PAYLOAD).filter(x =>
        Number.isInteger(x),
      );
    }

    if (model.serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
      truckowner.truckPayload = [];
    }

    if (model.serviceType === SERVICE_TYPE.NORMAL_TRUCK_VAN) {
      truckowner.containerSize = [];
    }

    keys.forEach(key => {
      truckowner[key] = model[key];
    });

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

  async deleteFileByFileId(
    targetId: number,
    fileId: string,
    referenceType: number,
    requestUserId: number,
    request: Request,
  ): Promise<boolean> {
    const file = await this.fileRepository.findOne({ id: fileId });
    await this.fileRepository.delete({ id: fileId });
    addBodyToRequest(request, { file, targetId, referenceType, requestUserId });
    return true;
  }

  async upgradeLicenseRequest(body: LicenseMail): Promise<void> {
    const user = await this.adminRepository.findOne({
      userType: USER_TYPE.SUPER_ADMIN,
    });
    return await this.mailHelper.sendLicenseRequest(user, body);
  }

  async getLicenseSettings(): Promise<Settings> {
    const settings = await this.commonSettingsRepository.find();
    return settings[0];
  }

  async updateLicenseSettings(model: UpdateLicenseSetting): Promise<boolean> {
    const settings = await this.commonSettingsRepository.find();
    if (
      settings[0].license === LICENSE.PREMIUM &&
      model.license === LICENSE.STANDARD
    ) {
      settings[0].displayOn = [];
      settings[0].license = model.license;
      settings[0].blackBoxType = [];
      settings[0].enableQuotation = model.enableQuotation;
      await this.commonSettingsRepository.save(settings[0]);
      return true;
    }
    settings[0].displayOn = model.displayOn;
    settings[0].license = model.license;
    settings[0].blackBoxType = model.blackBoxType;
    settings[0].enableQuotation = model.enableQuotation;
    await this.commonSettingsRepository.save(settings[0]);
    return true;
  }

  async initLicense(): Promise<boolean> {
    const existed = await this.commonSettingsRepository.find();
    if (existed && existed.length >= 1) {
      return true;
    }
    const setting = new Settings();
    setting.displayOn = [];
    setting.license = LICENSE.STANDARD;
    setting.blackBoxType = [];
    await this.commonSettingsRepository.save(setting);
    return true;
  }
}
