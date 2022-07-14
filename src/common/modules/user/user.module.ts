import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenHelper } from 'src/common/helpers/token.helper';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { File } from 'src/entities/file/file.entity';
import { Settings } from 'src/entities/setting/setting.entity';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { CommonUserController } from './user.controller';
import { CommonUserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRepository,
      TruckOwnerRepository,
      DriverRepository,
      AdminRepository,
      AdminSetting,
      File,
      Settings,
    ]),
    HttpModule,
  ],
  controllers: [CommonUserController],
  providers: [CommonUserService, TokenHelper],
})
export class CommonUserModule {}
