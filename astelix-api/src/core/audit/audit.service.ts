import { Injectable } from '@nestjs/common';
import type {
  AuditLog,
  AuditLogType,
  MessageDeliveryAuditLog,
  RuleExecutionAuditLog,
} from './audit-log.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class AuditService {
  private logs: AuditLog[] = [];

  /**
   * Log a message delivery event
   */
  logMessageDelivery(data: {
    senderId: string;
    receiverId: string;
    messageId: string;
    status: 'delivered' | 'pending' | 'delayed';
    senderLocal?: string;
    receiverLocal?: string;
    timezone?: string;
  }): MessageDeliveryAuditLog {
    const log: MessageDeliveryAuditLog = {
      id: `audit_${randomUUID()}`,
      type: 'message_delivery',
      referenceId: data.messageId,
      timestampUtc: new Date(),
      timezone: data.timezone,
      userId: data.receiverId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      messageId: data.messageId,
      status: data.status,
      dualTime: data.senderLocal
        ? {
            senderLocal: data.senderLocal,
            receiverLocal: data.receiverLocal || data.senderLocal,
          }
        : undefined,
    };

    this.logs.push(log as AuditLog);
    return log;
  }

  /**
   * Log a message read event
   */
  logMessageRead(data: {
    senderId: string;
    receiverId: string;
    messageId: string;
    timezone?: string;
  }): AuditLog {
    const log: AuditLog = {
      id: `audit_${randomUUID()}`,
      type: 'message_read',
      referenceId: data.messageId,
      timestampUtc: new Date(),
      timezone: data.timezone,
      userId: data.receiverId,
      metadata: {
        senderId: data.senderId,
        receiverId: data.receiverId,
      },
    };

    this.logs.push(log);
    return log;
  }

  /**
   * Log a message replied event
   */
  logMessageReplied(data: {
    senderId: string;
    receiverId: string;
    messageId: string;
    timezone?: string;
  }): AuditLog {
    const log: AuditLog = {
      id: `audit_${randomUUID()}`,
      type: 'message_replied',
      referenceId: data.messageId,
      timestampUtc: new Date(),
      timezone: data.timezone,
      userId: data.receiverId,
      metadata: {
        senderId: data.senderId,
        receiverId: data.receiverId,
      },
    };

    this.logs.push(log);
    return log;
  }


  /**
   * Log a rule execution
   */
  logRuleExecution(data: {
    ruleId: string;
    ruleName: string;
    eventType: string;
    userId: string;
    action: string;
    delayMs?: number;
    messageId?: string;
    timezone?: string;
  }): RuleExecutionAuditLog {
    const log: RuleExecutionAuditLog = {
      id: `audit_${randomUUID()}`,
      type: 'behavior_rule_executed',
      referenceId: data.messageId || `rule_${data.ruleId}`,
      timestampUtc: new Date(),
      timezone: data.timezone,
      userId: data.userId,
      ruleId: data.ruleId,
      ruleName: data.ruleName,
      action: data.action,
      eventType: data.eventType,
      delayMs: data.delayMs,
    };

    this.logs.push(log as AuditLog);
    return log;
  }

  /**
   * Log any generic audit event
   */
  logEvent(
    type: AuditLogType,
    referenceId: string,
    userId: string,
    timezone?: string,
    metadata?: unknown,
  ): AuditLog {
    const log: AuditLog = {
      id: `audit_${randomUUID()}`,
      type,
      referenceId,
      timestampUtc: new Date(),
      timezone,
      userId,
      metadata: metadata as Record<string, unknown>,
    };

    this.logs.push(log);
    return log;
  }

  /**
   * Get all logs
   */
  getAllLogs(): AuditLog[] {
    return this.logs;
  }

  /**
   * Get logs for a specific user
   */
  getUserLogs(userId: string): AuditLog[] {
    return this.logs.filter((log) => log.userId === userId);
  }

  /**
   * Get logs by type
   */
  getLogsByType(type: AuditLogType): AuditLog[] {
    return this.logs.filter((log) => log.type === type);
  }

  /**
   * Get logs for a specific message
   */
  getMessageLogs(messageId: string): AuditLog[] {
    return this.logs.filter((log) => log.referenceId === messageId);
  }

  /**
   * Clear all logs (for testing)
   */
  clearLogs(): void {
    this.logs = [];
  }
}
