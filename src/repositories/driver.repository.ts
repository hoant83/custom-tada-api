import { Driver } from 'src/entities/driver/driver.entity';
import {
  Repository,
  EntityRepository,
  FindManyOptions,
  getConnection,
  Like,
  //Like,
} from 'typeorm';
import { File } from 'src/entities/file/file.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { GetDriverEarningRequestDto } from 'src/dto/commission/GetDriverEarningRequest.dto';
import * as moment from 'moment';

@EntityRepository(Driver)
export class DriverRepository extends Repository<Driver> {
  async getLoginUserWithOptions(findOptions: {
    email: string;
  }): Promise<Driver> {
    const driver = await this.createQueryBuilder('driver')
      .where('driver.email = :email', {
        ...findOptions,
      })
      .select()
      .getOne();
    return driver;
  }

  async getLoginWithPhone(findOptions: {
    phoneNumber: string;
  }): Promise<Driver> {
    const [a, b, c] = [
      REFERENCE_TYPE.DRIVER_LICENSE,
      REFERENCE_TYPE.DRIVER_ID_CARD_FRONT_IMAGE,
      REFERENCE_TYPE.DRIVER_ID_CARD_BACK_IMAGE,
    ];
    const driver = await this.createQueryBuilder('driver')
      .where('driver.phoneNumber = :phoneNumber', {
        ...findOptions,
      })
      .leftJoinAndMapOne(
        'driver.license',
        File,
        'license',
        'license.referenceType =:a and license.referenceId = driver.id',
        { a },
      )
      .leftJoinAndMapOne(
        'driver.card_front_image',
        File,
        'card_front_image',
        'card_front_image.referenceType =:b and card_front_image.referenceId = driver.id',
        { b },
      )
      .leftJoinAndMapOne(
        'driver.card_back_image',
        File,
        'card_back_image',
        'card_back_image.referenceType =:c and card_back_image.referenceId = driver.id',
        { c },
      )
      .select()
      .withDeleted()
      .addSelect(['card_front_image', 'license', 'card_back_image'])
      .getOne();

    return driver;
  }

  async getDriverWithOptions(findOptions: { id: number }): Promise<Driver> {
    const [a, b, c, d] = [
      REFERENCE_TYPE.DRIVER_LICENSE,
      REFERENCE_TYPE.DRIVER_ID_CARD_FRONT_IMAGE,
      REFERENCE_TYPE.DRIVER_ID_CARD_BACK_IMAGE,
      REFERENCE_TYPE.OTHER_DRIVER_DOCUMENT,
    ];
    const driver = await this.createQueryBuilder('driver')
      .where('driver.id = :id', {
        ...findOptions,
      })
      .leftJoinAndMapOne(
        'driver.license',
        File,
        'license',
        'license.referenceType =:a and license.referenceId = driver.id',
        { a },
      )
      .leftJoinAndMapOne(
        'driver.card_front_image',
        File,
        'card_front_image',
        'card_front_image.referenceType =:b and card_front_image.referenceId = driver.id',
        { b },
      )
      .leftJoinAndMapOne(
        'driver.card_back_image',
        File,
        'card_back_image',
        'card_back_image.referenceType =:c and card_back_image.referenceId = driver.id',
        { c },
      )
      .leftJoinAndMapMany(
        'driver.otherDocuments',
        File,
        'otherDocument',
        'otherDocument.referenceType =:d and otherDocument.referenceId = driver.id',
        { d },
      )
      .select()
      .getOne();

    return driver;
  }

  async getDriversWithOptions(findOptions: {
    ownerId: number;
    options: FindManyOptions<Driver>;
  }): Promise<any> {
    const [a, b, c] = [
      REFERENCE_TYPE.DRIVER_LICENSE,
      REFERENCE_TYPE.DRIVER_ID_CARD_FRONT_IMAGE,
      REFERENCE_TYPE.DRIVER_ID_CARD_BACK_IMAGE,
    ];
    const drivers = await this.createQueryBuilder('driver')
      .where('driver.ownerId = :ownerId', {
        ...findOptions,
      })
      .leftJoinAndMapOne(
        'driver.license',
        File,
        'license',
        'license.referenceType =:a and license.referenceId = driver.id',
        { a },
      )
      .leftJoinAndMapOne(
        'driver.card_front_image',
        File,
        'card_front_image',
        'card_front_image.referenceType =:b and card_front_image.referenceId = driver.id',
        { b },
      )
      .leftJoinAndMapOne(
        'driver.card_back_image',
        File,
        'card_back_image',
        'card_back_image.referenceType =:c and card_back_image.referenceId = driver.id',
        { c },
      )
      .select()
      .addSelect(['card_front_image', 'license', 'card_back_image'])
      .getMany();

    return drivers;
  }

  async getDriver(phoneNumber: string): Promise<Driver> {
    const driver = await getConnection().query(
      `
      SELECT c.id ,c."ownerId", c."deletedAt"
      FROM PUBLIC.driver c
      WHERE c."phoneNumber" = $1
      `,
      [phoneNumber],
    );

    if (driver.length) return driver[0];
    return null;
  }

  async getDeletedDrivers(findOptions: {
    take: number;
    skip: number;
    search: any;
  }): Promise<any> {
    const [drivers, count] = await Promise.all([
      getConnection().query(
        `SELECT "c"."id", "c"."updatedDate", "c"."createdDate", "c"."email", "c"."phoneNumber", "c"."firstName", "c"."lastName", "c"."verifiedStatus", "c"."status", "c"."cardNo"
 FROM "driver" "c" WHERE "c"."deletedAt" IS NOT NULL ${findOptions.search} ORDER BY "c"."id" ASC LIMIT $1
 OFFSET $2`,
        [findOptions.take, findOptions.skip],
      ),
      getConnection().query(
        'SELECT COUNT(DISTINCT("c"."id")) as "total" FROM "driver" "c" WHERE "c"."deletedAt" IS NOT NULL',
      ),
    ]);
    return [drivers, count];
  }

  async getDriversEarning(
    model: GetDriverEarningRequestDto,
    ownerId: number,
  ): Promise<any> {
    const where: any = {
      phoneNumber: Like(`%${model.phone || ''}%`),
    };
    if (ownerId) {
      where.ownerId = ownerId;
    }
    const driverQueryBuilder = getConnection()
      .getRepository(Driver)
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.orders', 'order')
      .leftJoinAndSelect('driver.paymentHistory', 'paymentHistory')
      .where(where)
      .andWhere('order.updatedDate >= :from AND order.updatedDate <= :to', {
        from: model.from
          ? moment(model.from, 'MM-YYYY').toISOString()
          : moment('10-2000', 'MM-YYYY').toISOString(),
        to: model.to
          ? moment(model.to, 'MM-YYYY').toISOString()
          : moment().toISOString(),
      })
      .leftJoinAndSelect('order.additionalPrices', 'additionalPrice');

    const [drivers, count] = await Promise.all([
      driverQueryBuilder
        .take(model.take)
        .skip(model.skip)
        .getMany(),
      driverQueryBuilder.getCount(),
    ]);
    // drivers.forEach(driver => {
    //   console.log(driver.paymentHistory);
    // });
    return [drivers, count];
  }
}
