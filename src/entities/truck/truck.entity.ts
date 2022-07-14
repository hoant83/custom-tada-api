import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TRUCK_TYPE } from '../truckOwner/enums/truckType.enum';
import { TruckOwner } from '../truckOwner/truckOwner.entity';
import { TRUCK_STATUS } from './enums/truckStatus.enum';
import { Order } from '../order/order.entity';
import { File } from 'src/entities/file/file.entity';
import { BLACK_BOX_TYPE } from 'src/common/constants/black-box.enum';

@Entity()
export class Truck extends BaseEntity {
  @Column()
  truckNo: string;

  @Column()
  truckLoad: string;

  @Column({
    type: 'enum',
    enum: TRUCK_TYPE,
    nullable: true,
  })
  truckType: TRUCK_TYPE;

  @Column({
    type: 'enum',
    enum: TRUCK_STATUS,
    default: TRUCK_STATUS.UNVERIFIED,
  })
  truckStatus: TRUCK_STATUS;

  @ManyToOne(
    () => TruckOwner,
    truckOwner => truckOwner.trucks,
  )
  truckOwner: TruckOwner;

  @Column()
  ownerId: number;

  @ManyToMany(
    () => Order,
    order => order.trucks,
  )
  orders: Order[];

  @Column({ nullable: true })
  orderId: number;

  @JoinColumn()
  certificate: File;

  @Column({
    type: 'enum',
    enum: BLACK_BOX_TYPE,
    nullable: true,
  })
  blackBoxType: BLACK_BOX_TYPE;

  @Column({ nullable: true })
  devId: string;

  @Column({ unique: true, nullable: true })
  syncCode: string;

  @Column({ nullable: true })
  syncDate: Date;

  @Column({ default: false })
  shouldSync: boolean;
}
