import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleImportantNote {
  @ApiProperty()
  @IsBoolean()
  isOn: boolean;
}
