import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('position_events')
@Index(['marketId', 'blockNumber', 'transactionIndex'])
@Index(['marketId', 'userAddress'])
export class PositionEvents {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  marketId: string;

  @Column('varchar')
  userAddress: string;

  @Column('varchar')
  shares: string;

  @Column('varchar')
  eventType: string;

  @Column('timestamp')
  timestamp: Date;

  @Column('int')
  blockNumber: number;

  // multiple events can occour in same block
  @Column('int')
  transactionIndex: number;
}
