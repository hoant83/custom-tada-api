import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlackBoxController } from './black-box.controller';
import { BlackBoxService } from './black-box.service';
import { DinhViHopQuyService } from './dinhvihopquy.service';
import { BlackBox } from 'src/entities/black-box/black-box.entity';
import { TrackingBlackBox } from 'src/entities/tracking-black-box/tracking-black-box.entity';
import { OrderRepository } from 'src/repositories/order.repository';
import { TrackingBlackBoxLog } from 'src/entities/tracking-black-box-log/tracking-black-box-log.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { AnTeckService } from './anteck.service';
import { TruckRepository } from 'src/repositories/truck.repository';
import { VietmapService } from './vietmap.service';
import { SettingRepository } from 'src/repositories/setting.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlackBox,
      TrackingBlackBox,
      TrackingBlackBoxLog,
      OrderRepository,
      Tracking,
      TruckRepository,
      SettingRepository,
    ]),
    HttpModule,
  ],
  controllers: [BlackBoxController],
  providers: [
    DinhViHopQuyService,
    BlackBoxService,
    AnTeckService,
    VietmapService,
  ],
  exports: [BlackBoxService],
})
export class BlackBoxModule {}
