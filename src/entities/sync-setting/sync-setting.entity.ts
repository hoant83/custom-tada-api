import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { AuthInfo } from './auth-info';

@Entity()
export class SyncSetting extends BaseEntity {
  @Column({ nullable: false })
  server: string;

  @Column({ type: 'json' })
  authInfo: AuthInfo;

  @Column({
    array: true,
    nullable: true,
  })
  syncTo: string;

  @Column({ default: false })
  shouldSync: boolean;
}
