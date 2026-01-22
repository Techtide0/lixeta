/**
 * Mock Backend Service
 * Simulates the actual NestJS backend for demo purposes
 * Provides realistic mock data that mirrors real API responses
 */

export interface DemoScenarioResponse {
  id: string;
  scenario: string;
  timestamp: string;
  data: any;
  timeline: TimelineEvent[];
  metadata: ScenarioMetadata;
  signals: Signal[];
  decisions: Decision[];
  auditLog: AuditEntry[];
}

export interface TimelineEvent {
  relativeTime: string;
  message: string;
  type: "info" | "action" | "rule" | "warning" | "error";
}

export interface Signal {
  id: string;
  userId: string;
  eventType: string;
  timezone: string;
  occurredAt: string;
  metadata: Record<string, any>;
}

export interface Decision {
  id: string;
  ruleId: string;
  action: string;
  reason: string;
  confidence: number;
  scheduledFor?: string;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  details: string;
  status: "success" | "pending" | "delayed";
}

export interface ScenarioMetadata {
  utcTime: string;
  senderLocal: string;
  receiverLocal: string;
  rule: string;
  action: string;
  status: string;
}

/**
 * Mock Backend Implementation
 * Simulates /demo/{scenario} endpoints
 */
export const mockBackend = {
  /**
   * Scenario 1: Dual-Time Message (Timezone Intelligence)
   * Demonstrates timezone resolution and message routing
   */
  async runDualTimeScenario(): Promise<DemoScenarioResponse> {
    await delay(600);

    const now = new Date();
    const timestamp = now.toISOString();

    return {
      id: "scenario_dualtime_001",
      scenario: "dual-time",
      timestamp,
      data: {
        utcTime: timestamp,
        sender: {
          id: "user_sender_001",
          timezone: "America/New_York",
          localTime: formatTime(now, "America/New_York"),
        },
        receiver: {
          id: "user_receiver_001",
          timezone: "Europe/London",
          localTime: formatTime(now, "Europe/London"),
        },
        content: "Please approve this transaction",
        status: "delivered",
      },
      timeline: [
        {
          relativeTime: "T+0s",
          message: "Sender (America/New_York) initiated message",
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Resolved sender local time: ${formatTime(now, "America/New_York")}`,
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Resolved receiver timezone: Europe/London",
          type: "rule" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Receiver local time: ${formatTime(now, "Europe/London")}`,
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Message delivered via email",
          type: "action" as const,
        },
      ],
      metadata: {
        utcTime: timestamp,
        senderLocal: formatTime(now, "America/New_York"),
        receiverLocal: formatTime(now, "Europe/London"),
        rule: "timezone_intelligence",
        action: "message_resolved",
        status: "delivered",
      },
      signals: [
        {
          id: "signal_msg_001",
          userId: "user_sender_001",
          eventType: "message_sent",
          timezone: "America/New_York",
          occurredAt: timestamp,
          metadata: {
            content: "Please approve this transaction",
            channel: "email",
            recipient: "user_receiver_001",
          },
        },
      ],
      decisions: [
        {
          id: "decision_timezone_001",
          ruleId: "rule_timezone_intelligence",
          action: "resolve_timezone",
          reason: "Receiver in different timezone detected",
          confidence: 0.99,
        },
      ],
      auditLog: [
        {
          timestamp,
          action: "signal.recorded",
          details: "Message signal recorded from sender",
          status: "success",
        },
        {
          timestamp: new Date(now.getTime() + 100).toISOString(),
          action: "rule.matched",
          details: "timezone_intelligence rule matched",
          status: "success",
        },
        {
          timestamp: new Date(now.getTime() + 200).toISOString(),
          action: "message.delivered",
          details: "Message delivered to receiver in Europe/London",
          status: "success",
        },
      ],
    };
  },

  /**
   * Scenario 2: Behavior-Based Reminder (No-Reply Rule)
   * Demonstrates automatic reminder after 10 minutes without reply
   */
  async runBehaviorReminderScenario(): Promise<DemoScenarioResponse> {
    await delay(600);

    const now = new Date();
    const timestamp = now.toISOString();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

    return {
      id: "scenario_reminder_001",
      scenario: "behavior-reminder",
      timestamp,
      data: {
        triggeredAt: timestamp,
        rule: "no_reply_10min",
        action: "send_reminder",
        status: "triggered",
        noReplyWindow: 10,
      },
      timeline: [
        {
          relativeTime: "T+0s",
          message: "Message sent to user_456",
          type: "action" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Message delivered successfully",
          type: "action" as const,
        },
        {
          relativeTime: "T+10m",
          message: "No reply detected after 10 minutes",
          type: "warning" as const,
        },
        {
          relativeTime: "T+10m",
          message: "Rule triggered: no_reply_10min",
          type: "rule" as const,
        },
        {
          relativeTime: "T+10m",
          message: "Action queued: send_reminder",
          type: "action" as const,
        },
        {
          relativeTime: "T+10m",
          message: "Reminder sent via SMS",
          type: "action" as const,
        },
      ],
      metadata: {
        utcTime: timestamp,
        senderLocal: "N/A",
        receiverLocal: "N/A",
        rule: "no_reply_10min",
        action: "send_reminder",
        status: "executed",
      },
      signals: [
        {
          id: "signal_request_001",
          userId: "system",
          eventType: "request_sent",
          timezone: "America/Chicago",
          occurredAt: timestamp,
          metadata: {
            content: "You have an outstanding request",
            channel: "sms",
            requestId: "req_12345",
          },
        },
        {
          id: "signal_noreply_001",
          userId: "user_456",
          eventType: "no_reply_10min",
          timezone: "America/Chicago",
          occurredAt: tenMinutesLater.toISOString(),
          metadata: {
            windowMinutes: 10,
            requestId: "req_12345",
          },
        },
      ],
      decisions: [
        {
          id: "decision_reminder_001",
          ruleId: "rule_no_reply_10min",
          action: "send_reminder",
          reason: "No reply received within 10-minute window",
          confidence: 1.0,
          scheduledFor: tenMinutesLater.toISOString(),
        },
      ],
      auditLog: [
        {
          timestamp,
          action: "signal.recorded",
          details: "Request sent signal recorded",
          status: "success",
        },
        {
          timestamp: tenMinutesLater.toISOString(),
          action: "signal.delayed",
          details: "No reply signal detected",
          status: "success",
        },
        {
          timestamp: new Date(tenMinutesLater.getTime() + 100).toISOString(),
          action: "rule.matched",
          details: "no_reply_10min rule matched",
          status: "success",
        },
        {
          timestamp: new Date(tenMinutesLater.getTime() + 200).toISOString(),
          action: "action.executed",
          details: "Reminder sent via SMS",
          status: "success",
        },
      ],
    };
  },

  /**
   * Scenario 3: Fintech Login (Multi-Action Orchestration)
   * Demonstrates executing multiple actions on login event
   */
  async runFintechLoginScenario(): Promise<DemoScenarioResponse> {
    await delay(600);

    const now = new Date();
    const timestamp = now.toISOString();
    const action2Time = new Date(now.getTime() + 5000);

    return {
      id: "scenario_fintech_001",
      scenario: "fintech-login",
      timestamp,
      data: {
        userId: "user_fintech_001",
        email: "john_doe@fintech.com",
        loginTime: timestamp,
        platform: "web",
        actions: [
          { message: "Welcome popup displayed", delayMs: 0 },
          { message: "Guidance tour initiated", delayMs: 5000 },
        ],
      },
      timeline: [
        {
          relativeTime: "T+0s",
          message: "User login event detected",
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Processing event through rules engine",
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Rules matched: welcome_popup, guidance_tour",
          type: "rule" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Action 1: Welcome popup displayed",
          type: "action" as const,
        },
        {
          relativeTime: "T+5s",
          message: "Action 2: Guidance tour initiated",
          type: "action" as const,
        },
        {
          relativeTime: "T+5s",
          message: "All actions executed successfully",
          type: "action" as const,
        },
      ],
      metadata: {
        utcTime: timestamp,
        senderLocal: "N/A",
        receiverLocal: "N/A",
        rule: "welcome_popup, guidance_tour",
        action: "show_popup, show_tour",
        status: "executed",
      },
      signals: [
        {
          id: "signal_login_001",
          userId: "user_fintech_001",
          eventType: "login",
          timezone: "America/New_York",
          occurredAt: timestamp,
          metadata: {
            email: "john_doe@fintech.com",
            platform: "web",
            ipAddress: "203.0.113.45",
            deviceType: "desktop",
          },
        },
      ],
      decisions: [
        {
          id: "decision_popup_001",
          ruleId: "rule_welcome_popup",
          action: "show_popup",
          reason: "User login detected",
          confidence: 0.99,
          scheduledFor: timestamp,
        },
        {
          id: "decision_tour_001",
          ruleId: "rule_guidance_tour",
          action: "show_tour",
          reason: "Welcome popup completed",
          confidence: 0.95,
          scheduledFor: action2Time.toISOString(),
        },
      ],
      auditLog: [
        {
          timestamp,
          action: "signal.recorded",
          details: "Login signal recorded for user_fintech_001",
          status: "success",
        },
        {
          timestamp: new Date(now.getTime() + 50).toISOString(),
          action: "rule.matched",
          details: "welcome_popup rule matched",
          status: "success",
        },
        {
          timestamp: new Date(now.getTime() + 100).toISOString(),
          action: "action.executed",
          details: "Welcome popup action executed",
          status: "success",
        },
        {
          timestamp: action2Time.toISOString(),
          action: "rule.matched",
          details: "guidance_tour rule matched",
          status: "success",
        },
        {
          timestamp: new Date(action2Time.getTime() + 100).toISOString(),
          action: "action.executed",
          details: "Guidance tour action executed",
          status: "success",
        },
      ],
    };
  },

  /**
   * Scenario 4: Active Hours Window (Schedule-Based Delivery)
   * Demonstrates respecting user's active hours and delaying messages
   */
  async runActiveHoursScenario(): Promise<DemoScenarioResponse> {
    await delay(600);

    const now = new Date();
    // Set to 2:15 AM (outside active hours)
    const offHoursTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 2, 15, 0);
    if (offHoursTime < now) {
      offHoursTime.setDate(offHoursTime.getDate() + 1);
    }
    const timestamp = offHoursTime.toISOString();

    // Scheduled for 9:00 AM same timezone (PST)
    const scheduledTime = new Date(offHoursTime.getFullYear(), offHoursTime.getMonth(), offHoursTime.getDate() + 1, 9, 0, 0);
    const scheduledForString = scheduledTime.toISOString();

    return {
      id: "scenario_activehours_001",
      scenario: "active-hours",
      timestamp,
      data: {
        sentAt: timestamp,
        senderTimezone: "UTC",
        receiverTimezone: "America/Los_Angeles",
        deliveryWindow: "9 AM - 6 PM",
        status: "delayed",
        scheduledFor: scheduledForString,
        delayReason: "Outside active hours",
        delayDuration: "6 hours 45 minutes",
      },
      timeline: [
        {
          relativeTime: "T+0s",
          message: "Message received at 2:15 AM PST",
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Receiver timezone: America/Los_Angeles",
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Active hours: 9 AM - 6 PM PST",
          type: "rule" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Current time outside active hours",
          type: "warning" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Action: Delay delivery until 9:00 AM PST",
          type: "action" as const,
        },
        {
          relativeTime: "T+0s",
          message: "Scheduled for: " + formatTime(scheduledTime, "America/Los_Angeles"),
          type: "action" as const,
        },
      ],
      metadata: {
        utcTime: timestamp,
        senderLocal: "UTC",
        receiverLocal: formatTime(offHoursTime, "America/Los_Angeles"),
        rule: "active_hours_enforcement",
        action: "delay",
        status: "delayed",
      },
      signals: [
        {
          id: "signal_alert_001",
          userId: "user_789",
          eventType: "account_alert",
          timezone: "America/Los_Angeles",
          occurredAt: timestamp,
          metadata: {
            channel: "sms",
            content: "Your account requires attention: Verify your identity",
            priority: "normal",
            alertId: "alert_456",
          },
        },
      ],
      decisions: [
        {
          id: "decision_delay_001",
          ruleId: "rule_active_hours_123",
          action: "delay",
          reason: "Outside active hours (9 AM - 6 PM PST)",
          confidence: 0.99,
          scheduledFor: scheduledForString,
        },
      ],
      auditLog: [
        {
          timestamp,
          action: "signal.recorded",
          details: "Account alert signal recorded",
          status: "success",
        },
        {
          timestamp: new Date(offHoursTime.getTime() + 50).toISOString(),
          action: "rule.matched",
          details: "active_hours_enforcement rule matched",
          status: "success",
        },
        {
          timestamp: new Date(offHoursTime.getTime() + 100).toISOString(),
          action: "signal.delayed",
          details: "Message delayed until 9:00 AM PST (6 hours 45 minutes)",
          status: "pending",
        },
      ],
    };
  },
};

/**
 * Helper function to add delay (simulates network latency)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper function to format time in a specific timezone
 */
function formatTime(date: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const parts = formatter.formatToParts(date);
    const time = parts.map((p) => p.value).join("");
    return time;
  } catch {
    // Fallback for invalid timezones
    return date.toLocaleTimeString();
  }
}

/**
 * Main mock backend router function
 * Simulates routing to different scenario endpoints
 */
export async function runMockDemoScenario(
  scenario: "dual-time" | "behavior-reminder" | "fintech-login" | "active-hours"
): Promise<DemoScenarioResponse> {
  switch (scenario) {
    case "dual-time":
      return mockBackend.runDualTimeScenario();
    case "behavior-reminder":
      return mockBackend.runBehaviorReminderScenario();
    case "fintech-login":
      return mockBackend.runFintechLoginScenario();
    case "active-hours":
      return mockBackend.runActiveHoursScenario();
    default:
      throw new Error(`Unknown scenario: ${scenario}`);
  }
}
