import { ApiPropertyOptional } from '@nestjs/swagger';

export class SmsDto {
  @ApiPropertyOptional()
  orderAccepted?: boolean;

  @ApiPropertyOptional()
  orderComplete?: boolean;

  @ApiPropertyOptional()
  orderCancelled?: boolean;

  @ApiPropertyOptional()
  driverPickingUp?: boolean;

  @ApiPropertyOptional()
  driverDelivering?: boolean;

  @ApiPropertyOptional()
  totalAcceptedSms?: number;

  @ApiPropertyOptional()
  totalCancelledSms?: number;

  @ApiPropertyOptional()
  totalDriverPickingUp?: number;

  @ApiPropertyOptional()
  totalDriverDelivering?: number;
}
