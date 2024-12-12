import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DatabaseModule } from 'src/shared/database/database.module';
import { IndexerController } from './indexer.controller';
import { IndexerService } from './indexer.service';

@Module({
  imports: [BlockchainModule, DatabaseModule],
  providers: [IndexerService],
  controllers: [IndexerController],
})
export class IndexerModule {}
