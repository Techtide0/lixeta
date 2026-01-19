import { Injectable } from '@nestjs/common';

@Injectable()
export class DemoService {
  dualTimeScenario() {
    return {
      scenario: 'dual_time_message',
      sender: {
        id: 'user_ng',
        timezone: 'Africa/Lagos',
        localTime: '9:15 AM',
      },
      receiver: {
        id: 'user_us',
        timezone: 'America/New_York',
        localTime: '3:15 AM',
      },
      utcTime: '2026-01-16T08:15:00Z',
      status: 'delivered',
    };
  }

  behaviorReminderScenario() {
    return {
      scenario: 'auto_reminder',
      rule: 'no_reply_after_x_minutes',
      action: 'send_reminder',
      triggeredAt: '2026-01-16T08:45:00Z',
      status: 'executed',
    };
  }

  fintechLoginScenario() {
    return {
      scenario: 'fintech_login',
      actions: [
        {
          type: 'popup',
          message: 'Welcome! Let us know if you need help.',
          executedAt: 'T+0s',
        },
        {
          type: 'popup',
          message: 'Need help completing a transaction?',
          executedAt: 'T+5s',
        },
      ],
    };
  }

  activeHoursScenario() {
    return {
      scenario: 'active_hours_delay',
      sentAt: '11:45 PM',
      receiverTimezone: 'America/New_York',
      deliveryWindow: '8:00 AM – 9:00 PM',
      status: 'delayed',
      scheduledFor: '8:00 AM',
    };
  }
}
