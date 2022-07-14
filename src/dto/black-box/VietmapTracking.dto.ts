import { Exclude, Expose } from 'class-transformer';
import {
  BLACK_BOX_TYPE,
  VEHICLE_TYPE,
  VEHICLE_STATUS,
} from 'src/common/constants/black-box.enum';

@Exclude()
export class VietmapTracking {
  DevName: string;
  Status: number;
  Speed: number;
  GpsTime: string;
  Address: string;
  Y: number;
  X: number;

  @Expose({ name: 'dev_name' })
  get getDevName(): string {
    return this.DevName;
  }

  @Expose({ name: 'dev_status' })
  get getStatus(): number {
    if (this.Status === 1 && this.Speed > 0) {
      return VEHICLE_STATUS.RUNNING;
    }
    if (this.Status === 0 || this.Speed === 0) {
      return VEHICLE_STATUS.STOP;
    }
    return VEHICLE_STATUS.UNKNOWN;
  }

  @Expose({ name: 'speed' })
  get speed(): number {
    return this.Speed;
  }

  @Expose({ name: 'route_time' })
  get routeTime(): string {
    return '';
  }

  @Expose({ name: 'address' })
  get getAddress(): string {
    return this.Address;
  }

  @Expose({ name: 'tracking_time' })
  get trackingTime(): string {
    return this.GpsTime;
  }

  @Expose({ name: 'lat' })
  get getLat(): number {
    return +this.Y;
  }

  @Expose({ name: 'lng' })
  get getLng(): number {
    return +this.X;
  }

  @Expose({ name: 'vehicle_type' })
  get getVehicleType(): string {
    return VEHICLE_TYPE.TRUCK;
  }

  @Expose({ name: 'blackbox' })
  get getTypeTracking(): string {
    return BLACK_BOX_TYPE.VIETMAP;
  }

  constructor(partial: Partial<VietmapTracking>) {
    Object.assign(this, partial);
  }
}
