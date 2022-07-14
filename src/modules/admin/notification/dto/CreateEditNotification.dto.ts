import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEditNotificationDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  @ApiPropertyOptional()
  titleEN: string;

  @ApiProperty()
  @ApiPropertyOptional()
  bodyEN: string;

  @ApiProperty()
  @ApiPropertyOptional()
  titleKR: string;

  @ApiProperty()
  @ApiPropertyOptional()
  bodyKR: string;

  @ApiProperty()
  @ApiPropertyOptional()
  titleID: string;

  @ApiProperty()
  @ApiPropertyOptional()
  bodyID: string;

  @ApiPropertyOptional()
  sendToCustomer: boolean;

  @ApiPropertyOptional()
  sendToDriver: boolean;

  @ApiPropertyOptional()
  sendToTruckOwner: boolean;
}
