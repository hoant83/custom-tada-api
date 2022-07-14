import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  getObjectFromEnum,
  getValuesFromEnum,
} from 'src/common/helpers/utility.helper';
import { TRUCK_TYPE } from 'src/entities/truckOwner/enums/truckType.enum';

export class CreateTruckDto {
  @IsNotEmpty()
  @ApiPropertyOptional()
  truckNo?: string;

  @IsNotEmpty()
  @ApiPropertyOptional()
  truckLoad?: string;

  @IsNotEmpty()
  @IsEnum(TRUCK_TYPE)
  @ApiProperty({
    enum: getValuesFromEnum(TRUCK_TYPE),
    description: JSON.stringify(getObjectFromEnum(TRUCK_TYPE)),
  })
  truckType?: TRUCK_TYPE;
}
