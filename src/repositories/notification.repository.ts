import { Notification } from 'src/entities/notification/notification.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {
  async getFiltered(findOptions: {
    take: number;
    skip: number;
    search: string;
  }): Promise<[Notification[], number]> {
    const [notifications, count] = await this.createQueryBuilder('notification')
      .where('title ILIKE :searchTerm', {
        searchTerm: `%${findOptions.search}%`,
      })
      .orWhere('body ILIKE :searchTerm', {
        searchTerm: `%${findOptions.search}%`,
      })
      .orderBy('id', 'DESC')
      .take(findOptions.take)
      .skip(findOptions.skip)
      .select()
      .getManyAndCount();
    return [notifications, count];
  }
}
