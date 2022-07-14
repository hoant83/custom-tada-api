import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  TRUCK_TYPE_DEFAULT,
  TRUCK_PAYLOAD,
  NON_MOTORIZED_TYPE,
} from 'src/entities/default-reference/enums/defaultRef.enum';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';
import { CONTAINER_TYPE } from 'src/entities/order/enums/container-type.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';

export class DefaultReferenceDto {
  @IsOptional()
  @ApiPropertyOptional()
  typeOfTransport: SERVICE_TYPE;

  @IsOptional()
  @ApiPropertyOptional()
  containerType: CONTAINER_TYPE;

  @IsOptional()
  @ApiPropertyOptional()
  truckType: TRUCK_TYPE_DEFAULT;

  @IsOptional()
  @ApiPropertyOptional()
  nonMotorizedType: NON_MOTORIZED_TYPE;

  @IsOptional()
  @ApiPropertyOptional()
  containerSize: CONTAINER_SIZE;

  @IsOptional()
  @ApiPropertyOptional()
  truckPayload: TRUCK_PAYLOAD;

  @IsOptional()
  @ApiPropertyOptional()
  orderManagerName: string;

  @IsOptional()
  @ApiPropertyOptional()
  orderManagerNo: string;

  @IsOptional()
  @ApiPropertyOptional()
  pickupCity: string;

  @IsOptional()
  @ApiPropertyOptional()
  dropoffAddress: number[];

  @IsOptional()
  @ApiPropertyOptional()
  dropoffAddressText: string;

  @IsOptional()
  @ApiPropertyOptional()
  pickupAddress: number[];

  @IsOptional()
  @ApiPropertyOptional()
  pickupAddressText: string;

  @IsOptional()
  @ApiPropertyOptional()
  personInChargePickup: string;

  @IsOptional()
  @ApiPropertyOptional()
  personInChargePickupNO: string;

  @IsOptional()
  @ApiPropertyOptional()
  personInChargeDropoff: string;

  @IsOptional()
  @ApiPropertyOptional()
  personInChargeDropoffNO: string;
}
