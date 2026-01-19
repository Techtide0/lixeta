export type EventType =
  | 'message_delivered'
  | 'message_read'
  | 'message_replied'
  | 'time_elapsed';

export interface MessageEvent {
  type: EventType;
  messageId: string;
  utcTime: string;
  senderTimezone: string;
  receiverTimezone: string;
  senderLocalTime?: string;
  receiverLocalTime?: string;
}

export interface RuleAction {
  action: 'sender_reminder' | 'receiver_nudge' | 'auto_followup';
  messageId: string;
  utcTime: string;
  senderLocalTime: string;
  receiverLocalTime: string;
  senderTimezone: string;
  receiverTimezone: string;
  description: string;
}

export interface RuleEvaluationResult {
  messageId: string;
  evaluatedAtUtc: string;
  actions: RuleAction[];
  logs: RuleLog[];
}

export interface RuleLog {
  rule:
    | 'no_reply_reminder'
    | 'unread_nudge'
    | 'auto_followup'
    | 'unread_nudge_delayed'
    | 'no_reply_reminder_delayed'
    | 'auto_followup_delayed';
  messageId: string;
  triggered: boolean;
  reason: string;
  utcTime: string;
}
