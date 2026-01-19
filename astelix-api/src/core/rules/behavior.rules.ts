// src/behaviors/behavior.rules.ts

import { ActionType, BehaviorAction, BehaviorContext } from './behavior.types';

const MINUTES = 60 * 1000;

/**
 * Rule 1: Welcome message after login + idle
 */
function welcomeAfterLogin(context: BehaviorContext): BehaviorAction | null {
  if (
    context.lastEventType === 'user_login' &&
    context.inactivityMinutes >= 2
  ) {
    return {
      type: ActionType.SHOW_POPUP,
      reason: 'User logged in and became idle',
      payload: {
        message: 'Welcome back! Need help?',
      },
    };
  }

  return null;
}

/**
 * Rule 2: Idle browsing without conversion
 */
function idleBrowsingHelp(context: BehaviorContext): BehaviorAction | null {
  if (
    context.lastEventType === 'user_click' &&
    context.inactivityMinutes >= 3
  ) {
    return {
      type: ActionType.SHOW_POPUP,
      reason: 'User browsing without action',
      payload: {
        message: 'Need help choosing a product?',
      },
    };
  }

  return null;
}

/**
 * Rule 3: Message reminder
 */
function messageReminder(context: BehaviorContext): BehaviorAction | null {
  if (!context.message) return null;

  const hoursSinceSent =
    (context.now.getTime() - context.message.sentAt.getTime()) / (60 * MINUTES);

  if (hoursSinceSent >= 3) {
    return {
      type: ActionType.TRIGGER_REMINDER,
      reason: 'Message unanswered for 3 hours',
    };
  }

  return null;
}

/**
 * Rule 4: Delay delivery outside active hours
 */
function delayOutsideActiveHours(
  context: BehaviorContext,
): BehaviorAction | null {
  if (!context.message) return null;

  const receiverHour = context.now.getHours();

  // Demo-safe active hours
  const ACTIVE_START = 8;
  const ACTIVE_END = 21;

  if (receiverHour < ACTIVE_START || receiverHour > ACTIVE_END) {
    return {
      type: ActionType.DELAY_DELIVERY,
      reason: 'Receiver outside active hours',
    };
  }

  return null;
}

export const behaviorRules = [
  welcomeAfterLogin,
  idleBrowsingHelp,
  messageReminder,
  delayOutsideActiveHours,
];
