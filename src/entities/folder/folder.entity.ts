import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { File } from '../file/file.entity';
import { Order } from '../order/order.entity';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  key: string;

  @OneToMany(
    () => File,
    file => file.folder,
  )
  files: File[];

  @ManyToOne(
    () => Order,
    order => order.folders,
  )
  order: Order;

  @Column({ nullable: true })
  orderId: number;
}
