// src/behaviors/behavior.engine.ts

import {
  BehaviorContext,
  BehaviorResult,
  BehaviorAction,
} from './behavior.types';
import { behaviorRules } from './behavior.rules';

export class BehaviorEngine {
  /**
   * Evaluate all rules for a given user context
   */
  static evaluate(context: BehaviorContext): BehaviorResult {
    const actions: BehaviorAction[] = [];

    for (const rule of behaviorRules) {
      try {
        const result = rule(context);
        if (result) {
          actions.push(result);
        }
      } catch (err) {
        // Fail-safe: log and continue
        console.error('Behavior rule error:', err);
      }
    }

    return {
      userId: context.userId,
      evaluatedAt: context.now,
      actions,
    };
  }
}
