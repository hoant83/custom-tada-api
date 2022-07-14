import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class UpdateCommissionRequestDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  isEnableSetCommissionForDriver: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  isEnableAllowDriverSeeCommission: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  isEnableAllowDriverSeeOrdersPrice: boolean;

  @IsNotEmpty()
  @Max(100)
  @Min(0)
  @IsNumber()
  @ApiProperty()
  percentCommission: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty()
  fixedCommission: number;
}
