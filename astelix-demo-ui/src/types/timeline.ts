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
