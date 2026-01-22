import { Injectable } from '@nestjs/common';

interface TimelineEvent {
  relativeTime: string;
  message: string;
  type: 'info' | 'action' | 'rule' | 'warning' | 'error';
}

interface Metadata {
  utcTime: string;
  senderLocal: string;
  receiverLocal: string;
  rule: string;
  action: string;
  status: string;
}

interface Signal {
  id: string;
  userId: string;
  eventType: string;
  timezone: string;
  occurredAt: string;
  metadata: Record<string, any>;
}

interface Decision {
  id: string;
  ruleId: string;
  action: string;
  reason: string;
  confidence: number;
  scheduledFor?: string;
}

interface AuditEntry {
  timestamp: string;
  action: string;
  details: string;
  status: 'success' | 'pending' | 'delayed';
}

interface DemoResponse {
  id: string;
  scenario: string;
  timestamp: string;
  timeline: TimelineEvent[];
  metadata: Metadata;
  signals: Signal[];
  decisions: Decision[];
  auditLog: AuditEntry[];
}

@Injectable()
export class DemoService {
  private formatTime(date: Date, timezone: string): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
    });
    return formatter.format(date);
  }

  dualTimeScenario(): DemoResponse {
    const now = new Date();
    const utcTime = now.toISOString();

    return {
      id: 'scenario_dual_time_001',
      scenario: 'dual-time',
      timestamp: utcTime,
      timeline: [
        {
          relativeTime: 'T+0s',
          message: 'Sender (America/New_York) initiated message',
          type: 'info',
        },
        {
          relativeTime: 'T+0s',
          message: `Resolved sender local time: ${this.formatTime(now, 'America/New_York')}`,
          type: 'info',
        },
        {
          relativeTime: 'T+0s',
          message: 'Resolved receiver timezone: Europe/London',
          type: 'rule',
        },
        {
          relativeTime: 'T+0s',
          message: `Receiver local time: ${this.formatTime(now, 'Europe/London')}`,
          type: 'info',
        },
        {
          relativeTime: 'T+0s',
          message: 'Message delivered',
          type: 'action',
        },
      ],
      metadata: {
        utcTime,
        senderLocal: this.formatTime(now, 'America/New_York'),
        receiverLocal: this.formatTime(now, 'Europe/London'),
        rule: 'timezone_intelligence',
        action: 'message_resolved',
        status: 'delivered',
      },
      signals: [
        {
          id: 'signal_msg_001',
          userId: 'user_sender_001',
          eventType: 'message.sent',
          timezone: 'America/New_York',
          occurredAt: utcTime,
          metadata: {
            content: 'Please approve this transaction',
            recipient: 'user_receiver_001',
          },
        },
      ],
      decisions: [
        {
          id: 'decision_timezone_001',
          ruleId: 'rule_timezone_intelligence',
          action: 'resolve_timezone',
          reason: 'Receiver in different timezone detected',
          confidence: 0.99,
        },
      ],
      auditLog: [
        {
          timestamp: utcTime,
          action: 'signal.recorded',
          details: 'Message signal recorded from sender',
          status: 'success',
        },
        {
          timestamp: new Date(now.getTime() + 500).toISOString(),
          action: 'rule.matched',
          details: 'timezone_intelligence rule matched',
          status: 'success',
        },
        {
          timestamp: new Date(now.getTime() + 1000).toISOString(),
          action: 'message.delivered',
          details: 'Message delivered to recipient',
          status: 'success',
        },
      ],
    };
  }

  behaviorReminderScenario(): DemoResponse {
    const now = new Date();
    const utcTime = now.toISOString();
    const plus10m = new Date(now.getTime() + 10 * 60000);

    return {
      id: 'scenario_behavior_reminder_001',
      scenario: 'behavior-reminder',
      timestamp: utcTime,
      timeline: [
        {
          relativeTime: 'T+0s',
          message: 'Message sent and delivered',
          type: 'action',
        },
        {
          relativeTime: 'T+10m',
          message: 'No reply detected',
          type: 'warning',
        },
        {
          relativeTime: 'T+10m',
          message: 'Rule triggered: no_reply_10min',
          type: 'rule',
        },
        {
          relativeTime: 'T+10m',
          message: 'Action queued: send_reminder',
          type: 'action',
        },
        {
          relativeTime: 'T+10m',
          message: 'Action triggered',
          type: 'action',
        },
      ],
      metadata: {
        utcTime,
        senderLocal: 'N/A',
        receiverLocal: 'N/A',
        rule: 'no_reply_10min',
        action: 'send_reminder',
        status: 'triggered',
      },
      signals: [
        {
          id: 'signal_reminder_001',
          userId: 'user_001',
          eventType: 'message.sent',
          timezone: 'UTC',
          occurredAt: utcTime,
          metadata: { channel: 'email' },
        },
        {
          id: 'signal_reminder_002',
          userId: 'user_001',
          eventType: 'reply.timeout',
          timezone: 'UTC',
          occurredAt: plus10m.toISOString(),
          metadata: { timeoutWindow: '10m' },
        },
      ],
      decisions: [
        {
          id: 'decision_reminder_001',
          ruleId: 'rule_no_reply_10min',
          action: 'send_reminder',
          reason: 'No reply received within 10 minutes',
          confidence: 0.95,
          scheduledFor: plus10m.toISOString(),
        },
      ],
      auditLog: [
        {
          timestamp: utcTime,
          action: 'message.sent',
          details: 'Initial message sent',
          status: 'success',
        },
        {
          timestamp: plus10m.toISOString(),
          action: 'rule.triggered',
          details: 'no_reply_10min rule triggered',
          status: 'success',
        },
        {
          timestamp: new Date(plus10m.getTime() + 500).toISOString(),
          action: 'reminder.sent',
          details: 'Reminder notification sent',
          status: 'success',
        },
      ],
    };
  }

  fintechLoginScenario(): DemoResponse {
    const now = new Date();
    const utcTime = now.toISOString();
    const plus5s = new Date(now.getTime() + 5000);

    return {
      id: 'scenario_fintech_login_001',
      scenario: 'fintech-login',
      timestamp: utcTime,
      timeline: [
        {
          relativeTime: 'T+0s',
          message: 'User login event detected',
          type: 'info',
        },
        {
          relativeTime: 'T+0s',
          message: 'Action 1: Welcome popup displayed',
          type: 'action',
        },
        {
          relativeTime: 'T+5s',
          message: 'Action 2: Guidance tour initiated',
          type: 'action',
        },
        {
          relativeTime: 'T+5s',
          message: 'All actions executed',
          type: 'action',
        },
      ],
      metadata: {
        utcTime,
        senderLocal: 'N/A',
        receiverLocal: 'N/A',
        rule: 'login_event',
        action: '2 actions executed',
        status: 'executed',
      },
      signals: [
        {
          id: 'signal_login_001',
          userId: 'john_doe@fintech.com',
          eventType: 'user.login',
          timezone: 'UTC',
          occurredAt: utcTime,
          metadata: { platform: 'web', ipAddress: '192.168.1.1' },
        },
      ],
      decisions: [
        {
          id: 'decision_login_001',
          ruleId: 'rule_welcome_popup',
          action: 'show_popup',
          reason: 'First login of session',
          confidence: 1.0,
          scheduledFor: utcTime,
        },
        {
          id: 'decision_login_002',
          ruleId: 'rule_guidance_tour',
          action: 'show_tour',
          reason: 'User has not completed onboarding',
          confidence: 0.92,
          scheduledFor: plus5s.toISOString(),
        },
      ],
      auditLog: [
        {
          timestamp: utcTime,
          action: 'login.detected',
          details: 'User login event recorded',
          status: 'success',
        },
        {
          timestamp: utcTime,
          action: 'popup.shown',
          details: 'Welcome popup displayed',
          status: 'success',
        },
        {
          timestamp: plus5s.toISOString(),
          action: 'tour.started',
          details: 'Guidance tour initiated',
          status: 'success',
        },
      ],
    };
  }

  activeHoursScenario(): DemoResponse {
    const now = new Date();
    const utcTime = now.toISOString();
    const tomorrow9am = new Date(now);
    tomorrow9am.setDate(tomorrow9am.getDate() + 1);
    tomorrow9am.setHours(9, 0, 0, 0);

    return {
      id: 'scenario_active_hours_001',
      scenario: 'active-hours',
      timestamp: utcTime,
      timeline: [
        {
          relativeTime: 'T+0s',
          message: 'Message sent at 2:15 AM PST',
          type: 'info',
        },
        {
          relativeTime: 'T+0s',
          message: 'Receiver timezone: America/Los_Angeles',
          type: 'info',
        },
        {
          relativeTime: 'T+0s',
          message: 'Active hours: 9 AM - 6 PM',
          type: 'rule',
        },
        {
          relativeTime: 'T+0s',
          message: 'Status: delayed',
          type: 'warning',
        },
        {
          relativeTime: 'T+0s',
          message: 'Scheduled for: Tomorrow at 9:00 AM PST',
          type: 'action',
        },
      ],
      metadata: {
        utcTime,
        senderLocal: 'N/A',
        receiverLocal: 'America/Los_Angeles',
        rule: 'active_hours_check',
        action: 'delivery_delayed',
        status: 'delayed',
      },
      signals: [
        {
          id: 'signal_delivery_001',
          userId: 'user_receiver_pst',
          eventType: 'message.received',
          timezone: 'America/Los_Angeles',
          occurredAt: utcTime,
          metadata: { priority: 'normal', channel: 'email' },
        },
      ],
      decisions: [
        {
          id: 'decision_active_hours_001',
          ruleId: 'rule_active_hours_check',
          action: 'delay_delivery',
          reason: 'Current time (2:15 AM) outside active hours (9 AM - 6 PM)',
          confidence: 1.0,
          scheduledFor: tomorrow9am.toISOString(),
        },
      ],
      auditLog: [
        {
          timestamp: utcTime,
          action: 'message.queued',
          details: 'Message queued for delayed delivery',
          status: 'pending',
        },
        {
          timestamp: new Date(now.getTime() + 1000).toISOString(),
          action: 'rule.matched',
          details: 'active_hours_check rule matched - outside active window',
          status: 'success',
        },
        {
          timestamp: tomorrow9am.toISOString(),
          action: 'message.scheduled',
          details: `Delivery scheduled for ${tomorrow9am.toTimeString()}`,
          status: 'delayed',
        },
      ],
    };
  }
}
