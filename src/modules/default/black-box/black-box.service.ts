import { HttpStatus, Injectable, HttpService } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TrackingBlackBox } from 'src/entities/tracking-black-box/tracking-black-box.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { OrderRepository } from 'src/repositories/order.repository';
import { customThrowError } from 'src/common/helpers/throw.helper';
import { DinhViHopQuyService } from './dinhvihopquy.service';
import { DinhViHopQuyTracking } from 'src/dto/black-box/DinhViHopQuyTracking.dto';
import { Interval } from '@nestjs/schedule';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { Order } from 'src/entities/order/order.entity';
import { In, Between } from 'typeorm';
import { TrackingBlackBoxLog } from 'src/entities/tracking-black-box-log/tracking-black-box-log.entity';
import {
  BLACK_BOX_TYPE,
  DISPLAY_ON,
} from 'src/common/constants/black-box.enum';
import * as moment from 'moment';
import { FilterRequestDto } from 'src/dto/black-box/filter-request.dto';
import { FindManyOptions } from 'typeorm';
import { PaginationResult } from '@anpham1925/nestjs';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { AnTeckService } from './anteck.service';
import { ConfigService } from '@nestjs/config';
import { AnTeckTracking } from 'src/dto/black-box/AnTeckTracking.dto';
import { TruckRepository } from 'src/repositories/truck.repository';
import { LICENSE } from 'src/entities/admin/enums/userLicense.enum';
import { Request } from 'express';
import { TOKEN_TYPE } from 'src/common/constants/token-types.enum';
import { VietmapService } from './vietmap.service';
import { VietmapTracking } from 'src/dto/black-box/VietmapTracking.dto';
import { SettingRepository } from 'src/repositories/setting.repository';

@Injectable()
export class BlackBoxService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(TrackingBlackBox)
    private readonly trackingBlackBoxRepository: Repository<TrackingBlackBox>,
    @InjectRepository(TrackingBlackBoxLog)
    private readonly trackingBlackBoxLogRepository: Repository<
      TrackingBlackBoxLog
    >,
    private readonly orderRepository: OrderRepository,
    @InjectRepository(Order)
    private readonly orderEntityRepository: Repository<Order>,
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
    private readonly settingRepository: SettingRepository,
    private readonly dinhViHopQuyService: DinhViHopQuyService,
    private readonly anteckService: AnTeckService,
    private readonly vietmapService: VietmapService,
    private readonly truckRepository: TruckRepository,
  ) {}

  async trackingTruckByOrder(orderId: number, request: Request): Promise<any> {
    const order = await this.orderRepository.findOne({ id: orderId });
    if (!order) {
      return false;
    }

    const orderTrackingStatus = [
      ORDER_STATUS.DISPATCHED,
      ORDER_STATUS.PICKING,
      ORDER_STATUS.PICK_ARRIVED,
      ORDER_STATUS.PICKUPCODE_INPUTED,
      ORDER_STATUS.DELIVERING,
      ORDER_STATUS.DELIVERYCODE_INPUTED,
    ];
    if (!orderTrackingStatus.includes(order.status)) {
      return false;
    }

    const tracking: any = await this.trackingBlackBoxRepository.find({
      where: { orderId },
      select: ['truckId', 'trackingInfo', 'type'],
    });

    if (
      tracking[0] &&
      !(await this.checkCanTracking(tracking[0].type, (request as any).user))
    ) {
      return false;
    }

    const gpsTracking: any = await this.trackingRepository.find({ orderId });

    const dataTracking = tracking.map(item => {
      let typeReturn = null;
      switch (item.type) {
        case BLACK_BOX_TYPE.DINH_VI_HOP_QUY:
          typeReturn = DinhViHopQuyTracking;
          break;
        case BLACK_BOX_TYPE.ANTECK:
          typeReturn = AnTeckTracking;
          break;
        case BLACK_BOX_TYPE.VIETMAP:
          typeReturn = VietmapTracking;
          break;
      }
      return {
        truckId: item.truckId,
        info: new typeReturn(item.trackingInfo),
      };
    });
    return [dataTracking, gpsTracking];
  }

  async trackingTruckHistory(
    devName: string,
    fromDate: string,
    toDate: string,
    request: Request,
  ): Promise<any> {
    const truck = await this.truckRepository.findOne({ truckNo: devName });
    if (
      !truck ||
      !(await this.checkCanTracking(truck.blackBoxType, (request as any).user))
    ) {
      return false;
    }
    switch (truck.blackBoxType) {
      case BLACK_BOX_TYPE.DINH_VI_HOP_QUY:
        return (
          (await this.dinhViHopQuyService.historyTrackingDevice(
            devName,
            fromDate,
            toDate,
          )) || []
        );
      case BLACK_BOX_TYPE.ANTECK:
        return (
          (await this.anteckService.historyTrackingDevice(
            devName,
            fromDate,
            toDate,
          )) || []
        );
      case BLACK_BOX_TYPE.VIETMAP:
        return (
          (await this.vietmapService.historyTrackingDevice(
            devName,
            fromDate,
            toDate,
          )) || []
        );
    }
  }

  async trackingTruckHistoryLog(
    filterRequestDto: FilterRequestDto,
  ): Promise<any> {
    const {
      orderId,
      truckId,
      fromDate,
      toDate,
      skip,
      take,
      orderBy,
      orderDirection,
    } = filterRequestDto;

    const tracking = await this.trackingBlackBoxRepository.findOne(
      { orderId, truckId },
      { select: ['id'] },
    );
    if (!tracking.id) {
      return [];
    }

    const options: FindManyOptions<TrackingBlackBoxLog> = {
      skip,
      take,
    };

    options.where = {
      trackingBlackBoxId: tracking.id,
      trackingDate: Between(
        moment(fromDate).format('YYYY-MM-DD HH:mm:ss'),
        moment(toDate).format('YYYY-MM-DD HH:mm:ss'),
      ),
    };

    if (orderBy) {
      options.order = {
        [orderBy]: orderDirection,
      };
    } else {
      options.order = {
        id: 'DESC',
      };
    }

    const [
      trackingLog,
      count,
    ] = await this.trackingBlackBoxLogRepository.findAndCount(options);

    return new PaginationResult<DinhViHopQuyTracking>(
      trackingLog.map(item => new DinhViHopQuyTracking(item.trackingInfo)),
      count,
    );
  }

  @Interval(10000)
  async getOrdersTracking() {
    const orders = await this.orderEntityRepository.find({
      where: {
        status: In([ORDER_STATUS.PICKING, ORDER_STATUS.DELIVERING]),
      },
      select: ['id'],
    });
    for (const order of orders) {
      this.tracking(order.id);
    }
  }

  async tracking(orderId: number): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['trucks'],
      select: ['id', 'trucks'],
    });

    if (!order || !order.trucks) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.NOT_FOUND,
      );
    }

    for (const truck of order.trucks) {
      if (truck.truckNo) {
        let trackingInfo: any = null;
        switch (truck.blackBoxType) {
          case BLACK_BOX_TYPE.DINH_VI_HOP_QUY:
            trackingInfo = await this.dinhViHopQuyService.trackingDevice(
              truck.truckNo,
            );
            break;
          case BLACK_BOX_TYPE.ANTECK:
            trackingInfo = await this.anteckService.trackingDevice(
              truck.truckNo,
            );
            break;
          case BLACK_BOX_TYPE.VIETMAP:
            trackingInfo = await this.vietmapService.trackingDevice(
              truck.truckNo,
            );
            break;
        }
        if (trackingInfo) {
          this.createTracking(
            orderId,
            truck.id,
            truck.blackBoxType,
            trackingInfo,
          );
        }
      }
    }
  }

  async createTracking(
    orderId: number,
    truckId: number,
    type: string,
    trackingInfo: any,
  ): Promise<boolean> {
    let track = await this.trackingBlackBoxRepository.findOne({
      where: { orderId, truckId },
    });

    if (track) {
      if (JSON.stringify(track.trackingInfo) === JSON.stringify(trackingInfo)) {
        return true;
      }
      track.trackingInfo = trackingInfo;
    } else {
      track = this.trackingBlackBoxRepository.create({
        orderId,
        truckId,
        type,
        trackingInfo,
      });
    }

    await this.trackingBlackBoxRepository.save(track);
    if (this.configService.get('LOG_TRACKING_BLACKBOX') !== 'off') {
      let trackingDate = moment().format('YYYY-MM-DD HH:mm:ss');
      switch (type) {
        case BLACK_BOX_TYPE.DINH_VI_HOP_QUY:
          if (track.trackingInfo?.Trktime) {
            trackingDate = moment(
              track.trackingInfo?.Trktime,
              'M/D/YYYY h:mm:ss A',
            ).format('YYYY-MM-DD HH:mm:ss');
          }
          break;
        case BLACK_BOX_TYPE.VIETMAP:
          trackingDate = moment(track.trackingInfo.GpsTime).format(
            'YYYY-MM-DD HH:mm:ss',
          );
          break;
      }
      const trackLog = this.trackingBlackBoxLogRepository.create({
        trackingBlackBox: track,
        trackingDate,
        trackingInfo,
      });

      await this.trackingBlackBoxLogRepository.save(trackLog);
    }

    return true;
  }

  async getBlackBoxInfo(devName: string): Promise<any> {
    const dinhViHopQuy = await this.dinhViHopQuyService.getDeviceId(devName);
    if (dinhViHopQuy) {
      return {
        devId: dinhViHopQuy,
        type: BLACK_BOX_TYPE.DINH_VI_HOP_QUY,
      };
    }
    const anteck = await this.anteckService.getDeviceId(devName);
    if (anteck) {
      return {
        devId: anteck,
        type: BLACK_BOX_TYPE.ANTECK,
      };
    }
    const vietmap = await this.vietmapService.getDeviceId(devName);
    if (vietmap) {
      return {
        devId: vietmap,
        type: BLACK_BOX_TYPE.VIETMAP,
      };
    }
    return null;
  }

  async checkCanTracking(type: BLACK_BOX_TYPE, user: any): Promise<boolean> {
    const setting = await this.settingRepository.findOne();

    if (!setting || setting.license !== LICENSE.PREMIUM) {
      return false;
    }

    if (
      user &&
      user.type === TOKEN_TYPE.TRUCK_OWNER_LOGIN &&
      !setting.displayOn.includes(DISPLAY_ON.TRUCKOWNER)
    ) {
      return false;
    }

    if (
      user &&
      user.type === TOKEN_TYPE.CUSTOMER_LOGIN &&
      !setting.displayOn.includes(DISPLAY_ON.CUSTOMER)
    ) {
      return false;
    }

    if (!TOKEN_TYPE.ADMIN_LOGIN && !setting.blackBoxType.includes(type)) {
      return false;
    }

    return true;
  }
}
