import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { File } from 'src/entities/file/file.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';

@EntityRepository(TruckOwner)
export class TruckOwnerRepository extends Repository<TruckOwner> {
  async getLoginUserWithOptions(findOptions: {
    email: string;
    phoneNumber: string;
  }): Promise<TruckOwner> {
    const [a, b, c] = [
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_FRONT_IMAGE,
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_BACK_IMAGE,
      REFERENCE_TYPE.TRUCK_OWNER_PROFILE_IMG,
    ];
    const truckOwner = await this.createQueryBuilder('user')
      .where('user.email = :email OR user.phoneNumber = :phoneNumber', {
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
        'user.phoneVerified',
        'user.id',
        'user.email',
        'user.password',
        'user.firstName',
        'user.lastName',
        'user.verifiedStatus',
        'user.status',
        'user.preferLanguage',
        'user.companyId',
        'user.publicId',
        'user.cardNo',
        'user.truckService',
        'user.pickupZone',
        'user.serviceType',
        'user.syncCode',
      ])
      .withDeleted()
      .addSelect(['card_front_image', 'card_back_image', 'avatar'])
      .getOne();

    return truckOwner;
  }

  async getUserWithOptions(findOptions: {
    email: string;
  }): Promise<TruckOwner> {
    const [a, b, c] = [
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_FRONT_IMAGE,
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_BACK_IMAGE,
      REFERENCE_TYPE.TRUCK_OWNER_PROFILE_IMG,
    ];
    const truckOwner = await this.createQueryBuilder('user')
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

    return truckOwner;
  }

  async getTruckOwnerById(findOptions: { id: number }): Promise<TruckOwner> {
    const [a, b] = [
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_FRONT_IMAGE,
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_BACK_IMAGE,
    ];
    const truckOwner = await this.createQueryBuilder('user')
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
      .select()
      .addSelect(['card_front_image', 'card_back_image'])
      .getOne();

    return truckOwner;
  }

  async getDeletedTruckOwners(findOptions: {
    take: number;
    skip: number;
    search: string;
  }): Promise<any> {
    const [truckOwners, count] = await Promise.all([
      getConnection().query(
        `SELECT "c"."id", "c"."updatedDate", "c"."createdDate", "c"."email", "c"."phoneNumber", "c"."firstName", "c"."lastName", "c"."verifiedStatus", "c"."status", "c"."cardNo"
 FROM "truck_owner" "c" WHERE "c"."deletedAt" IS NOT NULL ${findOptions.search} ORDER BY "c"."id" ASC LIMIT $1
 OFFSET $2`,
        [findOptions.take, findOptions.skip],
      ),
      getConnection().query(
        'SELECT COUNT(DISTINCT("c"."id")) as "total" FROM "truck_owner" "c" WHERE "c"."deletedAt" IS NOT NULL',
      ),
    ]);
    return [truckOwners, count];
  }
}
