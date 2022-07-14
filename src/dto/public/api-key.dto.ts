import { ApiProperty } from '@nestjs/swagger';

export class APIKeyDto {
  @ApiProperty()
  apiKey: string;
}
