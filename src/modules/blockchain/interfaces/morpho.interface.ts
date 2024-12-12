export interface MarketParams {
  loanToken: string;
  collateralToken: string;
  oracle: string;
  irm: string;
  lltv: bigint;
}

export interface CreateMarketEvent {
  id: string;
  marketParams: MarketParams;
}

export interface BorrowEvent {
  id: string;
  caller: string;
  onBehalf: string;
  receiver: string;
  assets: bigint;
  shares: bigint;
}

export interface RepayEvent {
  id: string;
  caller: string;
  onBehalf: string;
  assets: bigint;
  shares: bigint;
}

export interface MarketData {
  totalBorrowShares: string;
  totalSupplyShares: string;
  totalBorrowAssets: string;
  totalSupplyAssets: string;
  lastUpdate: string;
  fee: string;
}

export interface PositionData {
  borrowShares: string;
  supplyShares: string;
  collateral: string;
}
