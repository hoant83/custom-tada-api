import { Injectable, OnModuleInit, HttpService } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BlackBox } from 'src/entities/black-box/black-box.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BLACK_BOX_TYPE } from 'src/common/constants/black-box.enum';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as querystring from 'querystring';
import { AnTeckTracking } from 'src/dto/black-box/AnTeckTracking.dto';
import { TruckRepository } from 'src/repositories/truck.repository';

@Injectable()
export class AnTeckService implements OnModuleInit {
  blackBoxSetting = null;
  googleEndpoint = this.configService.get('GOOGLE_MAPS_API');
  googleApiKey = this.configService.get('GOOGLE_MAPS_API_KEY');
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(BlackBox)
    private readonly blackBoxRepository: Repository<BlackBox>,
    private readonly httpService: HttpService,
    private readonly truckRepository: TruckRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    this.blackBoxSetting = await this.blackBoxRepository.findOne({
      type: BLACK_BOX_TYPE.ANTECK,
    });
    if (!this.blackBoxSetting) {
      this.blackBoxSetting = await this.initBlackBoxSetting();
    }
  }

  async initBlackBoxSetting(): Promise<any> {
    const baseUrl = 'http://171.244.133.9:9025/licenses/v1/api/';
    const blackBoxSetting = this.blackBoxRepository.create({
      type: BLACK_BOX_TYPE.ANTECK,
      endpoint: {
        trackingDevice: `${baseUrl}currentmonitor`,
        historyTrackingDevice: `${baseUrl}journey`,
      },
      authInfo: {
        key: this.configService.get('ANTECK_API_KEY'),
      },
    });
    return await this.blackBoxRepository.save(blackBoxSetting);
  }

  async trackingDevice(devName: string): Promise<any> {
    try {
      const dataReturn = await this.getDeviceApi(devName);
      if (!dataReturn) {
        return false;
      }
      if (dataReturn.lat && dataReturn.lng) {
        const addrParams = querystring.stringify({
          latlng: `${dataReturn.lat},${dataReturn.lng}`,
          key: this.googleApiKey,
        });
        const addrResult = await this.httpService
          .get(`${this.googleEndpoint}/geocode/json?${addrParams}`)
          .toPromise();
        if (addrResult.data?.results[0]?.formatted_address) {
          dataReturn['address'] =
            addrResult.data?.results[0]?.formatted_address;
        }
      }
      return dataReturn;
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
        key: this.blackBoxSetting.authInfo.key,
        transportId: devId,
        fromDate: moment(fromDate).format('DD/MM/YYYY HH:mm:ss'),
        toDate: moment(toDate).format('DD/MM/YYYY HH:mm:ss'),
      });
      const result = await this.httpService
        .get(`${this.blackBoxSetting.endpoint.historyTrackingDevice}?${params}`)
        .toPromise();
      if (!this.checkResult(result)) {
        return false;
      }

      const dataReturn = result.data.data.rawJourneyData.map((item: any) => {
        item.currentTime = moment(
          item.currentTime,
          'DD-MM-YYYY HH:mm:ss',
        ).format('YYYY-MM-DD HH:mm:ss');
        return new AnTeckTracking(item);
      });
      return dataReturn;
    } catch (e) {
      return false;
    }
  }

  async getDeviceIdByStored(devName: string): Promise<any> {
    const truck = await this.truckRepository.findOne({
      truckNo: devName,
      blackBoxType: BLACK_BOX_TYPE.ANTECK,
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
    return device.transportId || null;
  }

  async getDeviceApi(devName: string): Promise<any> {
    try {
      const params = querystring.stringify({
        key: this.blackBoxSetting.authInfo.key,
        registerNos: devName,
      });
      const result = await this.httpService
        .get(`${this.blackBoxSetting.endpoint.trackingDevice}?${params}`)
        .toPromise();
      if (!this.checkResult(result)) {
        return false;
      }
      const dataReturn = result.data.data[0];
      return dataReturn;
    } catch (e) {
      return false;
    }
  }

  private checkResult(result) {
    if (!result.data) {
      return false;
    }
    if (result.data.code !== 200) {
      return false;
    }
    if (!result.data.data || result.data.data.length === 0) {
      return false;
    }
    return true;
  }
}
