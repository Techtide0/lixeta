// types/timeline.ts

export interface TimelineStep {
  timestamp: string;
  localTime: string;
  type: 'event_received' | 'rule_evaluated' | 'decision_taken' | 'channel_attempted' | 'channel_sent' | 'state_updated';
  title: string;
  description: string;
  icon: 'check' | 'alert' | 'arrow-up' | 'minus' | 'check-circle' | 'clock';
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';
  details: string;
  critical?: boolean;
  // Enhanced fields
  whyHappened?: string;
  processingDuration?: string;
  channelContext?: {
    channel: 'SMS' | 'Email' | 'Push' | 'Webhook';
    status: 'sent' | 'delayed' | 'skipped' | 'simulated';
  };
  webhookInstruction?: {
    action: string;
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
    recommendedTime: string;
  };
}

export interface TimelineTrigger {
  type: string;
  user: string;
  userTimezone: string;
  localTime: string;
}

export interface TimelineMetrics {
  totalDuration: string;
  channelsAttempted: number;
  channelsSent: number;
  costSaved: string;
  slaTimer: string;
}

export interface TimelineData {
  eventId: string;
  trigger: TimelineTrigger;
  steps: TimelineStep[];
  metrics: TimelineMetrics;
}

export interface AnalyticsSummary {
  messagesSent: number;
  delivered: number;
  deliveryRate: number;
  engaged: number;
  engagementRate: number;
  costSavings: number;
}

export interface ChannelBreakdown {
  channel: 'Push' | 'Email' | 'SMS';
  count: number;
  percentage: number;
  color: string;
}

export interface RuleTriggered {
  rule: string;
  time: string;
  channel: 'Push' | 'Email' | 'SMS';
  triggered: number;
}

export interface RecentActivity {
  time: string;
  event: string;
  user: string;
  channel: 'Push' | 'Email' | 'SMS';
}

export interface CostAnalysis {
  emailSaved: number;
  smsSaved: number;
  totalCostCut: number;
  valueJustified: boolean;
}

export interface DeliveryStatus {
  delayed: number;
  immediate: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  channelBreakdown: ChannelBreakdown[];
  deliveryStatus: DeliveryStatus;
  topRules: RuleTriggered[];
  costAnalysis: CostAnalysis;
  recentActivity: RecentActivity[];
}
// Enhanced Interfaces
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

export interface ChannelOrchestration {
  channels: ('SMS' | 'Email' | 'Push' | 'Webhook')[];
  primary: 'SMS' | 'Email' | 'Push' | 'Webhook';
  fallback?: 'SMS' | 'Email' | 'Push' | 'Webhook';
}

export interface SuppressionMetrics {
  messagesAvoided: number;
  quietHoursSuppression: number;
  fatigueSuppression: number;
}

export interface EngagementEvents {
  clicked: number;
  ignored: number;
  responded: number;
}

export interface ROIComparison {
  withoutLixeta: {
    messagesSent: number;
    estimatedCost: number;
  };
  withLixeta: {
    messagesSent: number;
    estimatedCost: number;
    savings: number;
  };
}

export interface EnhancedAnalyticsData extends AnalyticsData {
  eventId?: string;
  eventType?: 'payment.failed' | 'transfer.reversal_requested' | 'login.new_device' | 'active_hours_event' | 'user.no_response';
  trigger?: TimelineTrigger;
  steps?: TimelineStep[];
  metrics?: TimelineMetrics;
  activeHours?: ActiveHoursStatus;
  behaviorFlow?: BehaviorFlow;
  channelOrchestration?: ChannelOrchestration;
  suppressionMetrics?: SuppressionMetrics;
  engagementEvents?: EngagementEvents;
  roiComparison?: ROIComparison;
  timeRange?: '7d' | '30d' | '90d';
}