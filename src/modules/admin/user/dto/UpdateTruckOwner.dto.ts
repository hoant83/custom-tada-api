import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber } from 'class-validator';
import { VERIFIED_STATUS } from 'src/entities/enums/verifiedStatus.enum';
import { USER_STATUS } from 'src/entities/enums/userStatus.enum';
import { TRUCK_TYPE } from 'src/entities/truckOwner/enums/truckType.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';
import {
  CONCATENATED_GOODS_TYPE,
  CONTRACT_CAR_TYPE,
  TRUCK_PAYLOAD,
} from 'src/entities/default-reference/enums/defaultRef.enum';

export class UpdateTruckOwner {
  @IsString()
  @ApiProperty()
  phoneNumber?: string;

  @IsString()
  @ApiProperty()
  email?: string;

  @IsString()
  @ApiProperty()
  firstName?: string;

  @IsString()
  @ApiProperty()
  lastName?: string;

  @IsString()
  @ApiProperty()
  password?: string;

  @IsString()
  @ApiProperty()
  cardNo?: string;

  @IsNumber()
  @ApiProperty()
  companyId?: number;

  @ApiProperty({ type: [Number] })
  pickupZone?: number[];

  @ApiPropertyOptional({ type: [String] })
  containerSize?: CONTAINER_SIZE[];

  @ApiPropertyOptional({ type: [Number] })
  truckPayload?: TRUCK_PAYLOAD[];

  @ApiPropertyOptional({ type: [String] })
  nonMotorizedType?: TRUCK_PAYLOAD[];

  @ApiPropertyOptional({ type: [Number] })
  concatenatedGoodsType?: CONCATENATED_GOODS_TYPE[];

  @ApiPropertyOptional({ type: [Number] })
  contractCarType?: CONTRACT_CAR_TYPE[];

  @IsEnum(SERVICE_TYPE)
  @ApiProperty({
    enum: [SERVICE_TYPE.NORMAL_TRUCK_VAN, SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK],
    description: JSON.stringify(SERVICE_TYPE),
  })
  serviceType?: SERVICE_TYPE;
}

export class AdminUpdateTruckOwner extends UpdateTruckOwner {
  @IsEnum(USER_STATUS)
  @ApiProperty({
    enum: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE],
    description: JSON.stringify(USER_STATUS),
  })
  userStatus?: USER_STATUS;

  @IsEnum(VERIFIED_STATUS)
  @ApiProperty({
    enum: [
      VERIFIED_STATUS.UNVERIFIED,
      VERIFIED_STATUS.PENDING,
      VERIFIED_STATUS.VERIFIED,
    ],
    description: JSON.stringify(VERIFIED_STATUS),
  })
  verifiedStatus?: VERIFIED_STATUS;

  @IsEnum(TRUCK_TYPE)
  @ApiProperty({
    enum: [
      TRUCK_TYPE.ALL,
      TRUCK_TYPE.TRAILOR_TRACTOR_TRUCK,
      TRUCK_TYPE.NORMAL_TRUCK_VAN,
    ],
    description: JSON.stringify(TRUCK_TYPE),
  })
  truckType?: TRUCK_TYPE;
}

export class VerifiedStatusTruckOwnerUpdate {
  @IsEnum(VERIFIED_STATUS)
  @ApiProperty({
    enum: [
      VERIFIED_STATUS.UNVERIFIED,
      VERIFIED_STATUS.PENDING,
      VERIFIED_STATUS.VERIFIED,
    ],
    description: JSON.stringify(VERIFIED_STATUS),
  })
  verifiedStatus?: VERIFIED_STATUS;
}
