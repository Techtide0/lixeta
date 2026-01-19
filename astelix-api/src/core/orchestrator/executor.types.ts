export type ExecutedAction = {
  id: string;
  actionType: string;
  payload: Record<string, unknown>;
  executedAt: string;
};

export type ExecutorResponse = {
  userId: string;
  executedCount: number;
  delayedCount: number;
  executedActions: ExecutedAction[];
};
