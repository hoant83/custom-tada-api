import { CommonEntity } from '@anpham1925/nestjs';
import { Column, Entity } from 'typeorm';
import { IMPORTANT_NOTE_ROLE } from './enums/important-note-role.enum';

@Entity()
export class ImportantNote extends CommonEntity {
  @Column()
  content: string;

  @Column({
    enum: IMPORTANT_NOTE_ROLE,
    unique: true,
  })
  type: IMPORTANT_NOTE_ROLE;

  @Column({ default: false })
  isOn: boolean;
}
