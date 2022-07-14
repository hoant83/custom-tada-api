import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber } from 'class-validator';
import { VERIFIED_STATUS } from 'src/entities/enums/verifiedStatus.enum';
import { USER_STATUS } from 'src/entities/enums/userStatus.enum';

export class UpdateDriver {
  @IsString()
  @ApiProperty()
  phoneNumber?: string;

  @IsString()
  @ApiProperty()
  email?: string;

  @IsString()
  @ApiProperty()
  name?: string;

  @IsString()
  @ApiProperty()
  licenseNo?: string;

  @IsString()
  @ApiProperty()
  companyTruckOwnerName?: string;

  @IsString()
  @ApiProperty()
  password?: string;

  @IsString()
  @ApiProperty()
  cardNo?: string;

  @ApiProperty()
  @IsNumber()
  ownerId?: number;
}

export class AdminUpdateDriver extends UpdateDriver {
  @IsEnum(USER_STATUS)
  @ApiProperty({
    enum: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE],
    description: JSON.stringify(USER_STATUS),
  })
  userStatus?: USER_STATUS;

  @IsEnum(VERIFIED_STATUS)
  @ApiProperty({
    enum: [
      VERIFIED_STATUS.UNVERIFIED,
      VERIFIED_STATUS.PENDING,
      VERIFIED_STATUS.VERIFIED,
    ],
    description: JSON.stringify(VERIFIED_STATUS),
  })
  verifiedStatus?: VERIFIED_STATUS;
}

export class VerifiedStatusTruckOwnerUpdate {
  @IsEnum(VERIFIED_STATUS)
  @ApiProperty({
    enum: [
      VERIFIED_STATUS.UNVERIFIED,
      VERIFIED_STATUS.PENDING,
      VERIFIED_STATUS.VERIFIED,
    ],
    description: JSON.stringify(VERIFIED_STATUS),
  })
  verifiedStatus?: VERIFIED_STATUS;
}
