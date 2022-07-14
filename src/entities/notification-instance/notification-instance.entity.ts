import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Notification } from '../notification/notification.entity';

@Entity()
export class NotificationInstance extends BaseEntity {
  @Column()
  referenceId: number;

  @Column({
    enum: TOKEN_ROLE,
  })
  referenceType: TOKEN_ROLE;

  @ManyToOne(
    () => Notification,
    notification => notification.instances,
  )
  notification: Notification;

  @Column({
    nullable: true,
  })
  notificationId: number;

  @Column({ default: false })
  isRead: boolean;
}
