import { ApiProperty } from '@nestjs/swagger';

export enum TOKEN_PLATFORM {
  MOBILE = 'mobile',
  WEB = 'web',
}

export class RegisterToken {
  @ApiProperty()
  token: string;

  @ApiProperty({
    enum: [TOKEN_PLATFORM.MOBILE, TOKEN_PLATFORM.WEB],
  })
  platform: TOKEN_PLATFORM;
}
