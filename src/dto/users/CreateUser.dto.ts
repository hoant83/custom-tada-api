import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ACCOUNT_TYPE } from 'src/entities/customer/enums/accountType.enum';
import {
  getObjectFromEnum,
  getValuesFromEnum,
} from 'src/common/helpers/utility.helper';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty()
  @Transform(it => it.toLowerCase())
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsOptional()
  @ApiPropertyOptional()
  phoneNumber?: string;

  @IsOptional()
  @ApiPropertyOptional()
  referalCode?: string;

  @IsNotEmpty()
  @IsEnum(ACCOUNT_TYPE)
  @ApiProperty({
    enum: getValuesFromEnum(ACCOUNT_TYPE),
    description: JSON.stringify(getObjectFromEnum(ACCOUNT_TYPE)),
  })
  accountType: ACCOUNT_TYPE;
}
