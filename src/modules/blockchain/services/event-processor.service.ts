// src/modules/blockchain/services/event-processor.service.ts
import { Injectable } from '@nestjs/common';
import {
  BorrowEvent,
  CreateMarketEvent,
  RepayEvent,
} from '../interfaces/morpho.interface';

@Injectable()
export class EventProcessorService {
  processMarketCreated(event: CreateMarketEvent): void {
    console.log('Processing Market Created Event:', event);
  }

  processBorrow(event: BorrowEvent): void {
    console.log('Processing Borrow Event:', event);
  }

  processRepay(event: RepayEvent): void {
    console.log('Processing Repay Event:', event);
  }
}
