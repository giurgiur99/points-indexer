import { Module } from '@nestjs/common';
import { BlockchainService } from './services/blockchain.service';
import { EventProcessorService } from './services/event-processor.service';

@Module({
  imports: [],
  providers: [BlockchainService, EventProcessorService],
})
export class BlockchainModule {}
