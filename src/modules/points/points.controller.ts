import { Controller, Get, Query } from '@nestjs/common';
import { PointsService } from './points.service';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('top-users')
  async getTopUsers(
    @Query('marketId') marketId: string,
    @Query('limit') limit?: number,
  ) {
    return this.pointsService.getTopUsersByPoints(marketId, limit);
  }
}
