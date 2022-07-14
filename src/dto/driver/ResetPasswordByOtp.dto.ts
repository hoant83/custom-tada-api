import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ResetPasswordByOtp {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  otp: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
