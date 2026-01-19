export type SignalType =
  | 'user_login'
  | 'user_click'
  | 'scroll'
  | 'message_sent'
  | 'message_read'
  | 'message_replied';

export interface Signal {
  id: string;
  userId: string;
  signalType: SignalType;
  metadata?: Record<string, any>;
  occurredAt: Date;
  timezone: string;
}
