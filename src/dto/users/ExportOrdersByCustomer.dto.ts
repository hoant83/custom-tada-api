import { Exclude, Expose } from 'class-transformer';
import { Order } from 'src/entities/order/order.entity';
import { ORDER_TYPE } from 'src/entities/order/enums/order-type.enum';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';
import { CONTAINER_TYPE } from 'src/entities/order/enums/container-type.enum';
import { TRUCK_SPECIAL_TYPE } from 'src/entities/order/enums/truck-special-type.enum';
import { CARGO_TYPE } from 'src/entities/order/enums/cargo-type.enum';
import { Customer } from 'src/entities/customer/customer.entity';
import { Admin } from 'src/entities/admin/admin.entity';
import { Company } from 'src/entities/company/company.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { CANCELED_BY } from 'src/entities/order/enums/canceled-by.enum';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';

export class ExportOrdersByCustomerDto {
  @Expose()
  // createdDate: Date;
  orderId: string;
  referenceNo: string;
  orderType: ORDER_TYPE;
  status: ORDER_STATUS;
  serviceType: SERVICE_TYPE;
  containerSize: CONTAINER_SIZE;
  containerType: CONTAINER_TYPE;
  containerQuantity: number;
  truckSpecialType: TRUCK_SPECIAL_TYPE;
  truckQuantity: number;
  truckLoad: string;
  cargoType: CARGO_TYPE;
  cargoName: string;
  cargoWeight: number;
  pickupAddressText: string;
  pickupTime: Date;
  dropoffAddressText: string;
  dropoffTime: Date;
  inChargeName: string;
  inChargeContactNo: string;
  pickupCode: string;
  deliveryCode: string;
  createdDate: Date;

  @Exclude()
  owner: TruckOwner;

  @Expose({
    name: 'truckOwnerId',
  })
  get truckOwnerId(): any {
    if (this.owner === null) {
      return null;
    }

    return this.owner.publicId;
  }

  @Expose({
    name: 'truckOwnerName',
  })
  get truckOwnerName(): any {
    if (this.owner === null) {
      return null;
    }

    return this.owner.firstName;
  }

  @Expose({
    name: 'truckOwnerCompanyName',
  })
  get truckOwnerCompanyName(): any {
    if (this.owner === null) {
      return null;
    }

    return this.owner.companyName;
  }
  @Expose({
    name: 'truckOwnerEmail',
  })
  get truckOwnerEmail(): any {
    if (this.owner === null) {
      return null;
    }

    return this.owner.email;
  }

  @Exclude()
  id: number;
  @Exclude()
  updatedDate: Date;
  @Exclude()
  companyId: number;
  @Exclude()
  canceledBy: CANCELED_BY;
  @Exclude()
  pickupAddress: number[];
  @Exclude()
  dropoffAddress: number[];
  @Exclude()
  packageSize: string;
  @Exclude()
  pickupCity: number;
  @Exclude()
  pickupContactNo: string;
  @Exclude()
  dropoffContactNo: string;
  @Exclude()
  noteToDriver: string;
  @Exclude()
  otherGeneralNotes: string;
  @Exclude()
  staffNote: string;
  @Exclude()
  staffAnotherNote: string;
  @Exclude()
  ownerId: number;
  @Exclude()
  verifiedPickup: boolean;
  @Exclude()
  verifiedDelivery: number[];
  @Exclude()
  customerOwnerId: number;
  @Exclude()
  beforeCancel: string;
  @Exclude()
  createdByCustomer: Customer;
  @Exclude()
  createdByCustomerId: number;
  @Exclude()
  createdByAdmin: Admin;
  @Exclude()
  createdByAdminId: number;
  @Exclude()
  company: Company;
  @Exclude()
  trucks: Truck[];
  @Exclude()
  drivers: Driver[];
  @Exclude()
  tracking: Tracking[];
  @Exclude()
  deletedAt: Date;
  @Exclude()
  price: boolean;
  @Exclude()
  priceRequest: number;
  @Exclude()
  vat: boolean;
  @Exclude()
  vatInfo: string;
  @Exclude()
  detailRequest: string;

  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
  }
}
