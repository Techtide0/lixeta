import { ExecutedAction } from './action.executor';

export class DeliverySimulator {
  static simulate(action: ExecutedAction) {
    return {
      deliveryId: action.id,
      status: action.status,
      deliveredAt: action.status === 'executed' ? new Date() : null,
      payload: action.payload ?? null,
    };
  }
}
