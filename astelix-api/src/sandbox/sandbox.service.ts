import { Injectable } from '@nestjs/common';
import { MessageDeliveryService } from '../core/signals/message-delivery.service';
import { BehaviorRulesEngine } from '../core/rules/behavior-rules.engine';
import { EventProcessor } from '../core/rules/event-processor';
import { AuditService } from '../core/audit/audit.service';
import { DecisionsService } from '../core/decisions/decisions.service';
import { OrchestratorService } from '../core/orchestrator/orchestrator.service';
import { SignalsService } from '../core/signals/signals.service';
import type { Signal } from '../core/signals/signal.types';
import type { UserActivity, EventRecordResponse } from '../core/signals/signals.service';
import type { UserActivityState, DualTimeMetadata, MessageDeliveryResult } from '../core/signals/message-delivery.types';

export interface SandboxDecision {
  id: string;
  userId: string;
  type: string;
  channel: string;
  reason: string;
  confidence: number;
  createdAt: Date;
  executedAt?: Date;
  status: 'pending' | 'executed' | 'failed';
  metadata?: Record<string, unknown>;
}

export interface SignalCatalogItem {
  type: string;
  description: string;
  eventTypes: string[];
  demoActions: Array<{
    type: string;
    reason: string;
    channel?: string;
  }>;
}

@Injectable()
export class SandboxService {
  private decisions: SandboxDecision[] = [];

  private readonly signalCatalog: SignalCatalogItem[] = [
    {
      type: 'user_login',
      description: 'User authentication/login event',
      eventTypes: ['USER_LOGIN'],
      demoActions: [
        {
          type: 'send_message',
          reason: 'User login detected',
          channel: 'sandbox',
        },
        {
          type: 'notify',
          reason: "Signal 'login' recorded",
        },
      ],
    },
    {
      type: 'user_click',
      description: 'User interaction/click event',
      eventTypes: ['USER_CLICK'],
      demoActions: [
        {
          type: 'send_message',
          reason: 'User clicked a key element',
          channel: 'sandbox',
        },
      ],
    },
    {
      type: 'scroll',
      description: 'Page scroll activity',
      eventTypes: [],
      demoActions: [],
    },
    {
      type: 'message_sent',
      description: 'Outgoing message created',
      eventTypes: ['MESSAGE_SENT'],
      demoActions: [],
    },
    {
      type: 'message_read',
      description: 'Message marked as read',
      eventTypes: [],
      demoActions: [],
    },
    {
      type: 'message_replied',
      description: 'Message reply sent',
      eventTypes: [],
      demoActions: [],
    },
  ];

  constructor(
    private readonly messageDeliveryService: MessageDeliveryService,
    private readonly behaviorRulesEngine: BehaviorRulesEngine,
    private readonly eventProcessor: EventProcessor,
    private readonly auditService: AuditService,
    private readonly decisionsService: DecisionsService,
    private readonly orchestratorService: OrchestratorService,
    private readonly signalsService: SignalsService,
  ) {}

  getSignalCatalog() {
    return {
      signals: this.signalCatalog,
    };
  }

  recordSignal(data: {
    userId: string;
    type: string;
    metadata?: Record<string, unknown>;
  }): Record<string, unknown> {
    // Record the signal
    const signal = {
      userId: data.userId,
      type: data.type,
      timestamp: new Date(),
      metadata: data.metadata,
    };

    // Demo rule: create decision for login signals
    if (data.type.toLowerCase() === 'login') {
      this.createDecision({
        userId: data.userId,
        type: 'send_message',
        channel: 'sandbox',
        reason: 'User login detected',
        confidence: 0.8,
        metadata: {
          signalType: data.type,
          source: 'signal_handler',
        },
      });
    }

    // Also create generic decision for any signal
    this.createDecision({
      userId: data.userId,
      type: 'notify',
      channel: 'sandbox',
      reason: `Signal "${data.type}" recorded`,
      confidence: 0.75,
      metadata: {
        signalType: data.type,
        source: 'signal_handler',
      },
    });

    return {
      status: 'ok',
      message: 'Signal recorded and decisions created',
      signal,
      decisionsCreated: data.type.toLowerCase() === 'login' ? 2 : 1,
    };
  }

  /**
   * Test Scope 2: Dual-time message delivery
   */
  deliverMessage(data: {
    senderId: string;
    receiverId: string;
    senderTimezone: string;
    receiverTimezone: string;
    messageContent: string;
  }) {
    // Create receiver activity state (mock)
    const receiver = {
      userId: data.receiverId,
      lastActiveAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      timezone: data.receiverTimezone,
    };

    // Determine delivery status
    const result = this.messageDeliveryService.determineDeliveryStatus(
      receiver,
      data.senderTimezone,
      data.messageContent,
    );

    // Log to audit
    this.auditService.logMessageDelivery({
      senderId: data.senderId,
      receiverId: data.receiverId,
      messageId: result.messageId,
      status: result.status,
      senderLocal: result.dualTime.senderLocal,
      receiverLocal: result.dualTime.receiverLocal,
      timezone: data.receiverTimezone,
    });

    return {
      ...result,
      metadata: {
        senderTimezone: data.senderTimezone,
        receiverTimezone: data.receiverTimezone,
      },
    };
  }

  /**
   * Create a decision in the decisions store
   */
  private createDecision(data: {
    userId: string;
    type: string;
    channel: string;
    reason: string;
    confidence?: number;
    metadata?: Record<string, unknown>;
  }): SandboxDecision {
    const decision: SandboxDecision = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      type: data.type,
      channel: data.channel,
      reason: data.reason,
      confidence: data.confidence || 0.8,
      createdAt: new Date(),
      status: 'pending',
      metadata: data.metadata,
    };

    this.decisions.push(decision);
    return decision;
  }

  /**
   * Test Scope 3: Behavior rules processing
   */
  processEvent(eventData: Record<string, unknown>) {
    const event = {
      type: (eventData.type as string) || 'unknown',
      userId: (eventData.userId as string) || '',
      messageId: (eventData.messageId as string | undefined) || undefined,
      timestamp: new Date(
        (eventData.timestamp as string | number | undefined) || Date.now(),
      ),
      timezone: (eventData.timezone as string) || 'UTC',
      metadata: eventData.metadata as Record<string, unknown> | undefined,
      state: eventData.state as Record<string, unknown> | undefined,
    };

    // Process event through behavior rules engine
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const rulesTriggered = this.behaviorRulesEngine.processEvent(event as any);

    // Process through event processor
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const processed = this.eventProcessor.processEvent(event as any);

    // Log each rule trigger to audit and create decisions
    for (const rule of rulesTriggered) {
      const payload = (rule.payload as Record<string, unknown>) || {};
      this.auditService.logRuleExecution({
        ruleId: rule.ruleId,
        ruleName: rule.ruleName,
        eventType: rule.eventType,
        userId: rule.userId,
        action: rule.action,
        delayMs: payload.delay as number | undefined,
        messageId: payload.messageId as string | undefined,
        timezone: payload.timezone as string | undefined,
      });

      // Create decision from rule trigger
      this.createDecision({
        userId: rule.userId,
        type: rule.action,
        channel: 'sandbox',
        reason: `Rule "${rule.ruleName}" triggered by event "${event.type}"`,
        confidence: 0.85,
        metadata: {
          ruleId: rule.ruleId,
          eventType: event.type,
          triggerTime: event.timestamp.toISOString(),
        },
      });
    }

    return {
      eventId: processed.eventId,
      eventType: processed.eventType,
      userId: processed.userId,
      rulesTriggered: rulesTriggered.map((r) => {
        const payload = (r.payload as Record<string, unknown>) || {};
        return {
          ruleId: r.ruleId,
          ruleName: r.ruleName,
          action: r.action,
          payload: payload,
        };
      }),
      auditLog: processed.auditLog,
    };
  }

  getAllRules() {
    const rules = this.behaviorRulesEngine.getAllRules();
    return {
      totalRules: rules.length,
      rules: rules.map((r) => ({
        id: r.id,
        name: r.name,
        trigger: r.trigger,
        priority: r.priority,
        delayMs: r.delayMs,
      })),
    };
  }

  getDecisions(userId: string) {
    // Query actual decisions for this user
    let userDecisions = this.decisions.filter((d) => d.userId === userId);

    // If no decisions exist, seed with sample decisions for demonstration
    if (userDecisions.length === 0) {
      const sampleDecisions: SandboxDecision[] = [
        {
          id: `decision_${Date.now()}_sample1`,
          userId,
          type: 'send_message',
          channel: 'sandbox',
          reason: 'User login detected',
          confidence: 0.85,
          createdAt: new Date(),
          status: 'pending',
        },
        {
          id: `decision_${Date.now()}_sample2`,
          userId,
          type: 'send_notification',
          channel: 'sandbox',
          reason: 'High engagement signal detected',
          confidence: 0.75,
          createdAt: new Date(),
          status: 'pending',
        },
      ];
      userDecisions = sampleDecisions;
    }

    return {
      userId,
      decisions: userDecisions.map((d) => ({
        type: d.type,
        channel: d.channel,
        reason: d.reason,
        confidence: d.confidence,
        createdAt: d.createdAt.toISOString(),
        status: d.status,
      })),
    };
  }

  orchestrate(userId: string) {
    // Get pending decisions for this user
    const userDecisions = this.decisions.filter(
      (d) => d.userId === userId && d.status === 'pending',
    );

    // Execute each decision
    const executed: Record<string, unknown>[] = [];
    for (const decision of userDecisions) {
      // Mark as executed
      decision.status = 'executed';
      decision.executedAt = new Date();

      // Log execution to audit
      this.auditService.logEvent(
        'decision_executed',
        decision.id,
        userId,
        'UTC',
        {
          decisionType: decision.type,
          reason: decision.reason,
          confidence: decision.confidence,
        },
      );

      // Collect execution info
      executed.push({
        decisionId: decision.id,
        type: decision.type,
        reason: decision.reason,
        executedAt: decision.executedAt.toISOString(),
      });
    }

    return {
      userId,
      executed: executed.length,
      actions: executed,
      message: `Executed ${executed.length} decision(s)`,
    };
  }

  getAuditLogs(userId: string) {
    return this.auditService.getUserLogs(userId);
  }

  getAllAuditLogs() {
    return this.auditService.getAllLogs();
  }

  /**
   * STEP 5: Trigger ANY event (not just messages)
   * Unlocks: popups, notifications, banners, nudges, etc.
   */
  triggerEvent(dto: {
    userId: string;
    eventType: string;
    metadata?: Record<string, unknown>;
  }) {
    // Build event object
    const event = {
      type: dto.eventType as
        | 'user_login'
        | 'user_click'
        | 'user_scroll'
        | 'message_sent',
      userId: dto.userId,
      timestamp: new Date(),
      timezone: 'UTC',
      metadata: dto.metadata,
    };

    // Process through behavior rules engine to trigger rules
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const rulesTriggered = this.behaviorRulesEngine.processEvent(event as any);

    // Emit through core event processor
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = this.eventProcessor.processEvent(event as any);

    // Create decisions from triggered rules
    for (const rule of rulesTriggered) {
      this.createDecision({
        userId: dto.userId,
        type: rule.action,
        channel: 'sandbox',
        reason: `Rule "${rule.ruleName}" triggered by event "${dto.eventType}"`,
        confidence: 0.85,
        metadata: {
          ruleId: rule.ruleId,
          eventType: dto.eventType,
          triggerTime: event.timestamp.toISOString(),
        },
      });
    }

    return {
      status: 'ok',
      eventId: result.eventId,
      eventType: result.eventType,
      userId: result.userId,
      rulesTriggered: rulesTriggered.length,
      decisionsCreated: rulesTriggered.length,
      message: `Event triggered, ${rulesTriggered.length} rule(s) triggered, ${rulesTriggered.length} decision(s) created`,
    };
  }

  /**
   * STEP 5: Get all pending actions for a user (All Types)
   * Returns: popups, notifications, messages, nudges, etc.
   */
  getUserActions(userId: string) {
    // Get actions from decisions service
    const actionsResponse = this.decisionsService.getActionsForUser(userId);

    return {
      userId,
      actionCount: actionsResponse.actions.length,
      actions: actionsResponse.actions.map((action) => ({
        actionId: action.id,
        actionType: action.actionType,
        status: action.status,
        payload: action.payload,
        scheduledAt: action.scheduledAt,
        triggeredByEvent: action.triggeredByEventType,
      })),
      message: `${actionsResponse.actions.length} pending actions`,
    };
  }
}
