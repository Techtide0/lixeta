export type ActionType =
  | 'deliver_message'
  | 'delay_message'
  | 'send_reminder'
  | 'show_popup'
  | 'send_notification';

export interface AstelixAction {
  id: string;
  userId: string;
  actionType: ActionType;
  payload?: Record<string, any>;
  scheduledAt: Date; // UTC
  status: 'pending' | 'executed';
  triggeredByEventType: string;
  createdAt: Date;
}
