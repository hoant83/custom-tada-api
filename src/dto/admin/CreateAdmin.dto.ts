import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { USER_TYPE } from 'src/entities/admin/enums/userType.enum';
import {
  getObjectFromEnum,
  getValuesFromEnum,
} from 'src/common/helpers/utility.helper';
import { Transform } from 'class-transformer';

export class CreateAdminDto {
  @IsEmail()
  @ApiProperty()
  @Transform(it => it.toLowerCase())
  email: string;

  @ApiProperty()
  password?: string;

  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @IsNotEmpty()
  @ApiProperty()
  cardNo: string;

  @IsNotEmpty()
  @IsEnum(USER_TYPE)
  @ApiProperty({
    enum: getValuesFromEnum(USER_TYPE),
    description: JSON.stringify(getObjectFromEnum(USER_TYPE)),
  })
  userType?: USER_TYPE;
}
