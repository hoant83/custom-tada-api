import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncSetting } from 'src/entities/sync-setting/sync-setting.entity';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { Admin } from 'src/entities/admin/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncSetting, Admin]), HttpModule],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
