import { ApiPropertyOptional } from '@nestjs/swagger';

export class folerRequestDto {
  @ApiPropertyOptional()
  name: string;

  // @ApiPropertyOptional()
  // orderId: number;
}
