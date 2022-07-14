import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.enum';
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { PaginationRequest } from 'src/common/dtos/pagination.dto';
import { customThrowError } from 'src/common/helpers/throw.helper';
import { getNotificationByLanguge } from 'src/common/utils/getLanguage.utility';
import { Admin } from 'src/entities/admin/admin.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { Repository } from 'typeorm';
import { NotificationResponse } from './dto/notificationResponse.dto';
import { TOKEN_PLATFORM } from './dto/register-token.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly driverRepository: DriverRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly truckOwnerRepository: TruckOwnerRepository,
    @InjectRepository(NotificationInstance)
    private readonly notificationInstanceRepository: Repository<
      NotificationInstance
    >,
  ) {}

  async registerToken(
    token: string,
    tokenData: Record<string, any>,
    platform: TOKEN_PLATFORM,
  ): Promise<boolean> {
    const { role, id } = tokenData;
    if (role === null || role === undefined) {
      customThrowError(RESPONSE_MESSAGES.TOKEN_ERROR, HttpStatus.NOT_FOUND);
    }

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

    if (!repository) {
      customThrowError(RESPONSE_MESSAGES.TOKEN_ERROR, HttpStatus.NOT_FOUND);
    }

    const user = await repository.findOne({
      where: {
        id,
      },
      select: ['id'],
    });

    if (!user) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (platform === TOKEN_PLATFORM.WEB) {
      user.notiToken = token;
    } else {
      user.deviceToken = token;
    }
    await repository.save(user);
    return true;
  }

  async listInstance(
    token: Record<string, any>,
    filter: PaginationRequest,
  ): Promise<[NotificationResponse[], number, number]> {
    if (!token) {
      return [[], 0, 0];
    }

    let repository: Repository<Admin | Customer | Driver | TruckOwner>;

    switch (token.role) {
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

    if (!repository) {
      customThrowError(RESPONSE_MESSAGES.TOKEN_ERROR, HttpStatus.NOT_FOUND);
    }

    const user = await repository.findOne({
      where: {
        id: token.id,
      },
      select: ['preferLanguage'],
    });

    if (!user) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const { skip, take } = filter;
    const where = {
      referenceId: token.id,
      referenceType: token.role,
    };

    const [noti, unreadCount] = await Promise.all([
      this.notificationInstanceRepository.findAndCount({
        where,
        skip,
        take,
        relations: ['notification'],
        order: {
          createdDate: 'DESC',
        },
      }),
      this.notificationInstanceRepository.count({
        where: {
          ...where,
          isRead: false,
        },
      }),
    ]);

    const resultNoti = noti[0].map(n => {
      const { title, body } = getNotificationByLanguge(
        n.notification,
        user.preferLanguage,
      );

      n.notification.title = title;
      n.notification.body = body;

      return new NotificationResponse(n);
    });

    return [resultNoti, noti[1], unreadCount];
  }

  async readNoti(id: number, token: Record<string, any>): Promise<boolean> {
    if (!token) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const where = {
      referenceId: token.id,
      referenceType: token.role,
      id,
    };
    const noti = await this.notificationInstanceRepository.findOne({
      where,
      select: ['id'],
    });
    if (!noti) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    noti.isRead = true;
    await this.notificationInstanceRepository.save(noti);
    return true;
  }

  async stopWarning(userId: number): Promise<boolean> {
    const customer = await this.customerRepository.findOne(userId);
    customer.limitWarning = true;
    await this.customerRepository.save(customer);
    return true;
  }
}
