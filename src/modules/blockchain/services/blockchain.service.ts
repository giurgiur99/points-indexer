import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

import { EventProcessorService } from './event-processor.service';
import { MorphoEvents } from '../interfaces/morpho-events.enum';

@Injectable()
export class BlockchainService {
  constructor(private readonly eventProcessor: EventProcessorService) {}

  // TODO: Later add a method to listen to live events when project is running.

  async processEvent(
    event: ethers.EventLog,
    timestamp: number,
    blockNumber: number,
    transactionIndex: number,
  ) {
    switch (event.eventName) {
      case MorphoEvents.CREATE_MARKET:
        await this.eventProcessor.processMarketCreated(
          {
            id: event.args[0],
            marketParams: event.args[1],
          },
          timestamp,
          blockNumber,
          transactionIndex,
        );
        break;

      case MorphoEvents.BORROW:
        await this.eventProcessor.processBorrow(
          {
            id: event.args[0],
            caller: event.args[1],
            onBehalf: event.args[2],
            receiver: event.args[3],
            assets: event.args[4],
            shares: event.args[5],
          },
          timestamp,
          blockNumber,
          transactionIndex,
        );
        break;

      case MorphoEvents.REPAY:
        await this.eventProcessor.processRepay(
          {
            id: event.args[0],
            caller: event.args[1],
            onBehalf: event.args[2],
            assets: event.args[3],
            shares: event.args[4],
          },
          timestamp,
          blockNumber,
          transactionIndex,
        );
        break;
    }
  }
}
