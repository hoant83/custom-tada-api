import { Exclude, Expose } from 'class-transformer';
import { File } from 'src/entities/file/file.entity';

export class TrucksDetailResponse {
  @Exclude()
  certificate: File;

  @Expose({
    name: 'certificateURL',
  })
  get certificateURL(): string {
    if (this.certificate)
      return `${process.env.BACKEND_HOST}/api/assets/${this.certificate.id}.${this.certificate.extension}`;
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

  constructor(partial: Partial<TrucksDetailResponse>) {
    Object.assign(this, partial);
  }
}
