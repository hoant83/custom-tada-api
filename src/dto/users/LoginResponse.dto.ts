import { BaseUserDetailResponse } from '../BaseUserDetailResponse.dto';
import { Exclude, Expose } from 'class-transformer';
import { File } from 'src/entities/file/file.entity';

export class LoginResponseDto extends BaseUserDetailResponse {
  cardNo: string;
  token: string;

  @Exclude()
  card_front_image: File;

  @Expose({
    name: 'frontCardUrl',
  })
  get frontCardUrl(): string {
    if (this.card_front_image) {
      return `${process.env.BACKEND_HOST}/api/assets/${this.card_front_image.id}.${this.card_front_image.extension}`;
    }
    return '';
  }

  @Exclude()
  card_back_image: File;

  @Expose({
    name: 'backCardUrl',
  })
  get backCardUrl(): string {
    if (this.card_back_image) {
      return `${process.env.BACKEND_HOST}/api/assets/${this.card_back_image.id}.${this.card_back_image.extension}`;
    }
    return '';
  }

  @Exclude()
  avatar: File;

  @Expose({
    name: 'avatarUrl',
  })
  get avatarUrl(): string {
    if (this.avatar) {
      return `${process.env.BACKEND_HOST}/api/assets/${this.avatar.id}.${this.avatar.extension}`;
    }
    return '';
  }

  constructor(partial: Partial<LoginResponseDto>) {
    super();
    Object.assign(this, partial);
  }
}
