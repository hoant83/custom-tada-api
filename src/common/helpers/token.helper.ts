import * as jwt from 'jsonwebtoken';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TOKEN_TYPE } from '../constants/token-types.enum';
import { customThrowError } from './throw.helper';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from '../constants/response-messages.enum';

@Injectable()
export class TokenHelper {
  secret = '';
  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get('TOKEN_SECRET');
  }

  createToken(data: Record<string, unknown>, exp?: string): any {
    try {
      const token = jwt.sign(
        { ...data, iat: Math.floor(Date.now() / 1000) },
        this.secret,
        exp && {
          expiresIn: exp,
        },
      );
      return token;
    } catch (error) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
        error,
      );
    }
  }

  verifyToken(token: string, type: string = TOKEN_TYPE.LOGIN): any {
    try {
      const data: any = jwt.verify(token, this.secret);
      if (
        data.type === TOKEN_TYPE.DRIVER_LOGIN ||
        data.type === TOKEN_TYPE.ADMIN_LOGIN ||
        data.type === TOKEN_TYPE.CUSTOMER_LOGIN ||
        data.type === TOKEN_TYPE.TRUCK_OWNER_LOGIN ||
        data.type === TOKEN_TYPE.SET_PASSWORD ||
        data.type === type
      )
        return data;
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
      );
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        customThrowError(
          RESPONSE_MESSAGES.TOKEN_EXPIRED,
          HttpStatus.UNAUTHORIZED,
          RESPONSE_MESSAGES_CODE.TOKEN_EXPIRED,
          error,
        );
      }

      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.ERROR,
        error,
      );
    }
  }
}
