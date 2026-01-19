export interface UserActivityState {
  userId: string;
  lastActiveAt: Date;
  timezone: string;
  activityHistory?: Date[];
}

export interface DualTimeMetadata {
  senderLocal: string;
  receiverLocal: string;
  sentAtUTC: string;
}

export interface MessageDeliveryResult {
  messageId: string;
  status: 'delivered' | 'pending' | 'delayed';
  dualTime: DualTimeMetadata;
  message: string;
  delayReason?: string;
  nextRetryAt?: Date;
}
