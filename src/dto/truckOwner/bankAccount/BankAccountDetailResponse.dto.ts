export class BankAccountDetailResponse {
  companyName?: string;
  businessLicenseNo?: number;
  bankName?: string;
  bankBranch?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;

  constructor(partial: Partial<BankAccountDetailResponse>) {
    Object.assign(this, partial);
  }
}
