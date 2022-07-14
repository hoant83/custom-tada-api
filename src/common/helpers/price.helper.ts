/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { HttpService, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseString } from 'fast-csv';
import * as moment from 'moment';
import { OrderRequestDto } from 'src/dto/order/order-request.dto';
import { PriceDto } from 'src/dto/public/price.dto';
import {
  NON_MOTORIZED_TYPE,
  CONCATENATED_GOODS_TYPE,
  CONTRACT_CAR_TYPE,
  TRUCK_PAYLOAD_IMPORT,
  TRUCK_TYPE_DEFAULT,
  TRUCK_TYPE_IMPORT,
  NON_MOTORIZED_TYPE_IMPORT,
  NON_MOTORIZED_PAYLOAD_IMPORT,
  CONCATENATED_GOODS_PAYLOAD_IMPORT,
  CONCATENATED_GOODS_TYPE_IMPORT,
  CONTRACT_CAR_TYPE_IMPORT,
  CONTRACT_CAR_PAYLOAD_IMPORT,
} from 'src/entities/default-reference/enums/defaultRef.enum';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { CARGO_TYPE } from 'src/entities/order/enums/cargo-type.enum';
import { CONTAINER_SIZE_IMPORT } from 'src/entities/order/enums/container-size.enum';
import { CONTAINER_TYPE_IMPORT } from 'src/entities/order/enums/container-type.enum';
import { ORDER_TYPE } from 'src/entities/order/enums/order-type.enum';
import {
  SERVICE_TYPE,
  SERVICE_TYPE_IMPORT,
} from 'src/entities/order/enums/service-type.enum';
import { PRICE_OPTIONS } from 'src/entities/pricing/enums/priceOption.enum';
import { SurCharges } from 'src/entities/surcharges/surcharges.entity';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from '../constants/response-messages.enum';
import { customThrowError } from './throw.helper';

@Injectable()
export class PriceHelper {
  endpoint: string;
  googleApiKey: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.endpoint = this.configService.get('GOOGLE_MAPS_API');
    this.googleApiKey = this.configService.get('GOOGLE_MAPS_API_KEY');
  }
  public async baseFare(
    trucktype:
      | TRUCK_TYPE_DEFAULT
      | null
      | NON_MOTORIZED_TYPE
      | CONCATENATED_GOODS_TYPE
      | CONTRACT_CAR_TYPE,
    serviceType: SERVICE_TYPE,
    pricing: any,
  ): Promise<number> {
    let price = 0;
    if (!trucktype) {
      if (pricing.truckTypeFares.length > 0) {
        for (let i = 0; i < pricing.truckTypeFares.length; i++) {
          if (pricing.truckTypeFares[i].truckType.includes('0')) {
            price +=
              pricing.truckTypeFares[i].price !== null
                ? pricing.truckTypeFares[i].price
                : 0;
            break;
          }
        }
      }
      if (price === 0) {
        switch (serviceType) {
          case SERVICE_TYPE.NORMAL_TRUCK_VAN:
            price +=
              pricing.baseFareNormal !== null ? pricing.baseFareNormal : 0;
            break;
          case SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK:
            price +=
              pricing.baseFareTractor !== null ? pricing.baseFareTractor : 0;
            break;
          case SERVICE_TYPE.NON_MOTORIZED_VEHICLE:
            price +=
              pricing.baseFareNonMotorized !== null
                ? pricing.baseFareNonMotorized
                : 0;
            break;
        }
      }
      return price;
    }

    if (pricing.truckTypeFares.length > 0 && trucktype) {
      for (let i = 0; i < pricing.truckTypeFares.length; i++) {
        if (pricing.truckTypeFares[i].truckType.includes(`${trucktype}`)) {
          price +=
            pricing.truckTypeFares[i].price !== null
              ? pricing.truckTypeFares[i].price
              : 0;
          break;
        }
      }
      if (price === 0) {
        for (let i = 0; i < pricing.truckTypeFares.length; i++) {
          if (pricing.truckTypeFares[i].truckType.includes('0')) {
            price +=
              pricing.truckTypeFares[i].price !== null
                ? pricing.truckTypeFares[i].price
                : 0;
            break;
          }
        }
      }
      if (price === 0) {
        switch (serviceType) {
          case SERVICE_TYPE.NORMAL_TRUCK_VAN:
            price +=
              pricing.baseFareNormal !== null ? pricing.baseFareNormal : 0;
            break;
          case SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK:
            price +=
              pricing.baseFareTractor !== null ? pricing.baseFareTractor : 0;
            break;
          case SERVICE_TYPE.NON_MOTORIZED_VEHICLE:
            price +=
              pricing.baseFareNonMotorized !== null
                ? pricing.baseFareNonMotorized
                : 0;
            break;
          case SERVICE_TYPE.CONCATENATED_GOODS:
            price +=
              pricing.baseFareConcatenatedGoods !== null
                ? pricing.baseFareConcatenatedGoods
                : 0;
            break;
          case SERVICE_TYPE.CONTRACT_CAR:
            price +=
              pricing.baseFareContractCar !== null
                ? pricing.baseFareContractCar
                : 0;
            break;
        }
      }
    }

    return price;
  }

  public async handlePayload(
    payload: any,
    payloadPricing: any[],
    basePrice: number,
  ) {
    let pricing = 0;
    payloadPricing = payloadPricing.reverse();
    for (let i = 0; i < payloadPricing.length; i++) {
      if (payloadPricing[i].payload.includes(payload ? `${payload}` : '0')) {
        if (payloadPricing[i].price === null) {
          break;
        }
        if (payloadPricing[i].priceOption === PRICE_OPTIONS.PERCENTAGE) {
          pricing += basePrice * (payloadPricing[i].price / 100);
        } else {
          pricing +=
            payloadPricing[i].price !== null
              ? payloadPricing[i].price
              : payloadPricing[i].price;
        }
        break;
      }
      if (pricing !== 0) {
        break;
      }
    }

    if (pricing === 0) {
      for (let i = 0; i < payloadPricing.length; i++) {
        if (payloadPricing[i].payload.includes('0')) {
          if (payloadPricing[i].price === null) {
            break;
          }
          if (payloadPricing[i].priceOption === PRICE_OPTIONS.PERCENTAGE) {
            pricing += basePrice * (payloadPricing[i].price / 100);
          } else {
            pricing +=
              payloadPricing[i].price !== null
                ? payloadPricing[i].price
                : payloadPricing[i].price;
          }
          break;
        }
      }
    }
    return pricing;
  }

  public async handleDistance(
    pickupAddress: number[],
    dropOffFields: any[],
    distancePrices: any[],
    payload: number | string,
    truckType: number | string,
  ): Promise<number> {
    let price = 0;
    distancePrices = distancePrices.reverse();
    const distance = await this.getDistances(pickupAddress, dropOffFields);
    let distanceData = [];
    for (let i = 0; i < distancePrices.length; i++) {
      if (+payload >= 20) {
        if (distancePrices[i].payload.includes(`${payload}`)) {
          distanceData = distancePrices[i].distances;
          break;
        }
        continue;
      } else {
        if (
          (distancePrices[i].payload.includes(`${payload}`) ||
            distancePrices[i].payload.includes('0')) &&
          (distancePrices[i].truckType.includes(`${truckType}`) ||
            distancePrices[i].truckType.includes('0'))
        ) {
          distanceData = distancePrices[i].distances;
          break;
        }
      }
    }
    if (distanceData.length === 0 && +payload >= 20) {
      for (let i = 0; i < distancePrices.length; i++) {
        if (distancePrices[i].payload.includes('0')) {
          distanceData = distancePrices[i].distances;
          break;
        }
      }
    }

    if (distanceData.length === 0) {
      return 0;
    }
    for (let i = 0; i < distanceData.length; i++) {
      if (
        distanceData[i].costPerKm === null ||
        distanceData[i].from === null ||
        distanceData[i].to === null
      ) {
        continue;
      }
      if (distanceData[i].from < distance && distanceData[i].to > distance) {
        price += distance * distanceData[i].costPerKm;
        break;
      }
    }

    return price;
  }

  async getDistances(pickupAddress: number[], dropOffFields: any[]) {
    if (!pickupAddress) {
      return 0;
    }
    let distance = 0;
    const distanceArr = [];
    distanceArr.push(pickupAddress);

    for (let i = 0; i < dropOffFields.length; i++) {
      if (!dropOffFields[i].dropoffAddress) {
        return 0;
      }
      distanceArr.push(dropOffFields[i].dropoffAddress);
    }

    const distanceLength = distanceArr.length;
    if (distanceLength === 0) {
      return 0;
    }

    for (let i = 0; i < distanceLength - 1; i++) {
      distance += await this.getDistanceByPair(
        distanceArr[i],
        distanceArr[i + 1],
      );
    }
    return distance;
  }

  async getDistanceByPair(p1: number[], p2: number[]): Promise<number> {
    const api = await this.httpService
      .get(
        `${this.endpoint}/distancematrix/json?origins=${p1[0]},${p1[1]}&destinations=${p2[0]},${p2[1]}&key=${this.googleApiKey}`,
      )
      .toPromise();
    const result = api.data.rows[0].elements[0].distance;
    if (result?.value) {
      return result?.value / 1000;
    } else {
      return 0;
    }
  }

  async getDistanceData(p1: number[], p2: number[]): Promise<any> {
    const api = await this.httpService
      .get(
        `${this.endpoint}/distancematrix/json?origins=${p1[0]},${p1[1]}&destinations=${p2[0]},${p2[1]}&key=${this.googleApiKey}`,
      )
      .toPromise();
    const result = api.data.rows[0].elements;

    return result;
  }

  public async MultipleStopsCharges(
    multipleStopsCharges: any[],
    basePrice: number,
    orderModel: OrderRequestDto | PriceDto,
  ): Promise<number> {
    let price = 0;
    multipleStopsCharges = multipleStopsCharges.reverse();
    const truckType = orderModel?.truckType
      ? `${orderModel?.truckType}`
      : orderModel?.nonMotorizedType
      ? `${orderModel?.nonMotorizedType}`
      : '0';
    const truckPayload = orderModel?.truckPayload
      ? `${orderModel?.truckPayload}`
      : orderModel?.containerSize
      ? `${orderModel?.containerSize}`
      : '0';
    const totalStops = orderModel.dropOffFields.length;
    if (totalStops === 1) {
      return price;
    }
    const settingLength = multipleStopsCharges.length;
    for (let j = 0; j < settingLength; j++) {
      if (
        ((multipleStopsCharges[j].truckType.length === 0
          ? true
          : multipleStopsCharges[j].truckType.includes(truckType)) ||
          multipleStopsCharges[j].truckType.includes('0')) &&
        ((multipleStopsCharges[j].truckPayload.length === 0
          ? true
          : multipleStopsCharges[j].truckPayload.includes(truckPayload)) ||
          multipleStopsCharges[j].truckPayload.includes('0'))
      ) {
        switch (multipleStopsCharges[j].multipleStopPriceOption) {
          case PRICE_OPTIONS.PERCENTAGE:
            price +=
              basePrice * (multipleStopsCharges[j].multipleStopPrice / 100);
            break;
          case PRICE_OPTIONS.VALUE:
            price += multipleStopsCharges[j].multipleStopPrice;
            break;
          default:
            break;
        }
      }
      if (price !== 0) {
        const result = price * (totalStops - 1);
        return result;
      }
    }
    return price;
  }

  public async additionalCharges(
    surCharges: SurCharges,
    basePrice: number,
    orderModel: OrderRequestDto | PriceDto,
  ): Promise<number> {
    let price = 0;
    if (
      orderModel.truckPayload !== null &&
      +surCharges.payloadMoreThan <= +orderModel.cargoWeight &&
      surCharges.heavyCargoPrice !== null
    ) {
      if (surCharges.heavyCargoPriceOption === PRICE_OPTIONS.PERCENTAGE) {
        price += basePrice * (surCharges.heavyCargoPrice / 100);
      } else {
        price += surCharges.heavyCargoPrice;
      }
    }

    if (surCharges.specialGoodsPrice !== null) {
      if (orderModel.cargoType !== CARGO_TYPE.STANDARD) {
        price +=
          surCharges.specialGoodsPriceOption === PRICE_OPTIONS.PERCENTAGE
            ? basePrice * (surCharges.specialGoodsPrice / 100)
            : surCharges.specialGoodsPrice;
      }
    }

    return price;
  }

  public async dynamicPrice(
    dynamicPrices: DynamicCharges[],
    basePrice: number,
    orderModel: OrderRequestDto | PriceDto,
  ): Promise<number> {
    let price = 0;
    const requests = orderModel.specialRequests;
    requests.map((u, index) => {
      if (u !== -1 && u !== -2) {
        dynamicPrices.map(i => {
          if (i.id === +u) {
            if (i.cost !== null) {
              if (i.priceOption === PRICE_OPTIONS.PERCENTAGE) {
                price += basePrice * (i.cost / 100);
              } else {
                price += i.cost;
              }
            }
          }
        });
      }
    });
    return price;
  }

  public async zonePrice(
    zonePrices: any[],
    orderModel: OrderRequestDto | PriceDto,
  ): Promise<number> {
    let price = 0;
    let anyPrice = 0;
    const pickup = orderModel.pickupAddress;
    const dropoff = orderModel.dropOffFields;
    const dropoffCity = new Array(dropoff.length);
    dropoffCity[0] = await this._getCity(pickup);
    zonePrices = zonePrices.reverse();
    for (let i = 0; i < dropoff.length; i++) {
      dropoffCity[i + 1] = await this._getCity(dropoff[i].dropoffAddress);
    }
    for (let i = 0; i < zonePrices.length; i++) {
      if (
        zonePrices[i].payload.includes(
          orderModel.truckPayload ? `${orderModel.truckPayload}` : '0',
        )
      ) {
        let k = 0;
        while (k + 1 <= dropoffCity.length) {
          if (
            dropoffCity[k] === zonePrices[i].pickupZoneArea &&
            dropoffCity[k + 1] === zonePrices[i].dropoffZoneArea
          ) {
            price += zonePrices[i].cost ? zonePrices[i].cost : 0;
          }
          k++;
        }
      }
      if (zonePrices[i].payload.includes('0') && anyPrice === 0) {
        let h = 0;
        while (h + 1 <= dropoffCity.length) {
          if (anyPrice !== 0) {
            break;
          }
          if (
            dropoffCity[h] === zonePrices[i].pickupZoneArea &&
            dropoffCity[h + 1] === zonePrices[i].dropoffZoneArea
          ) {
            anyPrice += zonePrices[i].cost ? zonePrices[i].cost : 0;
          }
          h++;
        }
      }
      if (price !== 0) {
        return price;
      }
    }

    if (anyPrice !== 0) {
      return anyPrice;
    }

    for (let l = 0; l < zonePrices.length; l++) {
      if (zonePrices[l].payload.includes('0')) {
        let c = 0;
        while (c + 1 <= dropoffCity.length) {
          if (dropoffCity[c] === dropoffCity[c + 1]) {
            price += zonePrices[l].sameZone ? zonePrices[l].sameZone : 0;
          }
          c++;
        }
        if (price !== 0) {
          break;
        }
      }
    }

    return price;
  }

  private async _getCity(dropoffAddress: number[]): Promise<any> {
    const data = await this.httpService
      .get(
        `${this.endpoint}/geocode/json?address=${dropoffAddress[0]},${dropoffAddress[1]}&key=${this.googleApiKey}`,
      )
      .toPromise();
    const result = data.data.results[0];
    for (let i = 0; i < result.address_components.length; i++) {
      if (
        result.address_components[i].types[0] === 'administrative_area_level_1'
      ) {
        return result.address_components[i].short_name
          .replace('Thành phố ', '')
          .replace('Tỉnh ', '')
          .replace('thành phố ', '');
      }
    }
    if (!result) {
      customThrowError(RESPONSE_MESSAGES.ERROR, HttpStatus.BAD_REQUEST);
    }
  }

  async csvToJson(data: any, type: SERVICE_TYPE): Promise<any> {
    return new Promise((resolve, rejects) => {
      const dataArr = [];
      const trailorHeader = [
        'referenceNo',
        'containerType',
        'containerSize',
        'containerQuantity',
        'cargoName',
        'pickupTime',
        'pickupAddressText',
        'pickupContactNo',
        'dropoffAddressTextFirst',
        'dropoffContactNoFirst',
        'dropoffAddressTextSec',
        'dropoffContactNoSec',
        'assignToFavEmail',
        'otherGeneralNotes',
        'inChargeContactNo',
        'dropOffFields',
        'pickupAddress',
      ];
      const normalHeader = [
        'referenceNo',
        'truckType',
        'truckPayload',
        'truckQuantity',
        'cargoName',
        'pickupTime',
        'pickupAddressText',
        'pickupContactNo',
        'dropoffAddressTextFirst',
        'dropoffContactNoFirst',
        'dropoffAddressTextSec',
        'dropoffContactNoSec',
        'assignToFavEmail',
        'otherGeneralNotes',
        'inChargeContactNo',
        'dropOffFields',
        'pickupAddress',
      ];
      const nonMotorizedHeader = [
        'referenceNo',
        'nonMotorizedType',
        'nonMotorizedQuantity',
        'nonMotorizedPayload',
        'cargoName',
        'pickupTime',
        'pickupAddressText',
        'pickupContactNo',
        'dropoffAddressTextFirst',
        'dropoffContactNoFirst',
        'dropoffAddressTextSec',
        'dropoffContactNoSec',
        'assignToFavEmail',
        'otherGeneralNotes',
        'inChargeContactNo',
        'dropOffFields',
        'pickupAddress',
      ];
      const concatenatedHeader = [
        'referenceNo',
        'concatenatedGoodsType',
        'concatenatedGoodsQuantity',
        'concatenatedGoodsPayload',
        'cargoName',
        'pickupTime',
        'pickupAddressText',
        'pickupContactNo',
        'dropoffAddressTextFirst',
        'dropoffContactNoFirst',
        'dropoffAddressTextSec',
        'dropoffContactNoSec',
        'assignToFavEmail',
        'otherGeneralNotes',
        'inChargeContactNo',
        'dropOffFields',
        'pickupAddress',
      ];
      const contractCarHeader = [
        'referenceNo',
        'contractCarType',
        'contractCarQuantity',
        'contractCarPayload',
        'cargoName',
        'pickupTime',
        'pickupAddressText',
        'pickupContactNo',
        'dropoffAddressTextFirst',
        'dropoffContactNoFirst',
        'dropoffAddressTextSec',
        'dropoffContactNoSec',
        'assignToFavEmail',
        'otherGeneralNotes',
        'inChargeContactNo',
        'dropOffFields',
        'pickupAddress',
      ];
      const optionParseString = {
        ignoreEmpty: true,
        headers: [],
        renameHeaders: true,
        discardUnmappedColumns: true,
        skipLines: 3,
      };
      switch (type) {
        case SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK:
          optionParseString.headers = trailorHeader;
          break;
        case SERVICE_TYPE.NORMAL_TRUCK_VAN:
          optionParseString.headers = normalHeader;
          break;
        case SERVICE_TYPE.NON_MOTORIZED_VEHICLE:
          optionParseString.headers = nonMotorizedHeader;
          break;
        case SERVICE_TYPE.CONCATENATED_GOODS:
          optionParseString.headers = concatenatedHeader;
          break;
        case SERVICE_TYPE.CONTRACT_CAR:
          optionParseString.headers = contractCarHeader;
          break;
      }
      parseString(data, optionParseString)
        .on('error', error => {
          resolve(false);
        })
        .on('data', row => dataArr.push(row))
        .on('end', () => {
          resolve(dataArr);
        });
    });
  }

  async csvToJsonQuick(data: any): Promise<any> {
    return new Promise(resolve => {
      const dataArr = [];
      const quickHeader = [
        'referenceNo',
        'serviceType',
        'pickupAddressText',
        'dropoffAddressText',
        'detailRequest',
        'assignToFavEmail',
        'inChargeContactNo',
        'dropOffFields',
        'pickupAddress',
      ];
      parseString(data, {
        ignoreEmpty: true,
        headers: quickHeader,
        renameHeaders: true,
        discardUnmappedColumns: true,
        skipLines: 3,
      })
        .on('error', error => {
          resolve(false);
        })
        .on('data', row => dataArr.push(row))
        .on('end', () => {
          resolve(dataArr);
        });
    });
  }

  processData = async (
    data: any,
    orderType: ORDER_TYPE,
    serviceType: SERVICE_TYPE,
    user: Record<string, unknown>,
  ) => {
    const dataNew = [];
    for (let i = 0; i < data.length; i++) {
      if (
        !data[i].pickupAddressText ||
        data[i].pickupAddressText === '' ||
        !data[i]?.dropoffAddressTextFirst ||
        data[i]?.dropoffAddressTextFirst === ''
      ) {
        customThrowError(
          RESPONSE_MESSAGES.PICKUP_DROPOFF_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
          RESPONSE_MESSAGES_CODE.PICKUP_DROPOFF_NOT_FOUND,
        );
      }
      data[i].containerType = CONTAINER_TYPE_IMPORT[data[i].containerType];
      data[i].containerSize = CONTAINER_SIZE_IMPORT[data[i].containerSize];

      const dataPickup = await this.getAddress(data[i].pickupAddressText);
      data[i].pickupAddress =
        dataPickup && dataPickup?.address ? dataPickup?.address : null;
      data[i].pickupCity =
        dataPickup && dataPickup?.city ? dataPickup?.city : null;
      const dataDropoff = await this.getAddress(
        data[i].dropoffAddressTextFirst,
      );
      data[i].dropOffFields = [
        {
          dropoffAddress:
            dataDropoff && dataDropoff?.address ? dataDropoff?.address : null,
          dropoffAddressText: data[i].dropoffAddressTextFirst,
          dropoffContact: '',
          dropoffContactNo: data[i].dropoffContactNoFirst,
          dropoffTime: '',
        },
      ];
      if (
        data[i].dropoffAddressTextSec &&
        data[i].dropoffAddressTextSec !== ''
      ) {
        const dataDropoffSec = await this.getAddress(
          data[i].dropoffAddressTextSec,
        );
        data[i].dropOffFields.push({
          dropoffAddress:
            dataDropoffSec && dataDropoffSec?.address
              ? dataDropoffSec?.address
              : null,
          dropoffAddressText: data[i].dropoffAddressTextSec,
          dropoffContact: '',
          dropoffContactNo: data[i].dropoffContactNoSec,
          dropoffTime: '',
        });
      }

      data[i].serviceType = serviceType;
      data[i].orderType = orderType;
      data[i].cargoType = CARGO_TYPE.STANDARD;
      data[i].pickupTime = data[i].pickupTime
        ? moment(data[i].pickupTime, 'DD-MM-YYYY').toDate()
        : null;
      dataNew.push(data);
    }
    return dataNew;
  };

  processDataNormalTruck = async (
    data: any,
    orderType: ORDER_TYPE,
    serviceType: SERVICE_TYPE,
    user: Record<string, unknown>,
  ) => {
    const dataNew = [];
    for (let i = 0; i < data.length; i++) {
      if (
        !data[i].pickupAddressText ||
        data[i].pickupAddressText === '' ||
        !data[i]?.dropoffAddressTextFirst ||
        data[i]?.dropoffAddressTextFirst === ''
      ) {
        customThrowError(
          RESPONSE_MESSAGES.PICKUP_DROPOFF_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
          RESPONSE_MESSAGES_CODE.PICKUP_DROPOFF_NOT_FOUND,
        );
      }
      data[i].truckType = TRUCK_TYPE_IMPORT[data[i].truckType];
      data[i].truckPayload = TRUCK_PAYLOAD_IMPORT[data[i].truckPayload];

      const dataPickup = await this.getAddress(data[i].pickupAddressText);
      data[i].pickupAddress =
        dataPickup && dataPickup?.address ? dataPickup?.address : null;
      data[i].pickupCity =
        dataPickup && dataPickup?.city ? dataPickup?.city : null;
      const dataDropoff = await this.getAddress(
        data[i].dropoffAddressTextFirst,
      );
      data[i].dropOffFields = [
        {
          dropoffAddress:
            dataDropoff && dataDropoff?.address ? dataDropoff?.address : null,
          dropoffAddressText: data[i].dropoffAddressTextFirst,
          dropoffContact: '',
          dropoffContactNo: data[i].dropoffContactNoFirst,
          dropoffTime: '',
        },
      ];
      if (
        data[i].dropoffAddressTextSec &&
        data[i].dropoffAddressTextSec !== ''
      ) {
        const dataDropoffSec = await this.getAddress(
          data[i].dropoffAddressTextSec,
        );
        data[i].dropOffFields.push({
          dropoffAddress:
            dataDropoffSec && dataDropoffSec?.address
              ? dataDropoffSec?.address
              : null,
          dropoffAddressText: data[i].dropoffAddressTextSec,
          dropoffContact: '',
          dropoffContactNo: data[i].dropoffContactNoSec,
          dropoffTime: '',
        });
      }

      data[i].serviceType = serviceType;
      data[i].orderType = orderType;
      data[i].cargoType = CARGO_TYPE.STANDARD;
      data[i].pickupTime = data[i].pickupTime
        ? moment(data[i].pickupTime, 'DD-MM-YYYY').toDate()
        : null;
      dataNew.push(data);
    }
    return dataNew;
  };

  processDataQuickTruck = async (
    data: any,
    orderType: ORDER_TYPE,
    user: Record<string, unknown>,
  ) => {
    const dataNew = [];
    for (let i = 0; i < data.length; i++) {
      if (
        !data[i].pickupAddressText ||
        data[i].pickupAddressText === '' ||
        !data[i]?.dropoffAddressText ||
        data[i]?.dropoffAddressText === ''
      ) {
        customThrowError(
          RESPONSE_MESSAGES.PICKUP_DROPOFF_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
          RESPONSE_MESSAGES_CODE.PICKUP_DROPOFF_NOT_FOUND,
        );
      }
      data[i].serviceType = SERVICE_TYPE_IMPORT[data[i].serviceType];

      const dataPickup = await this.getAddress(data[i].pickupAddressText);
      data[i].pickupAddress =
        dataPickup && dataPickup?.address ? dataPickup?.address : null;
      data[i].pickupCity =
        dataPickup && dataPickup?.city ? dataPickup?.city : null;
      const dataDropoff = await this.getAddress(
        data[i].dropoffAddressTextFirst,
      );
      data[i].dropOffFields = [
        {
          dropoffAddress:
            dataDropoff && dataDropoff?.address ? dataDropoff?.address : null,
          dropoffAddressText: data[i].dropoffAddressText,
          dropoffContact: '',
          dropoffContactNo: '',
          dropoffTime: '',
        },
      ];
      data[i].orderType = orderType;
      dataNew.push(data);
    }
    return dataNew;
  };

  processDataNonMotorized = async (
    data: any,
    orderType: ORDER_TYPE,
    serviceType: SERVICE_TYPE,
    user: Record<string, unknown>,
  ) => {
    const dataNew = [];
    for (let i = 0; i < data.length; i++) {
      if (
        !data[i].pickupAddressText ||
        data[i].pickupAddressText === '' ||
        !data[i]?.dropoffAddressTextFirst ||
        data[i]?.dropoffAddressTextFirst === ''
      ) {
        customThrowError(
          RESPONSE_MESSAGES.PICKUP_DROPOFF_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
          RESPONSE_MESSAGES_CODE.PICKUP_DROPOFF_NOT_FOUND,
        );
      }

      data[i].nonMotorizedType =
        NON_MOTORIZED_TYPE_IMPORT[data[i].nonMotorizedType];
      data[i].nonMotorizedPayload =
        NON_MOTORIZED_PAYLOAD_IMPORT[data[i].nonMotorizedPayload];

      const dataPickup = await this.getAddress(data[i].pickupAddressText);
      data[i].pickupAddress =
        dataPickup && dataPickup?.address ? dataPickup?.address : null;
      data[i].pickupCity =
        dataPickup && dataPickup?.city ? dataPickup?.city : null;
      const dataDropoff = await this.getAddress(
        data[i].dropoffAddressTextFirst,
      );
      data[i].dropOffFields = [
        {
          dropoffAddress:
            dataDropoff && dataDropoff?.address ? dataDropoff?.address : null,
          dropoffAddressText: data[i].dropoffAddressTextFirst,
          dropoffContact: '',
          dropoffContactNo: data[i].dropoffContactNoFirst,
          dropoffTime: '',
        },
      ];
      if (
        data[i].dropoffAddressTextSec &&
        data[i].dropoffAddressTextSec !== ''
      ) {
        const dataDropoffSec = await this.getAddress(
          data[i].dropoffAddressTextSec,
        );
        data[i].dropOffFields.push({
          dropoffAddress:
            dataDropoffSec && dataDropoffSec?.address
              ? dataDropoffSec?.address
              : null,
          dropoffAddressText: data[i].dropoffAddressTextSec,
          dropoffContact: '',
          dropoffContactNo: data[i].dropoffContactNoSec,
          dropoffTime: '',
        });
      }

      data[i].serviceType = serviceType;
      data[i].orderType = orderType;
      data[i].cargoType = CARGO_TYPE.STANDARD;
      data[i].pickupTime = data[i].pickupTime
        ? moment(data[i].pickupTime, 'DD-MM-YYYY').toDate()
        : null;
      dataNew.push(data);
    }
    return dataNew;
  };

  processDataConcatenated = async (
    data: any,
    orderType: ORDER_TYPE,
    serviceType: SERVICE_TYPE,
    user: Record<string, unknown>,
  ) => {
    const dataNew = [];
    for (let i = 0; i < data.length; i++) {
      if (
        !data[i].pickupAddressText ||
        data[i].pickupAddressText === '' ||
        !data[i]?.dropoffAddressTextFirst ||
        data[i]?.dropoffAddressTextFirst === ''
      ) {
        customThrowError(
          RESPONSE_MESSAGES.PICKUP_DROPOFF_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
          RESPONSE_MESSAGES_CODE.PICKUP_DROPOFF_NOT_FOUND,
        );
      }

      data[i].concatenatedGoodsType =
        CONCATENATED_GOODS_TYPE_IMPORT[data[i].concatenatedGoodsType];
      data[i].concatenatedGoodsPayload =
        CONCATENATED_GOODS_PAYLOAD_IMPORT[data[i].concatenatedGoodsPayload];

      const dataPickup = await this.getAddress(data[i].pickupAddressText);
      data[i].pickupAddress =
        dataPickup && dataPickup?.address ? dataPickup?.address : null;
      data[i].pickupCity =
        dataPickup && dataPickup?.city ? dataPickup?.city : null;
      const dataDropoff = await this.getAddress(
        data[i].dropoffAddressTextFirst,
      );
      data[i].dropOffFields = [
        {
          dropoffAddress:
            dataDropoff && dataDropoff?.address ? dataDropoff?.address : null,
          dropoffAddressText: data[i].dropoffAddressTextFirst,
          dropoffContact: '',
          dropoffContactNo: data[i].dropoffContactNoFirst,
          dropoffTime: '',
        },
      ];
      if (
        data[i].dropoffAddressTextSec &&
        data[i].dropoffAddressTextSec !== ''
      ) {
        const dataDropoffSec = await this.getAddress(
          data[i].dropoffAddressTextSec,
        );
        data[i].dropOffFields.push({
          dropoffAddress:
            dataDropoffSec && dataDropoffSec?.address
              ? dataDropoffSec?.address
              : null,
          dropoffAddressText: data[i].dropoffAddressTextSec,
          dropoffContact: '',
          dropoffContactNo: data[i].dropoffContactNoSec,
          dropoffTime: '',
        });
      }

      data[i].serviceType = serviceType;
      data[i].orderType = orderType;
      data[i].cargoType = CARGO_TYPE.STANDARD;
      data[i].pickupTime = data[i].pickupTime
        ? moment(data[i].pickupTime, 'DD-MM-YYYY').toDate()
        : null;
      dataNew.push(data);
    }
    return dataNew;
  };

  processDataContractCar = async (
    data: any,
    orderType: ORDER_TYPE,
    serviceType: SERVICE_TYPE,
    user: Record<string, unknown>,
  ) => {
    const dataNew = [];
    for (let i = 0; i < data.length; i++) {
      if (
        !data[i].pickupAddressText ||
        data[i].pickupAddressText === '' ||
        !data[i]?.dropoffAddressTextFirst ||
        data[i]?.dropoffAddressTextFirst === ''
      ) {
        customThrowError(
          RESPONSE_MESSAGES.PICKUP_DROPOFF_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
          RESPONSE_MESSAGES_CODE.PICKUP_DROPOFF_NOT_FOUND,
        );
      }

      data[i].contractCarType =
        CONTRACT_CAR_TYPE_IMPORT[data[i].contractCarType];
      data[i].contractCarPayload =
        CONTRACT_CAR_PAYLOAD_IMPORT[data[i].contractCarPayload];

      const dataPickup = await this.getAddress(data[i].pickupAddressText);
      data[i].pickupAddress =
        dataPickup && dataPickup?.address ? dataPickup?.address : null;
      data[i].pickupCity =
        dataPickup && dataPickup?.city ? dataPickup?.city : null;
      const dataDropoff = await this.getAddress(
        data[i].dropoffAddressTextFirst,
      );
      data[i].dropOffFields = [
        {
          dropoffAddress:
            dataDropoff && dataDropoff?.address ? dataDropoff?.address : null,
          dropoffAddressText: data[i].dropoffAddressTextFirst,
          dropoffContact: '',
          dropoffContactNo: data[i].dropoffContactNoFirst,
          dropoffTime: '',
        },
      ];
      if (
        data[i].dropoffAddressTextSec &&
        data[i].dropoffAddressTextSec !== ''
      ) {
        const dataDropoffSec = await this.getAddress(
          data[i].dropoffAddressTextSec,
        );
        data[i].dropOffFields.push({
          dropoffAddress:
            dataDropoffSec && dataDropoffSec?.address
              ? dataDropoffSec?.address
              : null,
          dropoffAddressText: data[i].dropoffAddressTextSec,
          dropoffContact: '',
          dropoffContactNo: data[i].dropoffContactNoSec,
          dropoffTime: '',
        });
      }

      data[i].serviceType = serviceType;
      data[i].orderType = orderType;
      data[i].cargoType = CARGO_TYPE.STANDARD;
      data[i].pickupTime = data[i].pickupTime
        ? moment(data[i].pickupTime, 'DD-MM-YYYY').toDate()
        : null;
      dataNew.push(data);
    }
    return dataNew;
  };

  getAddress = async (address: string) => {
    const api = await this.httpService
      .get(
        encodeURI(
          `${this.endpoint}/geocode/json?address=` +
            address +
            `&key=${this.googleApiKey}`,
        ),
      )
      .toPromise();
    if (!api?.data?.results[0]) {
      return null;
    }
    const result = api.data.results[0].geometry;
    const location = api.data.results[0];
    if (!location) {
      return null;
    }
    if (!result.location) {
      return null;
    }
    for (let i = 0; i < location.address_components.length; i++) {
      if (
        location.address_components[i].types[0] ===
        'administrative_area_level_1'
      ) {
        return {
          address: [result.location.lat, result.location.lng],
          city: location.address_components[i].short_name
            .replace('Thành phố ', '')
            .replace('Tỉnh ', '')
            .replace('thành phố ', ''),
        };
      }
    }
  };
}
