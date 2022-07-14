import { Exclude } from 'class-transformer';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';

export class TruckOwnerResponseDto extends TruckOwner {
  @Exclude()
  password: string;

  @Exclude()
  notiToken: string;

  @Exclude()
  deviceToken: string;

  @Exclude()
  pickupZone: number[];

  @Exclude()
  session: string;

  constructor(partial: Partial<TruckOwner> = {}) {
    super();
    Object.assign(this, partial);
  }
}
