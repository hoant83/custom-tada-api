import { PaginationResult } from '@anpham1925/nestjs';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { customThrowError } from 'src/common/helpers/throw.helper';
import { addBodyToRequest } from 'src/common/helpers/utility.helper';
import { AddressListRequest } from 'src/dto/address/AddressListRequest.dto';
import { CreateAddress } from 'src/dto/address/CreateAddress.dto';
import { UpdateAddress } from 'src/dto/address/UpdateAddress.dto';
import { Address } from 'src/entities/address/address.entity';
import { Province } from 'src/entities/province/province.entity';
import { AddressRepository } from 'src/repositories/address.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { FindManyOptions, Like, Raw, Repository } from 'typeorm';
@Injectable()
export class AddressService {
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  async createAddress(
    model: CreateAddress,
    requestUserId: number,
  ): Promise<boolean> {
    const customer = await this.customerRepository.findOne(requestUserId);
    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    const address = new Address();

    const keys = Object.keys(model);

    keys.forEach(key => {
      address[key] = model[key];
    });
    address.pickupCity = null;
    const pickupCityNameRaw = model.pickupCity;
    if (pickupCityNameRaw && !Number.isInteger(pickupCityNameRaw)) {
      const pickupCityModified = this._removeProvincePrefix(pickupCityNameRaw);
      const province = await this._getProvinceByName(pickupCityModified);
      if (!province) {
        customThrowError(
          RESPONSE_MESSAGES.CITY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          RESPONSE_MESSAGES_CODE.CITY_NOT_FOUND,
        );
      }
      address.pickupCity = province.id;
    }

    if (pickupCityNameRaw && Number.isInteger(pickupCityNameRaw)) {
      address.pickupCity = +pickupCityNameRaw;
    }

    address.ownerId = requestUserId;
    await this.addressRepository.save(address);
    return true;
  }

  private async _getProvinceById(id: number): Promise<Province> {
    return await this.provinceRepository.findOne(id);
  }

  private async _getProvinceByName(provinceName: string): Promise<Province> {
    return await this.provinceRepository.findOne({
      name: Like(`%${provinceName}%`),
      countryCode: process.env.REGION,
    });
  }

  private _removeProvincePrefix(provinceName: string): string {
    return provinceName
      .replace('Thành phố ', '')
      .replace('Tỉnh ', '')
      .replace('thành phố ', '')
      .replace(' City', '');
  }

  async updateAddress(
    model: UpdateAddress,
    requestUserId: number,
  ): Promise<boolean> {
    const customer = await this.customerRepository.findOne(requestUserId);
    if (!customer) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }
    if (model.ownerId !== customer.id) {
      customThrowError(
        RESPONSE_MESSAGES.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.UNAUTHORIZED,
      );
    }
    const address = await this.addressRepository.findOne(model.id);
    const keys = Object.keys(model);

    keys.forEach(key => {
      address[key] = model[key];
    });
    address.pickupCity = null;
    const pickupCityNameRaw = model.pickupCity;
    if (pickupCityNameRaw && !Number.isInteger(pickupCityNameRaw)) {
      const pickupCityModified = this._removeProvincePrefix(pickupCityNameRaw);
      const province = await this._getProvinceByName(pickupCityModified);
      if (!province) {
        customThrowError(
          RESPONSE_MESSAGES.CITY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          RESPONSE_MESSAGES_CODE.CITY_NOT_FOUND,
        );
      }
      address.pickupCity = province.id;
    }
    await this.addressRepository.save(address);
    return true;
  }

  async getAddresses(
    model: AddressListRequest,
    requestUserId: number,
  ): Promise<PaginationResult<Address>> {
    const { skip, take, search, orderBy, orderDirection, locationType } = model;

    const options: FindManyOptions<Address> = {
      skip,
      take,
    };

    options.where = {
      ownerId: requestUserId,
    };

    if (search) {
      options.where = [
        {
          ...options.where,
          company: Raw(
            alias => `LOWER(${alias}) like '%${search.toLowerCase()}%'`,
          ),
        },
      ];
    }

    if (locationType) {
      options.where = {
        ...options.where,
        locationType: locationType,
      };
    }

    if (orderBy) {
      options.order = {
        [orderBy]: orderDirection,
      };
    } else {
      options.order = {
        id: 'DESC',
      };
    }

    const [addresses, count] = await this.addressRepository.findAndCount(
      options,
    );
    return new PaginationResult<Address>(addresses, count);
  }

  async delete(
    addressId: number,
    customerId: number,
    request?: Request,
  ): Promise<boolean> {
    const address = await this.addressRepository.findOne(addressId);
    if (!address) {
      customThrowError(RESPONSE_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (address.ownerId !== customerId) {
      customThrowError(RESPONSE_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    await this.addressRepository.delete(addressId);

    addBodyToRequest(request, address);

    return true;
  }

  async getAddressById(
    addressId: number,
    customerId: number,
  ): Promise<Address> {
    const address = await this.addressRepository.findOne(addressId);
    if (address.ownerId !== customerId) {
      customThrowError(RESPONSE_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    return address;
  }
}
