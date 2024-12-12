import { Module } from '@nestjs/common';
import { BlockchainService } from './services/blockchain.service';
import { EventProcessorService } from './services/event-processor.service';
import { DatabaseModule } from 'src/shared/database/database.module';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import MorphoABI from '@abis/Morpho.json';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'PROVIDER',
      useFactory: (configService: ConfigService) => {
        return new ethers.JsonRpcProvider(
          configService.get<string>('ethereum.rpcUrl'),
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'MORPHO_CONTRACT',
      useFactory: (provider: ethers.Provider, configService: ConfigService) => {
        return new ethers.Contract(
          configService.get<string>('ethereum.contractAddress'),
          MorphoABI,
          provider,
        );
      },
      inject: ['PROVIDER', ConfigService],
    },
    BlockchainService,
    EventProcessorService,
  ],
  exports: [
    EventProcessorService,
    BlockchainService,
    'MORPHO_CONTRACT',
    'PROVIDER',
  ],
})
export class BlockchainModule {}
