import { Exclude, Expose } from 'class-transformer';
import {
  BLACK_BOX_TYPE,
  VEHICLE_TYPE,
  VEHICLE_STATUS,
} from 'src/common/constants/black-box.enum';

@Exclude()
export class DinhViHopQuyTracking {
  Devname: string;
  Devstatus: string;
  Speed: string;
  Route_time: string;
  Address: string;
  Trktime: string;
  Latitude: string;
  Longitude: string;
  Car_type: string;

  @Expose({ name: 'dev_name' })
  get devName(): string {
    return this.Devname;
  }

  @Expose({ name: 'dev_status' })
  get devStatus(): number {
    switch (this.Devstatus) {
      case '0':
        return VEHICLE_STATUS.RUNNING;
      case '1':
        return VEHICLE_STATUS.STOP;
      case '2':
        return VEHICLE_STATUS.LOST_SIGNAL;
    }
    return VEHICLE_STATUS.UNKNOWN;
  }

  @Expose({ name: 'speed' })
  get speed(): string {
    return this.Speed;
  }

  @Expose({ name: 'route_time' })
  get routeTime(): string {
    return this.Route_time;
  }

  @Expose({ name: 'address' })
  get address(): string {
    return this.Address;
  }

  @Expose({ name: 'tracking_time' })
  get trackingTime(): string {
    return this.Trktime;
  }

  @Expose({ name: 'lat' })
  get lat(): number {
    return +this.Latitude;
  }

  @Expose({ name: 'lng' })
  get lng(): number {
    return +this.Longitude;
  }

  @Expose({ name: 'vehicle_type' })
  get getVehicleType(): string {
    const shipTypes = ['220', '129', '157', '207', '222', '223', '230'];
    if (shipTypes.includes(this.Car_type)) {
      return VEHICLE_TYPE.SHIP;
    }
    return VEHICLE_TYPE.TRUCK;
  }

  @Expose({ name: 'blackbox' })
  get getTypeTracking(): string {
    return BLACK_BOX_TYPE.DINH_VI_HOP_QUY;
  }

  constructor(partial: Partial<DinhViHopQuyTracking>) {
    Object.assign(this, partial);
  }
}
