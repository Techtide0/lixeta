import { SignalType } from '../signals/signal.types';
import { DecisionType } from '../decisions/decision.types';

export interface RuleInput {
  signal: any;
  userId: string;
  [key: string]: any;
}

export interface RuleDecision {
  decisionType: DecisionType;
  payload: any;
  delayUntil?: Date;
}

export interface Rule {
  id: string;
  listensTo: SignalType;
  evaluate(input: RuleInput): RuleDecision | null;
}
