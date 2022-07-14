import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class BlackBox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column({ type: 'json' })
  endpoint: Record<string, unknown>;

  @Column({ type: 'json' })
  authInfo: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  authResult: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
