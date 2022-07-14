import { BaseUserDetailResponse } from '../BaseUserDetailResponse.dto';
import { Exclude, Expose } from 'class-transformer';
import { File } from 'src/entities/file/file.entity';

export class DriverResponseDto extends BaseUserDetailResponse {
  cardNo: string;
  token: string;
  licenseNo: string;
  companyTruckOwnerName: string;

  @Exclude()
  card_front_image: File;

  @Expose({
    name: 'frontCardUrl',
  })
  get frontCardUrl(): string {
    if (this.card_front_image) {
      return `${process.env.BACKEND_HOST}/api/assets/${this.card_front_image.id}.${this.card_front_image.extension}`;
    }
    return '';
  }

  @Exclude()
  card_back_image: File;

  @Expose({
    name: 'backCardUrl',
  })
  get backCardUrl(): string {
    if (this.card_back_image) {
      return `${process.env.BACKEND_HOST}/api/assets/${this.card_back_image.id}.${this.card_back_image.extension}`;
    }
    return '';
  }

  @Exclude()
  license: File;

  @Expose({
    name: 'licenseURL',
  })
  get licenseURL(): string {
    if (this.license) {
      return `${process.env.BACKEND_HOST}/api/assets/${this.license.id}.${this.license.extension}`;
    }
    return '';
  }

  constructor(partial: Partial<DriverResponseDto>) {
    super();
    Object.assign(this, partial);
  }
}
