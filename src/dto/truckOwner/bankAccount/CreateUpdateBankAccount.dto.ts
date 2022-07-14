import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUpdateBankAccount {
  @ApiPropertyOptional()
  companyName?: string;

  @ApiPropertyOptional()
  businessLicenseNo?: number;

  @ApiPropertyOptional()
  bankName?: string;

  @ApiPropertyOptional()
  bankBranch?: string;

  @ApiPropertyOptional()
  bankAccountHolderName?: string;

  @ApiPropertyOptional()
  bankAccountNumber?: string;
}
