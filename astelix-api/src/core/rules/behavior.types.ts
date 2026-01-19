// src/behaviors/behavior.types.ts

export type BehaviorContext = {
  userId: string;
  timezone: string;

  now: Date;

  lastEventType: 'user_login' | 'user_click' | 'message_sent' | 'session_ping';
  lastActiveAt: Date;

  inactivityMinutes: number;

  // Optional message context (for chat/email systems)
  message?: {
    messageId: string;
    senderId: string;
    receiverId: string;
    sentAt: Date;
    receiverTimezone: string;
  };
};

export enum ActionType {
  SHOW_POPUP = 'SHOW_POPUP',
  TRIGGER_REMINDER = 'TRIGGER_REMINDER',
  DELAY_DELIVERY = 'DELAY_DELIVERY',
  NOTIFY_SENDER = 'NOTIFY_SENDER',
}

export type BehaviorAction = {
  type: ActionType;
  reason: string;

  // Payload is intentionally flexible for different platforms
  payload?: {
    message?: string;
    delayUntil?: Date;
  };
};

export type BehaviorResult = {
  userId: string;
  evaluatedAt: Date;
  actions: BehaviorAction[];
};
