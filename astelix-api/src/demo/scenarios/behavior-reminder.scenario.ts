/**
 * SCENARIO 2: Behavior Rule (Auto-Reminder)
 *
 * 🎯 What This Proves
 * - Behavior intelligence without AI
 * - Rule-based automation
 * - No human follow-up needed
 *
 * 💬 Voiceover:
 * "ASTELIX doesn't wait for humans to remember. It acts."
 */

export interface BehaviorReminderResponse {
  scenario: 'auto_reminder';
  rule: string;
  action: string;
  triggeredAt: string;
  status: 'executed' | 'scheduled' | 'delayed';
}

export const behaviorReminderScenario = (): BehaviorReminderResponse => {
  return {
    scenario: 'auto_reminder',
    rule: 'no_reply_after_x_minutes',
    action: 'send_reminder',
    triggeredAt: '2026-01-16T08:45:00Z',
    status: 'executed',
  };
};
