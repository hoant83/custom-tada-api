import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginUserDto {
  @ApiProperty()
  @IsEmail()
  @Transform(it => it.toLowerCase())
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
