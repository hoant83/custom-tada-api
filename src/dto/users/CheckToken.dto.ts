import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CheckToken {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  token: string;
}
