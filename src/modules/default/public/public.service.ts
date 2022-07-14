import { HttpStatus, Injectable, HttpService } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { OrderRequestDto } from 'src/dto/order/order-request.dto';
import { Order } from 'src/entities/order/order.entity';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as querystring from 'querystring';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { customThrowError } from 'src/common/helpers/throw.helper';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { PriceDto } from 'src/dto/public/price.dto';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import {
  TRUCK_PAYLOAD,
  TRUCK_TYPE_DEFAULT,
} from 'src/entities/default-reference/enums/defaultRef.enum';

@Injectable()
export class PublicService {
  googleEndpoint = this.configService.get('GOOGLE_MAPS_API');
  googleApiKey = this.configService.get('GOOGLE_MAPS_API_KEY');

  constructor(
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
    private readonly httpService: HttpService,
    @InjectRepository(TruckOwner)
    private readonly truckOwnerRepository: Repository<TruckOwner>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createOrder(
    orderRequestDto: OrderRequestDto,
    user: Record<string, unknown>,
    req: Request,
  ): Promise<Order> {
    if (orderRequestDto.pickupAddressText) {
      const location = await this.getLocationFromAddress(
        orderRequestDto.pickupAddressText,
      );
      if (location) {
        orderRequestDto.pickupAddress = [location.lat, location.lng];
        orderRequestDto.pickupCity = location.city;
      }
    }

    if (
      orderRequestDto.dropOffFields &&
      orderRequestDto.dropOffFields.length > 0
    ) {
      for (const field of orderRequestDto.dropOffFields) {
        if (field.dropoffAddressText) {
          const location = await this.getLocationFromAddress(
            field.dropoffAddressText,
          );
          if (location) {
            field.dropoffAddress = [location.lat, location.lng];
          }
        }
      }
    }

    if (orderRequestDto.assignToFavCode) {
      const truckOwner = await this.truckOwnerRepository.findOne({
        publicId: orderRequestDto.assignToFavCode,
      });
      if (truckOwner) {
        orderRequestDto.assignToFav = truckOwner.id;
      }
      delete orderRequestDto.assignToFavCode;
    }

    return await this.orderService.createOrder(orderRequestDto, user, req);
  }

  async updateOrder(
    orderId: number,
    orderRequestModel: OrderRequestDto,
    editBy?: Record<string, unknown>,
    req?: Request,
  ): Promise<any> {
    const order = await this.orderRepository.findOne({ id: orderId });
    if (!order) {
      customThrowError(
        RESPONSE_MESSAGES.ORDER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        RESPONSE_MESSAGES_CODE.ORDER_NOT_FOUND,
      );
    }
    if (orderRequestModel.pickupAddressText) {
      const location = await this.getLocationFromAddress(
        orderRequestModel.pickupAddressText,
      );
      if (location) {
        orderRequestModel.pickupAddress = [location.lat, location.lng];
        orderRequestModel.pickupCity = location.city;
      }
    }

    if (
      orderRequestModel.dropOffFields &&
      orderRequestModel.dropOffFields.length > 0
    ) {
      for (const field of orderRequestModel.dropOffFields) {
        if (field.dropoffAddressText) {
          const location = await this.getLocationFromAddress(
            field.dropoffAddressText,
          );
          if (location) {
            field.dropoffAddress = [location.lat, location.lng];
          }
        }
      }
    }

    if (orderRequestModel.assignToFavCode) {
      const truckOwner = await this.truckOwnerRepository.findOne({
        publicId: orderRequestModel.assignToFavCode,
      });
      if (truckOwner) {
        orderRequestModel.assignToFav = truckOwner.id;
      }
      delete orderRequestModel.assignToFavCode;
    }

    for (const [key, value] of Object.entries(order)) {
      if (!orderRequestModel.hasOwnProperty(key)) {
        orderRequestModel[key] = value;
      }
    }

    return await this.orderService.update(
      orderId,
      orderRequestModel,
      (req as any).user,
      req,
    );
  }

  async getActivePricing(model: PriceDto): Promise<number> {
    if (model.pickupAddressText) {
      const location = await this.getLocationFromAddress(
        model.pickupAddressText,
      );
      if (location) {
        model.pickupAddress = [location.lat, location.lng];
      }
    }

    if (model.dropOffFields && model.dropOffFields.length > 0) {
      for (const field of model.dropOffFields) {
        if (field.dropoffAddressText) {
          const location = await this.getLocationFromAddress(
            field.dropoffAddressText,
          );
          if (location) {
            field.dropoffAddress = [location.lat, location.lng];
          }
        }
      }
    }
    if (!model.specialRequests) {
      model.specialRequests = [];
    }
    this._validateRequest(model);
    return await this.orderService.getActivePricing(model);
  }

  async getLocationFromAddress(address: string): Promise<any> {
    try {
      const addrParams = querystring.stringify({
        address: address,
        key: this.googleApiKey,
      });
      const locationResult = await this.httpService
        .get(`${this.googleEndpoint}/geocode/json?${addrParams}`)
        .toPromise();
      if (locationResult.data?.results[0]?.geometry?.location) {
        const city = this.getCity(locationResult.data?.results[0]);
        return {
          ...locationResult.data?.results[0]?.geometry?.location,
          city: city.long_name,
        };
      }
    } catch (e) {}
    return null;
  }

  getCity(result) {
    for (let i = 0; i < result.address_components.length; i++) {
      for (let b = 0; b < result.address_components[i].types.length; b++) {
        if (
          result.address_components[i].types[b] == 'administrative_area_level_1'
        ) {
          return result.address_components[i];
        }
      }
    }
    return null;
  }

  private _validateRequest(orderRequestDto: PriceDto): boolean {
    if (!orderRequestDto.serviceType) {
      customThrowError(
        RESPONSE_MESSAGES.SERVICE_TYPE,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.SERVICE_TYPE,
      );
    }

    if (!orderRequestDto.pickupAddressText) {
      customThrowError(
        RESPONSE_MESSAGES.PICKUP_ADDRESS_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.PICKUP_ADDRESS_NOT_FOUND,
      );
    }

    if (
      !orderRequestDto.dropOffFields ||
      orderRequestDto.dropOffFields.length === 0
    ) {
      customThrowError(
        RESPONSE_MESSAGES.PICKUP_DROPOFF_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.PICKUP_DROPOFF_NOT_FOUND,
      );
    }

    if (!orderRequestDto.cargoType) {
      customThrowError(
        RESPONSE_MESSAGES.CARGO_TYPE,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.CARGO_TYPE,
      );
    }

    this._validateServiceType(orderRequestDto);

    return true;
  }

  private _validateServiceType(orderRequestDto: PriceDto): boolean {
    switch (orderRequestDto.serviceType) {
      case SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK:
        if (
          !orderRequestDto.containerSize ||
          !orderRequestDto.containerQuantity
        ) {
          customThrowError(
            RESPONSE_MESSAGES.CONTAINER_PRICE_REQUIRED,
            HttpStatus.BAD_REQUEST,
            RESPONSE_MESSAGES_CODE.CONTAINER_PRICE_REQUIRED,
          );
        }
        break;

      case SERVICE_TYPE.NORMAL_TRUCK_VAN:
        if (
          !orderRequestDto.truckQuantity ||
          (!orderRequestDto.truckType &&
            orderRequestDto.truckType !== TRUCK_TYPE_DEFAULT.ANY) ||
          (!orderRequestDto.truckPayload &&
            orderRequestDto.truckPayload !== TRUCK_PAYLOAD.ANY)
        ) {
          customThrowError(
            RESPONSE_MESSAGES.TRUCK_SPECIAL_OR_QUANTITY,
            HttpStatus.BAD_REQUEST,
            RESPONSE_MESSAGES_CODE.TRUCK_SPECIAL_OR_QUANTITY,
          );
        }
        break;
    }

    return true;
  }
}
