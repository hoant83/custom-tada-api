import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { SOURCE } from 'src/entities/notification/enums/source.enum';
import { Notification } from 'src/entities/notification/notification.entity';

export class NotificationResponse {
  title: string;
  body: string;
  source: SOURCE;
  sendToCustomer: boolean;
  sendToTruck: boolean;
  notification: Partial<Notification>;

  deleteFields(): Partial<Notification> {
    const noti = { ...this.notification };

    const deleteProps = ['titleKR', 'titleID', 'bodyEN', 'bodyKR', 'bodyID'];
    for (const key of deleteProps) {
      delete noti[key];
    }

    return noti;
  }

  constructor(partial: Partial<NotificationInstance>) {
    Object.assign(this, partial);
    this.notification = this.deleteFields();
  }
}
