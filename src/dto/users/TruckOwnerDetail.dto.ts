import { Exclude, Expose } from 'class-transformer';
import { Company } from 'src/entities/company/company.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';

export class TruckOwnerDetailResponse extends TruckOwner {
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

  constructor(partial: Partial<TruckOwnerDetailResponse>) {
    super();
    Object.assign(this, partial);
  }
}
