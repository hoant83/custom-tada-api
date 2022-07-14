import { ApiPropertyOptional } from '@nestjs/swagger';

export class distanceRequest {
  @ApiPropertyOptional()
  start: number[];

  @ApiPropertyOptional()
  end: number[];
}
