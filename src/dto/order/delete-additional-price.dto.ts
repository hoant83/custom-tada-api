import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ADDITIONAL_PROICE_OPTIONS } from 'src/entities/additional-price/enums/additional-price-options.enum';

export class DeleteAdditionalPrice {
  @ApiPropertyOptional()
  additionalType?: ADDITIONAL_PROICE_OPTIONS;

  @ApiPropertyOptional()
  @Transform(x => +x)
  totalPrice?: number;
}
