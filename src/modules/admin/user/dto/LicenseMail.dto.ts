import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LicenseMail {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  contactNo: string;

  @IsString()
  @ApiProperty()
  notes: string;
}
