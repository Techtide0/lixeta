// enhanced.controller.ts

import type { EventType } from './enhanced-types';
import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EnhancedTimelineService } from './enhanced-timeline.service';
import { EnhancedAnalyticsService } from './enhanced-analytics.service';

@Controller('timeline')
export class EnhancedController {
  constructor(
    private readonly enhancedTimelineService: EnhancedTimelineService,
    private readonly enhancedAnalyticsService: EnhancedAnalyticsService,
  ) {}

  /**
   * GET /api/timeline/enhanced/:eventType
   * Get enhanced timeline for a specific event type
   */
  @Get('enhanced/:eventType')
  getEnhancedTimeline(@Param('eventType') eventType: EventType) {
    try {
      const validEventTypes: EventType[] = [
        'payment.failed',
        'transfer.reversal_requested',
        'login.new_device',
        'active_hours_event',
        'user.no_response',
      ];

      if (!validEventTypes.includes(eventType)) {
        throw new HttpException(
          {
            error: 'Invalid event type',
            validTypes: validEventTypes,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const timeline =
        this.enhancedTimelineService.generateTimelineForEvent(eventType);
      return timeline;
    } catch (error) {
      console.error('Enhanced timeline error:', error);
      throw new HttpException(
        { error: 'Failed to generate timeline' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/timeline/latest
   * Get the latest timeline (defaults to payment.failed)
   */
  @Get('latest')
  getLatestTimeline() {
    try {
      const timeline =
        this.enhancedTimelineService.generateTimelineForEvent('payment.failed');
      return timeline;
    } catch (error) {
      console.error('Latest timeline error:', error);
      throw new HttpException(
        { error: 'Failed to fetch latest timeline' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/analytics/enhanced
   * Get enhanced analytics with suppression metrics and ROI comparison
   */
  @Get('../analytics/enhanced')
  getEnhancedAnalytics(@Query('range') range?: '7d' | '30d' | '90d') {
    try {
      const timeRange = range || '30d';

      if (!['7d', '30d', '90d'].includes(timeRange)) {
        throw new HttpException(
          {
            error: 'Invalid time range',
            validRanges: ['7d', '30d', '90d'],
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const analytics = this.enhancedAnalyticsService.getAnalytics(timeRange);
      return analytics;
    } catch (error) {
      console.error('Enhanced analytics error:', error);
      throw new HttpException(
        { error: 'Failed to fetch analytics' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/analytics
   * Backward compatible analytics endpoint
   */
  @Get('../analytics')
  getAnalytics(@Query('range') range?: '7d' | '30d' | '90d') {
    try {
      const timeRange = range || '30d';

      const analytics = this.enhancedAnalyticsService.getAnalytics(timeRange);
      return analytics;
    } catch (error) {
      console.error('Analytics error:', error);
      throw new HttpException(
        { error: 'Failed to fetch analytics' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/events/types
   * List all available event types
   */
  @Get('../events/types')
  getEventTypes() {
    const eventTypes = [
      {
        type: 'payment.failed',
        label: '💳 Payment Failed',
        description: 'Subscription payment declined - critical recovery flow',
        category: 'financial',
      },
      {
        type: 'transfer.reversal_requested',
        label: '🔄 Transfer Reversal',
        description: 'User requested fund transfer reversal',
        category: 'financial',
      },
      {
        type: 'login.new_device',
        label: '📱 New Device Login',
        description: 'Security alert + onboarding sequence',
        category: 'security',
      },
      {
        type: 'active_hours_event',
        label: '🔒 Active Hours Protection',
        description: 'Message delayed to respect user schedule',
        category: 'engagement',
      },
      {
        type: 'user.no_response',
        label: '⏰ No Response',
        description: 'Automated follow-up after no user response',
        category: 'engagement',
      },
    ];

    return eventTypes;
  }
}
