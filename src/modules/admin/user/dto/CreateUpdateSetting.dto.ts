import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SETTING_TYPE } from 'src/entities/admin-setting/enums/adminSettingType.enum';
import { SpecialRequest } from 'src/entities/special-request/special-request.entity';

export class CreateUpdateSetting {
  @IsOptional()
  @ApiPropertyOptional()
  id: number;

  @IsOptional()
  @ApiPropertyOptional()
  settingType: SETTING_TYPE;

  @IsOptional()
  @ApiPropertyOptional()
  rawHtml: string;

  @IsOptional()
  @ApiPropertyOptional()
  specialRequest: SpecialRequest[];
}
