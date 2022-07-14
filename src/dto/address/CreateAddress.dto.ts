import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { LOCATION_TYPE } from 'src/entities/address/enums/localtionType.enum';

export class CreateAddress {
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
  inChangeNo: string;

  @ApiPropertyOptional()
  pickupCity: string;

  @ApiPropertyOptional({ type: [Number] })
  pickupAddress: number[];

  @ApiPropertyOptional()
  pickupAddressText: string;

  @ApiPropertyOptional({ type: [Number] })
  dropoffAddress: number[];

  @ApiPropertyOptional()
  dropoffAddressText: string;
}
