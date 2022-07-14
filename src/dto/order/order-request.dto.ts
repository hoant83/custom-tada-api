import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import {
  NON_MOTORIZED_TYPE,
  CONCATENATED_GOODS_TYPE,
  CONTRACT_CAR_TYPE,
} from 'src/entities/default-reference/enums/defaultRef.enum';
import { CARGO_TYPE } from 'src/entities/order/enums/cargo-type.enum';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';
import { CONTAINER_TYPE } from 'src/entities/order/enums/container-type.enum';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { ORDER_TYPE } from 'src/entities/order/enums/order-type.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { PAYMENT_TYPE } from 'src/entities/payment/enums/payment.enum';

export class OrderRequestDto {
  @ApiPropertyOptional()
  id: number;

  @ApiPropertyOptional()
  ownerId: number;

  @ApiPropertyOptional()
  orderId: string;

  @ApiPropertyOptional()
  createdByAdminId: number;

  @ApiPropertyOptional()
  createdByCustomerId: number;

  @ApiPropertyOptional()
  companyId: number;

  @IsEnum(ORDER_TYPE)
  @ApiPropertyOptional({ required: true })
  orderType: ORDER_TYPE;

  @IsEnum(SERVICE_TYPE)
  @ApiPropertyOptional({ required: true })
  serviceType: SERVICE_TYPE;

  @ApiPropertyOptional()
  referenceNo: string;

  @ApiPropertyOptional()
  referenceNote: string;

  @IsEnum(CONTAINER_SIZE)
  @ApiPropertyOptional()
  containerSize: CONTAINER_SIZE;

  @IsEnum(CONTAINER_TYPE)
  @ApiPropertyOptional()
  containerType: CONTAINER_TYPE;

  @ApiPropertyOptional()
  containerQuantity: number;

  @ApiPropertyOptional()
  concatenatedGoodsQuantity: number;

  @ApiPropertyOptional()
  concatenatedGoodsType: CONCATENATED_GOODS_TYPE;

  @ApiPropertyOptional()
  contractCarQuantity: number;

  @ApiPropertyOptional()
  contractCarType: CONTRACT_CAR_TYPE;

  @ApiPropertyOptional()
  nonMotorizedQuantity: number;

  @ApiPropertyOptional()
  nonMotorizedType: NON_MOTORIZED_TYPE;

  @ApiPropertyOptional()
  pickupCity: string;

  @IsEnum(ORDER_STATUS)
  @ApiPropertyOptional()
  status: ORDER_STATUS;

  @ApiPropertyOptional()
  @Transform(value => +value)
  truckQuantity: number;

  @ApiPropertyOptional()
  truckLoad: string;

  @ApiPropertyOptional()
  truckPayload: number;

  @ApiPropertyOptional()
  truckType: number;

  @IsEnum(CARGO_TYPE)
  @ApiPropertyOptional()
  cargoType: CARGO_TYPE;

  @ApiPropertyOptional()
  cargoName: string;

  @ApiPropertyOptional()
  @Transform(value => (value ? +value.replace(/\,/g, '') : null))
  cargoWeight: number;

  @ApiPropertyOptional()
  packageSize: string;

  @ApiPropertyOptional({ type: [Number] })
  pickupAddress: number[];

  @ApiPropertyOptional()
  pickupAddressText: string;

  @ApiPropertyOptional()
  pickupContactNo: string;

  @ApiPropertyOptional()
  @Transform(value => {
    if (!value) return null;
    const newDate = value
      .split(',')
      .reverse()
      .join(',');
    const test = new Date(value);
    if (isNaN(test.getTime())) {
      const result = new Date(newDate);
      return result;
    }
    return test;
  })
  pickupTime: Date;

  @ApiPropertyOptional({ nullable: false })
  dropOffFields: any[];

  @IsEnum(PAYMENT_TYPE)
  @ApiPropertyOptional()
  paymentType: PAYMENT_TYPE;

  @ApiPropertyOptional({ nullable: true })
  otherPaymentType: string;

  @ApiPropertyOptional()
  dropoffContactNo: string;

  @ApiPropertyOptional()
  @Transform(value => (value ? value : null))
  dropoffTime: Date;

  @ApiPropertyOptional()
  pickupEmptyContainer: boolean;

  @ApiPropertyOptional()
  pickupEmptyAddress: string;

  @ApiPropertyOptional()
  dropoffEmptyContainer: boolean;

  @ApiPropertyOptional()
  dropoffEmptyAddress: string;

  @ApiPropertyOptional()
  noteToDriver: string;

  @ApiPropertyOptional()
  price: boolean;

  // @ApiPropertyOptional()
  // @Transform(value => +value)
  // priceRequest: number;

  @ApiPropertyOptional()
  vat: boolean;

  @ApiPropertyOptional()
  vatInfo: string;

  @ApiPropertyOptional()
  inChargeName: string;

  @ApiPropertyOptional()
  inChargeContactNo: string;

  @ApiPropertyOptional()
  otherGeneralNotes: string;

  @ApiPropertyOptional()
  detailRequest: string;

  @ApiPropertyOptional()
  staffNote: string;

  @ApiPropertyOptional()
  staffAnotherNote: string;

  @ApiPropertyOptional()
  customerOwnerId: number;

  @ApiPropertyOptional()
  specialRequests: number[];

  @ApiPropertyOptional()
  assignToFav: number;

  @ApiPropertyOptional()
  assignToFavEmail: number;

  @ApiPropertyOptional()
  assignToFavCode: string;

  @ApiPropertyOptional()
  nonMotorizedPayload: string;

  @ApiPropertyOptional()
  concatenatedGoodsPayload: string;

  @ApiPropertyOptional()
  contractCarPayload: string;
}
