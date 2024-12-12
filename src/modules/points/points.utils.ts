import BigNumber from 'bignumber.js';
import { PointInterval, UserPosition } from './points.dto';
import { PositionEvents } from 'src/shared/database/entities/position-events.entity';
import { MorphoEvents } from '../blockchain/interfaces/morpho-events.enum';

export const POINTS_PER_SECOND = new BigNumber(100);

export const calculateIntervalPoints = (
  position: UserPosition,
  totalBorrowShares: BigNumber,
): BigNumber => {
  const timeElapsed = position.nextEventTime.minus(position.lastEventTime);
  const marketShare = position.currentShares
    .multipliedBy(100)
    .dividedBy(totalBorrowShares);

  return timeElapsed
    .multipliedBy(marketShare)
    .multipliedBy(POINTS_PER_SECOND)
    .dividedBy(100)
    .integerValue();
};

// Intervals are used for trecability and to calculate points for each user/market.
export const createInterval = (
  position: UserPosition,
  marketBorrowShares: BigNumber,
  points: BigNumber,
  eventShares: BigNumber,
  eventType: MorphoEvents,
): PointInterval => {
  const { lastEventTime, nextEventTime, currentShares } = position;
  const marketShare = currentShares
    .multipliedBy(100)
    .dividedBy(marketBorrowShares);

  return {
    startTime: new Date(lastEventTime.toNumber() * 1000).toISOString(),
    endTime: new Date(nextEventTime.toNumber() * 1000).toISOString(),
    marketTotalShares: marketBorrowShares.toString(),
    marketSharePercentage: marketShare.toString(),
    eventShares: eventShares.toString(),
    totalShares: currentShares.toString(),
    points: points.toString(),
    eventType,
  };
};

export const createPosition = (): UserPosition => {
  return {
    intervals: [],
    currentShares: new BigNumber(0),
    lastEventTime: new BigNumber(0),
    nextEventTime: new BigNumber(0),
  };
};

export const mapPositionEventsToUserPositions = (
  positionEvents: PositionEvents[],
): Record<string, PositionEvents[]> => {
  return positionEvents.reduce(
    (acc, event) => {
      acc[event.userAddress] = acc[event.userAddress] || [];
      acc[event.userAddress].push(event);
      return acc;
    },
    {} as Record<string, PositionEvents[]>,
  );
};
