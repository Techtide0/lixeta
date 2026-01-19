export type EventType =
  | 'message_sent'
  | 'message_delivered'
  | 'message_read'
  | 'user_login'
  | 'user_scroll'
  | 'user_click';

export type DecisionActionType =
  | 'send_reminder'
  | 'show_popup'
  | 'send_notification'
  | 'nudge_receiver'
  | 'auto_followup'
  | 'welcome_prompt';

export interface BehaviorEvent {
  type: EventType;
  userId: string;
  messageId?: string;
  timestamp: Date;
  timezone: string;
  metadata?: Record<string, any>;
  state?: {
    readAfterXHours?: boolean;
    clickedProduct?: boolean;
    isNewUser?: boolean;
    [key: string]: any;
  };
}

export interface BehaviorRuleDefinition {
  id: string;
  name: string;
  trigger: EventType;
  condition: (event: BehaviorEvent, state?: any) => boolean;
  action: (event: BehaviorEvent) => DecisionActionType;
  delayMs?: number; // Optional delay before executing action
  priority?: number; // Higher priority runs first
}

export interface RuleExecutionResult {
  ruleId: string;
  ruleName: string;
  eventType: EventType;
  userId: string;
  triggeredAt: Date;
  action: DecisionActionType;
  payload?: any;
}
