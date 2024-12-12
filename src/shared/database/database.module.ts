import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MarketState } from './entities/market-state.entity';
import { Market } from './entities/market.entity';
import typeorm from 'src/config/typeorm';
import { PositionEvents } from './entities/position-events.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [typeorm],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    TypeOrmModule.forFeature([Market, MarketState, PositionEvents]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
