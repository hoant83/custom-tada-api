import { Exclude, Expose } from 'class-transformer';
import { Customer } from 'src/entities/customer/customer.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { Notification } from 'src/entities/notification/notification.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';

export class NotificationDetailtResponse extends Notification {
  @Exclude()
  sendToCustomerList: Customer[];

  @Expose({
    name: 'customers',
  })
  get customers(): any[] {
    if (this.sendToCustomerList && this.sendToCustomerList.length > 0) {
      return this.sendToCustomerList.map(u => ({
        id: u.id,
        email: u.email,
        phoneNumber: u.phoneNumber ?? '',
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`,
      }));
    }
    return [];
  }

  @Exclude()
  sendToTruckownerList: TruckOwner[];

  @Expose({
    name: 'truckOwners',
  })
  get truckOwners(): any[] {
    if (this.sendToTruckownerList && this.sendToTruckownerList.length > 0) {
      return this.sendToTruckownerList.map(u => ({
        id: u.id,
        email: u.email,
        phoneNumber: u.phoneNumber ?? '',
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`,
      }));
    }
    return [];
  }

  @Exclude()
  sendToDriverList: Driver[];

  @Expose({
    name: 'drivers',
  })
  get drivers(): any[] {
    if (this.sendToDriverList && this.sendToDriverList.length > 0) {
      return this.sendToDriverList.map(u => ({
        id: u.id,
        email: u.email,
        phoneNumber: u.phoneNumber ?? '',
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`,
      }));
    }
    return [];
  }

  constructor(partial: Partial<NotificationDetailtResponse> = {}) {
    super();
    Object.assign(this, partial);
  }
}
