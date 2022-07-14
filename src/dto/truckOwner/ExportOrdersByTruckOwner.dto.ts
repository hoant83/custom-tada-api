import { Exclude, Expose } from 'class-transformer';
import { Order } from 'src/entities/order/order.entity';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { Customer } from 'src/entities/customer/customer.entity';
import { Admin } from 'src/entities/admin/admin.entity';
import { Company } from 'src/entities/company/company.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { CANCELED_BY } from 'src/entities/order/enums/canceled-by.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';
import { CONTAINER_TYPE } from 'src/entities/order/enums/container-type.enum';
import { TRUCK_SPECIAL_TYPE } from 'src/entities/order/enums/truck-special-type.enum';
import { CARGO_TYPE } from 'src/entities/order/enums/cargo-type.enum';
import { Folder } from 'src/entities/folder/folder.entity';
import { Note } from 'src/entities/note/note.entity';
import { AdditionalPrice } from 'src/entities/additional-price/additional-price.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { ORDER_TYPE } from 'src/entities/order/enums/order-type.enum';
import { PAYMENT_TYPE } from 'src/entities/payment/enums/payment.enum';
import {
  TRUCK_PAYLOAD,
  TRUCK_TYPE_DEFAULT,
} from 'src/entities/default-reference/enums/defaultRef.enum';

export class ExportOrdersByTruckOwnerDto {
  @Exclude()
  id: number;

  @Exclude()
  updatedDate: Date;

  createdDate: Date;

  @Exclude()
  createdByCustomer: Customer;

  @Expose({ name: 'customerName' })
  get customerName(): string {
    return this.createdByCustomer
      ? `${this.createdByCustomer.firstName ?? ''} ${this.createdByCustomer
          .lastName ?? ''}`
      : '';
  }

  @Expose({ name: 'customerEmail' })
  get customerEmail(): string {
    return this.createdByCustomer
      ? `${this.createdByCustomer.email ?? ''}`
      : '';
  }

  @Exclude()
  createdByCustomerId: number;

  @Exclude()
  createdByAdmin: Admin;

  @Exclude()
  createdByAdminId: number;

  @Exclude()
  company: Company;

  @Exclude()
  companyId: number;

  orderId: string;

  @Exclude()
  referenceNo: string;

  @Exclude()
  referenceNote: string;

  @Exclude()
  orderType: ORDER_TYPE;

  status: ORDER_STATUS;

  @Exclude()
  canceledBy: CANCELED_BY;

  serviceType: SERVICE_TYPE;
  containerSize: CONTAINER_SIZE;
  containerType: CONTAINER_TYPE;

  @Exclude()
  containerQuantity: number;

  @Exclude()
  truckSpecialType: TRUCK_SPECIAL_TYPE;

  paymentType: PAYMENT_TYPE;

  @Exclude()
  otherPaymentType: string;

  truckQuantity: number;

  @Exclude()
  truckLoad: string;
  truckType: TRUCK_TYPE_DEFAULT;
  truckPayload: TRUCK_PAYLOAD;

  @Exclude()
  email: string;

  // @Exclude()
  // companyName: string;

  @Exclude()
  bussinessLicenseNO: string;

  @Exclude()
  address: string;

  @Exclude()
  cargoType: CARGO_TYPE;

  cargoName: string;

  @Exclude()
  cargoWeight: number;

  @Exclude()
  packageSize: string;

  @Exclude()
  packageSizeText: string;

  @Exclude()
  pickupAddress: number[];

  pickupAddressText: string;

  @Exclude()
  pickupContactNo: string;

  @Exclude()
  pickupCity: number;

  pickupTime: Date;
  dropOffFields: string[];

  @Exclude()
  dropoffContactNo: string;

  @Exclude()
  dropoffTime: Date;

  @Exclude()
  pickupEmptyContainer: boolean;

  @Exclude()
  pickupEmptyAddress: string;

  @Exclude()
  dropoffEmptyContainer: boolean;

  @Exclude()
  dropoffEmptyAddress: string;

  @Exclude()
  noteToDriver: string;

  @Exclude()
  price: boolean;

  @Exclude()
  priceRequest: number;

  @Exclude()
  useSuggestedPrice: boolean;

  @Exclude()
  suggestedPrice: number;

  @Exclude()
  useQuotePrice: boolean;

  @Exclude()
  inChargeName: string;

  @Exclude()
  inChargeContactNo: string;

  @Exclude()
  otherGeneralNotes: string;

  @Exclude()
  detailRequest: string;

  @Exclude()
  staffNote: string;

  @Exclude()
  staffAnotherNote: string;

  @Exclude()
  pickupCode: string;

  @Exclude()
  deliveryCode: string;

  @Exclude()
  owner: TruckOwner;

  @Exclude()
  ownerId: number;

  @Exclude()
  customerOwnerId: number;

  @Exclude()
  trucks: Truck[];

  @Expose({ name: 'truckNo' })
  get truckNo(): string {
    let truckNo = '';
    if (!this.trucks) {
      return truckNo;
    }

    const size = this.trucks.length;
    this.trucks.forEach((t, index) => {
      truckNo += `${t.truckNo ?? ''}${
        size > 1 && index + 1 < size ? '\n' : ''
      }`;
    });

    return truckNo;
  }

  @Exclude()
  drivers: Driver[];

  @Expose({ name: 'driverInCharge' })
  get driverInCharge(): string {
    let driverInCharge = '';
    if (!this.drivers) {
      return driverInCharge;
    }

    const size = this.drivers.length;
    this.drivers.forEach((d, index) => {
      driverInCharge += `${d.firstName ?? ''} ${d.lastName ?? ''}${
        size > 1 && index + 1 < size ? '\n' : ''
      }`;
    });

    return driverInCharge;
  }

  @Exclude()
  tracking: Tracking[];

  @Exclude()
  additionalPrices: AdditionalPrice[];

  @Exclude()
  folders: Folder[];

  @Exclude()
  notes: Note[];

  vat: boolean;
  vatInfo: string;

  @Exclude()
  beforeCancel: string;

  @Exclude()
  verifiedPickup: boolean;

  @Exclude()
  verifiedDelivery: number[];

  @Exclude()
  deletedAt: Date;

  @Exclude()
  remainAcceptedSms: number;

  @Exclude()
  remainCancelledSms: number;

  @Exclude()
  driverPickupSms: boolean;

  @Exclude()
  driverDeliverySms: boolean;

  @Exclude()
  orderCompleteSms: boolean;

  specialRequests: number[];

  @Exclude()
  deliveredTime: Date;

  paymentDueDate: Date;

  isPaymentDoneByCustomer: boolean;

  @Exclude()
  isPaymentDoneByTruckOwner: boolean;

  totalPrice: number;

  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
  }
}
