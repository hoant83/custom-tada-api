import { Exclude, Expose } from 'class-transformer';
import {
  BLACK_BOX_TYPE,
  VEHICLE_TYPE,
  VEHICLE_STATUS,
} from 'src/common/constants/black-box.enum';

@Exclude()
export class AnTeckTracking {
  registerNo: string;
  status: number;
  gpsSpeed: number;
  currentTime: string;
  address: string;
  lat: number;
  lng: number;

  @Expose({ name: 'dev_name' })
  get devName(): string {
    return this.registerNo;
  }

  @Expose({ name: 'dev_status' })
  get devStatus(): number {
    switch (this.status) {
      case 0:
      case 5:
        return VEHICLE_STATUS.RUNNING;
      case 1:
      case 2:
        return VEHICLE_STATUS.STOP;
      case 3:
      case 4:
        return VEHICLE_STATUS.LOST_SIGNAL;
    }
    return VEHICLE_STATUS.UNKNOWN;
  }

  @Expose({ name: 'speed' })
  get speed(): number {
    return this.gpsSpeed;
  }

  @Expose({ name: 'route_time' })
  get routeTime(): string {
    return '';
  }

  @Expose({ name: 'address' })
  get getAddress(): string {
    return this.address;
  }

  @Expose({ name: 'tracking_time' })
  get trackingTime(): string {
    return this.currentTime;
  }

  @Expose({ name: 'lat' })
  get getLat(): number {
    return +this.lat;
  }

  @Expose({ name: 'lng' })
  get getLng(): number {
    return +this.lng;
  }

  @Expose({ name: 'vehicle_type' })
  get getVehicleType(): string {
    return VEHICLE_TYPE.TRUCK;
  }

  @Expose({ name: 'blackbox' })
  get getTypeTracking(): string {
    return BLACK_BOX_TYPE.ANTECK;
  }

  constructor(partial: Partial<AnTeckTracking>) {
    Object.assign(this, partial);
  }
}
