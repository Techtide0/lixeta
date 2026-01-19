import { BehaviorAction, ActionType } from '../rules/behavior.types';

export type ExecutedAction = {
  id: string;
  actionType: ActionType;
  status: 'executed' | 'delayed' | 'scheduled';
  executedAt: Date;
  payload?: unknown;
};

export class ActionExecutor {
  static execute(action: BehaviorAction): ExecutedAction {
    switch (action.type) {
      case ActionType.DELAY_DELIVERY:
        return {
          id: crypto.randomUUID(),
          actionType: action.type,
          status: 'delayed',
          executedAt: new Date(),
        };

      case ActionType.TRIGGER_REMINDER:
      case ActionType.SHOW_POPUP:
      case ActionType.NOTIFY_SENDER:
        return {
          id: crypto.randomUUID(),
          actionType: action.type,
          status: 'executed',
          executedAt: new Date(),
          payload: action.payload,
        };

      default:
        throw new Error('Unknown action type');
    }
  }
}
