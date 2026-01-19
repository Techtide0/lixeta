import { Injectable } from '@nestjs/common';
import { RulesService } from '../rules/rules.service';
import type { AstelixAction } from '../rules/interfaces/astelix-action.interface';
import { SignalsService, UserActivity } from '../signals/signals.service';

export interface GetActionsResponse {
  userId: string;
  actionsCount: number;
  actions: AstelixAction[];
  userActivity?: UserActivity | null;
}

@Injectable()
export class DecisionsService {
  private executedActions = new Map<string, Set<string>>();

  constructor(
    private readonly rulesService: RulesService,
    private readonly signalsService: SignalsService,
  ) {}

  getActionsForUser(userId: string): GetActionsResponse {
    // Get user activity data
    const userActivity = this.signalsService.getUser(userId);

    // Get actions for this user from rules service
    const actions = this.rulesService.getActionsForUser(userId);

    return {
      userId,
      actionsCount: actions.length,
      actions,
      userActivity,
    };
  }

  getPendingActions(userId: string): AstelixAction[] {
    const allActions = this.rulesService.getActionsForUser(userId);
    const executedIds = this.executedActions.get(userId) || new Set();
    
    return allActions.filter((action) => !executedIds.has(action.id));
  }

  markAsExecuted(actionId: string): void {
    // Track executed actions across all users
    for (const [userId, executedIds] of this.executedActions.entries()) {
      if (executedIds.has(actionId)) {
        return;
      }
    }

    // If not found, add it to a default tracking (optional, depending on your needs)
    if (!this.executedActions.has('default')) {
      this.executedActions.set('default', new Set());
    }
    this.executedActions.get('default')?.add(actionId);
  }
}
