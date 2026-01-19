import { Injectable } from '@nestjs/common';
import { BehaviorRulesEngine } from './behavior-rules.engine';
import type { BehaviorEvent, RuleExecutionResult } from './behavior-rule.types';

export interface ProcessedEventResult {
  eventId: string;
  eventType: string;
  userId: string;
  recordedAt: Date;
  rulesTriggered: RuleExecutionResult[];
  auditLog?: {
    timestamp: Date;
    event: string;
    userId: string;
    details: any;
  };
}

@Injectable()
export class EventProcessor {
  private eventLog: BehaviorEvent[] = [];

  constructor(private readonly rulesEngine: BehaviorRulesEngine) {}

  /**
   * Process a behavior event and execute applicable rules
   */
  processEvent(event: BehaviorEvent): ProcessedEventResult {
    // Record event in log
    this.eventLog.push(event);

    // Process rules
    const rulesTriggered = this.rulesEngine.processEvent(event);

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create audit log entry
    const auditLog = {
      timestamp: new Date(),
      event: `event_${event.type}_processed`,
      userId: event.userId,
      details: {
        eventId,
        eventType: event.type,
        messageId: event.messageId,
        rulesTriggeredCount: rulesTriggered.length,
        rulesTriggered: rulesTriggered.map((r) => ({
          ruleId: r.ruleId,
          ruleName: r.ruleName,
          action: r.action,
        })),
        timezone: event.timezone,
        metadata: event.metadata,
      },
    };

    return {
      eventId,
      eventType: event.type,
      userId: event.userId,
      recordedAt: event.timestamp,
      rulesTriggered,
      auditLog,
    };
  }

  /**
   * Get event log for a user
   */
  getUserEventLog(userId: string): BehaviorEvent[] {
    return this.eventLog.filter((e) => e.userId === userId);
  }

  /**
   * Get all events
   */
  getEventLog(): BehaviorEvent[] {
    return this.eventLog;
  }

  /**
   * Clear event log (for testing)
   */
  clearEventLog(): void {
    this.eventLog = [];
  }
}
