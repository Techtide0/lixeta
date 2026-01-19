import { Injectable } from '@nestjs/common';
import type {
  BehaviorEvent,
  BehaviorRuleDefinition,
  RuleExecutionResult,
  EventType,
} from './behavior-rule.types';

@Injectable()
export class BehaviorRulesEngine {
  private rules: Map<string, BehaviorRuleDefinition> = new Map();
  private executedRules: Set<string> = new Set();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default behavior rules
   */
  private initializeDefaultRules(): void {
    // Auto-reminder rule: Send reminder if message unread after 3 hours
    this.registerRule({
      id: 'rule_auto_reminder',
      name: 'autoReminder',
      trigger: 'message_sent',
      condition: (event) => !event.state?.readAfterXHours,
      action: () => 'send_reminder',
      delayMs: 3 * 60 * 60 * 1000, // 3 hours
      priority: 10,
    });

    // Welcome popup: Show on user login
    this.registerRule({
      id: 'rule_welcome_popup',
      name: 'welcomePopup',
      trigger: 'user_login',
      condition: (event) =>
        !event.state?.isNewUser || event.state?.isNewUser === true,
      action: () => 'welcome_prompt',
      priority: 20,
    });

    // Scroll hint: Show hint on scroll if product not clicked
    this.registerRule({
      id: 'rule_scroll_hint',
      name: 'scrollHint',
      trigger: 'user_scroll',
      condition: (event) => !event.state?.clickedProduct,
      action: () => 'show_popup',
      priority: 5,
    });

    // Message delivered nudge: Nudge receiver to read
    this.registerRule({
      id: 'rule_delivery_nudge',
      name: 'deliveryNudge',
      trigger: 'message_delivered',
      condition: () => true,
      action: () => 'nudge_receiver',
      delayMs: 30 * 1000, // 30 seconds
      priority: 15,
    });

    // Message read follow-up: Auto-followup after read
    this.registerRule({
      id: 'rule_followup_read',
      name: 'followupOnRead',
      trigger: 'message_read',
      condition: (event) => event.metadata?.hasFollowUp === true,
      action: () => 'auto_followup',
      delayMs: 5 * 60 * 1000, // 5 minutes
      priority: 8,
    });
  }

  /**
   * Register a custom behavior rule
   */
  registerRule(rule: BehaviorRuleDefinition): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Get all rules matching a specific trigger
   */
  getRulesByTrigger(trigger: EventType): BehaviorRuleDefinition[] {
    return Array.from(this.rules.values())
      .filter((rule) => rule.trigger === trigger)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Process an event and execute applicable rules
   */
  processEvent(event: BehaviorEvent): RuleExecutionResult[] {
    const results: RuleExecutionResult[] = [];
    const applicableRules = this.getRulesByTrigger(event.type);

    for (const rule of applicableRules) {
      try {
        // Check if rule condition is met
        if (rule.condition(event, event.state)) {
          const action = rule.action(event);
          const ruleKey = `${rule.id}_${event.userId}_${event.timestamp.getTime()}`;

          // Prevent duplicate executions
          if (!this.executedRules.has(ruleKey)) {
            this.executedRules.add(ruleKey);

            results.push({
              ruleId: rule.id,
              ruleName: rule.name,
              eventType: event.type,
              userId: event.userId,
              triggeredAt: new Date(),
              action,
              payload: {
                messageId: event.messageId,
                delay: rule.delayMs || 0,
                timezone: event.timezone,
                metadata: event.metadata,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error processing rule ${rule.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Get all registered rules
   */
  getAllRules(): BehaviorRuleDefinition[] {
    return Array.from(this.rules.values());
  }

  /**
   * Clear execution history (for testing/reset)
   */
  clearExecutionHistory(): void {
    this.executedRules.clear();
  }
}
