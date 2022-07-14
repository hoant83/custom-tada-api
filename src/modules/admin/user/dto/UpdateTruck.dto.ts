import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { TRUCK_TYPE } from 'src/entities/truckOwner/enums/truckType.enum';
import { TRUCK_STATUS } from 'src/entities/truck/enums/truckStatus.enum';

export class UpdateTruck {
  @IsString()
  @ApiProperty()
  truckNo?: string;

  @IsString()
  @ApiProperty()
  truckLoad?: string;

  @IsEnum(TRUCK_TYPE)
  @ApiProperty({
    enum: [
      TRUCK_TYPE.ALL,
      TRUCK_TYPE.NORMAL_TRUCK_VAN,
      TRUCK_TYPE.TRAILOR_TRACTOR_TRUCK,
    ],
    description: JSON.stringify(TRUCK_TYPE),
  })
  truckType?: TRUCK_TYPE;
}

export class AdminUpdateTruck extends UpdateTruck {
  @IsEnum(TRUCK_STATUS)
  @ApiProperty({
    enum: [
      TRUCK_STATUS.UNVERIFIED,
      TRUCK_STATUS.PENDING,
      TRUCK_STATUS.VERIFIED,
    ],
    description: JSON.stringify(TRUCK_STATUS),
  })
  truckStatus?: TRUCK_STATUS;
}
