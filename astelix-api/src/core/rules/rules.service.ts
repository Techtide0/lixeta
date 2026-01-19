import { Injectable } from '@nestjs/common';
import type { AstelixAction } from './interfaces/astelix-action.interface';
import { DateTime } from 'luxon';
import { randomUUID } from 'crypto';

@Injectable()
export class RulesService {
  private actions: AstelixAction[] = [];

  evaluate(event: {
    userId: string;
    eventType: string;
    timezone: string;
    occurredAt: Date;
    metadata?: any;
  }): AstelixAction[] {
    const results: AstelixAction[] = [];

    // Example 1: Welcome popup on login
    if (event.eventType === 'user_login') {
      results.push(
        this.createAction(
          event.userId,
          'show_popup',
          {
            message: 'Welcome! Let us know if you need help.',
          },
          event,
        ),
      );
    }

    // Example 2: Message sent → prepare delivery decision
    if (event.eventType === 'message_sent') {
      results.push(
        this.createAction(
          event.userId,
          'deliver_message',
          event.metadata,
          event,
        ),
      );
    }

    this.actions.push(...results);
    return results;
  }

  private createAction(
    userId: string,
    actionType: AstelixAction['actionType'],
    payload: Record<string, any> | undefined,
    event: any,
  ): AstelixAction {
    const scheduledAt = DateTime.fromJSDate(event.occurredAt)
      .toUTC()
      .toJSDate();

    return {
      id: randomUUID(),
      userId,
      actionType,
      payload,
      scheduledAt,
      status: 'pending',
      triggeredByEventType: event.eventType,
      createdAt: new Date(),
    };
  }

  getActionsForUser(userId: string): AstelixAction[] {
    return this.actions.filter((a) => a.userId === userId);
  }
}
