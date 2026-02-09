import { Injectable } from '@nestjs/common';
import type {
  EnhancedTimelineData,
  EventType,
  TimelineStep,
} from './enhanced-types';

@Injectable()
export class EnhancedTimelineService {
  /**
   * Generate enhanced timeline for a specific event
   */
  generateTimelineForEvent(eventType: EventType): EnhancedTimelineData {
    const baseTime = new Date();
    switch (eventType) {
      case 'payment.failed':
        return this.generatePaymentFailedTimeline(baseTime);
      case 'transfer.reversal_requested':
        return this.generateTransferReversalTimeline(baseTime);
      case 'login.new_device':
        return this.generateNewDeviceLoginTimeline(baseTime);
      case 'active_hours_event':
        return this.generateActiveHoursTimeline(baseTime);
      case 'user.no_response':
        return this.generateNoResponseTimeline(baseTime);
      default:
        return this.generatePaymentFailedTimeline(baseTime);
    }
  }

  private generatePaymentFailedTimeline(baseTime: Date): EnhancedTimelineData {
    const steps: TimelineStep[] = [
      {
        timestamp: baseTime.toISOString(),
        localTime: this.formatLocalTime(baseTime, 'US/Eastern'),
        type: 'event_received',
        title: 'Payment Failed Event Received',
        description: 'Subscription payment declined',
        icon: 'check',
        color: 'red',
        details:
          'Event: payment.failed | Amount: $49.99 | Card: •••• 4242 | Reason: Insufficient funds',
        whyHappened:
          "Customer's subscription payment of $49.99 was declined due to insufficient funds. This triggers critical customer retention flow.",
        processingDuration: '45ms',
        channelContext: {
          channel: 'Webhook',
          status: 'simulated',
        },
      },
      {
        timestamp: this.addSeconds(baseTime, 0.12).toISOString(),
        localTime: this.formatLocalTime(
          this.addSeconds(baseTime, 0.12),
          'US/Eastern',
        ),
        type: 'rule_evaluated',
        title: 'Payment Failure Rule Evaluated',
        description: 'CRITICAL_PAYMENT_FAILED matched',
        icon: 'alert',
        color: 'yellow',
        details:
          'Rule: CRITICAL_PAYMENT_FAILED | Priority: CRITICAL | Conditions matched: payment_failed=true, amount>$10, subscription_active=true',
        whyHappened:
          'System evaluated payment failure rules. High-value subscription ($49.99) requires immediate customer notification to prevent churn.',
        processingDuration: '120ms',
      },
      {
        timestamp: this.addSeconds(baseTime, 0.24).toISOString(),
        localTime: this.formatLocalTime(
          this.addSeconds(baseTime, 0.24),
          'US/Eastern',
        ),
        type: 'decision_taken',
        title: 'Decision: Send Immediate SMS',
        description: 'High urgency - bypass quiet hours',
        icon: 'arrow-up',
        color: 'red',
        critical: true,
        details:
          'Decision: SEND_SMS immediately despite quiet hours | Reason: Financial urgency | SLA: 2 minutes',
        whyHappened:
          'Payment failures require immediate action. User needs to update payment method within 24h to maintain service. Time-sensitive.',
        processingDuration: '85ms',
        webhookInstruction: {
          action: 'SEND_SMS',
          urgency: 'CRITICAL',
          reason: 'payment_failed',
          recommendedTime: 'now',
        },
      },
      {
        timestamp: this.addSeconds(baseTime, 1.5).toISOString(),
        localTime: this.formatLocalTime(
          this.addSeconds(baseTime, 1.5),
          'US/Eastern',
        ),
        type: 'channel_sent',
        title: 'SMS Delivered (Simulated)',
        description: 'Critical payment notification sent',
        icon: 'check-circle',
        color: 'purple',
        details:
          'Simulated SMS: "Your $49.99 payment failed. Update your card at [link] to keep your subscription active. Reply HELP for assistance."',
        whyHappened:
          'SMS chosen over email for immediacy. Higher open rate (98%) vs email (22%) for time-critical financial alerts.',
        channelContext: {
          channel: 'SMS',
          status: 'simulated',
        },
      },
      {
        timestamp: this.addSeconds(baseTime, 600).toISOString(),
        localTime: this.formatLocalTime(
          this.addSeconds(baseTime, 600),
          'US/Eastern',
        ),
        type: 'state_updated',
        title: 'Monitoring for Response',
        description: 'No user response after 10 minutes',
        icon: 'clock',
        color: 'blue',
        details:
          'Status: Awaiting user action | Timer: 10m elapsed | Next step: Email escalation if no response in 20m',
        whyHappened:
          'After 10 minutes with no payment update, system prepares email escalation with more details and alternative payment methods.',
        processingDuration: '32ms',
      },
    ];

    return {
      eventId: `evt_payment_failed_${Date.now()}`,
      eventType: 'payment.failed',
      trigger: {
        type: 'payment.failed',
        user: 'Sarah Martinez (Premium Subscriber)',
        userTimezone: 'US/Eastern',
        localTime: this.formatLocalTime(baseTime, 'US/Eastern'),
      },
      steps,
      metrics: {
        totalDuration: '10m 2s',
        channelsAttempted: 2,
        channelsSent: 1,
        costSaved: '$0.03',
        slaTimer: '1m 58s remaining',
      },
      behaviorFlow: {
        flowId: 'payment_recovery_v2',
        name: 'Payment Failure Recovery Flow',
        steps: [
          {
            stepNumber: 1,
            action: 'Send SMS alert',
            condition: 'payment_failed && amount > $10',
            outcome: 'Delivered',
          },
          {
            stepNumber: 2,
            action: 'Wait 10 minutes',
            condition: 'no_payment_update',
            outcome: 'Monitoring',
          },
          {
            stepNumber: 3,
            action: 'Send email with alternatives',
            condition: 'no_response_after_10m',
            outcome: 'Scheduled',
          },
        ],
      },
      channelOrchestration: {
        channels: ['SMS', 'Email', 'Push'],
        primary: 'SMS',
        fallback: 'Email',
      },
    };
  }

  /**
   * Active Hours Flow
   */
  private generateActiveHoursTimeline(baseTime: Date): EnhancedTimelineData {
    // Simulate 11:45 PM message
    const lateNightTime = new Date(baseTime);
    lateNightTime.setHours(23, 45, 0, 0);

    const steps: TimelineStep[] = [
      {
        timestamp: lateNightTime.toISOString(),
        localTime: '11:45 PM',
        type: 'event_received',
        title: 'Marketing Message Received',
        description: 'New feature announcement',
        icon: 'check',
        color: 'green',
        details:
          'Event: marketing.feature_launch | User timezone: US/Pacific | Active hours: 9 AM - 6 PM',
        whyHappened:
          "Marketing campaign triggered at 11:45 PM user local time. System detects this is outside user's preferred active hours (9 AM - 6 PM).",
        processingDuration: '67ms',
      },
      {
        timestamp: this.addSeconds(lateNightTime, 0.15).toISOString(),
        localTime: '11:45 PM',
        type: 'rule_evaluated',
        title: 'Active Hours Protection Evaluated',
        description: 'RESPECT_ACTIVE_HOURS matched',
        icon: 'alert',
        color: 'yellow',
        details:
          'Rule: RESPECT_ACTIVE_HOURS | Current: 11:45 PM | Window: 9 AM - 6 PM | Action: DELAY',
        whyHappened:
          'User preference analysis shows 92% lower engagement for messages after 10 PM. Delaying optimizes open rate and user satisfaction.',
        processingDuration: '143ms',
      },
      {
        timestamp: this.addSeconds(lateNightTime, 0.3).toISOString(),
        localTime: '11:45 PM',
        type: 'decision_taken',
        title: 'Decision: Delay Until Morning',
        description: 'Scheduled for 9:00 AM PST',
        icon: 'arrow-up',
        color: 'blue',
        critical: true,
        details:
          'Decision: DELAY_UNTIL_ACTIVE_HOURS | Target: 9:00 AM PST (9h 15m from now) | Expected engagement: 72%',
        whyHappened:
          'Respect user sleep schedule. Morning delivery (9 AM) shows 3.2x higher engagement vs late-night delivery.',
        processingDuration: '98ms',
        webhookInstruction: {
          action: 'DELAY_PUSH',
          urgency: 'LOW',
          reason: 'outside_active_hours',
          recommendedTime: '2026-02-03T17:00:00Z',
        },
      },
      {
        timestamp: this.addSeconds(lateNightTime, 0.45).toISOString(),
        localTime: '11:45 PM',
        type: 'state_updated',
        title: 'Scheduled for Optimal Delivery',
        description: 'Queued for 9:00 AM PST',
        icon: 'clock',
        color: 'purple',
        details:
          'Status: SCHEDULED | Delivery window: 9:00 AM - 9:15 AM PST | Engagement likelihood: 72% | Cost: $0 (internal queue)',
        whyHappened:
          'Message held in queue. Will be delivered during peak engagement window tomorrow morning, maximizing ROI.',
        channelContext: {
          channel: 'Push',
          status: 'delayed',
        },
      },
    ];

    return {
      eventId: `evt_active_hours_${Date.now()}`,
      eventType: 'active_hours_event',
      trigger: {
        type: 'marketing.feature_launch',
        user: 'Alex Chen (US/Pacific)',
        userTimezone: 'US/Pacific',
        localTime: '11:45 PM',
      },
      steps,
      metrics: {
        totalDuration: '9h 15m (scheduled)',
        channelsAttempted: 1,
        channelsSent: 0,
        costSaved: '$0.02',
        slaTimer: '9h 15m until delivery',
      },
      activeHours: {
        isWithinHours: false,
        currentLocalTime: '11:45 PM PST',
        window: '9:00 AM - 6:00 PM PST',
        status: 'delayed',
        deliveryTime: 'Tomorrow at 9:00 AM PST',
        engagementLikelihood: 72,
      },
      behaviorFlow: {
        flowId: 'active_hours_optimization',
        name: 'Active Hours Delivery Optimization',
        steps: [
          {
            stepNumber: 1,
            action: 'Check active hours',
            condition: 'message_received',
            outcome: 'Outside window (11:45 PM)',
          },
          {
            stepNumber: 2,
            action: 'Calculate optimal time',
            condition: 'outside_active_hours',
            outcome: 'Delay to 9:00 AM (+72% engagement)',
          },
          {
            stepNumber: 3,
            action: 'Queue message',
            condition: 'optimal_time_calculated',
            outcome: 'Scheduled',
          },
        ],
      },
      channelOrchestration: {
        channels: ['Push', 'Email'],
        primary: 'Push',
        fallback: 'Email',
      },
    };
  }

  /**
   * New Device Login Flow
   */
  private generateNewDeviceLoginTimeline(baseTime: Date): EnhancedTimelineData {
    const steps: TimelineStep[] = [
      {
        timestamp: baseTime.toISOString(),
        localTime: this.formatLocalTime(baseTime, 'US/Pacific'),
        type: 'event_received',
        title: 'New Device Login Detected',
        description: 'Login from iPhone 14 Pro in San Francisco',
        icon: 'check',
        color: 'green',
        details:
          'Event: login.new_device | Device: iPhone 14 Pro | Location: San Francisco, CA | IP: 192.168.1.***',
        whyHappened:
          'User logged in from a device not seen before. Security protocol triggers multi-step verification and onboarding flow.',
        processingDuration: '112ms',
      },
      {
        timestamp: this.addSeconds(baseTime, 0.2).toISOString(),
        localTime: this.formatLocalTime(
          this.addSeconds(baseTime, 0.2),
          'US/Pacific',
        ),
        type: 'rule_evaluated',
        title: 'Security + Onboarding Rules',
        description: '3 rules matched simultaneously',
        icon: 'alert',
        color: 'yellow',
        details:
          'Matched: SECURITY_ALERT, WELCOME_BACK, FEATURE_TOUR | Orchestrating 3-step sequence with optimal timing',
        whyHappened:
          'New device triggers both security verification and user onboarding. System orchestrates sequence to avoid overwhelming user.',
        processingDuration: '156ms',
      },
      {
        timestamp: this.addSeconds(baseTime, 0.4).toISOString(),
        localTime: this.formatLocalTime(
          this.addSeconds(baseTime, 0.4),
          'US/Pacific',
        ),
        type: 'decision_taken',
        title: 'Decision: Multi-Step Orchestration',
        description: 'Security first, then onboarding',
        icon: 'arrow-up',
        color: 'blue',
        details:
          'Sequence: (1) Security alert → wait 2s → (2) Welcome message → wait 3s → (3) Feature tour | Total: ~5s UX flow',
        whyHappened:
          'Prioritize security confirmation first. Then onboard user when alert is acknowledged. Prevents notification fatigue.',
        processingDuration: '203ms',
      },
      {
        timestamp: this.addSeconds(baseTime, 0.6).toISOString(),
        localTime: this.formatLocalTime(
          this.addSeconds(baseTime, 0.6),
          'US/Pacific',
        ),
        type: 'channel_sent',
        title: 'Step 1: Security Alert (Simulated Push)',
        description: 'New device verification',
        icon: 'check-circle',
        color: 'purple',
        details:
          'Simulated Push: "New login from iPhone 14 Pro in San Francisco. Was this you? [Yes] [No, secure my account]"',
        whyHappened:
          'Security takes precedence. User must acknowledge new device before proceeding with onboarding.',
        channelContext: {
          channel: 'Push',
          status: 'simulated',
        },
      },
      {
        timestamp: this.addSeconds(baseTime, 2.6).toISOString(),
        localTime: this.formatLocalTime(
          this.addSeconds(baseTime, 2.6),
          'US/Pacific',
        ),
        type: 'channel_sent',
        title: 'Step 2: Welcome Message (Simulated)',
        description: 'In-app welcome banner',
        icon: 'check-circle',
        color: 'green',
        details:
          'Simulated In-App: "Welcome back! Your account is secure and ready. What would you like to do today?"',
        whyHappened:
          'After security confirmation (2s delay), welcome user warmly. Creates positive re-engagement experience.',
        channelContext: {
          channel: 'Push',
          status: 'simulated',
        },
      },
      {
        timestamp: this.addSeconds(baseTime, 5.6).toISOString(),
        localTime: this.formatLocalTime(
          this.addSeconds(baseTime, 5.6),
          'US/Pacific',
        ),
        type: 'channel_sent',
        title: 'Step 3: Feature Tour (Simulated)',
        description: 'Optional onboarding',
        icon: 'check-circle',
        color: 'blue',
        details:
          'Simulated In-App: "New features available! Take a 30-second tour? [Yes, show me] [Maybe later]"',
        whyHappened:
          'After welcome (3s delay), offer optional feature discovery. Non-intrusive timing prevents abandonment.',
        channelContext: {
          channel: 'Push',
          status: 'simulated',
        },
      },
    ];

    return {
      eventId: `evt_new_device_${Date.now()}`,
      eventType: 'login.new_device',
      trigger: {
        type: 'login.new_device',
        user: 'Jordan Lee (Premium User)',
        userTimezone: 'US/Pacific',
        localTime: this.formatLocalTime(baseTime, 'US/Pacific'),
      },
      steps,
      metrics: {
        totalDuration: '5.6s',
        channelsAttempted: 3,
        channelsSent: 3,
        costSaved: '$0',
        slaTimer: 'N/A (sequence complete)',
      },
      behaviorFlow: {
        flowId: 'new_device_onboarding',
        name: 'New Device Security + Onboarding',
        steps: [
          {
            stepNumber: 1,
            action: 'Send security alert',
            condition: 'new_device_detected',
            outcome: 'Delivered',
          },
          {
            stepNumber: 2,
            action: 'Wait for acknowledgment',
            condition: 'security_confirmed || timeout_2s',
            outcome: 'Proceeded after 2s',
          },
          {
            stepNumber: 3,
            action: 'Welcome message',
            condition: 'security_ok',
            outcome: 'Delivered',
          },
          {
            stepNumber: 4,
            action: 'Feature tour offer',
            condition: 'user_engaged',
            outcome: 'Delivered',
            suppressed: false,
            reason: 'User active, optimal timing',
          },
        ],
      },
      channelOrchestration: {
        channels: ['Push', 'Email', 'SMS'],
        primary: 'Push',
        fallback: 'Email',
      },
    };
  }

  // Helper methods
  private addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1000);
  }

  private formatLocalTime(date: Date, timezone: string): string {
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  private generateTransferReversalTimeline(
    baseTime: Date,
  ): EnhancedTimelineData {
    // Similar structure - implement as needed
    return this.generatePaymentFailedTimeline(baseTime);
  }

  private generateNoResponseTimeline(baseTime: Date): EnhancedTimelineData {
    // Similar structure - implement as needed
    return this.generatePaymentFailedTimeline(baseTime);
  }
}
