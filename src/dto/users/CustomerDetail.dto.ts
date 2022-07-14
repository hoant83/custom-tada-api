import { Exclude, Expose } from 'class-transformer';
import { Company } from 'src/entities/company/company.entity';
import { Customer } from 'src/entities/customer/customer.entity';

export class CustomerDetailResponse extends Customer {
  @Exclude()
  password: string;

  @Exclude()
  company: Company;

  @Expose({
    name: 'companyName',
  })
  get companyName(): string {
    if (this.company) {
      return this.company.name;
    }
    return '';
  }

  constructor(partial: Partial<CustomerDetailResponse>) {
    super();
    Object.assign(this, partial);
  }
}
