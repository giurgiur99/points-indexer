import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

import MorphoABI from '@abis/Morpho.json';
import { ConfigService } from '@nestjs/config';
import { EventProcessorService } from './event-processor.service';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private readonly contract: ethers.Contract;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventProcessor: EventProcessorService,
  ) {
    const rpcUrl = this.configService.get<string>('network.rpcUrl');
    const morphoContractAddress = this.configService.get<string>(
      'network.morphoContractAddress',
    );

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(
      morphoContractAddress,
      MorphoABI,
      this.provider,
    );
  }

  onModuleInit(): void {
    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    this.contract.on(
      'Borrow',
      (id, caller, onBehalf, receiver, assets, shares, event) => {
        this.eventProcessor.processBorrow({
          id,
          caller,
          onBehalf,
          receiver,
          assets,
          shares,
        });
      },
    );

    this.contract.on('Repay', (id, caller, onBehalf, assets, shares, event) => {
      this.eventProcessor.processRepay({
        id,
        caller,
        onBehalf,
        assets,
        shares,
      });
    });

    this.contract.on('CreateMarket', (id, marketParams, event) => {
      this.eventProcessor.processMarketCreated({
        id,
        marketParams,
      });
    });
  }
}
