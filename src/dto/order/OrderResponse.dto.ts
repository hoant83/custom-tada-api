import { Order } from 'src/entities/order/order.entity';
import { Exclude, Expose } from 'class-transformer';
import { Driver } from 'src/entities/driver/driver.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import { File } from 'src/entities/file/file.entity';

export class OrderResponseDto extends Order {
  @Exclude()
  drivers: Driver[];

  @Expose({
    name: 'driversData',
  })
  get driversData(): any {
    if (this.drivers) {
      const driverData = this.drivers.map(d => ({
        id: d.id,
        phoneNumber: d.phoneNumber,
        email: d.email,
        firstName: d.firstName,
        cardNo: d.cardNo,
      }));

      return driverData;
    }
  }

  @Exclude()
  createdBy: Customer;

  @Expose({
    name: 'createdByData',
  })
  get createdByData(): any {
    const createdBy = {
      email: this.createdBy.email,
      firstName: this.createdBy.firstName,
      phoneNumber: this.createdBy.phoneNumber,
    };

    return createdBy;
  }

  @Exclude()
  imgs: File[];

  @Expose({
    name: 'metadata',
  })
  get metadata(): any[] {
    if (this.imgs) {
      return this.imgs.map(d => ({
        id: d.id,
        link: `${process.env.BACKEND_HOST}/api/assets/${d.id}.${d.extension}`,
        fileName: d.fileName,
      }));
    }
    return [];
  }

  constructor(partial: Partial<Order> = {}) {
    super();
    Object.assign(this, partial);
  }
}
