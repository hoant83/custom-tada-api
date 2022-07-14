import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ACCOUNT_ROLE } from 'src/entities/customer/enums/accountRole.enum';
import {
  getObjectFromEnum,
  getValuesFromEnum,
} from 'src/common/helpers/utility.helper';
import { CreateUserDto } from '../users/CreateUser.dto';

export class CreateEmployeeDto extends CreateUserDto {
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty()
  @ApiProperty()
  cardNo: string;

  @IsNotEmpty()
  @IsEnum(ACCOUNT_ROLE)
  @ApiProperty({
    enum: getValuesFromEnum(ACCOUNT_ROLE),
    description: JSON.stringify(getObjectFromEnum(ACCOUNT_ROLE)),
  })
  accountRole?: ACCOUNT_ROLE;
}
