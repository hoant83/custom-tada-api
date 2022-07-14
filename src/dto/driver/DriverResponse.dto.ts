import { Expose } from 'class-transformer';
import { Driver } from 'src/entities/driver/driver.entity';

export class DriverResponse extends Driver {
  @Expose({
    name: 'partnerId',
  })
  get partnerId(): string {
    if (this.ownerId) {
      return this.truckOwner.publicId;
    }
    return '';
  }
  constructor(partial: Partial<DriverResponse>) {
    super();
    Object.assign(this, partial);
  }
}
