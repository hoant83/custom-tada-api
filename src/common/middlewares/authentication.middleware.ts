import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { TOKEN_ROLE } from '../constants/token-role.enum';
import { TokenHelper } from '../helpers/token.helper';
import { getTokenFromRequest } from '../utils/request.utility';

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenHelper: TokenHelper,
    private readonly truckOwnerRepository: TruckOwnerRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly driverRepository: DriverRepository,
  ) {}
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tokenString = getTokenFromRequest(req);

    if (!tokenString) return next();
    const token = await this.tokenHelper.verifyToken(tokenString);

    (req as any).user = token;

    switch (token.role) {
      case TOKEN_ROLE.CUSTOMER:
        this.customerRepository.update(
          { id: token.id },
          { lastActiveDate: new Date() },
        );
        break;
      case TOKEN_ROLE.TRUCK_OWNER:
        this.truckOwnerRepository.update(
          { id: token.id },
          { lastActiveDate: new Date() },
        );
        break;
      case TOKEN_ROLE.DRIVER:
        this.driverRepository.update(
          { id: token.id },
          { lastActiveDate: new Date() },
        );
        break;
    }

    next();
  }
}
