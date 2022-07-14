import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PhoneLoginDto {
  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
