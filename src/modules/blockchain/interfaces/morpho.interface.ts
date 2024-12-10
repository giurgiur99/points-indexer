export interface MarketParams {
  loanToken: string;
  collateralToken: string;
  oracle: string;
  irm: string;
  lltv: bigint;
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

export interface CreateMarketEvent {
  id: string;
  marketParams: MarketParams;
}
