import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePassword {
  @ApiProperty()
  @IsString()
  current: string;

  @ApiProperty()
  @IsString()
  password: string;
}
