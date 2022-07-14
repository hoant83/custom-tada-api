import { Injectable, OnModuleInit, HttpService } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BlackBox } from 'src/entities/black-box/black-box.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BLACK_BOX_TYPE } from 'src/common/constants/black-box.enum';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as querystring from 'querystring';
import { VietmapTracking } from 'src/dto/black-box/VietmapTracking.dto';
import { TruckRepository } from 'src/repositories/truck.repository';

@Injectable()
export class VietmapService implements OnModuleInit {
  blackBoxSetting = null;
  // googleEndpoint = this.configService.get('GOOGLE_MAPS_API');
  // googleApiKey = this.configService.get('GOOGLE_MAPS_API_KEY');
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(BlackBox)
    private readonly blackBoxRepository: Repository<BlackBox>,
    private readonly httpService: HttpService,
    private readonly truckRepository: TruckRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    this.blackBoxSetting = await this.blackBoxRepository.findOne({
      type: BLACK_BOX_TYPE.VIETMAP,
    });
    if (!this.blackBoxSetting) {
      this.blackBoxSetting = await this.initBlackBoxSetting();
    }
  }

  async initBlackBoxSetting(): Promise<any> {
    const baseUrl = 'https://client-api.quanlyxe.vn/v3/tracking/';
    const blackBoxSetting = this.blackBoxRepository.create({
      type: BLACK_BOX_TYPE.VIETMAP,
      endpoint: {
        getVehicles: `${baseUrl}getvehicles`,
        trackingDevice: `${baseUrl}GetVehicleStatus`,
        historyTrackingDevice: `${baseUrl}getvehiclehistory`,
      },
      authInfo: {
        key: this.configService.get('VIETMAP_API_KEY'),
      },
    });
    return await this.blackBoxRepository.save(blackBoxSetting);
  }

  async trackingDevice(devName: string): Promise<any> {
    try {
      const params = querystring.stringify({
        plate: devName,
        apikey: this.blackBoxSetting.authInfo.key,
      });
      const result = await this.httpService
        .get(`${this.blackBoxSetting.endpoint.trackingDevice}?${params}`)
        .toPromise();
      if (!this.checkResult(result)) {
        return false;
      }
      result.data.Data[0].DevName = devName;
      return new VietmapTracking(result.data.Data[0]);
    } catch (e) {
      return false;
    }
  }

  async historyTrackingDevice(
    devName: string,
    fromDate: string,
    toDate: string,
  ): Promise<any> {
    try {
      const devId = await this.getDeviceIdByStored(devName);
      if (!devId) {
        return false;
      }

      const params = querystring.stringify({
        apikey: this.blackBoxSetting.authInfo.key,
        'v3-id': devId,
        formTicks: moment(fromDate).format('DD/MM/YYYY HH:mm:ss'),
        toTicks: moment(toDate).format('DD/MM/YYYY HH:mm:ss'),
      });
      const result = await this.httpService
        .get(`${this.blackBoxSetting.endpoint.historyTrackingDevice}?${params}`)
        .toPromise();
      if (!this.checkResult(result)) {
        return false;
      }

      const dataReturn = result.data.Data.map((item: any) => {
        return new VietmapTracking(item);
      });
      return dataReturn;
    } catch (e) {
      return false;
    }
  }

  async getDeviceIdByStored(devName: string): Promise<any> {
    const truck = await this.truckRepository.findOne({
      truckNo: devName,
      blackBoxType: BLACK_BOX_TYPE.VIETMAP,
    });
    if (truck.devId) {
      return truck.devId;
    }
    truck.devId = await this.getDeviceId(devName);
    this.truckRepository.save(truck);
    return truck.devId;
  }

  async getDeviceId(devName: string): Promise<any> {
    const device = await this.getDeviceApi(devName);
    if (!device) {
      return null;
    }
    return device.Id || null;
  }

  async getDeviceApi(devName: string): Promise<any> {
    try {
      const params = querystring.stringify({
        plate: devName,
        apikey: this.blackBoxSetting.authInfo.key,
      });
      const result = await this.httpService
        .get(`${this.blackBoxSetting.endpoint.trackingDevice}?${params}`)
        .toPromise();
      if (!this.checkResult(result)) {
        return false;
      }
      result.data.Data[0].Id;
    } catch (e) {
      return false;
    }
  }

  private checkResult(result) {
    if (!result.data) {
      return false;
    }
    if (!result.data.Data || result.data.Data.length === 0) {
      return false;
    }
    return true;
  }
}
