import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { CARGO_TYPE } from 'src/entities/order/enums/cargo-type.enum';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';

export class PriceDto {
  @ApiPropertyOptional({ type: [Number] })
  pickupAddress: number[];

  @IsEnum(SERVICE_TYPE)
  @ApiPropertyOptional({ required: true })
  serviceType: SERVICE_TYPE;

  @IsEnum(CONTAINER_SIZE)
  @ApiPropertyOptional()
  containerSize: CONTAINER_SIZE;

  @ApiPropertyOptional()
  containerQuantity: number;

  @ApiPropertyOptional()
  @Transform(value => +value)
  truckQuantity: number;

  @ApiPropertyOptional()
  truckPayload: number;

  @ApiPropertyOptional()
  truckType: number;

  @ApiPropertyOptional()
  concatenatedGoodsQuantity: number;

  @ApiPropertyOptional()
  concatenatedGoodsType: any;

  @ApiPropertyOptional()
  contractCarQuantity: number;

  @ApiPropertyOptional()
  contractCarType: any;

  @ApiPropertyOptional()
  nonMotorizedQuantity: number;

  @ApiPropertyOptional()
  nonMotorizedType: any;

  @IsEnum(CARGO_TYPE)
  @ApiPropertyOptional()
  cargoType: CARGO_TYPE;

  @ApiPropertyOptional()
  @Transform(value => (value ? +value.replace(/\,/g, '') : null))
  cargoWeight: number;

  @ApiPropertyOptional()
  pickupAddressText: string;

  @ApiPropertyOptional({ nullable: false })
  dropOffFields: any[];

  @ApiPropertyOptional()
  specialRequests: number[];
}
