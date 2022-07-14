import { PaginationResult } from '@anpham1925/nestjs';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PriceQuotation } from 'src/entities/price-quotation/price-quotation.entity';
import { FindManyOptions, Repository, In, getManager, Like } from 'typeorm';
import { PaginationRequest } from 'src/common/dtos/pagination.dto';
import { CreatePriceQuotation } from 'src/dto/price-quotation/CreatePriceQuotation.dto';
import { UpdatePriceQuotation } from 'src/dto/price-quotation/UpdatePriceQuotation.dto';
import { Admin } from 'src/entities/admin/admin.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import { PRICE_QUOTATION_STATUS } from 'src/entities/price-quotation/priceQuotationStatus.enum';
import { customThrowError } from 'src/common/helpers/throw.helper';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { addBodyToRequest } from 'src/common/helpers/utility.helper';
import { Request } from 'express';

@Injectable()
export class PriceQuotationService {
  constructor(
    @InjectRepository(PriceQuotation)
    private readonly priceQuotationRepository: Repository<PriceQuotation>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getPriceQuotations(
    model: PaginationRequest,
  ): Promise<PaginationResult<PriceQuotation>> {
    const { skip, take, orderBy, orderDirection } = model;

    const options: FindManyOptions<PriceQuotation> = {
      skip,
      take,
      select: [
        'id',
        'name',
        'toAllCustomers',
        'status',
        'lastUpdatedBy',
        'lastUpdatedTime',
        'currency',
      ],
      relations: ['customers', 'admin'],
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
      priceQuotations,
      count,
    ] = await this.priceQuotationRepository.findAndCount(options);

    const dataCustomers = [];

    for (let i = 0; i < priceQuotations.length; i++) {
      const tempData = [];
      for (let j = 0; j < priceQuotations[i].customers.length; j++) {
        const data = await this.customerRepository.findOne(
          priceQuotations[i].customers[j].id,
          {
            relations: ['company'],
          },
        );
        tempData.push(data.company);
      }
      dataCustomers.push(tempData);
    }

    const newPriceQuotations = priceQuotations.map(
      (item: any, index: number) => ({
        ...item,
        customers: item.customers.map((customer: any, customerIndex: any) => {
          return {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            company: dataCustomers[index][customerIndex] ?? null,
          };
        }),
        admin: item.admin
          ? {
              id: item.admin.id,
              firstName: item.admin.firstName,
              lastName: item.admin.lastName,
            }
          : null,
      }),
    );

    return new PaginationResult<PriceQuotation>(newPriceQuotations, count);
  }

  async getPriceQuotationsForCustomer(
    customerId: number,
    model: PaginationRequest,
  ): Promise<PaginationResult<PriceQuotation>> {
    const { skip, take, orderBy, orderDirection } = model;

    const priceCus = await getManager().query(
      'SELECT * FROM price_quotation_customers_customer WHERE price_quotation_customers_customer."customerId"=$1',
      [customerId],
    );

    const priceQuotationIds = priceCus.map(
      (item: any) => item.priceQuotationId,
    );

    const options: FindManyOptions<PriceQuotation> = {
      skip,
      take,
      select: [
        'id',
        'name',
        'lastUpdatedBy',
        'lastUpdatedTime',
        'quotation',
        'note',
        'currency',
      ],
      relations: ['admin'],
    };

    options.where = [
      {
        toAllCustomers: true,
        status: PRICE_QUOTATION_STATUS.PUBLISHED,
      },
    ];

    if (priceQuotationIds.length > 0) {
      options.where.push({
        id: In(priceQuotationIds),
        status: PRICE_QUOTATION_STATUS.PUBLISHED,
      });
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

    const [
      priceQuotations,
      count,
    ] = await this.priceQuotationRepository.findAndCount(options);

    const newPriceQuotations = priceQuotations.map((item: any) => {
      let header = {};
      const data = [];
      if (item.quotation?.rows) {
        const tmpData = item.quotation.rows;
        header = tmpData[0];
        for (let i = 1; i < tmpData.length - 1; i++) {
          if (tmpData[i] && Object.keys(tmpData[i]).length > 0) {
            data.push(tmpData[i]);
          }
        }
      }
      return {
        ...item,
        quotation: {
          header,
          data,
        },
        admin: item.admin
          ? {
              id: item.admin.id,
              firstName: item.admin.firstName,
              lastName: item.admin.lastName,
            }
          : null,
      };
    });

    return new PaginationResult<PriceQuotation>(newPriceQuotations, count);
  }

  async getPriceQuotationById(id: number): Promise<any> {
    const priceQuotation = await this.priceQuotationRepository.findOne({
      where: { id },
      relations: ['customers'],
    });
    if (!priceQuotation) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    return {
      ...priceQuotation,
      customers: priceQuotation.customers.map((customer: any) => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
      })),
    };
  }

  async createPriceQuotation(
    model: CreatePriceQuotation,
    requestUserId: number,
  ): Promise<boolean> {
    const admin = await this.adminRepository.findOne(requestUserId);
    let toAllCustomers = true;
    let toCustomers = [];
    if (
      !model.toAllCustomers &&
      model.toCustomers &&
      model.toCustomers.length > 0
    ) {
      toAllCustomers = false;
      toCustomers = await this.customerRepository.find({
        where: { id: In(model.toCustomers) },
      });
    }

    const priceQuotation = new PriceQuotation();
    priceQuotation.name = model.name;
    priceQuotation.quotation = model.quotation;
    priceQuotation.note = model.note;
    priceQuotation.toAllCustomers = toAllCustomers;
    priceQuotation.customers = toCustomers;
    priceQuotation.lastUpdatedBy = admin.id;
    priceQuotation.currency = model.currency;
    priceQuotation.lastUpdatedTime = new Date();

    await this.priceQuotationRepository.save(priceQuotation);
    return true;
  }

  async updatePriceQuotation(
    model: UpdatePriceQuotation,
    requestUserId: number,
  ): Promise<boolean> {
    const priceQuotation = await this.priceQuotationRepository.findOne(
      model.id,
    );
    if (!priceQuotation) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    const admin = await this.adminRepository.findOne(requestUserId);
    let toAllCustomers = true;
    let toCustomers = [];
    if (
      !model.toAllCustomers &&
      model.toCustomers &&
      model.toCustomers.length > 0
    ) {
      toAllCustomers = false;
      toCustomers = await this.customerRepository.find({
        where: { id: In(model.toCustomers) },
      });
    }

    priceQuotation.name = model.name;
    priceQuotation.quotation = model.quotation;
    priceQuotation.note = model.note;
    priceQuotation.toAllCustomers = toAllCustomers;
    priceQuotation.customers = toCustomers;
    priceQuotation.lastUpdatedBy = admin.id;
    priceQuotation.currency = model.currency;
    priceQuotation.lastUpdatedTime = new Date();
    priceQuotation.status = PRICE_QUOTATION_STATUS.DRAFT;

    await this.priceQuotationRepository.save(priceQuotation);
    return true;
  }

  async delete(id: number, request?: Request): Promise<boolean> {
    const priceQuotation = await this.priceQuotationRepository.findOne(id);
    if (!priceQuotation) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    await this.priceQuotationRepository.delete(id);

    addBodyToRequest(request, priceQuotation);

    return true;
  }

  async published(id: number): Promise<boolean> {
    const priceQuotation = await this.priceQuotationRepository.findOne(id);
    if (!priceQuotation) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    priceQuotation.status = PRICE_QUOTATION_STATUS.PUBLISHED;

    await this.priceQuotationRepository.save(priceQuotation);

    return true;
  }

  async unPublished(id: number): Promise<boolean> {
    const priceQuotation = await this.priceQuotationRepository.findOne(id);
    if (!priceQuotation) {
      customThrowError(
        RESPONSE_MESSAGES.NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    }

    priceQuotation.status = PRICE_QUOTATION_STATUS.DRAFT;

    await this.priceQuotationRepository.save(priceQuotation);

    return true;
  }

  async getCustomerOptions(search?: string): Promise<any> {
    const options: FindManyOptions<Customer> = {
      select: ['id', 'firstName', 'lastName', 'email'],
      take: 50,
      relations: ['company'],
    };

    if (search) {
      options.where = [
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
      ];
    }

    return await this.customerRepository.find(options);
  }
}
