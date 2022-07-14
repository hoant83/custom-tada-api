import {
  BLACK_BOX_TYPE,
  DISPLAY_ON,
} from 'src/common/constants/black-box.enum';
import { Column, Entity } from 'typeorm';
import { LICENSE } from '../admin/enums/userLicense.enum';
import { BaseEntity } from '../base.entity';

@Entity()
export class Settings extends BaseEntity {
  @Column({ default: true })
  orderAccepted: boolean;

  @Column({ default: 10 })
  totalAcceptedSms: number;

  @Column({ default: true })
  orderCancelled: boolean;

  @Column({ default: 10 })
  totalCancelledSms: number;

  @Column({ default: true })
  driverPickingUp: boolean;

  @Column({ default: true })
  driverDelivering: boolean;

  @Column({ default: true })
  orderComplete: boolean;

  @Column({ default: false })
  pricing: boolean;

  @Column({
    type: 'enum',
    enum: LICENSE,
    default: LICENSE.PREMIUM,
    nullable: true,
  })
  license: LICENSE;

  @Column('text', {
    nullable: true,
    array: true,
  })
  blackBoxType: (string | BLACK_BOX_TYPE)[];

  @Column('text', {
    nullable: true,
    array: true,
  })
  displayOn: (string | DISPLAY_ON)[];

  @Column({ default: false })
  enableQuotation: boolean;

  @Column({ default: false })
  enableCommission: boolean;

  @Column({ default: false })
  defaultSettingCommission: boolean;

  @Column({ default: false })
  allTruckOwnersCommisson: boolean;

  @Column({ type: 'float8', nullable: true, default: 0 })
  percentCommission: number;

  @Column({ type: 'float8', nullable: true, default: 0 })
  fixedCommission: number;
}
