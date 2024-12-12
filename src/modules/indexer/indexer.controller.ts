import { Controller, Post, Body } from '@nestjs/common';
import { IndexerService } from './indexer.service';

@Controller('indexer')
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @Post('index')
  async startIndexing(@Body() body: { fromBlock: number; toBlock?: number }) {
    // Block index markets: 18883124
    // Block index borrows & repays: 21374147

    return this.indexerService.indexHistoricalData(
      body.fromBlock,
      body.toBlock,
    );
  }
}
