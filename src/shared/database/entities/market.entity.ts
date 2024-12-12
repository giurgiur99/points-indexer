import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('markets')
export class Market {
  @PrimaryColumn('varchar')
  id: string;

  @Column('varchar')
  loanToken: string;

  @Column('varchar')
  collateralToken: string;

  @Column('varchar')
  oracle: string;

  @Column('varchar')
  irm: string;

  @Column('numeric', { precision: 78, scale: 0 })
  lltv: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  updatedAt: Date;
}
