import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { LOCATION_TYPE } from 'src/entities/address/enums/localtionType.enum';

export class UpdateAddress {
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @ApiProperty()
  company: string;

  @IsNotEmpty()
  @ApiProperty()
  locationType: LOCATION_TYPE;

  @IsNotEmpty()
  @ApiProperty()
  locationName: string;

  @IsNotEmpty()
  @ApiProperty()
  locationAddress: string;

  @IsOptional()
  @ApiPropertyOptional()
  inChargeName: string;

  @IsOptional()
  @ApiPropertyOptional()
  inChargeNo: string;

  @IsNotEmpty()
  @ApiProperty()
  ownerId: number;

  @IsOptional()
  @ApiPropertyOptional()
  pickupCity: string;
}
