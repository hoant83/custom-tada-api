import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PAYMENT_TYPE } from 'src/entities/payment/enums/payment.enum';

export class DefaultPaymentDto {
  @IsOptional()
  @ApiPropertyOptional()
  needVATInvoice: boolean;

  @IsOptional()
  @ApiPropertyOptional()
  companyName: string;

  @IsOptional()
  @ApiPropertyOptional()
  bussinessLicenseNO: string;

  @IsOptional()
  @ApiPropertyOptional()
  address: string;

  @IsOptional()
  @ApiPropertyOptional()
  paymentType: PAYMENT_TYPE;

  @IsOptional()
  @ApiPropertyOptional()
  otherPayment: string;
}
