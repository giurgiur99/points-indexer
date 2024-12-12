import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsController } from './points.controller';
import { Module } from '@nestjs/common';
import { MarketState } from 'src/shared/database/entities/market-state.entity';
import { PositionEvents } from 'src/shared/database/entities/position-events.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PointsService } from './points.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketState, PositionEvents]),
    BlockchainModule,
  ],
  controllers: [PointsController],
  providers: [PointsService],
})
export class PointsModule {}
