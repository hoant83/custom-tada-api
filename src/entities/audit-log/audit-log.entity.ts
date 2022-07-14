import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity()
export class AuditLog extends BaseEntity {
  @Column()
  action: string;

  @Column()
  module: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'json', nullable: true })
  content: Record<string, unknown>;

  @Column({
    default: '',
  })
  url: string;

  @Column({
    default: '',
  })
  phoneNumber: string;

  @Index('key-idx')
  @Column({
    default: '',
  })
  key: string;
}
