import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BLACK_BOX_TYPE,
  DISPLAY_ON,
} from 'src/common/constants/black-box.enum';
import { LICENSE } from 'src/entities/admin/enums/userLicense.enum';

export class UpdateLicenseSetting {
  @ApiProperty()
  license?: LICENSE;

  @ApiPropertyOptional({ type: [String] })
  displayOn?: DISPLAY_ON[];

  @ApiPropertyOptional({ type: [String] })
  blackBoxType?: BLACK_BOX_TYPE[];

  @ApiPropertyOptional()
  enableQuotation?: boolean;
}
