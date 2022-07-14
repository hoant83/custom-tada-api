import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsString } from 'class-validator';
import { PaginationRequest } from 'src/common/dtos/pagination.dto';
import { ACCOUNT_TYPE } from 'src/entities/customer/enums/accountType.enum';
import { FILTER_STATISTIC } from 'src/entities/order/enums/filter-statistic.enum';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { Order } from 'src/entities/order/order.entity';
import { PAYMENT_TYPE } from 'src/entities/payment/enums/payment.enum';
import { FindConditions } from 'typeorm';
import { OrderRequestDto } from './order-request.dto';

export class FilterRequestDto extends PaginationRequest {
  @ApiPropertyOptional()
  order?: OrderRequestDto;

  @ApiPropertyOptional({ enum: ORDER_STATUS })
  searchBy?: string;

  @ApiPropertyOptional()
  searchKeyword?: string;

  @ApiPropertyOptional()
  isGetAll?: boolean;
}

export class FilterRequestDtoV2 extends PaginationRequest {
  @ApiPropertyOptional({
    enum: ORDER_STATUS,
    isArray: true,
  })
  @IsEnum(ORDER_STATUS, { each: true })
  @IsArray()
  status?: ORDER_STATUS[];

  @ApiPropertyOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional()
  @IsDateString()
  pickupFrom?: string;

  @ApiPropertyOptional()
  @IsDateString()
  pickupTo?: string;

  @ApiPropertyOptional()
  @IsDateString()
  dropoffFrom?: string;

  @ApiPropertyOptional()
  @IsDateString()
  dropoffTo?: string;

  @ApiPropertyOptional()
  @IsString()
  pickupAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  dropoffAddress?: string;

  @ApiPropertyOptional({
    enum: PAYMENT_TYPE,
    isArray: true,
  })
  @IsEnum(PAYMENT_TYPE, { each: true })
  @IsArray()
  @Transform(array => array.map(x => +x))
  paymentType?: PAYMENT_TYPE[];

  @ApiPropertyOptional()
  @IsString()
  orderManagerName?: string;

  @ApiPropertyOptional()
  @IsString()
  truckOwnerName?: string;

  @ApiPropertyOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsString()
  truckOwnerPartnerId?: string;

  @ApiPropertyOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional()
  @IsString()
  referenceNo?: string;

  @ApiPropertyOptional({
    enum: ACCOUNT_TYPE,
    isArray: true,
  })
  @IsEnum(ACCOUNT_TYPE, { each: true })
  @IsArray()
  @Transform(array => array.map(x => +x))
  accountType?: ACCOUNT_TYPE[];

  @ApiPropertyOptional()
  @IsString()
  all?: string;
}

export class OrderQueryBuilder extends FilterRequestDtoV2 {
  orderFindCondition: FindConditions<Order>;
}

export class FilterStatisticRequestDto extends PaginationRequest {
  @ApiPropertyOptional({ enum: FILTER_STATISTIC })
  searchBy?: string;

  @ApiPropertyOptional()
  searchKeyword?: string;

  @ApiPropertyOptional()
  fromDate?: string;

  @ApiPropertyOptional()
  toDate?: string;

  @ApiPropertyOptional()
  isExportAll?: boolean;
}
