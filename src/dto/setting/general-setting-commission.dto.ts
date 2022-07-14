import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class GeneralSettupCommissionDto {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isEnableCommissionFeature?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isEnableSetupDefaultDriversCommission?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isEnableAllTruckOwnersCommission?: boolean;

  @ApiProperty()
  @IsOptional()
  @Min(0)
  @Max(100)
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultPercentCommission?: number;

  @ApiProperty()
  @IsOptional()
  @Min(0)
  @IsInt()
  // @IsPositive()
  defaultFixedCommission?: number;
}
