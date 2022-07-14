import { Injectable, OnModuleInit, HttpService } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BlackBox } from 'src/entities/black-box/black-box.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BLACK_BOX_TYPE } from 'src/common/constants/black-box.enum';
import { DinhViHopQuyTracking } from 'src/dto/black-box/DinhViHopQuyTracking.dto';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { TruckRepository } from 'src/repositories/truck.repository';

@Injectable()
export class DinhViHopQuyService implements OnModuleInit {
  blackBoxSetting = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(BlackBox)
    private readonly blackBoxRepository: Repository<BlackBox>,
    private readonly httpService: HttpService,
    private readonly truckRepository: TruckRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    this.blackBoxSetting = await this.blackBoxRepository.findOne({
      type: BLACK_BOX_TYPE.DINH_VI_HOP_QUY,
    });
    if (!this.blackBoxSetting) {
      this.blackBoxSetting = await this.initBlackBoxSetting();
    }
    this.loginApi();
  }

  async initBlackBoxSetting(): Promise<any> {
    const baseUrl = 'http://api.dinhvihopquy.com/TTASService.svc/';
    const blackBoxSetting = this.blackBoxRepository.create({
      type: BLACK_BOX_TYPE.DINH_VI_HOP_QUY,
      endpoint: {
        login: `${baseUrl}fn_login`,
        getDevice: `${baseUrl}fn_getdevice`,
        trackingDevice: `${baseUrl}fn_theodoitructuyen_map`,
        historyTrackingDevice: `${baseUrl}fn_xemlai`,
      },
      authInfo: {
        username: this.configService.get('DINHVIHOPQUY_USERNAME'),
        password: this.configService.get('DINHVIHOPQUY_PASSWORD'),
      },
    });
    return await this.blackBoxRepository.save(blackBoxSetting);
  }

  async trackingDevice(devName: string): Promise<any> {
    const devId = await this.getDeviceIdByStored(devName);
    if (!devId) {
      return null;
    }
    return await this.trackingDeviceApi(devId);
  }

  async historyTrackingDevice(
    devName: string,
    fromDate: string,
    toDate: string,
  ): Promise<any> {
    this.loginApi();
    if (!(await this.checkAndReLoginApi())) {
      return false;
    }

    const devId = await this.getDeviceIdByStored(devName);
    if (!devId) {
      return null;
    }
    const arrDates = this.getDates(fromDate, toDate);
    if (arrDates.length === 0) {
      return null;
    }

    const results: any[] = [];
    for (const date of arrDates) {
      let res = await this.historyTrackingDeviceApi(
        devId,
        date.format('DD/MM/YYYY'),
      );
      if (res === false) {
        res = await this.historyTrackingDeviceApi(
          devId,
          date.format('DD/MM/YYYY'),
        );
      }
      results.push(res);
    }

    let dataResult = [];
    for (let index = 0; index < results.length; index++) {
      if (
        !results[index] ||
        !results[index]['List_xemlai'] ||
        results[index]['List_xemlai'].length === 0
      ) {
        continue;
      }
      const data = results[index]['List_xemlai'];
      for (const r of data) {
        r.Trktime = `${arrDates[index].format('YYYY-MM-DD')} ${r.Trktime}`;
        dataResult.push(new DinhViHopQuyTracking(r));
      }
    }
    dataResult = dataResult.filter(
      item =>
        moment(fromDate).isSameOrBefore(item.Trktime) &&
        moment(toDate).isSameOrAfter(item.Trktime),
    );
    return dataResult;
  }

  getDates(startDate, toDate) {
    startDate = moment(moment(startDate).format('YYYY-MM-DD'));
    toDate = moment(moment(toDate).format('YYYY-MM-DD'));
    const now = startDate.clone();
    const dates = [];
    while (now.isSameOrBefore(toDate)) {
      dates.push(now.clone());
      now.add(1, 'days');
    }
    return dates;
  }

  async getDeviceIdByStored(devName: string): Promise<any> {
    const truck = await this.truckRepository.findOne({
      truckNo: devName,
      blackBoxType: BLACK_BOX_TYPE.DINH_VI_HOP_QUY,
    });
    if (truck.devId) {
      return truck.devId;
    }
    truck.devId = await this.getDeviceId(devName);
    this.truckRepository.save(truck);
    return truck.devId;
  }

  async getDeviceId(devName: string): Promise<any> {
    const device = await this.getDevicesApi(devName);
    if (!device) {
      return null;
    }
    return device.Id;
  }

  async loginApi(): Promise<any> {
    this.blackBoxSetting = await this.blackBoxRepository.findOne({
      type: BLACK_BOX_TYPE.DINH_VI_HOP_QUY,
    });
    if (!this.blackBoxSetting) {
      return false;
    }
    try {
      const result = await this.httpService
        .post(
          this.blackBoxSetting.endpoint.login,
          this.blackBoxSetting.authInfo,
        )
        .toPromise();
      if (!this.checkResult(result, 'fn_loginResult')) {
        this.blackBoxSetting.authResult = null;
        this.blackBoxRepository.update(this.blackBoxSetting.id, {
          authResult: this.blackBoxSetting.authResult,
        });
        return false;
      }

      this.blackBoxSetting.authResult = result.data.fn_loginResult;
      this.blackBoxRepository.update(this.blackBoxSetting.id, {
        authResult: this.blackBoxSetting.authResult,
      });
      return result.data;
    } catch (e) {
      return false;
    }
  }

  async getDevicesApi(devName = ''): Promise<any> {
    if (!(await this.checkAndReLoginApi())) {
      return false;
    }
    try {
      const result = await this.httpService
        .post(this.blackBoxSetting.endpoint.getDevice, {
          username: this.blackBoxSetting.authResult.Username,
          login_date: this.blackBoxSetting.authResult.Login_date,
        })
        .toPromise();
      if (!this.checkResult(result, 'fn_getdeviceResult')) {
        return false;
      }
      if (!devName) {
        return result.data.fn_getdeviceResult.List_deive;
      }

      return result.data.fn_getdeviceResult?.List_deive.find(
        item => item.Devname === devName,
      );
    } catch (e) {
      return false;
    }
  }

  async trackingDeviceApi(devId: string): Promise<any> {
    if (!(await this.checkAndReLoginApi())) {
      return false;
    }
    try {
      const result = await this.httpService
        .post(this.blackBoxSetting.endpoint.trackingDevice, {
          username: this.blackBoxSetting.authResult.Username,
          devid: devId,
        })
        .toPromise();
      if (!this.checkResult(result, 'fn_theodoitructuyen_mapResult')) {
        return false;
      }

      return result.data.fn_theodoitructuyen_mapResult?.List_theodoi[0];
    } catch (e) {
      return false;
    }
  }

  async historyTrackingDeviceApi(devId: string, trktime: string): Promise<any> {
    if (!(await this.checkAndReLoginApi())) {
      return false;
    }
    try {
      const result = await this.httpService
        .post(this.blackBoxSetting.endpoint.historyTrackingDevice, {
          username: this.blackBoxSetting.authResult.Username,
          devid: devId,
          kpi: this.blackBoxSetting.authResult.Kpi,
          trktime: trktime,
          login_date: this.blackBoxSetting.authResult.Login_date,
        })
        .toPromise();
      if (!this.checkResult(result, 'fn_xemlaiResult')) {
        return false;
      }

      return result.data.fn_xemlaiResult;
    } catch (e) {
      return false;
    }
  }

  private async checkAndReLoginApi(): Promise<any> {
    if (!this.blackBoxSetting.authResult) {
      if (!(await this.loginApi())) {
        return false;
      }
    } else {
      const loginDate = new Date(
        this.blackBoxSetting.authResult.Login_date,
      ).toLocaleDateString();
      if (loginDate !== new Date().toLocaleDateString()) {
        if (!(await this.loginApi())) {
          return false;
        }
      }
    }
    return true;
  }

  private checkResult(result, fn) {
    if (!result.data) {
      return false;
    }
    if (!result.data[fn]?.Status || result.data[fn].Status !== 200) {
      return false;
    }
    return true;
  }
}
