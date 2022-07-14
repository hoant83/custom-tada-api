import { Admin } from 'src/entities/admin/admin.entity';
import { Repository, EntityRepository, getConnection } from 'typeorm';

@EntityRepository(Admin)
export class AdminRepository extends Repository<Admin> {
  async getLoginUserWithOptions(findOptions: {
    email: string;
  }): Promise<Admin> {
    const Admin = await this.createQueryBuilder('user')
      .where('user.email = :email', {
        ...findOptions,
      })
      .select([
        'user.id',
        'user.email',
        'user.password',
        'user.createdDate',
        'user.userType',
      ])
      .withDeleted()
      .getOne();
    return Admin;
  }

  async getUserWithOptions(findOptions: { email: string }): Promise<Admin> {
    const Admin = await this.createQueryBuilder('user')
      .where('user.email = :email', {
        ...findOptions,
      })
      .select()
      .withDeleted()
      .getOne();
    return Admin;
  }

  async getDeletedAdmins(findOptions: {
    take: number;
    skip: number;
    search: string;
  }): Promise<any> {
    const [admins, count] = await Promise.all([
      getConnection().query(
        `SELECT "c"."id", "c"."updatedDate", "c"."createdDate", "c"."email", "c"."phoneNumber", "c"."firstName", "c"."lastName", "c"."verifiedStatus", "c"."status", "c"."cardNo"
 FROM "admin" "c" WHERE "c"."deletedAt" IS NOT NULL ${findOptions.search} ORDER BY "c"."id" ASC LIMIT $1
 OFFSET $2`,
        [findOptions.take, findOptions.skip],
      ),
      getConnection().query(
        'SELECT COUNT(DISTINCT("c"."id")) as "total" FROM "admin" "c" WHERE "c"."deletedAt" IS NOT NULL',
      ),
    ]);
    return [admins, count];
  }
}
