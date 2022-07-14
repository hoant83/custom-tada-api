import * as moment from 'moment';
import {
  FORMAT_DATE_REPORT,
  TYPE_REPORT,
} from 'src/common/constants/type-report.enum';
import { prepareLikeSqlParam } from 'src/common/helpers/utility.helper';
import { JobsResponseDto } from 'src/dto/jobs/JobsResponse.dto';
import {
  FilterRequestDto,
  OrderQueryBuilder,
} from 'src/dto/order/filter-request.dto';
import { ExportOrdersByCustomerDto } from 'src/dto/users/ExportOrdersByCustomer.dto';
import { Admin } from 'src/entities/admin/admin.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import { ACCOUNT_ROLE } from 'src/entities/customer/enums/accountRole.enum';
import {
  NON_MOTORIZED_TYPE,
  NON_MOTORIZED_TYPE_FILTER,
  CONCATENATED_GOODS_TYPE,
  CONCATENATED_GOODS_TYPE_FILTER,
  CONTRACT_CAR_TYPE,
  CONTRACT_CAR_TYPE_FILTER,
  TRUCK_PAYLOAD,
} from 'src/entities/default-reference/enums/defaultRef.enum';
import { Driver } from 'src/entities/driver/driver.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { File } from 'src/entities/file/file.entity';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { ORDER_TYPE } from 'src/entities/order/enums/order-type.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { Order } from 'src/entities/order/order.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import {
  Between,
  Brackets,
  EntityRepository,
  FindManyOptions,
  getConnection,
  In,
  IsNull,
  Like,
  Not,
  Repository,
  SelectQueryBuilder,
  WhereExpression,
  getRepository,
} from 'typeorm';
import { GetRequest } from '../modules/admin/user/dto/GetRequest.dto';
import { getManager } from 'typeorm';
import { FILTER_STATISTIC } from 'src/entities/order/enums/filter-statistic.enum';
import { AdditionalPrice } from 'src/entities/additional-price/additional-price.entity';
import { Settings } from 'src/entities/setting/setting.entity';
import { ACCOUNT_TYPE } from 'src/entities/customer/enums/accountType.enum';

interface QueryReportDto {
  createdDate: any;
  createdByCustomerId?: number;
  customerOwnerId?: number;
  status?: any;
  ownerId?: number;
}

interface JoinAlias {
  adminAlias: string;
  truckownerAlias: string;
  customerAlias: string;
}

enum CONDITION_TYPE {
  AND,
  OR,
}

const DB_QUERIES = {
  DROPOFF_ADDRESS: `o."orderId" in (select oi."orderId" as orderId from public."order" oi, unnest(oi."dropOffFields") with ordinality "dropOffUnnest" where "dropOffUnnest"::json->>'dropoffAddressText' ilike :dropoffAddress)`,
  TRUCK_OWNER_NAME: `mainAlias."ownerId" is not null and (truckOwnerAlias."firstName" ilike :truckOwnerName or truckOwnerAlias.email ilike :truckOwnerName)`,
  CUSTOMER_NAME: `mainAlias."createdByCustomerId" is not null and (customerAlias."firstName" ilike :customerName or customerAlias.email ilike :customerName)`,
};

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {
  async getList(
    filterOptionsModel: FilterRequestDto,
  ): Promise<[Order[], number]> {
    const {
      skip,
      take,
      searchBy,
      searchKeyword,
      order: filterOrder,
    } = filterOptionsModel;
    const order = {};
    const filterCondition = {} as any;
    const where = [];

    if (filterOptionsModel.orderBy) {
      order[filterOptionsModel.orderBy] = filterOptionsModel.orderDirection;
    } else {
      (order as any).createdDate = 'DESC';
    }

    if (searchBy && searchKeyword) {
      if (searchBy === 'paymentType') {
        filterCondition[searchBy] = searchKeyword;
      } else {
        filterCondition[searchBy] = Like(`%${searchKeyword}%`);
      }
    }

    if (filterOptionsModel.order?.customerOwnerId) {
      const filterOptions = [
        { createdByCustomerId: filterOrder.createdByCustomerId },
        { customerOwnerId: filterOrder.customerOwnerId },
      ];
      const modifiedOptions = filterOptions.map(condition => ({
        ...condition,
        ...filterCondition,
      }));
      where.push(...modifiedOptions);
    } else {
      where.push({ ...filterOrder, ...filterCondition });
    }
    let search = '';
    if (searchBy === 'customerEmail') {
      search = `LOWER("Order__createdByCustomer"."email") like '%${searchKeyword.toLowerCase()}%'`;
      const options: FindManyOptions<Order> = {
        where: search,
        skip,
        take,
        order,
        relations: [
          'tracking',
          'createdByCustomer',
          'owner',
          'additionalPrices',
        ],
      };
      const [orders, count] = await this.findAndCount(options);
      if (orders) {
        for (let i = 0; i < orders.length; i++) {
          orders[i]['priceCalculate'] = this.calTotalPrice(orders[i]);
          orders[i]['commission'] = this.calCommission(
            orders[i],
            orders[i]['priceCalculate'],
          );
          if (!orders[i].isSetCommission || !orders[i].allowSeePrice) {
            orders[i]['priceCalculate'] = null;
          }
          if (!orders[i].isSetCommission || !orders[i].allowSeeCommission) {
            orders[i]['commission'] = null;
          }
        }
      }
      return [orders, count];
    }
    if (searchBy === 'truckOwnerEmail') {
      search = `LOWER("Order__owner"."email") like '%${searchKeyword.toLowerCase()}%'`;
      const options: FindManyOptions<Order> = {
        where: search,
        skip,
        take,
        order,
        relations: [
          'tracking',
          'createdByCustomer',
          'owner',
          'TruckOwnerBankAccount',
          'additionalPrices',
        ],
      };
      const [orders, count] = await this.findAndCount(options);
      if (orders) {
        for (let i = 0; i < orders.length; i++) {
          orders[i]['priceCalculate'] = this.calTotalPrice(orders[i]);
          orders[i]['commission'] = this.calCommission(
            orders[i],
            orders[i]['priceCalculate'],
          );
          if (!orders[i].isSetCommission || !orders[i].allowSeePrice) {
            orders[i]['priceCalculate'] = null;
          }
          if (!orders[i].isSetCommission || !orders[i].allowSeeCommission) {
            orders[i]['commission'] = null;
          }
        }
      }
      return [orders, count];
    }

    const options: FindManyOptions<Order> = {
      where,
      skip,
      take,
      order,
      relations: ['tracking', 'createdByCustomer', 'owner', 'additionalPrices'],
    };

    const [orders, count] = await this.findAndCount(options);
    // const modifiedOrders = orders.map(o => new OrderResponseDto(o));
    if (orders) {
      for (let i = 0; i < orders.length; i++) {
        orders[i]['priceCalculate'] = this.calTotalPrice(orders[i]);
        orders[i]['commission'] = this.calCommission(
          orders[i],
          orders[i]['priceCalculate'],
        );
        if (!orders[i].isSetCommission || !orders[i].allowSeePrice) {
          orders[i]['priceCalculate'] = null;
        }
        if (!orders[i].isSetCommission || !orders[i].allowSeeCommission) {
          orders[i]['commission'] = null;
        }
      }
    }
    // return [modifiedOrders, count];
    return [orders, count];
  }

  /**
   *
   * @description join tables (customer as cus, admin as adm, truckowner as tro) to the query
   * @param query {SelectQueryBuilder<Order>} query to build
   * @param mainAlias alias string of main table
   */
  private _prepareJoinQuery(
    query: SelectQueryBuilder<Order>,
    mainAlias: string,
    otherAliases: JoinAlias,
  ): void {
    const { adminAlias, truckownerAlias, customerAlias } = otherAliases;
    query.leftJoin(
      Customer,
      customerAlias,
      `${customerAlias}.id = ${mainAlias}."createdByCustomerId"`,
    );
    query.leftJoin(
      Admin,
      adminAlias,
      `${adminAlias}.id = ${mainAlias}."createdByAdminId"`,
    );
    query.leftJoin(
      TruckOwner,
      truckownerAlias,
      `${truckownerAlias}.id = ${mainAlias}."ownerId"`,
    );
    query.leftJoinAndMapMany(
      `${mainAlias}.tracking`,
      Tracking,
      'trac',
      `trac.orderId = ${mainAlias}."id"`,
    );
  }

  /**
   * @description add and query to each field in filter
   *
   * @param query {SelectQueryBuilder<Order>} query to build
   * @param mainAlias {string} alias string of main table
   * @param filter {Record<string, any>} filter for the query
   */
  private _prepareWhereEnumBasedQuery(
    query: SelectQueryBuilder<Order> | WhereExpression,
    mainAlias: string,
    filter: Record<string, any>,
  ): void {
    for (const key in filter) {
      filter[key] &&
        query.andWhere(`${mainAlias}."${key}" IN (:...${key})`, {
          [key]: filter[key],
        });
    }
  }

  private _prepareWhereTimeBasedQuery(
    compareSign: string,
    query: SelectQueryBuilder<Order> | WhereExpression,
    mainAlias: string,
    filter: Record<string, any>,
    skip = 0,
  ) {
    let count = skip;
    for (const key in filter) {
      filter[key] &&
        query.andWhere(`${mainAlias}."${key}" ${compareSign} :${key}${count}`, {
          [`${key}${count}`]: filter[key],
        });
      count++;
    }
  }

  private _prepareWhereBeforeTimeBasedQuery(
    query: SelectQueryBuilder<Order> | WhereExpression,
    mainAlias: string,
    filter: Record<string, any>,
    skip = 0,
  ) {
    this._prepareWhereTimeBasedQuery('>=', query, mainAlias, filter, skip);
  }

  private _prepareWhereAfterTimeBasedQuery(
    query: SelectQueryBuilder<Order> | WhereExpression,
    mainAlias: string,
    filter: Record<string, any>,
    skip = 0,
  ) {
    this._prepareWhereTimeBasedQuery('<=', query, mainAlias, filter, skip);
  }

  /**
   *
   * @param query {SelectQueryBuilder<Order>} query to build
   * @param mainAliasalias string of main table
   * @param filter{Record<string, any>} filter for the query
   */
  private _prepareWhereILikeBasedQuery(
    query: SelectQueryBuilder<Order> | WhereExpression,
    mainAlias: string,
    filter: Record<string, any>,
    conditionType?: CONDITION_TYPE,
  ): void {
    for (const key in filter) {
      if (filter[key]) {
        if (conditionType === CONDITION_TYPE.OR) {
          query.orWhere(`(${mainAlias}."${key}") ilike :${key}`, {
            [key]: prepareLikeSqlParam(filter[key]),
          });
        } else {
          query.andWhere(`(${mainAlias}."${key}") ilike :${key}`, {
            [key]: prepareLikeSqlParam(filter[key]),
          });
        }
      }
    }
  }

  /**
   * @description a function to combine all query filter for order
   *
   * @param {OrderQueryBuilder} filterOptionsModel
   * @returns
   */

  async getListv2(
    filterOptionsModel: OrderQueryBuilder,
    isAll?: boolean,
  ): Promise<[Order[], number]> {
    const {
      skip,
      take,
      orderFindCondition,
      orderDirection,
    } = filterOptionsModel;
    const mainAlias = 'o';

    const otherAliases: JoinAlias = {
      adminAlias: 'adm',
      customerAlias: 'cus',
      truckownerAlias: 'tro',
    };

    const query = this.createQueryBuilder(mainAlias).where(orderFindCondition);

    this._prepareJoinQuery(query, mainAlias, otherAliases);

    if (isAll) {
      this._prepareOrFilterQuery(
        query,
        mainAlias,
        filterOptionsModel,
        otherAliases,
      );
    } else {
      this._prepareAndFilterQuery(
        query,
        mainAlias,
        filterOptionsModel,
        otherAliases,
      );
    }

    const [orders, count] = orderDirection
      ? await query
          .skip(skip)
          .take(take)
          .orderBy({
            [`${mainAlias}.id`]: 'DESC',
            [`${mainAlias}.sort`]: 'DESC',
          })
          .getManyAndCount()
      : await query
          .skip(skip)
          .take(take)
          .orderBy({
            [`${mainAlias}.sort`]: 'DESC',
            [`${mainAlias}.createdDate`]: 'DESC',
          })
          .getManyAndCount();

    if (orders.length) {
      const orderIds = orders.map(item => item.id);
      const addResult = await getRepository(AdditionalPrice)
        .createQueryBuilder('additional_price')
        .select('additional_price.*')
        .where('"orderId" IN (:...orderIds)', { orderIds })
        .getRawMany();
      if (addResult) {
        for (const order of orders) {
          const ads = addResult.filter(item => order.id === item.orderId);
          order['additionalPrices'] = ads;
        }
      }
    }

    return [orders, count];
  }

  private _prepareCommonFilterQuery(
    query: SelectQueryBuilder<Order>,
    mainAlias: string,
    filter: OrderQueryBuilder,
    otherAliases: JoinAlias,
  ): void {
    /**
     * enum base query
     * --- status
     * --- paymentType
     */

    this._prepareWhereEnumBasedQuery(query, mainAlias, {
      status: filter.status,
      paymentType: filter.paymentType,
    });

    /**
     * from-to timebase query
     *  -- createdFrom
     *  -- createdTo
     *  -- pickupFrom
     *  -- pickupTo
     */
    const fromData = {
      createdDate: filter.createdFrom,
      pickupTime: filter.pickupFrom,
    };
    this._prepareWhereBeforeTimeBasedQuery(query, mainAlias, fromData);

    this._prepareWhereAfterTimeBasedQuery(
      query,
      mainAlias,
      {
        createdDate: filter.createdTo,
        pickupTime: filter.pickupTo,
      },
      Object.keys(fromData).length ?? 0,
    );

    /**
     * special query
     * --- dropoffAddress (from-to time based)
     * --- dropoffTime (text-based)
     */

    if (filter.dropoffFrom || filter.dropoffTo) {
      const subquery = `(select oi."orderId" as orderId from public."order" oi, unnest(oi."dropOffFields") with ordinality "dropOffUnnest"  where ${
        filter.dropoffFrom
          ? `"dropOffUnnest"::json->>'dropoffTime' >= :dropoffFrom`
          : ''
      } ${filter.dropoffFrom && filter.dropoffTo ? 'and' : ''} ${
        filter.dropoffTo
          ? `"dropOffUnnest"::json->>'dropoffTime' <= :dropoffTo`
          : ''
      })`;

      query.andWhere(`o."orderId" in ${subquery}`, {
        dropoffFrom: filter.dropoffFrom,
        dropoffTo: filter.dropoffTo,
      });
    }
  }

  private _prepareRawFilterTruckOwnerName(
    mainAlias: string,
    truckOwnerAlias: string,
  ): string {
    return DB_QUERIES.TRUCK_OWNER_NAME.replace(/mainAlias/g, mainAlias).replace(
      /truckOwnerAlias/g,
      truckOwnerAlias,
    );
  }

  private _prepareRawFilterCustomerName(
    mainAlias: string,
    customerAlias: string,
  ): string {
    return DB_QUERIES.CUSTOMER_NAME.replace(/mainAlias/g, mainAlias).replace(
      /customerAlias/g,
      customerAlias,
    );
  }

  private _prepareAndFilterQuery(
    query: SelectQueryBuilder<Order>,
    mainAlias: string,
    filter: OrderQueryBuilder,
    otherAliases: JoinAlias,
  ): void {
    this._prepareCommonFilterQuery(query, mainAlias, filter, otherAliases);

    /**
     * check with and/or condition
     */
    if (filter.dropoffAddress) {
      const textQuery = DB_QUERIES.DROPOFF_ADDRESS;
      const params = {
        dropoffAddress: prepareLikeSqlParam(filter.dropoffAddress),
      };

      query.andWhere(textQuery, params);
    }

    /**
     * simple ilike query
     * --- pickupAddress
     * --- orderId
     * --- referenceNo
     */
    this._prepareWhereILikeBasedQuery(query, mainAlias, {
      pickupAddressText: filter.pickupAddress,
      orderId: filter.orderId,
      referenceNo: filter.referenceNo,
    });

    /**
     * text-ilike base query
     * --- orderManagerName
     * --- customerName
     * --- truckownerName
     * --- truckownerPartnerId
     */

    if (filter.orderManagerName) {
      query.andWhere(
        this._prepareOrderManagerNameBracket(
          mainAlias,
          filter.orderManagerName,
          otherAliases,
        ),
      );
    }

    if (filter.orderManagerName) {
      query.andWhere(
        this._prepareOrderManagerNameBracket(
          mainAlias,
          filter.orderManagerName,
          otherAliases,
        ),
      );
    }
    if (filter.truckOwnerName) {
      query.andWhere(
        this._prepareRawFilterTruckOwnerName(
          mainAlias,
          otherAliases.truckownerAlias,
        ),
        {
          truckOwnerName: prepareLikeSqlParam(filter.truckOwnerName),
        },
      );
    }
    if (filter.customerName) {
      query.andWhere(
        this._prepareRawFilterCustomerName(
          mainAlias,
          otherAliases.customerAlias,
        ),
        {
          customerName: prepareLikeSqlParam(filter.customerName),
        },
      );
    }
    if (filter.truckOwnerPartnerId) {
      query.andWhere(
        this._prepareTruckOwnerPartnerIdBracket(
          mainAlias,
          otherAliases.truckownerAlias,
          filter.truckOwnerPartnerId,
        ),
      );
    }
    if (filter.accountType) {
      query.andWhere(
        this._prepareAccountTypeBracket(
          mainAlias,
          otherAliases.customerAlias,
          filter.accountType,
        ),
      );
    }
  }

  private _prepareAccountTypeBracket(
    mainAlias: string,
    customerAlias: string,
    accountType: ACCOUNT_TYPE[],
  ): Brackets {
    return new Brackets(qb =>
      qb
        .where(`${mainAlias}."createdByCustomerId" is not null`)
        .andWhere(`${customerAlias}."accountType" IN (:...accountType)`, {
          accountType,
        }),
    );
  }

  private _prepareOrderManagerNameBracket(
    mainAlias: string,
    orderManagerName: string,
    otherAliases: JoinAlias,
  ): Brackets {
    return new Brackets(qb => {
      qb.where(
        `${mainAlias}."inChargeName" is not null and ${mainAlias}."inChargeName" ilike :orderManagerName`,
        {
          orderManagerName: prepareLikeSqlParam(orderManagerName),
        },
      )
        .orWhere(
          new Brackets(qb => {
            qb.where(
              new Brackets(qb =>
                qb
                  .where(`${mainAlias}."inChargeName" is null`)
                  .orWhere(`${mainAlias}."inChargeName" = ''`),
              ),
            ).andWhere(
              new Brackets(qb => {
                qb.where(
                  `${otherAliases.customerAlias}."firstName" ilike :orderManagerName`,
                  {
                    orderManagerName: prepareLikeSqlParam(orderManagerName),
                  },
                ).orWhere(
                  `${otherAliases.adminAlias}."firstName" ilike :orderManagerName`,
                  {
                    orderManagerName: prepareLikeSqlParam(orderManagerName),
                  },
                );
              }),
            );
          }),
        )
        .orWhere(
          `${mainAlias}."inChargeContactNo" is not null and ${mainAlias}."inChargeContactNo" ilike :orderManagerName`,
          {
            orderManagerName: prepareLikeSqlParam(orderManagerName),
          },
        );
    });
  }

  private _prepareTruckOwnerPartnerIdBracket(
    mainAlias: string,
    truckOwnerAlias: string,
    truckOwnerPartnerId: string,
  ): Brackets {
    return new Brackets(qb =>
      qb
        .where(`${mainAlias}."ownerId" is not null`)
        .andWhere(`${truckOwnerAlias}."publicId" = :truckOwnerPartnerId`, {
          truckOwnerPartnerId: truckOwnerPartnerId,
        }),
    );
  }

  private _prepareOrFilterQuery(
    query: SelectQueryBuilder<Order>,
    mainAlias: string,
    filter: OrderQueryBuilder,
    otherAliases: JoinAlias,
  ): void {
    this._prepareCommonFilterQuery(query, mainAlias, filter, otherAliases);

    query.andWhere(
      new Brackets(qb => {
        qb.where(DB_QUERIES.DROPOFF_ADDRESS, {
          dropoffAddress: prepareLikeSqlParam(filter.dropoffAddress),
        });
        this._prepareWhereILikeBasedQuery(
          qb,
          mainAlias,
          {
            pickupAddressText: filter.pickupAddress,
            orderId: filter.orderId,
            referenceNo: filter.referenceNo,
          },
          CONDITION_TYPE.OR,
        );
        qb.orWhere(
          this._prepareOrderManagerNameBracket(
            mainAlias,
            filter.orderManagerName,
            otherAliases,
          ),
        );
        qb.orWhere(
          this._prepareRawFilterTruckOwnerName(
            mainAlias,
            otherAliases.truckownerAlias,
          ),
          {
            truckOwnerName: prepareLikeSqlParam(filter.truckOwnerName),
          },
        );
        qb.orWhere(
          this._prepareRawFilterCustomerName(
            mainAlias,
            otherAliases.customerAlias,
          ),
          {
            customerName: prepareLikeSqlParam(filter.customerName),
          },
        );
        qb.orWhere(
          this._prepareTruckOwnerPartnerIdBracket(
            mainAlias,
            otherAliases.truckownerAlias,
            filter.truckOwnerPartnerId,
          ),
        );
      }),
    );
  }

  async getListWithAllFilter(
    filterOptionsModel: OrderQueryBuilder,
  ): Promise<[Order[], number]> {
    const { skip, take, orderFindCondition } = filterOptionsModel;
    const mainAlias = 'o';

    const otherAliases: JoinAlias = {
      adminAlias: 'adm',
      customerAlias: 'cus',
      truckownerAlias: 'tro',
    };

    const query = this.createQueryBuilder(mainAlias).where(orderFindCondition);

    this._prepareJoinQuery(query, mainAlias, otherAliases);

    const [orders, count] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return [orders, count];
  }
  async getListPayment(
    filterOptionsModel: FilterRequestDto,
  ): Promise<[Order[], number]> {
    const {
      skip,
      take,
      searchBy,
      searchKeyword,
      order: filterOrder,
    } = filterOptionsModel;
    const order = {};
    const filterCondition = {} as any;
    let where = [];

    if (filterOptionsModel.orderBy) {
      order[filterOptionsModel.orderBy] = filterOptionsModel.orderDirection;
    } else {
      (order as any).createdDate = 'DESC';
    }

    if (searchBy && searchKeyword) {
      if (searchBy === 'paymentType' || searchBy === 'totalPrice') {
        filterCondition[searchBy] = searchKeyword;
      } else {
        filterCondition[searchBy] = Like(`%${searchKeyword}%`);
      }
    }

    if (filterOptionsModel.order?.customerOwnerId) {
      const filterOptions = [
        { createdByCustomerId: filterOrder.createdByCustomerId },
        { customerOwnerId: filterOrder.customerOwnerId },
      ];
      const modifiedOptions = filterOptions.map(condition => ({
        ...condition,
        ...filterCondition,
      }));
      where.push(...modifiedOptions);
    } else {
      where.push({ ...filterOrder, ...filterCondition });
    }
    where = where.map(condition => ({
      ...condition,
      status: Not(
        In([
          ORDER_STATUS.CREATED,
          ORDER_STATUS.VERIFIED,
          ORDER_STATUS.ASSIGNING,
        ]),
      ),
    }));

    if (searchBy === 'status') {
      where = where.map(condition => ({
        ...condition,
        status: searchKeyword,
      }));
    }

    let search = '';
    if (searchBy === 'customerEmail') {
      search = `LOWER("Order__createdByCustomer"."email") like '%${searchKeyword.toLowerCase()}%'`;
      const options: FindManyOptions<Order> = {
        where: search,
        skip,
        take,
        order,
        relations: [
          'tracking',
          'createdByCustomer',
          'owner',
          'additionalPrices',
        ],
      };
      const [orders, count] = await this.findAndCount(options);
      return [orders, count];
    }
    if (searchBy === 'truckOwnerEmail') {
      search = `LOWER("Order__owner"."email") like '%${searchKeyword.toLowerCase()}%'`;
      const options: FindManyOptions<Order> = {
        where: search,
        skip,
        take,
        order,
        relations: [
          'tracking',
          'createdByCustomer',
          'owner',
          'additionalPrices',
        ],
      };
      const [orders, count] = await this.findAndCount(options);
      return [orders, count];
    }

    const options: FindManyOptions<Order> = {
      where,
      skip,
      take,
      order,
      relations: ['tracking', 'createdByCustomer', 'owner', 'additionalPrices'],
    };

    const [orders, count] = await this.findAndCount(options);
    // const modifiedOrders = orders.map(o => new OrderResponseDto(o));

    // return [modifiedOrders, count];
    return [orders, count];
  }

  async getReportCustomerList(
    filterOptionsModel: Record<string, any>,
    type: string,
  ): Promise<[any[], number]> {
    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;

    const filterCondition = {} as any;

    const { begin, end } = this._prepareYearCondition(
      +filterOptionsModel.month,
      +filterOptionsModel.year,
    );

    if (searchBy && searchKeyword) {
      filterCondition[searchBy] = Like(`%${searchKeyword}%`);
    }

    const query = this.createQueryBuilder('order');

    let where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        createdByCustomerId: filterOptionsModel.order.createdByCustomerId,
        ...filterCondition,
      },
    ];

    if (filterOptionsModel.order.customerOwnerId) {
      where.push({
        createdDate: Between(begin, end),
        customerOwnerId: filterOptionsModel.order.customerOwnerId,
        ...filterCondition,
      });
    }

    if (type === TYPE_REPORT.PENDING) {
      where = where.map(condition => ({
        ...condition,
        status: Not(In([ORDER_STATUS.CANCELED, ORDER_STATUS.DELIVERED])),
        ...filterCondition,
      }));
    }

    if (type === TYPE_REPORT.COMPLETED) {
      where = where.map(condition => ({
        ...condition,
        status: ORDER_STATUS.DELIVERED,
        ...filterCondition,
      }));
    }

    if (type === TYPE_REPORT.CANCELLED) {
      where = where.map(condition => ({
        ...condition,
        status: ORDER_STATUS.CANCELED,
        ...filterCondition,
      }));
    }

    const [result, count] = await query
      .where(where)
      .skip(skip)
      .take(take)
      .orderBy('order.id', 'DESC')
      .select()
      .getManyAndCount();

    return [result, count];
  }

  async getReportTruckOwnerList(
    filterOptionsModel: Record<string, any>,
    type: string,
    truckOwnerId: number,
  ): Promise<[any[], number]> {
    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;

    const filterCondition = {} as any;

    const { begin, end } = this._prepareYearCondition(
      +filterOptionsModel.month,
      +filterOptionsModel.year,
    );

    if (searchBy && searchKeyword) {
      filterCondition[searchBy] = Like(`%${searchKeyword}%`);
    }

    const query = this.createQueryBuilder('order');

    let where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        ownerId: truckOwnerId,
        ...filterCondition,
      },
    ];

    if (type === TYPE_REPORT.PENDING) {
      where = where.map(condition => ({
        ...condition,
        status: Not(In([ORDER_STATUS.CANCELED, ORDER_STATUS.DELIVERED])),
        ...filterCondition,
      }));
    }

    if (type === TYPE_REPORT.COMPLETED) {
      where = where.map(condition => ({
        ...condition,
        status: ORDER_STATUS.DELIVERED,
        ...filterCondition,
      }));
    }

    if (type === TYPE_REPORT.CANCELLED) {
      where = where.map(condition => ({
        ...condition,
        status: ORDER_STATUS.CANCELED,
        ...filterCondition,
      }));
    }

    const [result, count] = await query
      .where(where)
      .skip(skip)
      .take(take)
      .orderBy('order.id', 'DESC')
      .select()
      .getManyAndCount();

    return [result, count];
  }
  //
  async getReportTruckownerList(
    filterOptionsModel: Record<string, any>,
    truckOwnerId: number,
  ): Promise<[any[], number]> {
    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;

    const { begin, end } = this._prepareYearCondition(
      +filterOptionsModel.month,
      +filterOptionsModel.year,
    );

    const filterCondition = {} as any;

    const query = this.createQueryBuilder('order');

    if (searchBy && searchKeyword) {
      filterCondition[searchBy] = Like(`%${searchKeyword}%`);
    }

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        createdByCustomerId: filterOptionsModel.order.createdByCustomerId,
        status: ORDER_STATUS.DELIVERED,
        ownerId: truckOwnerId,
        ...filterCondition,
      },
    ];

    if (filterOptionsModel.order.customerOwnerId) {
      where.push({
        createdDate: Between(begin, end),
        customerOwnerId: filterOptionsModel.order.customerOwnerId,
        status: ORDER_STATUS.DELIVERED,
        ownerId: truckOwnerId,
        ...filterCondition,
      });
    }

    const [result, count] = await query
      .where(where)
      .skip(skip)
      .take(take)
      .select()
      .getManyAndCount();

    return [result, count];
  }
  async getReportAdminList(
    filterOptionsModel: Record<string, any>,
    type: string,
  ): Promise<[any[], number]> {
    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;

    const filterCondition = {} as any;

    const { begin, end } = this._prepareYearCondition(
      +filterOptionsModel.month,
      +filterOptionsModel.year,
    );

    if (searchBy && searchKeyword) {
      filterCondition[searchBy] = Like(`%${searchKeyword}%`);
    }

    const query = this.createQueryBuilder('order');

    let where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        ...filterCondition,
      },
    ];

    if (type === TYPE_REPORT.PENDING) {
      where = where.map(condition => ({
        ...condition,
        status: Not(In([ORDER_STATUS.CANCELED, ORDER_STATUS.DELIVERED])),
        ...filterCondition,
      }));
    }

    if (type === TYPE_REPORT.COMPLETED) {
      where = where.map(condition => ({
        ...condition,
        status: ORDER_STATUS.DELIVERED,
        ...filterCondition,
      }));
    }

    if (type === TYPE_REPORT.CANCELLED) {
      where = where.map(condition => ({
        ...condition,
        status: ORDER_STATUS.CANCELED,
        ...filterCondition,
      }));
    }

    const [result, count] = await query
      .where(where)
      .skip(skip)
      .take(take)
      .orderBy('order.id', 'DESC')
      .select()
      .getManyAndCount();

    return [result, count];
  }
  //
  async getReportTruckownerListByAdmin(
    filterOptionsModel: Record<string, any>,
    truckOwnerId: number,
  ): Promise<[any[], number]> {
    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;

    const { begin, end } = this._prepareYearCondition(
      +filterOptionsModel.month,
      +filterOptionsModel.year,
    );

    const filterCondition = {} as any;

    const query = this.createQueryBuilder('order');

    if (searchBy && searchKeyword) {
      filterCondition[searchBy] = Like(`%${searchKeyword}%`);
    }

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        status: ORDER_STATUS.DELIVERED,
        ownerId: truckOwnerId,
        ...filterCondition,
      },
    ];
    const [result, count] = await query
      .where(where)
      .skip(skip)
      .take(take)
      .select()
      .getManyAndCount();

    return [result, count];
  }

  async getReportCustomerListByTruckOwner(
    filterOptionsModel: Record<string, any>,
    customerId: number,
  ): Promise<[any[], number]> {
    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;

    const { begin, end } = this._prepareYearCondition(
      +filterOptionsModel.month,
      +filterOptionsModel.year,
    );

    const filterCondition = {} as any;

    const query = this.createQueryBuilder('order');

    if (searchBy && searchKeyword) {
      filterCondition[searchBy] = Like(`%${searchKeyword}%`);
    }

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        createdByCustomerId: customerId,
        status: ORDER_STATUS.DELIVERED,
        ownerId: filterOptionsModel.order.ownerId,
        ...filterCondition,
      },
    ];

    const [result, count] = await query
      .where(where)
      .skip(skip)
      .take(take)
      .select()
      .getManyAndCount();

    return [result, count];
  }

  async getCustomerStatistics(
    filterOptionsModel: Record<string, any>,
  ): Promise<[any[], number]> {
    const {
      skip,
      take,
      isExportAll,
      orderBy,
      orderDirection,
      searchBy,
      searchKeyword,
      fromDate,
      toDate,
    } = filterOptionsModel;

    let whereFromDate = '';
    if (fromDate) {
      whereFromDate = `AND "order"."createdDate" >= '${fromDate}'`;
    }

    let whereToDate = '';
    if (toDate) {
      whereToDate = `AND "order"."createdDate" <= '${toDate}'`;
    }

    let whereKeyWord = '';
    if (searchBy && searchKeyword) {
      switch (searchBy) {
        case FILTER_STATISTIC.EMAIL:
          whereKeyWord = `WHERE customer.email LIKE '%${searchKeyword}%'`;
          break;
        case FILTER_STATISTIC.PHONE:
          whereKeyWord = `WHERE customer."phoneNumber" LIKE '%${searchKeyword}%'`;
          break;
        case FILTER_STATISTIC.NAME:
          whereKeyWord = `
            WHERE
              LOWER(customer."firstName") LIKE '%${searchKeyword.toLowerCase()}%'
              OR LOWER(customer."lastName") LIKE '%${searchKeyword.toLowerCase()}%'
              OR LOWER(CONCAT(customer."firstName", ' ', customer."lastName")) LIKE '%${searchKeyword.toLowerCase()}%'
          `;
          break;
        case FILTER_STATISTIC.COMPANY_NAME:
          whereKeyWord = `WHERE customer."companyId" IN (
            SELECT id FROM company WHERE name LIKE '%${searchKeyword.toLowerCase()}%'
          )`;
          break;
      }
    }

    let limit = '';
    if (!isExportAll && take) {
      limit = `LIMIT ${take}`;
    }

    let offset = '';
    if (!isExportAll && skip) {
      offset = `OFFSET ${skip}`;
    }

    let sort = '';
    if (orderBy && orderDirection) {
      sort = `ORDER BY "${orderBy}" ${orderDirection}`;
    }

    const query = `
      SELECT
        customer.id,
        customer."firstName",
        customer."lastName",
        customer."email",
        COALESCE((
          SELECT
            COUNT("order".id)
          FROM "order"
          WHERE
            ("order"."createdByCustomerId" = customer.id
            or (
              customer."accountRole" = '${ACCOUNT_ROLE.OWNER}'
              AND "order"."customerOwnerId" = customer.id
            ))
            AND "order"."status" = '${ORDER_STATUS.DELIVERED}'
            ${whereFromDate}
            ${whereToDate}
        ), 0) AS quantity,
        COALESCE((
          SELECT
            SUM(
              CASE
                WHEN "useSuggestedPrice" = true THEN "suggestedPrice" +
                  COALESCE((SELECT SUM(price) FROM additional_price WHERE "orderId" = "order".id), 0)
                ELSE "priceRequest" +
                  COALESCE((SELECT SUM(price) FROM additional_price WHERE "orderId" = "order".id), 0)
              END
            )
          FROM "order"
          WHERE
            "order"."createdByCustomerId" = customer.id
            AND "order"."status" = '${ORDER_STATUS.DELIVERED}'
            ${whereFromDate}
            ${whereToDate}
        ), 0) AS "individualTotalPrice",
        COALESCE((
          SELECT
            SUM(
              CASE
                WHEN "useSuggestedPrice" = true THEN "suggestedPrice" +
                  COALESCE((SELECT SUM(price) FROM additional_price WHERE "orderId" = "order".id), 0)
                ELSE "priceRequest" +
                  COALESCE((SELECT SUM(price) FROM additional_price WHERE "orderId" = "order".id), 0)
              END
            )
          FROM "order"
          WHERE
            ("order"."createdByCustomerId" = customer.id
            or (
              customer."accountRole" = '${ACCOUNT_ROLE.OWNER}'
              AND "order"."customerOwnerId" = customer.id
            ))
            AND "order"."status" = '${ORDER_STATUS.DELIVERED}'
            ${whereFromDate}
            ${whereToDate}
        ), 0) AS "totalPrice"
      FROM customer
      ${whereKeyWord}
      GROUP BY customer.id
      ${sort}
      ${limit}
      ${offset}
    `;

    const result = await getManager().query(query);

    const queryCount = `
      SELECT COUNT(*) AS count
      FROM (
        SELECT id
        FROM customer
        ${whereKeyWord}
        GROUP BY id
      ) AS tmp
    `;

    const count = await getManager().query(queryCount);
    return [result, count[0]['count']];
  }

  async getTruckOwnerStatistics(
    filterOptionsModel: Record<string, any>,
  ): Promise<[any[], number]> {
    const {
      skip,
      take,
      isExportAll,
      orderBy,
      orderDirection,
      searchBy,
      searchKeyword,
      fromDate,
      toDate,
    } = filterOptionsModel;

    let whereFromDate = '';
    if (fromDate) {
      whereFromDate = `AND "order"."createdDate" >= '${fromDate}'`;
    }

    let whereToDate = '';
    if (toDate) {
      whereToDate = `AND "order"."createdDate" <= '${toDate}'`;
    }

    let whereKeyWord = '';
    if (searchBy && searchKeyword) {
      switch (searchBy) {
        case FILTER_STATISTIC.EMAIL:
          whereKeyWord = `WHERE truck_owner.email LIKE '%${searchKeyword}%'`;
          break;
        case FILTER_STATISTIC.PHONE:
          whereKeyWord = `WHERE truck_owner."phoneNumber" LIKE '%${searchKeyword}%'`;
          break;
        case FILTER_STATISTIC.NAME:
          whereKeyWord = `
            WHERE
              LOWER(truck_owner."firstName") LIKE '%${searchKeyword.toLowerCase()}%'
              OR LOWER(truck_owner."lastName") LIKE '%${searchKeyword.toLowerCase()}%'
              OR LOWER(CONCAT(truck_owner."firstName", ' ', truck_owner."lastName")) LIKE '%${searchKeyword.toLowerCase()}%'
          `;
          break;
        case FILTER_STATISTIC.PUBLIC_ID:
          whereKeyWord = `WHERE truck_owner."publicId" = '${searchKeyword}'`;
          break;
      }
    }

    let limit = '';
    if (!isExportAll && take) {
      limit = `LIMIT ${take}`;
    }

    let offset = '';
    if (!isExportAll && skip) {
      offset = `OFFSET ${skip}`;
    }

    let sort = '';
    if (orderBy && orderDirection) {
      sort = `ORDER BY "${orderBy}" ${orderDirection}`;
    }

    const query = `
      SELECT
        truck_owner.id,
        truck_owner."firstName",
        truck_owner."lastName",
        truck_owner."email",
        COALESCE((
          SELECT
            COUNT("order".id)
          FROM "order"
          WHERE
            "order"."ownerId" = truck_owner.id
            AND "order"."status" = '${ORDER_STATUS.DELIVERED}'
            ${whereFromDate}
            ${whereToDate}
        ), 0) AS quantity,
        COALESCE((
          SELECT
            SUM(
              CASE
                WHEN "useSuggestedPrice" = true THEN "suggestedPrice" +
                  COALESCE((SELECT SUM(price) FROM additional_price WHERE "orderId" = "order".id), 0)
                ELSE "priceRequest" +
                  COALESCE((SELECT SUM(price) FROM additional_price WHERE "orderId" = "order".id), 0)
              END
            )
          FROM "order"
          WHERE
            "order"."ownerId" = truck_owner.id
            AND "order"."status" = '${ORDER_STATUS.DELIVERED}'
            ${whereFromDate}
            ${whereToDate}
        ), 0) AS "totalPrice",
        COALESCE((
          SELECT
            SUM(
              COALESCE((
                CASE
                WHEN "useSuggestedPrice" = true THEN ("suggestedPrice" +
                  COALESCE((SELECT SUM(price) FROM additional_price WHERE "orderId" = "order".id), 0))
                ELSE "priceRequest" +
                  COALESCE((SELECT SUM(price) FROM additional_price WHERE "orderId" = "order".id), 0)
                END
              ), 0) * (
                CASE WHEN "isSetCommission" AND "percentCommission" IS NOT NULL THEN "percentCommission" ELSE 0 END
              ) / 100 + (
                CASE WHEN "isSetCommission" AND "fixedCommission" IS NOT NULL THEN "fixedCommission" ELSE 0 END
              )
            )
          FROM "order"
          WHERE
            "order"."ownerId" = truck_owner.id
            AND "order"."status" = '${ORDER_STATUS.DELIVERED}'
            ${whereFromDate}
            ${whereToDate}
        ), 0) AS "earnings"
      FROM truck_owner
      ${whereKeyWord}
      GROUP BY truck_owner.id
      ${sort}
      ${limit}
      ${offset}
    `;

    const result = await getManager().query(query);

    const queryCount = `
      SELECT COUNT(*) AS count
      FROM (
        SELECT id
        FROM truck_owner
        ${whereKeyWord}
        GROUP BY id
      ) AS tmp
    `;

    const count = await getManager().query(queryCount);
    return [result, count[0]['count']];
  }

  async getNewOrders(
    customerIdList: number[],
    zone: number[],
    truckPayload: (string | TRUCK_PAYLOAD)[],
    containerSize: string[],
    filterOptionsModel: FilterRequestDto,
    serviceType: SERVICE_TYPE,
    truckOwnerId: number,
    nonMotorizedType?: (string | NON_MOTORIZED_TYPE)[],
    concatenatedGoodsType?: (string | CONCATENATED_GOODS_TYPE)[],
    contractCarType?: (string | CONTRACT_CAR_TYPE)[],
  ): Promise<[Order[], number]> {
    if (zone.length === 0) {
      return [[], 0];
    }

    let where: any[] = [{ createdByAdminId: Not(IsNull()) }];

    if (customerIdList.length) {
      where.push({
        createdByCustomerId: In(customerIdList),
      });
    }

    where = where.map(w => ({ ...w, ownerId: null }));

    //remember to check array length before use In()
    if (!filterOptionsModel.isGetAll && truckPayload.length) {
      where = where.map(w => ({
        ...w,
        truckPayload: In(truckPayload),
      }));
    }

    if (
      customerIdList.length &&
      containerSize.length &&
      !filterOptionsModel.isGetAll
    ) {
      where.push({
        createdByCustomerId: In(customerIdList),
        containerSize: In(containerSize),
      });
    }

    if (!filterOptionsModel.isGetAll && nonMotorizedType.length) {
      if (!nonMotorizedType.includes(NON_MOTORIZED_TYPE_FILTER.ANY)) {
        where.push({
          createdByCustomerId: In(customerIdList),
          nonMotorizedType: In(nonMotorizedType),
          serviceType: SERVICE_TYPE.NON_MOTORIZED_VEHICLE,
        });
        where.push({
          createdByAdminId: Not(IsNull()),
          nonMotorizedType: In(nonMotorizedType),
          serviceType: SERVICE_TYPE.NON_MOTORIZED_VEHICLE,
        });
      } else {
        where.push({
          createdByCustomerId: In(customerIdList),
          serviceType: SERVICE_TYPE.NON_MOTORIZED_VEHICLE,
        });
        where.push({
          createdByAdminId: Not(IsNull()),
          serviceType: SERVICE_TYPE.NON_MOTORIZED_VEHICLE,
        });
      }
    }

    if (!filterOptionsModel.isGetAll && concatenatedGoodsType.length > 0) {
      if (!concatenatedGoodsType.includes(CONCATENATED_GOODS_TYPE_FILTER.ANY)) {
        where.push({
          createdByCustomerId: In(customerIdList),
          concatenatedGoodsType: In(concatenatedGoodsType),
          serviceType: SERVICE_TYPE.CONCATENATED_GOODS,
        });
        where.push({
          createdByAdminId: Not(IsNull()),
          concatenatedGoodsType: In(concatenatedGoodsType),
          serviceType: SERVICE_TYPE.CONCATENATED_GOODS,
        });
      } else {
        where.push({
          createdByCustomerId: In(customerIdList),
          serviceType: SERVICE_TYPE.CONCATENATED_GOODS,
        });
        where.push({
          createdByAdminId: Not(IsNull()),
          serviceType: SERVICE_TYPE.CONCATENATED_GOODS,
        });
      }
    }

    if (!filterOptionsModel.isGetAll && contractCarType.length > 0) {
      if (!contractCarType.includes(CONTRACT_CAR_TYPE_FILTER.ANY)) {
        where.push({
          createdByCustomerId: In(customerIdList),
          contractCarType: In(contractCarType),
          serviceType: SERVICE_TYPE.CONTRACT_CAR,
        });
        where.push({
          createdByAdminId: Not(IsNull()),
          contractCarType: In(contractCarType),
          serviceType: SERVICE_TYPE.CONTRACT_CAR,
        });
      } else {
        where.push({
          createdByCustomerId: In(customerIdList),
          serviceType: SERVICE_TYPE.CONTRACT_CAR,
        });
        where.push({
          createdByAdminId: Not(IsNull()),
          serviceType: SERVICE_TYPE.CONTRACT_CAR,
        });
      }
    }

    if (customerIdList.length) {
      //where['createdByCustomerId'] = In(customerIdList);
      where.push({
        createdByCustomerId: In(customerIdList),
        orderType: ORDER_TYPE.QUICK,
      });
    } else {
      where.push({ orderType: ORDER_TYPE.QUICK });
    }

    if (!filterOptionsModel.isGetAll && serviceType) {
      if (serviceType === SERVICE_TYPE.NORMAL_TRUCK_VAN) {
        const checkAnyPayload = truckPayload.find(
          item => item == TRUCK_PAYLOAD.ANY,
        );
        if (checkAnyPayload) {
          where = where.map(w => ({
            ...w,
            serviceType: serviceType,
          }));
        } else {
          where = where.map(w => ({
            ...w,
            serviceType: serviceType,
            truckPayload: In(truckPayload),
          }));
        }
      } else if (serviceType === SERVICE_TYPE.TRAILOR_TRACTOR_TRUCK) {
        let checkAllSize = true;
        for (const item of Object.values(CONTAINER_SIZE)) {
          if (!containerSize.includes(item)) {
            checkAllSize = false;
            break;
          }
        }
        if (checkAllSize) {
          where = where.map(w => ({
            ...w,
            serviceType: serviceType,
          }));
        } else {
          where = where.map(w => ({
            ...w,
            serviceType: serviceType,
            containerSize: In(containerSize),
          }));
        }
      } else if (serviceType === SERVICE_TYPE.CONCATENATED_GOODS) {
        const checkAnyType = concatenatedGoodsType.length === 4;

        if (checkAnyType || concatenatedGoodsType.length === 0) {
          where = where.map(w => ({
            ...w,
            serviceType: serviceType,
          }));
        } else {
          where = where.map(w => {
            if (w.orderType === ORDER_TYPE.QUICK) {
              return {
                ...w,
                serviceType: serviceType,
              };
            }
            return {
              ...w,
              serviceType: serviceType,
              concatenatedGoodsType: In(concatenatedGoodsType),
            };
          });
        }
      } else if (serviceType === SERVICE_TYPE.CONTRACT_CAR) {
        const checkAnyType = contractCarType.length === 3;

        if (checkAnyType || contractCarType.length === 0) {
          where = where.map(w => ({
            ...w,
            serviceType: serviceType,
          }));
        } else {
          where = where.map(w => {
            if (w.orderType === ORDER_TYPE.QUICK) {
              return {
                ...w,
                serviceType: serviceType,
              };
            }
            return {
              ...w,
              serviceType: serviceType,
              contractCarType: In(contractCarType),
            };
          });
        }
      } else {
        const checkAllSize = nonMotorizedType.length === 2;
        if (checkAllSize) {
          where = where.map(w => ({
            ...w,
            serviceType: serviceType,
          }));
        } else {
          where = where.map(w => ({
            ...w,
            serviceType: serviceType,
            nonMotorizedType: In(nonMotorizedType),
          }));
        }
      }
    }
    if (!filterOptionsModel.isGetAll && zone.length && zone.length !== 63) {
      where = where.map(w => ({ ...w, pickupCity: In(zone) }));
    }

    where.push({
      assignToFav: truckOwnerId,
    });

    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;
    const order = {};

    if (filterOptionsModel.orderBy) {
      order[filterOptionsModel.orderBy] = filterOptionsModel.orderDirection;
    } else {
      (order as any).createdDate = 'DESC';
    }

    if (searchBy && searchKeyword) {
      filterOptionsModel.order[searchBy] = Like(`%${searchKeyword}%`);
    }

    where = where.map(w => ({ ...w, ...filterOptionsModel.order }));

    const options: FindManyOptions<Order> = {
      where,
      skip,
      take,
      order,
      relations: ['createdByCustomer'],
    };

    const result = await this.findAndCount(options);
    for (let i = 0; i < result[0].length; i++) {
      if (result[0][i].assignToFav) {
        if (+result[0][i].assignToFav !== truckOwnerId) {
          result[1] = result[1] - 1;
          result[0].splice(i, 1);
        }
      }
    }

    for (let i = 0; i < result[0].length; i++) {
      result[0][i]['priceCalculate'] = this.calTotalPrice(result[0][i]);
      result[0][i]['commission'] = this.calCommission(
        result[0][i],
        result[0][i]['priceCalculate'],
      );
      if (!result[0][i].isSetCommission || !result[0][i].allowSeePrice) {
        result[0][i]['priceCalculate'] = null;
      }
      if (!result[0][i].isSetCommission || !result[0][i].allowSeeCommission) {
        result[0][i]['commission'] = null;
      }
    }

    return result;
  }

  calTotalPrice(data) {
    let total = 0;
    if (data.useSuggestedPrice) {
      total = data.suggestedPrice;
    } else {
      total = data.priceRequest;
    }
    if (data.additionalPrices && data.additionalPrices.length > 0) {
      total += data.additionalPrices
        .map(item => item.price)
        .reduce((x, y) => x + y);
    }
    return total;
  }

  calCommission(data, total = null) {
    if (!total) {
      total = this.calTotalPrice(data);
    }
    const fixedComm = data.fixedCommission ?? 0;
    const percentComm = data.percentCommission ?? 0;
    return (total * percentComm) / 100 + fixedComm;
  }

  // async exportOrdersByCustomer(
  //   customer: Customer,
  //   orderIds: number[],
  //   customerOwnerId: number,
  //   isSelectedAll: boolean,
  // ): Promise<ExportOrdersByCustomerNewDto[]> {
  //   const query = this.createQueryBuilder('order')
  //     .leftJoinAndSelect('order.company', 'company')
  //     .leftJoinAndSelect('order.createdByCustomer', 'createdByCustomer')
  //     .leftJoinAndSelect('order.createdByAdmin', 'createdByAdmin')
  //     .leftJoinAndSelect(
  //       'order.owner',
  //       'truckOwner',
  //       'truckOwner.id = order.ownerId',
  //     );

  //   if (isSelectedAll) {
  //     query.where('order.createdByCustomerId = :customerId', {
  //       customerId: customer.id,
  //     });
  //   } else {
  //     if (customerOwnerId) {
  //       query.where(
  //         'order.id IN (:...orderIds) AND order.customerOwnerId = :customerOwnerId',
  //         {
  //           orderIds: orderIds,
  //           customerOwnerId: customerOwnerId,
  //         },
  //       );
  //     }
  //   }

  //   const orders = await query.getMany();
  //   const result = orders.map(o => new ExportOrdersByCustomerNewDto({ ...o }));
  //   return result;
  // }

  async exportReportOrdersByCustomer(
    customerId: number,
    ownerId: number,
    orderIds: number[],
    isSelectedAll: boolean,
    month: number,
    year: number,
    typeOrder: string,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const { begin, end } = this._prepareYearCondition(month, year);

    const query = this.createQueryBuilder('order');

    let where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        createdByCustomerId: customerId,
      },
    ];

    if (ownerId !== -1) {
      where.push({
        createdDate: Between(begin, end),
        customerOwnerId: ownerId,
      });
    }

    if (typeOrder === TYPE_REPORT.PENDING) {
      where = where.map(condition => ({
        ...condition,
        status: Not(In([ORDER_STATUS.CANCELED, ORDER_STATUS.DELIVERED])),
      }));
    }

    if (typeOrder === TYPE_REPORT.COMPLETED) {
      where = where.map(condition => ({
        ...condition,
        status: ORDER_STATUS.DELIVERED,
      }));
    }

    if (typeOrder === TYPE_REPORT.CANCELLED) {
      where = where.map(condition => ({
        ...condition,
        status: ORDER_STATUS.CANCELED,
      }));
    }

    if (isSelectedAll) {
      query
        .where(where)
        .leftJoinAndSelect(
          'order.owner',
          'truckOwner',
          'truckOwner.id = order.ownerId',
        );
    } else {
      query
        .andWhere('order.id IN (:...orderIds)', {
          orderIds: orderIds,
        })
        .leftJoinAndSelect(
          'order.createdByCustomer',
          'customer',
          'customer.id = :customerId',
          {
            customerId,
          },
        )
        .leftJoinAndSelect(
          'order.owner',
          'truckOwner',
          'truckOwner.id = order.ownerId',
        );
    }

    const orders = await query.getMany();
    const result = orders.map(o => new ExportOrdersByCustomerDto({ ...o }));
    return result;
  }

  async exportReportTruckOwnersByCustomer(
    customerId: number,
    ownerId: number,
    orderIds: number[],
    isSelectedAll: boolean,
    month: number,
    year: number,
    truckOwnerId: number,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const { begin, end } = this._prepareYearCondition(month, year);

    const query = this.createQueryBuilder('order');

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        createdByCustomerId: customerId,
        status: ORDER_STATUS.DELIVERED,
        ownerId: truckOwnerId,
      },
    ];

    if (ownerId !== -1) {
      where.push({
        createdDate: Between(begin, end),
        customerOwnerId: ownerId,
        status: ORDER_STATUS.DELIVERED,
        ownerId: truckOwnerId,
      });
    }

    if (isSelectedAll) {
      query
        .where(where)
        .leftJoinAndSelect(
          'order.owner',
          'truckOwner',
          'truckOwner.id = order.ownerId',
        );
    } else {
      query
        .andWhere('order.id IN (:...orderIds)', {
          orderIds: orderIds,
        })
        .leftJoinAndSelect(
          'order.createdByCustomer',
          'customer',
          'customer.id = :customerId',
          {
            customerId,
          },
        )
        .leftJoinAndSelect(
          'order.owner',
          'truckOwner',
          'truckOwner.id = order.ownerId',
        );
    }

    const orders = await query.getMany();
    const result = orders.map(o => new ExportOrdersByCustomerDto({ ...o }));
    return result;
  }

  async exportReportOrdersByAdmin(
    orderIds: number[],
    isSelectedAll: boolean,
    month: number,
    year: number,
    typeOrder: string,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const { begin, end } = this._prepareYearCondition(month, year);

    const query = this.createQueryBuilder('order');

    let where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
      },
    ];

    if (typeOrder === TYPE_REPORT.PENDING) {
      where = where.map(condition => ({
        ...condition,
        status: Not(In([ORDER_STATUS.CANCELED, ORDER_STATUS.DELIVERED])),
      }));
    }

    if (typeOrder === TYPE_REPORT.COMPLETED) {
      where = where.map(condition => ({
        ...condition,
        status: ORDER_STATUS.DELIVERED,
      }));
    }

    if (typeOrder === TYPE_REPORT.CANCELLED) {
      where = where.map(condition => ({
        ...condition,
        status: ORDER_STATUS.CANCELED,
      }));
    }

    if (isSelectedAll) {
      query
        .where(where)
        .leftJoinAndSelect(
          'order.owner',
          'truckOwner',
          'truckOwner.id = order.ownerId',
        );
    } else {
      query
        .andWhere('order.id IN (:...orderIds)', {
          orderIds: orderIds,
        })
        .leftJoinAndSelect(
          'order.owner',
          'truckOwner',
          'truckOwner.id = order.ownerId',
        );
    }

    const orders = await query.getMany();
    const result = orders.map(o => new ExportOrdersByCustomerDto({ ...o }));
    return result;
  }

  async exportReportTruckOwnersByAdmin(
    orderIds: number[],
    isSelectedAll: boolean,
    month: number,
    year: number,
    truckOwnerId: number,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const { begin, end } = this._prepareYearCondition(month, year);

    const query = this.createQueryBuilder('order');

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        status: ORDER_STATUS.DELIVERED,
        ownerId: truckOwnerId,
      },
    ];

    if (isSelectedAll) {
      query
        .where(where)
        .leftJoinAndSelect(
          'order.owner',
          'truckOwner',
          'truckOwner.id = order.ownerId',
        );
    } else {
      query
        .andWhere('order.id IN (:...orderIds)', {
          orderIds: orderIds,
        })
        .leftJoinAndSelect(
          'order.owner',
          'truckOwner',
          'truckOwner.id = order.ownerId',
        );
    }

    const orders = await query.getMany();
    const result = orders.map(o => new ExportOrdersByCustomerDto({ ...o }));
    return result;
  }

  // async exportOrdersByAdmin(
  //   adminId: number,
  //   orderIds: number[],
  //   isSelectedAll: boolean,
  // ): Promise<any> {
  //   const query = this.createQueryBuilder('order');

  //   if (!isSelectedAll) {
  //     query
  //       .where('order.id IN (:...orderIds)', {
  //         orderIds: orderIds,
  //       })
  //       .leftJoinAndSelect(
  //         'order.owner',
  //         'truckOwner',
  //         'truckOwner.id = order.ownerId',
  //       );
  //   } else {
  //     query.leftJoinAndSelect(
  //       'order.owner',
  //       'truckOwner',
  //       'truckOwner.id = order.ownerId',
  //     );
  //   }
  //   const orders = await query.getMany();

  //   const result = orders.map(o => new ExportOrdersByCustomerDto({ ...o }));

  //   return result;
  // }

  async getOrderByDriver(
    driverId: number,
    filter: GetRequest,
  ): Promise<[Order[], number]> {
    const orderIds = await getConnection().query(
      `
      SELECT o.id
      FROM PUBLIC.order o
      INNER JOIN PUBLIC.order_drivers_driver od ON o.id = od."orderId"
      WHERE od."driverId" = $1;
      `,
      [driverId],
    );

    if (!orderIds.length) return [[], 0];

    const { skip, take } = filter;

    const result = await this.findAndCount({
      where: {
        id: In(orderIds.map(o => o.id)),
      },
      skip,
      take,
      relations: ['additionalPrices'],
      order: {
        updatedDate: 'DESC',
      },
    });

    const generalSetting = await getRepository(Settings).findOne();

    if (result[0]) {
      for (let i = 0; i < result[0].length; i++) {
        result[0][i]['priceCalculate'] = this.calTotalPrice(result[0][i]);
        result[0][i]['commission'] = this.calCommission(
          result[0][i],
          result[0][i]['priceCalculate'],
        );
        if (!result[0][i].isSetCommission || !result[0][i].allowSeePrice) {
          result[0][i]['priceCalculate'] = null;
        }
        if (!result[0][i].isSetCommission || !result[0][i].allowSeeCommission) {
          result[0][i]['commission'] = null;
        }
        result[0][i]['allowSeeCommission'] =
          generalSetting.enableCommission &&
          result[0][i]['isSetCommission'] &&
          result[0][i]['allowSeeCommission'];
      }
    }

    return result;
  }

  async getJobs(
    truckOwnerId: number,
    filterOptionsModel: FilterRequestDto,
    status: string | string[],
  ): Promise<[JobsResponseDto[], number]> {
    const a = REFERENCE_TYPE.ORDER_DOCUMENT;
    const generalSetting = await getRepository(Settings).findOne();

    const { skip, take, orderBy, searchBy, searchKeyword } = filterOptionsModel;
    const query = this.createQueryBuilder('order')
      .where('order.status IN (:...status) AND order.ownerId = :truckOwnerId', {
        status,
        truckOwnerId,
      })
      .leftJoinAndMapMany(
        'order.document',
        File,
        'document',
        'document.referenceType = :a and document.referenceId = order.id',
        { a },
      )
      .leftJoinAndMapMany('order.drivers', Driver, 'd', 'd.orderId = order.id')
      .leftJoinAndMapMany('order.trucks', Truck, 't', 't.orderId = order.id')
      .leftJoinAndMapMany(
        'order.tracking',
        Tracking,
        'tr',
        'tr.orderId = order.id',
      )
      .leftJoinAndMapOne(
        'order.createdByCustomer',
        Customer,
        'c',
        'c.id = order.createdByCustomer',
      )
      .leftJoinAndMapOne(
        'order.createdByAdmin',
        Admin,
        'a',
        'a.id = order.createdByAdmin',
      )
      .leftJoinAndSelect('order.additionalPrices', 'additionalPrices')
      .leftJoinAndSelect('order.notes', 'note');
    if (searchBy === 'customerEmail') {
      const [jobs, count] = await query
        .andWhere(`LOWER("c"."email") like '%${searchKeyword.toLowerCase()}%'`)
        .skip(skip)
        .take(take)
        .orderBy(`order.${orderBy}`, 'DESC')
        .select()
        .getManyAndCount();

      const modifiedJobs = jobs.map(
        j => new JobsResponseDto(j, generalSetting.enableCommission),
      );
      return [modifiedJobs, count];
    }
    if (searchBy) {
      const [jobs, count] = await query
        .andWhere(`"order"."${searchBy}" ILIKE :searchKeyword`, {
          searchKeyword: `%${searchKeyword}%`,
        })
        .skip(skip)
        .take(take)
        .orderBy(`order.${orderBy}`, 'DESC')
        .select()
        .getManyAndCount();

      const modifiedJobs = jobs.map(
        j => new JobsResponseDto(j, generalSetting.enableCommission),
      );
      return [modifiedJobs, count];
    }
    const [jobs, count] = await query
      .skip(skip)
      .take(take)
      .orderBy(`order.${orderBy}`, 'DESC')
      .select()
      .getManyAndCount();

    const modifiedJobs = jobs.map(
      j => new JobsResponseDto(j, generalSetting.enableCommission),
    );
    return [modifiedJobs, count];
  }

  async getCustomerDataReportByCustomer(
    customer: Customer,
    model: Record<string, any>,
  ): Promise<any> {
    const query = this.createQueryBuilder('order');

    const { begin, end } = this._prepareYearCondition(
      +model.month,
      +model.year,
    );

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        createdByCustomerId: customer.id,
      },
    ];

    if (customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE) {
      where.push({
        createdDate: Between(begin, end),
        customerOwnerId: customer.ownerId,
      });
    }
    query.where(where);

    const data = await query.getManyAndCount();

    const beginYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'ASC' },
    });

    const endYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'DESC' },
    });

    return [data, beginYear, endYear];
  }

  async getCustomerDataReportByAdmin(model: Record<string, any>): Promise<any> {
    const query = this.createQueryBuilder('order');

    const { begin, end } = this._prepareYearCondition(
      +model.month,
      +model.year,
    );

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
      },
    ];
    query.where(where);

    const data = await query.getManyAndCount();

    const beginYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'ASC' },
    });

    const endYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'DESC' },
    });

    return [data, beginYear, endYear];
  }

  async getOrderDataReportByTruckOwner(
    truckOwner: TruckOwner,
    model: Record<string, any>,
  ): Promise<any> {
    const query = this.createQueryBuilder('order');

    const { begin, end } = this._prepareYearCondition(
      +model.month,
      +model.year,
    );

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        ownerId: truckOwner.id,
      },
    ];

    query.where(where);

    const data = await query.getManyAndCount();

    const beginYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'ASC' },
    });

    const endYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'DESC' },
    });

    return [data, beginYear, endYear];
  }

  async getTruckownerDataReportByCustomer(
    customer: Customer,
    model: Record<string, any>,
  ): Promise<any> {
    const query = this.createQueryBuilder('order');
    // let begin, end: any;

    // if (+model.month === -1) {
    //   const queryYear = moment().year(model.year);
    //   begin = moment(queryYear)
    //     .startOf('year')
    //     .format(FORMAT_DATE_REPORT.RELATIVE);
    //   end = moment(queryYear)
    //     .endOf('year')
    //     .format(FORMAT_DATE_REPORT.RELATIVE);
    // } else {
    //   const criteria = new Date(model.year, model.month);
    //   begin = moment(criteria)
    //     .startOf('month')
    //     .format(FORMAT_DATE_REPORT.RELATIVE);
    //   end = moment(criteria)
    //     .endOf('month')
    //     .format(FORMAT_DATE_REPORT.RELATIVE);
    // }

    const { begin, end } = this._prepareYearCondition(
      +model.month,
      +model.year,
    );

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        createdByCustomerId: customer.id,
        status: ORDER_STATUS.DELIVERED,
      },
    ];

    if (customer.accountRole !== ACCOUNT_ROLE.EXECUTIVE) {
      where.push({
        createdDate: Between(begin, end),
        customerOwnerId: customer.ownerId,
        status: ORDER_STATUS.DELIVERED,
      });
    }
    query
      .where(where)
      .leftJoinAndMapOne(
        'order.ownerId',
        TruckOwner,
        't',
        't.id = order.ownerId',
      );

    const data = await query.getManyAndCount();

    const beginYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'ASC' },
    });

    const endYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'DESC' },
    });

    return [data, beginYear, endYear];
  }

  async getTruckownerDataReportByAdmin(
    model: Record<string, any>,
  ): Promise<any> {
    const query = this.createQueryBuilder('order');
    // let begin, end: any;

    // if (+model.month === -1) {
    //   const queryYear = moment().year(model.year);
    //   begin = moment(queryYear)
    //     .startOf('year')
    //     .format(FORMAT_DATE_REPORT.RELATIVE);
    //   end = moment(queryYear)
    //     .endOf('year')
    //     .format(FORMAT_DATE_REPORT.RELATIVE);
    // } else {
    //   const criteria = new Date(model.year, model.month);
    //   begin = moment(criteria)
    //     .startOf('month')
    //     .format(FORMAT_DATE_REPORT.RELATIVE);
    //   end = moment(criteria)
    //     .endOf('month')
    //     .format(FORMAT_DATE_REPORT.RELATIVE);
    // }

    const { begin, end } = this._prepareYearCondition(
      +model.month,
      +model.year,
    );

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        status: ORDER_STATUS.DELIVERED,
      },
    ];

    query
      .where(where)
      .leftJoinAndMapOne(
        'order.ownerId',
        TruckOwner,
        't',
        't.id = order.ownerId',
      );

    const data = await query.getManyAndCount();

    const beginYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'ASC' },
    });

    const endYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'DESC' },
    });

    return [data, beginYear, endYear];
  }

  async getCustomerDataReportByTruckOwner(
    truckOwner: TruckOwner,
    model: Record<string, any>,
  ): Promise<any> {
    const query = this.createQueryBuilder('order');

    const { begin, end } = this._prepareYearCondition(
      +model.month,
      +model.year,
    );

    const where: QueryReportDto[] = [
      {
        createdDate: Between(begin, end),
        ownerId: truckOwner.id,
        status: ORDER_STATUS.DELIVERED,
      },
    ];

    query
      .where(where)
      .leftJoinAndMapOne(
        'order.createdByCustomer',
        Customer,
        'customer',
        'customer.id = order.createdByCustomerId',
      );

    const data = await query.getManyAndCount();

    const beginYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'ASC' },
    });

    const endYear = await this.findOne({
      select: ['createdDate'],
      order: { createdDate: 'DESC' },
    });

    return [data, beginYear, endYear];
  }

  private _prepareYearCondition(month: number, year: number) {
    let begin, end: any;
    if (+month === -1) {
      const queryYear = moment().year(year);
      begin = moment(queryYear)
        .startOf('year')
        .format(FORMAT_DATE_REPORT.RELATIVE);
      end = moment(queryYear)
        .endOf('year')
        .format(FORMAT_DATE_REPORT.RELATIVE);
    } else {
      const criteria = new Date(year, month);
      begin = moment(criteria)
        .startOf('month')
        .format(FORMAT_DATE_REPORT.RELATIVE);
      end = moment(criteria)
        .endOf('month')
        .format(FORMAT_DATE_REPORT.RELATIVE);
    }

    return { begin, end };
  }
}
