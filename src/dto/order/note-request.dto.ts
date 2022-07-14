import { ApiPropertyOptional } from '@nestjs/swagger';

export class noteRequestDto {
  @ApiPropertyOptional()
  content: string;
}
