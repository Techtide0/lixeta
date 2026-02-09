import { Module } from '@nestjs/common';
import { LixetaController } from './lixeta.controller';
import { LixetaService } from './lixeta.service';
import { EnhancedTimelineService } from '../core/lixeta/enhanced-timeline.service';
import { EnhancedAnalyticsService } from '../core/lixeta/enhanced-analytics.service';
import { EnhancedController } from '../core/lixeta/enhanced.controller';

@Module({
  controllers: [LixetaController, EnhancedController],
  providers: [LixetaService, EnhancedTimelineService, EnhancedAnalyticsService],
  exports: [LixetaService, EnhancedTimelineService, EnhancedAnalyticsService]
})
export class LixetaModule {}
