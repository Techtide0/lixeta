import { SignalType } from '../signals/signal.types';

export type DecisionType =
  | 'deliver_message'
  | 'show_popup'
  | 'send_reminder'
  | 'nudge_receiver'
  | 'auto_followup';

export interface Decision {
  id: string;
  userId: string;
  decisionType: DecisionType;
  payload: any;
  scheduledAt: Date;
  status: 'pending' | 'executed' | 'delayed';
  triggeredBySignal: SignalType;
}
