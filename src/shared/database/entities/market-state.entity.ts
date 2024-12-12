import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('market_states')
@Index(['marketId', 'blockNumber', 'transactionIndex'])
export class MarketState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  marketId: string;

  @Column('varchar')
  totalBorrowShares: string;

  @Column('varchar')
  totalBorrowAssets: string;

  @Column('varchar')
  totalSupplyShares: string;

  @Column('varchar')
  totalSupplyAssets: string;

  @Column('timestamp')
  timestamp: Date;

  @Column('int')
  blockNumber: number;

  @Column('int')
  transactionIndex: number;
}
