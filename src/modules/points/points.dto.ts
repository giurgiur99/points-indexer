import BigNumber from 'bignumber.js';
import { MorphoEvents } from '../blockchain/interfaces/morpho-events.enum';

export interface TopUsersByPointsResponse {
  userAddress: string;
  points: string;
  intervals: PointInterval[];
}

export interface UserPosition {
  intervals: PointInterval[];
  currentShares: BigNumber;
  lastEventTime: BigNumber;
  nextEventTime: BigNumber;
}

export interface PointInterval {
  startTime: string;
  endTime: string;
  marketTotalShares: string;
  marketSharePercentage: string;
  eventShares: string;
  totalShares: string;
  points: string;
  eventType: MorphoEvents;
}
