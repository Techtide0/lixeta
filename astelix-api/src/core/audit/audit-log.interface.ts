export type AuditLogType =
  | 'signal_received'
  | 'rule_triggered'
  | 'decision_created'
  | 'decision_executed'
  | 'decision_delayed'
  | 'message_delivery'
  | 'event_processed'
  | 'behavior_rule_executed';

export interface AuditLog {
  id: string;
  type: AuditLogType;
  referenceId: string;
  timestampUtc: Date;
  localTime?: Date;
  timezone?: string;
  userId?: string;
  metadata?: any;
}

export interface MessageDeliveryAuditLog extends AuditLog {
  type: 'message_delivery';
  senderId: string;
  receiverId: string;
  messageId: string;
  status: 'delivered' | 'pending' | 'delayed';
  dualTime?: {
    senderLocal: string;
    receiverLocal: string;
  };
}

export interface RuleExecutionAuditLog extends AuditLog {
  type: 'behavior_rule_executed';
  ruleId: string;
  ruleName: string;
  action: string;
  eventType: string;
  delayMs?: number;
}
