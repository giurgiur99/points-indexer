import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      validate,
    }),
    BlockchainModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
