import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketState } from 'src/shared/database/entities/market-state.entity';
import { BigNumber } from 'bignumber.js';
import { PositionEvents } from 'src/shared/database/entities/position-events.entity';
import { TopUsersByPointsResponse, UserPosition } from './points.dto';
import { MorphoEvents } from '../blockchain/interfaces/morpho-events.enum';
import { getAddress } from 'ethers';
import {
  calculateIntervalPoints,
  createInterval,
  createPosition,
  mapPositionEventsToUserPositions,
} from './points.utils';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(MarketState)
    private readonly marketStateRepository: Repository<MarketState>,
    @InjectRepository(PositionEvents)
    private readonly positionRepository: Repository<PositionEvents>,
  ) {}

  private async getMarketBorrowShares(
    event: PositionEvents,
  ): Promise<BigNumber> {
    const { marketId, blockNumber } = event;

    const marketState = await this.marketStateRepository.findOne({
      where: { marketId, blockNumber },
    });

    if (!marketState) {
      throw new NotFoundException(
        `Market state not found for market ${marketId} at block ${blockNumber}`,
      );
    }

    return BigNumber(marketState.totalBorrowShares);
  }

  private async processUserPosition(
    events: PositionEvents[],
  ): Promise<UserPosition> {
    // Update position object in the functions
    const position = createPosition();

    if (events.length === 0) {
      return position;
    }

    for (const [index, event] of events.entries()) {
      // Make sure we don't have undefined values by checking if the event is the last one.
      // We get the current timestamp if it's the last event to calculate accuring points.
      const isLastEvent = index === events.length - 1;
      position.lastEventTime = new BigNumber(event.timestamp.getTime() / 1000);
      position.nextEventTime = new BigNumber(
        isLastEvent
          ? new Date().getTime() / 1000
          : events[index + 1].timestamp.getTime() / 1000,
      );

      const marketBorrowShares = await this.getMarketBorrowShares(event);

      // Add or subtract shares from the current position.
      position.currentShares =
        event.eventType === MorphoEvents.BORROW
          ? position.currentShares.plus(BigNumber(event.shares))
          : position.currentShares.minus(BigNumber(event.shares));

      // Calculate points for the interval.
      const points = calculateIntervalPoints(position, marketBorrowShares);
      const newInterval = createInterval(
        position,
        marketBorrowShares,
        points,
        new BigNumber(event.shares),
        event.eventType as MorphoEvents,
      );

      position.intervals.push(newInterval);
    }

    return position;
  }

  async getTopUsersByPoints(
    marketId: string,
    limit: number = 10,
  ): Promise<TopUsersByPointsResponse[]> {
    const positionEvents = await this.positionRepository.find({
      where: { marketId },
      order: { blockNumber: 'ASC', transactionIndex: 'ASC', timestamp: 'ASC' },
    });

    const userPositionEvents = mapPositionEventsToUserPositions(positionEvents);

    // Process each user's position
    const userPoints = await Promise.all(
      Object.entries(userPositionEvents).map(async ([userAddress, events]) => {
        const position = await this.processUserPosition(events);

        const totalPoints = position.intervals.reduce(
          (acc, interval) => acc.plus(BigNumber(interval.points)),
          new BigNumber(0),
        );

        return {
          userAddress: getAddress(userAddress),
          points: totalPoints.toString(),
          intervals: position.intervals,
        };
      }),
    );

    return userPoints
      .sort((a, b) => Number(BigInt(b.points) - BigInt(a.points)))
      .slice(0, limit);
  }
}
