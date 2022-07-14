import { Exclude, Expose } from 'class-transformer';
import { AdditionalPrice } from 'src/entities/additional-price/additional-price.entity';
import { ADDITIONAL_PROICE_OPTIONS } from 'src/entities/additional-price/enums/additional-price-options.enum';
import { Admin } from 'src/entities/admin/admin.entity';
import { Company } from 'src/entities/company/company.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import {
  TRUCK_PAYLOAD,
  TRUCK_TYPE_DEFAULT,
} from 'src/entities/default-reference/enums/defaultRef.enum';
import { Driver } from 'src/entities/driver/driver.entity';
import { Folder } from 'src/entities/folder/folder.entity';
import { Note } from 'src/entities/note/note.entity';
import { CANCELED_BY } from 'src/entities/order/enums/canceled-by.enum';
import { CARGO_TYPE } from 'src/entities/order/enums/cargo-type.enum';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';
import { CONTAINER_TYPE } from 'src/entities/order/enums/container-type.enum';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { ORDER_TYPE } from 'src/entities/order/enums/order-type.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { TRUCK_SPECIAL_TYPE } from 'src/entities/order/enums/truck-special-type.enum';
import { Order } from 'src/entities/order/order.entity';
import { PAYMENT_TYPE } from 'src/entities/payment/enums/payment.enum';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';

export class ExportOrdersByCustomerNewDto {
  @Exclude()
  id: number;

  @Exclude()
  updatedDate: Date;

  createdDate: Date;

  @Exclude()
  createdByCustomer: Customer;

  @Exclude()
  createdByCustomerId: number;

  @Exclude()
  createdByAdmin: Admin;

  @Exclude()
  createdByAdminId: number;

  @Expose({ name: 'orderCreatedBy' })
  get orderCreatedBy(): string {
    if (this.createdByCustomer) {
      return `${this.createdByCustomer.firstName ?? ''} ${this.createdByCustomer
        .lastName ?? ''}`;
    }

    if (this.createdByAdmin) {
      return `${this.createdByAdmin.firstName ?? ''} ${this.createdByAdmin
        .lastName ?? ''}`;
    }

    return '';
  }

  @Exclude()
  company: Company;

  @Exclude()
  companyId: number;

  orderId: string;
  referenceNo: string;
  referenceNote: string;
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

  cargoType: CARGO_TYPE;
  cargoName: string;
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

  pickupEmptyContainer: boolean;
  pickupEmptyAddress: string;
  dropoffEmptyContainer: boolean;
  dropoffEmptyAddress: string;

  @Exclude()
  noteToDriver: string;

  @Exclude()
  price: boolean;

  priceRequest: number;
  useSuggestedPrice: boolean;
  suggestedPrice: number;

  @Exclude()
  useQuotePrice: boolean;

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

  pickupCode: string;
  deliveryCode: string;

  @Exclude()
  owner: TruckOwner;

  @Expose({
    name: 'truckOwnerId',
  })
  get truckOwnerId(): string {
    return this.owner ? this.owner.publicId : '';
  }

  @Expose({
    name: 'truckOwnerEmail',
  })
  get truckOwnerEmail(): string {
    return this.owner ? this.owner.email : '';
  }

  @Expose({
    name: 'ownerCompanyName',
  })
  get ownerCompanyName(): string {
    return this.owner && this.owner.company ? this.owner.company.name : '';
  }

  @Expose({
    name: 'bankName',
  })
  get bankName(): string {
    return this.owner && this.owner.truckOwnerBankAccount
      ? this.owner.truckOwnerBankAccount.bankName
      : '';
  }

  @Expose({
    name: 'bankBranch',
  })
  get bankBranch(): string {
    return this.owner && this.owner.truckOwnerBankAccount
      ? this.owner.truckOwnerBankAccount.bankBranch
      : '';
  }

  @Expose({
    name: 'bankAccountHolderName',
  })
  get bankAccountHolderName(): string {
    return this.owner && this.owner.truckOwnerBankAccount
      ? this.owner.truckOwnerBankAccount.bankAccountHolderName
      : '';
  }

  @Expose({
    name: 'bankAccountNumber',
  })
  get bankAccountNumber(): string {
    return this.owner && this.owner.truckOwnerBankAccount
      ? this.owner.truckOwnerBankAccount.bankAccountNumber
      : '';
  }

  @Exclude()
  ownerId: number;

  @Exclude()
  customerOwnerId: number;

  @Exclude()
  trucks: Truck[];

  @Exclude()
  drivers: Driver[];

  @Exclude()
  tracking: Tracking[];

  @Exclude()
  additionalPrices: AdditionalPrice[];

  @Expose({ name: 'additionalPriceKey' })
  get additionalPriceKey(): Map<ADDITIONAL_PROICE_OPTIONS, number> {
    const map = new Map<ADDITIONAL_PROICE_OPTIONS, number>();

    if (this.additionalPrices && this.additionalPrices.length) {
      this.additionalPrices.forEach(a => {
        map.set(a.type, a.price);
      });
    }

    return map;
  }

  @Exclude()
  folders: Folder[];

  @Exclude()
  notes: Note[];

  vat: boolean;

  @Exclude()
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

  @Exclude()
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
