import { Exclude, Expose } from 'class-transformer';
import { File } from 'src/entities/file/file.entity';
import { BaseUserDetailResponse } from '../BaseUserDetailResponse.dto';

export class DriverDetailResponse extends BaseUserDetailResponse {
  token: string;

  cardNo: string;

  @Exclude()
  license: File;

  @Expose({
    name: 'licenseURL',
  })
  get licenseURL(): string {
    if (this.license)
      return `${process.env.BACKEND_HOST}/api/assets/${this.license.id}.${this.license.extension}`;
    return '';
  }

  @Exclude()
  card_back_image: File;

  @Expose({
    name: 'cardBackURL',
  })
  get cardBackURL(): string {
    if (this.card_back_image)
      return `${process.env.BACKEND_HOST}/api/assets/${this.card_back_image.id}.${this.card_back_image.extension}`;
    return '';
  }

  @Exclude()
  card_front_image: File;

  @Expose({
    name: 'cardFrontURL',
  })
  get cardFrontURL(): string {
    if (this.card_front_image)
      return `${process.env.BACKEND_HOST}/api/assets/${this.card_front_image.id}.${this.card_front_image.extension}`;
    return '';
  }

  @Exclude()
  otherDocuments: File[];

  @Expose({
    name: 'otherDocumentURLs',
  })
  get otherDocumentURLs(): Map<string, string> {
    const otherDocs = new Map<string, string>();
    if (this.otherDocuments && this.otherDocuments.length) {
      this.otherDocuments.forEach((otherDoc: File) => {
        otherDocs.set(
          otherDoc.id,
          `${process.env.BACKEND_HOST}/api/assets/${otherDoc.id}.${otherDoc.extension}`,
        );
      });
    }

    return otherDocs;
  }

  constructor(partial: Partial<DriverDetailResponse>) {
    super();
    Object.assign(this, partial);
  }
}
