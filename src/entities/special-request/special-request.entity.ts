import { Entity, Column, ManyToOne } from 'typeorm';
import { AdminSetting } from '../admin-setting/admin-setting.entity';
import { BaseEntity } from '../base.entity';

@Entity()
export class SpecialRequest extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @ManyToOne(
    () => AdminSetting,
    adminSetting => adminSetting.specialRequests,
  )
  adminSetting: AdminSetting;
}
