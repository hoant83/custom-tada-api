import { Entity, Column, PrimaryColumn, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity()
@Unique(['truckOwnerId'])
export class Commission extends BaseEntity {
  @PrimaryColumn()
  truckOwnerId: number;

  @Column({ default: false })
  enabled: boolean;
}
