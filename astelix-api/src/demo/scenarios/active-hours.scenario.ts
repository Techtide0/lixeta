/**
 * SCENARIO 4: Active-Hours Delay (Compliance Signal)
 *
 * 🎯 What This Proves
 * - No disturbance to users
 * - Compliance readiness (banking/fintech)
 * - Safety by default
 * - Respects user boundaries
 *
 * 💬 Voiceover:
 * "ASTELIX protects users and institutions by default."
 */

export interface ActiveHoursDelayResponse {
  scenario: 'active_hours_delay';
  sentAt: string;
  receiverTimezone: string;
  deliveryWindow: string;
  status: 'delayed' | 'scheduled';
  scheduledFor: string;
}

export const activeHoursScenario = (): ActiveHoursDelayResponse => {
  return {
    scenario: 'active_hours_delay',
    sentAt: '11:45 PM',
    receiverTimezone: 'America/New_York',
    deliveryWindow: '8:00 AM – 9:00 PM',
    status: 'delayed',
    scheduledFor: '8:00 AM',
  };
};
