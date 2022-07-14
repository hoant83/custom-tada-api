import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';

export class fileType {
  @IsEnum(REFERENCE_TYPE)
  @ApiProperty({
    enum: [
      REFERENCE_TYPE.CUSTOMER_LOGO,
      REFERENCE_TYPE.FOOTER_QR,
      REFERENCE_TYPE.CUSTOMER_DEFAULT_PROFILE_IMG,
    ],
    description: JSON.stringify(REFERENCE_TYPE),
  })
  fileType?: REFERENCE_TYPE;
}
