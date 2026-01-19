/**
 * SCENARIO 3: Fintech Login Popups
 *
 * 🎯 What This Proves
 * - Works beyond chat/messaging
 * - App + website intelligence
 * - Same engine, different surface
 * - Cross-channel consistency
 *
 * 💬 Voiceover:
 * "ASTELIX is agnostic. Same rules, any surface."
 */

export interface PopupAction {
  type: string;
  message: string;
  executedAt: string;
}

export interface FintechLoginResponse {
  scenario: 'fintech_login';
  actions: PopupAction[];
}

export const fintechLoginScenario = (): FintechLoginResponse => {
  return {
    scenario: 'fintech_login',
    actions: [
      {
        type: 'popup',
        message: 'Welcome! Let us know if you need help.',
        executedAt: 'T+0s',
      },
      {
        type: 'popup',
        message: 'Need help completing a transaction?',
        executedAt: 'T+5s',
      },
    ],
  };
};
