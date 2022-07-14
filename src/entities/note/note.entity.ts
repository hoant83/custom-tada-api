import {
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { Order } from '../order/order.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @Column({ nullable: true })
  content: string;

  @ManyToOne(
    () => Order,
    order => order.notes,
  )
  order: Order;

  @Column({ nullable: true })
  orderId: number;
}
