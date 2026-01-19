import { Injectable } from '@nestjs/common';
import { MessageDeliveryService } from '../core/signals/message-delivery.service';
import { BehaviorRulesEngine } from '../core/rules/behavior-rules.engine';
import { EventProcessor } from '../core/rules/event-processor';
import { AuditService } from '../core/audit/audit.service';
import { DecisionsService } from '../core/decisions/decisions.service';
import { OrchestratorService } from '../core/orchestrator/orchestrator.service';

@Injectable()
export class SandboxService {
  constructor(
    private readonly messageDeliveryService: MessageDeliveryService,
    private readonly behaviorRulesEngine: BehaviorRulesEngine,
    private readonly eventProcessor: EventProcessor,
    private readonly auditService: AuditService,
    private readonly decisionsService: DecisionsService,
    private readonly orchestratorService: OrchestratorService,
  ) {}

  recordSignal(): Record<string, unknown> {
    // TODO: Implement signal recording
    return { status: 'ok', message: 'Signal recorded' };
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
   * Test Scope 3: Behavior rules processing
   */
  processEvent(eventData: any) {
    const event = {
      type: eventData.type,
      userId: eventData.userId,
      messageId: eventData.messageId,
      timestamp: new Date(eventData.timestamp || Date.now()),
      timezone: eventData.timezone || 'UTC',
      metadata: eventData.metadata,
      state: eventData.state,
    };

    // Process event through behavior rules engine
    const rulesTriggered = this.behaviorRulesEngine.processEvent(event);

    // Process through event processor
    const processed = this.eventProcessor.processEvent(event);

    // Log each rule trigger to audit
    for (const rule of rulesTriggered) {
      this.auditService.logRuleExecution({
        ruleId: rule.ruleId,
        ruleName: rule.ruleName,
        eventType: rule.eventType,
        userId: rule.userId,
        action: rule.action,
        delayMs: rule.payload?.delay,
        messageId: rule.payload?.messageId,
        timezone: rule.payload?.timezone,
      });
    }

    return {
      eventId: processed.eventId,
      eventType: processed.eventType,
      userId: processed.userId,
      rulesTriggered: rulesTriggered.map((r) => ({
        ruleId: r.ruleId,
        ruleName: r.ruleName,
        action: r.action,
        payload: r.payload,
      })),
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
    // TODO: Implement decision retrieval
    return { userId, decisions: [] };
  }

  orchestrate(userId: string) {
    // TODO: Implement orchestration execution
    return { userId, executed: 0 };
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
    // Emit through core event processor
    const result = this.eventProcessor.processEvent({
      type: dto.eventType as
        | 'user_login'
        | 'user_click'
        | 'user_scroll'
        | 'message_sent',
      userId: dto.userId,
      timestamp: new Date(),
      timezone: 'UTC', // Will be replaced by actual user timezone
      metadata: dto.metadata,
    });

    return {
      status: 'ok',
      eventId: result.eventId,
      eventType: result.eventType,
      userId: result.userId,
      rulesTriggered: result.rulesTriggered,
      message: 'Event triggered and rules evaluated',
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
