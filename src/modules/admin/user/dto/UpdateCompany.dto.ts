import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCompany {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @ApiProperty()
  // @IsNotEmpty()
  phone?: string;

  @IsString()
  @ApiProperty()
  // @IsNotEmpty()
  address?: string;

  @IsString()
  @ApiProperty()
  // @IsNotEmpty()
  licenseNo?: string;
}
