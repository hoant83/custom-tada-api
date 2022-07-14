import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber } from 'class-validator';
import { VERIFIED_STATUS } from 'src/entities/enums/verifiedStatus.enum';
import { USER_STATUS } from 'src/entities/enums/userStatus.enum';
import { ACCOUNT_TYPE } from 'src/entities/customer/enums/accountType.enum';

export class UpdateCustomer {
  @IsString()
  @ApiProperty()
  phone?: string;

  @IsString()
  @ApiProperty()
  email?: string;

  @IsString()
  @ApiProperty()
  firstName?: string;

  @IsString()
  @ApiProperty()
  lastName?: string;

  @IsString()
  @ApiProperty()
  password?: string;

  @IsString()
  @ApiProperty()
  cardNo?: string;

  @IsNumber()
  @ApiProperty()
  companyId?: number;

  @IsNumber()
  @IsEnum(ACCOUNT_TYPE)
  @ApiProperty({
    enum: [
      ACCOUNT_TYPE.INDIVIDUAL,
      ACCOUNT_TYPE.BUSINESS_PARTNER,
      ACCOUNT_TYPE.CORPORATE,
      ACCOUNT_TYPE.LOGISTIC_FORWARDER,
    ],
    description: JSON.stringify(ACCOUNT_TYPE),
  })
  accountType?: ACCOUNT_TYPE;
}

export class AdminUpdateCustomer extends UpdateCustomer {
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

export class VerifiedStatusCustomerUpdate {
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
