// services/api.ts

import { TimelineData, AnalyticsData } from '../types/timeline';
import { ScenarioId } from '../components/ScenarioSelector.tsx';

// Determine API base URL based on environment
const getAPIBaseURL = (): string => {
  // Check if VITE_API_URL environment variable is set
  if (import.meta.env.VITE_API_URL) {
    return String(import.meta.env.VITE_API_URL);
  }

  // Development environment
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }

  // Production environment
  return 'https://lixeta.onrender.com/api';
};

const API_BASE_URL = getAPIBaseURL();

export class LixetaAPI {
  static async fetchLatestTimeline(): Promise<TimelineData> {
    try {
      const response = await fetch(`${API_BASE_URL}/timeline/latest`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      // Return mock data for demo purposes
      return this.getMockTimelineData();
    }
  }

  static async fetchTimelineForScenario(scenarioId: ScenarioId): Promise<TimelineData> {
    try {
      const response = await fetch(`${API_BASE_URL}/timeline/scenario/${scenarioId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch scenario timeline for ${scenarioId}:`, error);
      // Return scenario-specific mock data as fallback
      return this.getMockTimelineForScenario(scenarioId);
    }
  }

  static async fetchAnalytics(range: string = '30d'): Promise<AnalyticsData> {
    try {
      // Map frontend range format to backend format
      const dateRangeMap: Record<string, string> = {
        '7d': 'last7Days',
        '30d': 'last30Days',
        '90d': 'last90Days'
      };
      
      const dateRange = dateRangeMap[range] || 'last30Days';
      const response = await fetch(`${API_BASE_URL}/analytics?dateRange=${dateRange}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Return mock data for demo purposes
      return this.getMockAnalyticsData();
    }
  }

  // Mock data for demo/development
  private static getMockTimelineData(): TimelineData {
    return {
      eventId: 'evt_2026_001',
      trigger: {
        type: 'wrong_transfer',
        user: 'John Doe (High Risk)',
        userTimezone: 'US/Pacific',
        localTime: '4:02 AM'
      },
      steps: [
        {
          timestamp: '2026-01-31T12:02:11.000Z',
          localTime: '4:02:11 AM',
          type: 'event_received',
          title: 'Event received',
          description: 'Wrong transfer reported',
          icon: 'check',
          color: 'green',
          details: 'Customer reported an incorrect fund transfer in mobile app. Event classified as high-priority financial issue.'
        },
        {
          timestamp: '2026-01-31T12:02:12.000Z',
          localTime: '4:02:12 AM',
          type: 'rule_evaluated',
          title: 'Rule evaluated',
          description: 'CRITICAL_SUPPORT',
          icon: 'alert',
          color: 'yellow',
          details: 'Evaluated rule: Financial errors require immediate escalation. Matched conditions: error_type=transfer, user_risk=high, amount>$100'
        },
        {
          timestamp: '2026-01-31T12:02:13.000Z',
          localTime: '4:02:13 AM',
          type: 'decision_taken',
          title: 'Decision taken',
          description: 'Escalate immediately',
          icon: 'arrow-up',
          color: 'red',
          critical: true,
          details: 'Decision: Bypass quiet hours due to financial urgency. SLA timer started: 14m 33s. Target resolution: 4:16 AM local time.'
        },
        {
          timestamp: '2026-01-31T12:02:13.000Z',
          localTime: '4:02:13 AM',
          type: 'channel_attempted',
          title: 'Channel attempted',
          description: 'Push skipped (quiet hours)',
          icon: 'minus',
          color: 'gray',
          details: 'Push notification suppressed. Reason: User local time 4:02 AM falls within quiet hours (11 PM - 7 AM). Override not applied for non-life-threatening issues.'
        },
        {
          timestamp: '2026-01-31T12:02:14.000Z',
          localTime: '4:02:14 AM',
          type: 'channel_sent',
          title: 'Channel sent',
          description: 'SMS sent',
          icon: 'check-circle',
          color: 'purple',
          details: 'SMS delivered via Twilio to +1-XXX-XXX-1234. Cost: $0.02. Content: "Critical: Wrong transfer detected. Support team alerted. Respond STOP to cancel."'
        },
        {
          timestamp: '2026-01-31T12:05:00.000Z',
          localTime: '4:05:00 AM',
          type: 'state_updated',
          title: 'State updated',
          description: 'Awaiting agent response',
          icon: 'clock',
          color: 'blue',
          details: 'Support ticket #7823 created and assigned to on-call agent. Status: Active. Customer notified via SMS. Escalation path: Tier 2 if no response in 10 minutes.'
        }
      ],
      metrics: {
        totalDuration: '2m 49s',
        channelsAttempted: 3,
        channelsSent: 1,
        costSaved: '$0.06',
        slaTimer: '14m 33s remaining'
      }
    };
  }

  private static getMockTimelineForScenario(scenarioId: ScenarioId): TimelineData {
    const scenarios: Record<ScenarioId, TimelineData> = {
      'dual-time': {
        eventId: 'evt_dual_time_001',
        trigger: {
          type: 'dual_time_message',
          user: 'Sarah Chen',
          userTimezone: 'US/Eastern',
          localTime: '5:00 PM'
        },
        steps: [
          {
            timestamp: '2026-02-02T20:00:00.000Z',
            localTime: '3:00 PM PST',
            type: 'event_received',
            title: 'Event received',
            description: 'Message triggered',
            icon: 'check',
            color: 'green',
            details: 'Message created by sender in US/Pacific timezone at 3:00 PM PST'
          },
          {
            timestamp: '2026-02-02T20:05:00.000Z',
            localTime: '3:05 PM PST / 6:05 PM EST',
            type: 'rule_evaluated',
            title: 'Timezone rule evaluated',
            description: 'Multi-zone delivery',
            icon: 'alert',
            color: 'blue',
            details: 'Rule: Check receiver timezone. Receiver (Sarah) is in EST, 3 hours ahead of sender. Optimal delivery window: 6-8 PM EST.'
          },
          {
            timestamp: '2026-02-02T20:10:00.000Z',
            localTime: '6:10 PM EST',
            type: 'decision_taken',
            title: 'Decision taken',
            description: 'Schedule for optimal time',
            icon: 'arrow-up',
            color: 'green',
            details: 'Decision: Send now (6:10 PM EST) - within optimal window. Message will arrive while receiver is active.'
          },
          {
            timestamp: '2026-02-02T20:11:00.000Z',
            localTime: '6:11 PM EST',
            type: 'channel_sent',
            title: 'Delivered',
            description: 'Via Push notification',
            icon: 'check-circle',
            color: 'purple',
            details: 'Push notification delivered to Sarah at 6:11 PM EST. Engagement: High (62% likely at this time).'
          }
        ],
        metrics: {
          totalDuration: '11m 11s',
          channelsAttempted: 2,
          channelsSent: 1,
          costSaved: '$0.03',
          slaTimer: '54m remaining'
        }
      },
      'behavior-reminder': {
        eventId: 'evt_behavior_001',
        trigger: {
          type: 'behavior_reminder',
          user: 'Michael Torres',
          userTimezone: 'US/Central',
          localTime: '10:30 AM'
        },
        steps: [
          {
            timestamp: '2026-02-02T16:30:00.000Z',
            localTime: '10:30 AM CST',
            type: 'event_received',
            title: 'Event received',
            description: 'Initial message sent',
            icon: 'check',
            color: 'green',
            details: 'Initial outreach message sent to Michael. Content: Product feature overview.'
          },
          {
            timestamp: '2026-02-02T16:40:00.000Z',
            localTime: '10:40 AM CST',
            type: 'rule_evaluated',
            title: 'Engagement rule evaluated',
            description: 'No response detected',
            icon: 'alert',
            color: 'yellow',
            details: 'Rule: Check engagement in last 10 minutes. Result: No open, no click detected. User behavior: Inactive.'
          },
          {
            timestamp: '2026-02-02T16:50:00.000Z',
            localTime: '10:50 AM CST',
            type: 'decision_taken',
            title: 'Auto-reminder triggered',
            description: 'Send follow-up',
            icon: 'arrow-up',
            color: 'yellow',
            critical: true,
            details: 'Decision: Send automated reminder message. Strategy: More urgent tone, call-to-action prominent. Delay: 10 minutes.'
          },
          {
            timestamp: '2026-02-02T16:51:00.000Z',
            localTime: '10:51 AM CST',
            type: 'channel_sent',
            title: 'Reminder sent',
            description: 'Via Email',
            icon: 'check-circle',
            color: 'blue',
            details: 'Email reminder delivered. Subject: "We\'d love your feedback!" Estimated read time: Next 5 minutes.'
          },
          {
            timestamp: '2026-02-02T16:56:00.000Z',
            localTime: '10:56 AM CST',
            type: 'state_updated',
            title: 'Engagement detected',
            description: 'User interacted',
            icon: 'check',
            color: 'green',
            details: 'Michael opened the reminder email at 10:56 AM. Clicked link at 10:57 AM. Conversion: Success.'
          }
        ],
        metrics: {
          totalDuration: '26m 0s',
          channelsAttempted: 2,
          channelsSent: 2,
          costSaved: '$0.02',
          slaTimer: '24m remaining'
        }
      },
      'fintech-login': {
        eventId: 'evt_fintech_001',
        trigger: {
          type: 'fintech_login',
          user: 'Emma Roberts',
          userTimezone: 'Europe/London',
          localTime: '2:00 PM'
        },
        steps: [
          {
            timestamp: '2026-02-02T14:00:00.000Z',
            localTime: '2:00 PM GMT',
            type: 'event_received',
            title: 'Login detected',
            description: 'New device login',
            icon: 'check',
            color: 'green',
            details: 'Emma logged in from Chrome on MacOS (new device). IP: 185.47.123.45. Location: London, UK.'
          },
          {
            timestamp: '2026-02-02T14:01:00.000Z',
            localTime: '2:01 PM GMT',
            type: 'rule_evaluated',
            title: 'Fintech orchestration rule',
            description: 'Sequence: Welcome',
            icon: 'alert',
            color: 'blue',
            details: 'Rule: New login detected on fintech account. Trigger orchestration sequence for new device onboarding.'
          },
          {
            timestamp: '2026-02-02T14:02:00.000Z',
            localTime: '2:02 PM GMT',
            type: 'channel_sent',
            title: 'Welcome message sent',
            description: 'Step 1/3',
            icon: 'check-circle',
            color: 'green',
            details: 'Push notification: "Welcome! We detected a new login on your account. Review your security settings." Tapped: Yes (2:03 PM).'
          },
          {
            timestamp: '2026-02-02T14:05:00.000Z',
            localTime: '2:05 PM GMT',
            type: 'channel_sent',
            title: 'Feature tour message sent',
            description: 'Step 2/3',
            icon: 'check-circle',
            color: 'green',
            details: 'Email: "Discover new features on your accounts." Tour video included. Video viewed: Yes (3 min 45s watch time).'
          },
          {
            timestamp: '2026-02-02T14:10:00.000Z',
            localTime: '2:10 PM GMT',
            type: 'channel_sent',
            title: 'Security settings message sent',
            description: 'Step 3/3',
            icon: 'check-circle',
            color: 'blue',
            details: 'SMS: "Update 2FA settings for enhanced security. One-time codes sent." Response: Link clicked, 2FA enabled successfully.'
          }
        ],
        metrics: {
          totalDuration: '10m 0s',
          channelsAttempted: 3,
          channelsSent: 3,
          costSaved: '$0.08',
          slaTimer: '50m remaining'
        }
      },
      'active-hours': {
        eventId: 'evt_active_hours_001',
        trigger: {
          type: 'active_hours',
          user: 'David Kumar',
          userTimezone: 'Asia/Kolkata',
          localTime: '11:45 PM'
        },
        steps: [
          {
            timestamp: '2026-02-02T18:15:00.000Z',
            localTime: '11:45 PM IST',
            type: 'event_received',
            title: 'Event received',
            description: 'Message triggered',
            icon: 'check',
            color: 'green',
            details: 'Order cancellation notice created. Current user time: 11:45 PM IST (outside active hours).'
          },
          {
            timestamp: '2026-02-02T18:16:00.000Z',
            localTime: '11:45 PM IST',
            type: 'rule_evaluated',
            title: 'Active hours rule evaluated',
            description: 'Outside business hours',
            icon: 'alert',
            color: 'yellow',
            details: 'Rule: Check user active hours. Defined hours: 9 AM - 6 PM IST. Current: 11:45 PM IST. Status: OUTSIDE active window.'
          },
          {
            timestamp: '2026-02-02T18:17:00.000Z',
            localTime: '11:45 PM IST',
            type: 'decision_taken',
            title: 'Decision taken',
            description: 'Delay delivery',
            icon: 'minus',
            color: 'yellow',
            critical: true,
            details: 'Decision: Do not disturb user now. Schedule message for next active window. Next active hours: Tomorrow 9:00 AM IST (9 hours 15 minutes away).'
          },
          {
            timestamp: '2026-02-03T03:30:00.000Z',
            localTime: '9:00 AM IST',
            type: 'channel_sent',
            title: 'Delivered at optimal time',
            description: 'On schedule',
            icon: 'check-circle',
            color: 'green',
            details: 'Message delivered tomorrow at 9:00 AM IST (start of active hours). Engagement likelihood: 73%. User satisfaction increased by respecting quiet hours.'
          }
        ],
        metrics: {
          totalDuration: '9h 15m',
          channelsAttempted: 1,
          channelsSent: 1,
          costSaved: '$0.01',
          slaTimer: 'Scheduled delivery'
        }
      }
    };

    return scenarios[scenarioId] || this.getMockTimelineData();
  }

  private static getMockAnalyticsData(): AnalyticsData {
    return {
      summary: {
        messagesSent: 252543,
        delivered: 248731,
        deliveryRate: 98.5,
        engaged: 76402,
        engagementRate: 30.3,
        costSavings: 8291
      },
      channelBreakdown: [
        { channel: 'Push', count: 132345, percentage: 52.4, color: '#4F46E5' },
        { channel: 'Email', count: 87412, percentage: 34.6, color: '#10B981' },
        { channel: 'SMS', count: 32786, percentage: 13.0, color: '#F59E0B' }
      ],
      deliveryStatus: {
        delayed: 12456,
        immediate: 240087
      },
      topRules: [
        { rule: 'Rodriguez2U775', time: '9:21 AM', channel: 'Push', triggered: 1247 },
        { rule: 'KwasiA203', time: '8:59 AM', channel: 'Email', triggered: 1089 },
        { rule: 'AdeSU93', time: '8:42 AM', channel: 'SMS', triggered: 892 },
        { rule: 'Moyo313', time: '8:40 AM', channel: 'Push', triggered: 743 },
        { rule: 'AlshaNGu21', time: '8:33 AM', channel: 'Push', triggered: 621 }
      ],
      costAnalysis: {
        emailSaved: 4500,
        smsSaved: 3700,
        totalCostCut: 34,
        valueJustified: true
      },
      recentActivity: [
        { time: '2 minutes ago', event: 'Wrong transfer escalated', user: 'John Doe', channel: 'SMS' },
        { time: '8 minutes ago', event: 'Login alert delayed', user: 'Jane Smith', channel: 'Email' },
        { time: '15 minutes ago', event: 'Payment confirmation sent', user: 'Bob Wilson', channel: 'Push' },
        { time: '23 minutes ago', event: 'Account activity alert', user: 'Alice Brown', channel: 'Email' },
        { time: '31 minutes ago', event: 'Fraud warning escalated', user: 'Charlie Davis', channel: 'SMS' }
      ]
    };
  }
}
