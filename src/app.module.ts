import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { validate } from './config/env.validation';
import { DatabaseModule } from './shared/database/database.module';
import { IndexerModule } from './modules/indexer/indexer.module';
import { PointsModule } from './modules/points/points.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    BlockchainModule,
    IndexerModule,
    PointsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
