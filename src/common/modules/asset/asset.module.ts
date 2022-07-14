import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
