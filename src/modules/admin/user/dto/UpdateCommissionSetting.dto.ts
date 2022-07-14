import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';
import { GeneralSettupCommissionDto } from 'src/dto/setting/general-setting-commission.dto';

export class UpdateCommissionSetting extends GeneralSettupCommissionDto {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @ApiPropertyOptional()
  truckOwnersId?: number[];
}
