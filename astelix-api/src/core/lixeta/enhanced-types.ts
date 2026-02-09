// enhanced-types.ts

export type EventType =
  | 'payment.failed'
  | 'transfer.reversal_requested'
  | 'login.new_device'
  | 'active_hours_event'
  | 'user.no_response';

export type ChannelType = 'SMS' | 'Email' | 'Push' | 'Webhook';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface EventMetadata {
  userId: string;
  amount?: number;
  deviceInfo?: string;
  channelIntent: ChannelType;
  urgency: UrgencyLevel;
  reason?: string;
}

export interface Event {
  eventName: EventType;
  utcTimestamp: string;
  senderTimezone: string;
  receiverTimezone: string;
  metadata: EventMetadata;
}

export interface TimelineStep {
  timestamp: string;
  localTime: string;
  type:
    | 'event_received'
    | 'rule_evaluated'
    | 'decision_taken'
    | 'channel_attempted'
    | 'channel_sent'
    | 'state_updated';
  title: string;
  description: string;
  icon: 'check' | 'alert' | 'arrow-up' | 'minus' | 'check-circle' | 'clock';
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';
  details: string;
  critical?: boolean;
  // Enhanced fields
  whyHappened: string;
  processingDuration?: string;
  channelContext?: {
    channel: ChannelType;
    status: 'sent' | 'delayed' | 'skipped' | 'simulated';
  };
  webhookInstruction?: {
    action: string;
    urgency: UrgencyLevel;
    reason: string;
    recommendedTime: string;
  };
}

export interface ActiveHoursConfig {
  startHour: number;
  endHour: number;
  timezone: string;
}

export interface ActiveHoursStatus {
  isWithinHours: boolean;
  currentLocalTime: string;
  window: string;
  status: 'delayed' | 'sent' | 'scheduled';
  deliveryTime?: string;
  engagementLikelihood?: number;
}

export interface BehaviorFlow {
  flowId: string;
  name: string;
  steps: {
    stepNumber: number;
    action: string;
    condition: string;
    outcome: string;
    suppressed?: boolean;
    reason?: string;
  }[];
}

export interface EnhancedTimelineData {
  eventId: string;
  eventType: EventType;
  trigger: {
    type: string;
    user: string;
    userTimezone: string;
    localTime: string;
  };
  steps: TimelineStep[];
  metrics: {
    totalDuration: string;
    channelsAttempted: number;
    channelsSent: number;
    costSaved: string;
    slaTimer: string;
  };
  // Enhanced fields
  activeHours?: ActiveHoursStatus;
  behaviorFlow?: BehaviorFlow;
  channelOrchestration: {
    channels: ChannelType[];
    primary: ChannelType;
    fallback?: ChannelType;
  };
}

export interface EnhancedAnalytics {
  summary: {
    messagesSent: number;
    delivered: number;
    deliveryRate: number;
    engaged: number;
    engagementRate: number;
    costSavings: number;
  };
  channelBreakdown: {
    channel: ChannelType;
    count: number;
    percentage: number;
    color: string;
  }[];
  deliveryStatus: {
    delayed: number;
    immediate: number;
  };
  topRules: {
    rule: string;
    time: string;
    channel: ChannelType;
    triggered: number;
  }[];
  costAnalysis: {
    emailSaved: number;
    smsSaved: number;
    totalCostCut: number;
    valueJustified: boolean;
  };
  recentActivity: {
    time: string;
    event: string;
    user: string;
    channel: ChannelType;
  }[];
  // Enhanced fields
  suppressionMetrics: {
    messagesAvoided: number;
    quietHoursSuppression: number;
    fatigueSuppression: number;
  };
  engagementEvents: {
    clicked: number;
    ignored: number;
    responded: number;
  };
  roiComparison: {
    withoutLixeta: {
      messagesSent: number;
      estimatedCost: number;
    };
    withLixeta: {
      messagesSent: number;
      estimatedCost: number;
      savings: number;
    };
  };
  timeRange: '7d' | '30d' | '90d';
}
