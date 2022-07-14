import { Exclude } from 'class-transformer';

export class AdminDetailResponse {
  @Exclude()
  password: string;

  constructor(partial: Partial<AdminDetailResponse>) {
    Object.assign(this, partial);
  }
}
