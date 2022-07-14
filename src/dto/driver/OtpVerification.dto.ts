import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpVerification {
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @IsNotEmpty()
  @ApiProperty()
  otpCode: number;
}
