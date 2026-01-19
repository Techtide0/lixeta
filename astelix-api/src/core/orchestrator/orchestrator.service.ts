import { Injectable } from '@nestjs/common';
import { DecisionsService } from '../decisions/decisions.service';
import type { ExecutorResponse, ExecutedAction } from './executor.types';

@Injectable()
export class OrchestratorService {
  constructor(private readonly decisionsService: DecisionsService) {}

  executeForUser(userId: string): ExecutorResponse {
    const pendingActions = this.decisionsService.getPendingActions(userId);

    const executedActions: ExecutedAction[] = [];
    let delayedCount = 0;

    for (const action of pendingActions) {
      const now = new Date();

      if (action.scheduledAt && new Date(action.scheduledAt) > now) {
        delayedCount++;
        continue;
      }

      this.decisionsService.markAsExecuted(action.id);

      executedActions.push({
        id: action.id,
        actionType: action.actionType,
        payload: action.payload || {},
        executedAt: now.toISOString(),
      });
    }

    return {
      userId,
      executedCount: executedActions.length,
      delayedCount,
      executedActions,
    };
  }
}
