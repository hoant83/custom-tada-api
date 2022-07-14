import { Exclude } from 'class-transformer';

export class UserDetailResponse {
  @Exclude()
  password: string;

  constructor(partial: Partial<UserDetailResponse>) {
    Object.assign(this, partial);
  }
}
