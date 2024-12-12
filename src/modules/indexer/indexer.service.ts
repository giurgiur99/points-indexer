import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { BlockchainService } from '../blockchain/services/blockchain.service';

@Injectable()
export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    @Inject('MORPHO_CONTRACT')
    private readonly morphoContract: ethers.Contract,
    @Inject('PROVIDER')
    private readonly provider: ethers.Provider,
    private readonly blockchainService: BlockchainService,
  ) {}

  async indexHistoricalData(fromBlock: number, toBlock?: number) {
    try {
      let latestBlock = toBlock || (await this.provider.getBlockNumber());
      const batchSize = 1000;

      this.logger.log(
        `Starting historical indexing from block ${fromBlock} to ${latestBlock}`,
      );

      for (
        let currentBlock = fromBlock;
        currentBlock < latestBlock;
        currentBlock += batchSize
      ) {
        const endBlock = Math.min(currentBlock + batchSize - 1, latestBlock);
        await this.processBlockRange(currentBlock, endBlock);
        this.logger.log(`Processed blocks ${currentBlock} to ${endBlock}`);
      }

      this.logger.log('Historical indexing completed');
      return { message: 'Indexing completed successfully' };
    } catch (error) {
      this.logger.error('Error during historical indexing:', error);
      throw new HttpException(
        error.message || 'Error during historical indexing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getCreateMarketEvents(fromBlock: number, toBlock: number) {
    return this.morphoContract.queryFilter(
      this.morphoContract.filters.CreateMarket(),
      fromBlock,
      toBlock,
    );
  }

  private async getBorrowEvents(fromBlock: number, toBlock: number) {
    return this.morphoContract.queryFilter(
      this.morphoContract.filters.Borrow(),
      fromBlock,
      toBlock,
    );
  }

  private async getRepayEvents(fromBlock: number, toBlock: number) {
    return this.morphoContract.queryFilter(
      this.morphoContract.filters.Repay(),
      fromBlock,
      toBlock,
    );
  }

  private async processBlockRange(fromBlock: number, toBlock: number) {
    const [createMarketEvents, borrowEvents, repayEvents] = await Promise.all([
      this.getCreateMarketEvents(fromBlock, toBlock),
      this.getBorrowEvents(fromBlock, toBlock),
      this.getRepayEvents(fromBlock, toBlock),
    ]);

    const events = [
      ...createMarketEvents,
      ...borrowEvents,
      ...repayEvents,
    ].sort(
      (a, b) =>
        a?.blockNumber - b?.blockNumber ||
        a?.transactionIndex - b?.transactionIndex,
    );

    for (const event of events) {
      const { timestamp, number } = await event.getBlock();
      await this.blockchainService.processEvent(
        event as ethers.EventLog,
        timestamp,
        number,
        event.transactionIndex,
      );
    }
  }
}
