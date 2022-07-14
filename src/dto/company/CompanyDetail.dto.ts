import { Exclude, Expose } from 'class-transformer';
import { File } from 'src/entities/file/file.entity';

export class CompanyDetailResponse {
  id: number;
  name: string;
  createdDate: Date;
  updatedDate: Date;
  phone: string;
  address: string;
  licenseNo: string;

  @Exclude()
  company_business_license: File;

  @Expose({
    name: 'businessLicenseUrl',
  })
  get businessLicenseUrl(): string {
    if (this.company_business_license)
      return `${process.env.BACKEND_HOST}/api/assets/${this.company_business_license.id}.${this.company_business_license.extension}`;
    return '';
  }

  @Exclude()
  company_icon: File;

  @Expose({
    name: 'companyIconUrl',
  })
  get companyIconUrl(): string {
    if (this.company_icon)
      return `${process.env.BACKEND_HOST}/api/assets/${this.company_icon.id}.${this.company_icon.extension}`;
    return '';
  }
  constructor(partial: Partial<CompanyDetailResponse>) {
    Object.assign(this, partial);
  }
}
