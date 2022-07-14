import { Customer } from 'src/entities/customer/customer.entity';
import { Repository, EntityRepository, getConnection } from 'typeorm';
import { File } from 'src/entities/file/file.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';

@EntityRepository(Customer)
export class CustomerRepository extends Repository<Customer> {
  async getLoginUserWithOptions(findOptions: {
    email: string;
  }): Promise<Customer> {
    const [a, b, c] = [
      REFERENCE_TYPE.CUSTOMER_ID_CARD_FRONT_IMAGE,
      REFERENCE_TYPE.CUSTOMER_ID_CARD_BACK_IMAGE,
      REFERENCE_TYPE.CUSTOMER_PROFILE_IMG,
    ];
    const customer = await this.createQueryBuilder('user')
      .where('user.email = :email', {
        ...findOptions,
      })
      .leftJoinAndMapOne(
        'user.card_front_image',
        File,
        'card_front_image',
        'card_front_image.referenceType = :a and card_front_image.referenceId = user.id',
        { a },
      )
      .leftJoinAndMapOne(
        'user.card_back_image',
        File,
        'card_back_image',
        'card_back_image.referenceType = :b and card_back_image.referenceId = user.id',
        { b },
      )
      .leftJoinAndMapOne(
        'user.avatar',
        File,
        'avatar',
        'avatar.referenceType = :c and avatar.referenceId = user.id',
        { c },
      )
      .select([
        'user.email',
        'user.phoneNumber',
        'user.deletedAt',
        'user.emailVerified',
        'user.id',
        'user.email',
        'user.password',
        'user.firstName',
        'user.lastName',
        'user.verifiedStatus',
        'user.status',
        'user.preferLanguage',
        'user.accountRole',
        'user.accountType',
        'user.companyId',
        'user.ownerId',
        'user.cardNo',
        'user.verifyMailSentDate',
      ])
      .withDeleted()
      .addSelect(['card_front_image', 'card_back_image', 'avatar'])
      .getOne();

    return customer;
  }

  async getUserWithOptions(findOptions: { email: string }): Promise<Customer> {
    const [a, b, c] = [
      REFERENCE_TYPE.CUSTOMER_ID_CARD_FRONT_IMAGE,
      REFERENCE_TYPE.CUSTOMER_ID_CARD_BACK_IMAGE,
      REFERENCE_TYPE.CUSTOMER_PROFILE_IMG,
    ];
    const customer = await this.createQueryBuilder('user')
      .where('user.email = :email', {
        ...findOptions,
      })
      .leftJoinAndMapOne(
        'user.card_front_image',
        File,
        'card_front_image',
        'card_front_image.referenceType = :a and card_front_image.referenceId = user.id',
        { a },
      )
      .leftJoinAndMapOne(
        'user.card_back_image',
        File,
        'card_back_image',
        'card_back_image.referenceType = :b and card_back_image.referenceId = user.id',
        { b },
      )
      .leftJoinAndMapOne(
        'user.avatar',
        File,
        'avatar',
        'avatar.referenceType = :c and avatar.referenceId = user.id',
        { c },
      )
      .select()
      .withDeleted()
      .addSelect(['card_front_image', 'card_back_image', 'avatar'])
      .getOne();
    return customer;
  }

  async getCustomerById(findOptions: { id: number }): Promise<Customer> {
    const [a, b, c] = [
      REFERENCE_TYPE.CUSTOMER_ID_CARD_FRONT_IMAGE,
      REFERENCE_TYPE.CUSTOMER_ID_CARD_BACK_IMAGE,
      REFERENCE_TYPE.CUSTOMER_PROFILE_IMG,
    ];
    const customer = await this.createQueryBuilder('user')
      .where('user.id = :id', {
        ...findOptions,
      })
      .leftJoinAndMapOne(
        'user.card_front_image',
        File,
        'card_front_image',
        'card_front_image.referenceType = :a and card_front_image.referenceId = user.id',
        { a },
      )
      .leftJoinAndMapOne(
        'user.card_back_image',
        File,
        'card_back_image',
        'card_back_image.referenceType = :b and card_back_image.referenceId = user.id',
        { b },
      )
      .leftJoinAndMapOne(
        'user.avatar',
        File,
        'avatar',
        'avatar.referenceType = :c and avatar.referenceId = user.id',
        { c },
      )
      .select()
      .addSelect(['card_front_image', 'card_back_image'])
      .getOne();
    return customer;
  }

  async getEmployeeWithOptions(findOptions: {
    id: number;
    ownerId: number;
  }): Promise<Customer> {
    const [a, b] = [
      REFERENCE_TYPE.CUSTOMER_ID_CARD_FRONT_IMAGE,
      REFERENCE_TYPE.CUSTOMER_ID_CARD_BACK_IMAGE,
    ];
    const customer = await this.createQueryBuilder('user')
      .where('user.id = :id AND user.ownerId = :ownerId', {
        ...findOptions,
      })
      .leftJoinAndMapOne(
        'user.card_front_image',
        File,
        'card_front_image',
        'card_front_image.referenceType =:a and card_front_image.referenceId = user.id',
        { a },
      )
      .leftJoinAndMapOne(
        'user.card_back_image',
        File,
        'card_back_image',
        'card_back_image.referenceType =:b and card_back_image.referenceId = user.id',
        { b },
      )
      .select()
      .addSelect(['card_front_image', 'card_back_image'])
      .getOne();
    return customer;
  }

  async getAccessibleCustomers(ownerId: number): Promise<number[]> {
    const customers = await getConnection().query(
      `
      SELECT c.id
      FROM PUBLIC.customer c
      INNER JOIN PUBLIC.customer_favorite_truck_owners_truck_owner cr ON c.id = cr."customerId"
      WHERE cr."truckOwnerId" = $1
      UNION
      SELECT c.id
      FROM PUBLIC.customer c
      LEFT JOIN PUBLIC.customer_favorite_truck_owners_truck_owner cr ON c.id = cr."customerId"
      WHERE cr."customerId" IS NULL;
      `,
      [ownerId],
    );

    return customers.map(c => c.id);
  }

  async getDeletedCustomers(findOptions: {
    take: number;
    skip: number;
    search: any;
  }): Promise<any> {
    const [customers, count] = await Promise.all([
      getConnection().query(
        `SELECT "c"."id", "c"."updatedDate", "c"."createdDate", "c"."email", "c"."phoneNumber", "c"."firstName", "c"."lastName", "c"."verifiedStatus", "c"."status", "c"."cardNo", "c"."accountRole", "c"."companyId"
 FROM "customer" "c" WHERE "c"."deletedAt" IS NOT NULL ${findOptions.search} ORDER BY "c"."id" ASC LIMIT $1
 OFFSET $2`,
        [findOptions.take, findOptions.skip],
      ),
      getConnection().query(
        'SELECT COUNT(DISTINCT("c"."id")) as "total" FROM "customer" "c" WHERE "c"."deletedAt" IS NOT NULL',
      ),
    ]);
    return [customers, count];
  }

  async getCustomerByEmail(email: string): Promise<any> {
    const customer = await getConnection().query(
      `
      SELECT c.id ,c."ownerId", c."deletedAt"
      FROM PUBLIC.customer c
      WHERE c."email" = $1
      `,
      [email],
    );

    if (customer.length) return customer[0];
    return null;
  }
}
