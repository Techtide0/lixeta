/**
 * SCENARIO 1: Dual-Time Message
 *
 * 🎯 What This Proves
 * - Time-zone intelligence
 * - Dual-time metadata
 * - Audit clarity
 *
 * 💬 Voiceover:
 * "ASTELIX understands your users across every timezone, automatically."
 */

export interface DualTimeResponse {
  scenario: 'dual_time_message';
  sender: {
    id: string;
    timezone: string;
    localTime: string;
  };
  receiver: {
    id: string;
    timezone: string;
    localTime: string;
  };
  utcTime: string;
  status: 'delivered' | 'delayed';
}

export const dualTimeScenario = (): DualTimeResponse => {
  return {
    scenario: 'dual_time_message',
    sender: {
      id: 'user_ng',
      timezone: 'Africa/Lagos',
      localTime: '9:15 AM',
    },
    receiver: {
      id: 'user_us',
      timezone: 'America/New_York',
      localTime: '3:15 AM',
    },
    utcTime: '2026-01-16T08:15:00Z',
    status: 'delivered',
  };
};
