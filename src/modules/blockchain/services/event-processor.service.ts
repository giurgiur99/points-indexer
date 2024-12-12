import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BorrowEvent,
  CreateMarketEvent,
  MarketData,
  RepayEvent,
} from '../interfaces/morpho.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Market } from 'src/shared/database/entities/market.entity';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { MarketState } from 'src/shared/database/entities/market-state.entity';
import { PositionEvents } from 'src/shared/database/entities/position-events.entity';
import { MorphoEvents } from '../interfaces/morpho-events.enum';

@Injectable()
export class EventProcessorService {
  private readonly logger = new Logger(EventProcessorService.name);

  constructor(
    @InjectRepository(Market)
    private readonly marketRepository: Repository<Market>,
    @InjectRepository(MarketState)
    private readonly marketStateRepository: Repository<MarketState>,
    @InjectRepository(PositionEvents)
    private readonly positionRepository: Repository<PositionEvents>,
    @Inject('MORPHO_CONTRACT')
    private readonly morphoContract: ethers.Contract,
  ) {}

  private async getMarketData(
    marketId: string,
    blockNumber: number,
  ): Promise<MarketData> {
    try {
      const marketData = await this.morphoContract.market(marketId, {
        blockTag: blockNumber,
      });

      return {
        totalSupplyAssets: marketData[0].toString(),
        totalSupplyShares: marketData[1].toString(),
        totalBorrowAssets: marketData[2].toString(),
        totalBorrowShares: marketData[3].toString(),
        lastUpdate: marketData[4].toString(),
        fee: marketData[5].toString(),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching market data for market ${marketId}`,
        error,
      );
      throw error;
    }
  }

  async processMarketCreated(
    event: CreateMarketEvent,
    blockTimestamp: number,
    blockNumber: number,
    transactionIndex: number,
  ): Promise<void> {
    this.logger.log(`New market event received: ${event.id}. Processing...`);
    const { id: marketId, marketParams } = event;

    await this.marketRepository.upsert(
      {
        id: marketId,
        loanToken: marketParams.loanToken,
        collateralToken: marketParams.collateralToken,
        oracle: marketParams.oracle,
        irm: marketParams.irm,
        lltv: marketParams.lltv.toString(),
        createdAt: new Date(blockTimestamp * 1000),
        updatedAt: new Date(blockTimestamp * 1000),
      },
      {
        conflictPaths: ['id'],
      },
    );

    await this.updateMarketState(
      marketId,
      blockTimestamp,
      blockNumber,
      transactionIndex,
    );

    this.logger.log(`Market Created Event: ${marketId} processed`);
  }

  private async updateMarketState(
    marketId: string,
    timestamp: number,
    blockNumber: number,
    transactionIndex: number,
  ): Promise<void> {
    try {
      const marketData = await this.getMarketData(marketId, blockNumber);

      await this.marketStateRepository.save({
        marketId,
        totalBorrowShares: marketData.totalBorrowShares,
        totalBorrowAssets: marketData.totalBorrowAssets,
        totalSupplyShares: marketData.totalSupplyShares,
        totalSupplyAssets: marketData.totalSupplyAssets,
        timestamp: new Date(timestamp * 1000),
        blockNumber,
        transactionIndex,
      });
    } catch (error) {
      this.logger.error(
        `Error updating market state for market ${marketId}`,
        error,
      );
      throw error;
    }
  }

  async processBorrow(
    event: BorrowEvent,
    blockTimestamp: number,
    blockNumber: number,
    transactionIndex: number,
  ): Promise<void> {
    this.logger.log(`New borrow event received: ${event.id}. Processing...`);
    const { id: marketId, onBehalf, shares } = event;

    await this.updateMarketState(
      marketId,
      blockTimestamp,
      blockNumber,
      transactionIndex,
    );

    await this.positionRepository.save({
      marketId,
      userAddress: onBehalf,
      shares: shares.toString(),
      eventType: MorphoEvents.BORROW,
      timestamp: new Date(blockTimestamp * 1000),
      blockNumber,
      transactionIndex,
    });

    this.logger.log(`Borrow Event processed: ${marketId} for user ${onBehalf}`);
  }

  async processRepay(
    event: RepayEvent,
    blockTimestamp: number,
    blockNumber: number,
    transactionIndex: number,
  ): Promise<void> {
    this.logger.log(`New repay event received: ${event.id}. Processing...`);
    const { id: marketId, onBehalf, shares } = event;

    await this.updateMarketState(
      marketId,
      blockTimestamp,
      blockNumber,
      transactionIndex,
    );

    await this.positionRepository.save({
      marketId,
      userAddress: onBehalf,
      shares: shares.toString(),
      eventType: MorphoEvents.REPAY,
      timestamp: new Date(blockTimestamp * 1000),
      blockNumber,
      transactionIndex,
    });

    this.logger.log(`Repay Event processed: ${marketId} for user ${onBehalf}`);
  }
}
