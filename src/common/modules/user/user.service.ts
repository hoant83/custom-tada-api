import { HttpService, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { TOKEN_TYPE } from 'src/common/constants/token-types.enum';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { customThrowError } from 'src/common/helpers/throw.helper';
import { TokenHelper } from 'src/common/helpers/token.helper';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { Admin } from 'src/entities/admin/admin.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { File } from 'src/entities/file/file.entity';
import { Settings } from 'src/entities/setting/setting.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { Repository } from 'typeorm';

@Injectable()
export class CommonUserService {
  endpoint: string;
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly truckOwnerRepository: TruckOwnerRepository,
    private readonly driverRepository: DriverRepository,
    private readonly tokenHelper: TokenHelper,
    private readonly adminRepository: AdminRepository,
    @InjectRepository(AdminSetting)
    private readonly adminSettingRepository: Repository<AdminSetting>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly httpService: HttpService,
    @InjectRepository(Settings)
    private readonly licenseSetting: Repository<Settings>,
  ) {
    this.endpoint = 'http://api.dinhvihopquy.com/TTASService.svc/';
  }

  async verifyAccount(token: string): Promise<any> {
    const data = this.tokenHelper.verifyToken(token, TOKEN_TYPE.VERIFY);

    const { role, id } = data;

    const repo: any =
      role === TOKEN_ROLE.CUSTOMER
        ? this.customerRepository
        : this.truckOwnerRepository;

    await repo.update({ id }, { emailVerified: true });
    const email = await repo.findOne(id, { select: ['id', 'email'] });
    return email;
  }

  async testingBlackBox(): Promise<any> {
    const data = {
      username: 'vothanhtam',
      password: '123456',
    };
    return await this.httpService
      .post(`${this.endpoint}/fn_login`, data)
      .toPromise();
  }

  async changeLanguage(
    language: USER_LANGUAGE,
    token: string,
    tokenData: Record<string, any>,
  ): Promise<boolean> {
    const { role, id } = tokenData;
    let repository: Repository<Admin | Customer | Driver | TruckOwner>;
    switch (role) {
      case TOKEN_ROLE.ADMIN:
        repository = this.adminRepository;
        break;
      case TOKEN_ROLE.CUSTOMER:
        repository = this.customerRepository;
        break;
      case TOKEN_ROLE.DRIVER:
        repository = this.driverRepository;
        break;
      case TOKEN_ROLE.TRUCK_OWNER:
        repository = this.truckOwnerRepository;
        break;
    }
    const user = await repository.findOne(id, {
      select: ['id', 'preferLanguage'],
    });
    if (!user) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }
    user.preferLanguage = language;
    await repository.save(user);
    return true;
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

  async getLicenseSettings(): Promise<Settings> {
    const settings = await this.licenseSetting.find();
    return settings[0];
  }
}
