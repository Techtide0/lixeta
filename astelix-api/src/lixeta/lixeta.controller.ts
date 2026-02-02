import { Controller, Get, Param, Query } from '@nestjs/common';
import { LixetaService } from './lixeta.service';
import type {
  TimelineData,
  AnalyticsData,
  ScenarioId,
  DateRange,
} from './lixeta.service';

@Controller()
export class LixetaController {
  constructor(private readonly lixetaService: LixetaService) {}

  @Get('timeline/latest')
  getLatestTimeline(): TimelineData {
    return this.lixetaService.getLatestTimeline();
  }

  @Get('timeline/scenario/:scenarioId')
  getScenarioTimeline(
    @Param('scenarioId') scenarioId: ScenarioId,
  ): TimelineData {
    return this.lixetaService.getScenarioTimeline(scenarioId);
  }

  @Get('analytics')
  getAnalytics(
    @Query('dateRange') dateRange: DateRange = 'last30Days',
  ): AnalyticsData {
    return this.lixetaService.getAnalytics(dateRange);
  }
}
