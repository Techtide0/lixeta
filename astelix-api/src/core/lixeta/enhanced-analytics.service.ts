// enhanced-analytics.service.ts

import { Injectable } from '@nestjs/common';
import { EnhancedAnalytics } from './enhanced-types';

@Injectable()
export class EnhancedAnalyticsService {
  /**
   * Get enhanced analytics for a time range
   */
  getAnalytics(timeRange: '7d' | '30d' | '90d' = '30d'): EnhancedAnalytics {
    const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : 3;

    const baseMetrics = {
      messagesSent: Math.floor(252543 * multiplier),
      delivered: Math.floor(248731 * multiplier),
      engaged: Math.floor(76402 * multiplier),
    };

    return {
      summary: {
        messagesSent: baseMetrics.messagesSent,
        delivered: baseMetrics.delivered,
        deliveryRate: 98.5,
        engaged: baseMetrics.engaged,
        engagementRate: 30.3,
        costSavings: Math.floor(8291 * multiplier),
      },
      channelBreakdown: [
        {
          channel: 'Push',
          count: Math.floor(132345 * multiplier),
          percentage: 52.4,
          color: '#4F46E5',
        },
        {
          channel: 'Email',
          count: Math.floor(87412 * multiplier),
          percentage: 34.6,
          color: '#10B981',
        },
        {
          channel: 'SMS',
          count: Math.floor(32786 * multiplier),
          percentage: 13.0,
          color: '#F59E0B',
        },
      ],
      deliveryStatus: {
        delayed: Math.floor(12456 * multiplier),
        immediate: Math.floor(240087 * multiplier),
      },
      topRules: [
        {
          rule: 'PAYMENT_FAILED_ALERT',
          time: '9:21 AM',
          channel: 'SMS',
          triggered: Math.floor(1247 * multiplier),
        },
        {
          rule: 'ACTIVE_HOURS_PROTECTION',
          time: '8:59 AM',
          channel: 'Email',
          triggered: Math.floor(1089 * multiplier),
        },
        {
          rule: 'NEW_DEVICE_SECURITY',
          time: '8:42 AM',
          channel: 'Push',
          triggered: Math.floor(892 * multiplier),
        },
        {
          rule: 'NO_RESPONSE_FOLLOWUP',
          time: '8:40 AM',
          channel: 'Email',
          triggered: Math.floor(743 * multiplier),
        },
        {
          rule: 'TRANSFER_REVERSAL',
          time: '8:33 AM',
          channel: 'SMS',
          triggered: Math.floor(621 * multiplier),
        },
      ],
      costAnalysis: {
        emailSaved: Math.floor(4500 * multiplier),
        smsSaved: Math.floor(3700 * multiplier),
        totalCostCut: 34,
        valueJustified: true,
      },
      recentActivity: [
        {
          time: '2 minutes ago',
          event: 'Payment failed - SMS sent',
          user: 'Sarah Martinez',
          channel: 'SMS',
        },
        {
          time: '8 minutes ago',
          event: 'Login alert delayed',
          user: 'Jordan Lee',
          channel: 'Push',
        },
        {
          time: '15 minutes ago',
          event: 'Marketing message queued',
          user: 'Alex Chen',
          channel: 'Push',
        },
        {
          time: '23 minutes ago',
          event: 'Transfer reversal notification',
          user: 'Morgan Kim',
          channel: 'Email',
        },
        {
          time: '31 minutes ago',
          event: 'No response - escalated',
          user: 'Taylor Brown',
          channel: 'Email',
        },
      ],
      // Enhanced metrics
      suppressionMetrics: {
        messagesAvoided: Math.floor(45231 * multiplier),
        quietHoursSuppression: Math.floor(32189 * multiplier),
        fatigueSuppression: Math.floor(13042 * multiplier),
      },
      engagementEvents: {
        clicked: Math.floor(52341 * multiplier),
        ignored: Math.floor(18923 * multiplier),
        responded: Math.floor(34128 * multiplier),
      },
      roiComparison: {
        withoutLixeta: {
          messagesSent: Math.floor(297774 * multiplier),
          estimatedCost: Math.floor(14889 * multiplier),
        },
        withLixeta: {
          messagesSent: baseMetrics.messagesSent,
          estimatedCost: Math.floor(6598 * multiplier),
          savings: Math.floor(8291 * multiplier),
        },
      },
      timeRange,
    };
  }
}
