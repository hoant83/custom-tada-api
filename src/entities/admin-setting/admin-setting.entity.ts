import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { SpecialRequest } from '../special-request/special-request.entity';
import { SETTING_TYPE } from './enums/adminSettingType.enum';

@Entity()
export class AdminSetting extends BaseEntity {
  @Column({ nullable: true, type: 'enum', enum: SETTING_TYPE })
  settingType: SETTING_TYPE;

  @Column({ default: false })
  enabled: boolean;

  @Column({ nullable: true })
  rawHtml: string;

  @Column({ nullable: true })
  remain: string;

  @OneToMany(
    () => SpecialRequest,
    specialRequest => specialRequest.adminSetting,
    { nullable: true },
  )
  specialRequests: SpecialRequest[];
}
