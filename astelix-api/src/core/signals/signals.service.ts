import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto.js';
import { RulesService } from '../rules/rules.service.js';
import { MessageDeliveryService } from './message-delivery.service';
import type { AstelixAction } from '../rules/interfaces/astelix-action.interface';

export interface UserActivity {
  userId: string;
  timezone: string;
  lastActiveAt: Date;
  activityHistory: Date[];
}

export interface EventRecordResponse {
  status: string;
  userId: string;
  eventType: string;
  occurredAt: string;
  timezone: string;
  actionsGenerated: AstelixAction[];
}

@Injectable()
export class SignalsService {
  private readonly events: any[] = [];
  private users: Map<string, UserActivity> = new Map();

  constructor(
    private readonly rulesService: RulesService,
    private readonly messageDeliveryService: MessageDeliveryService,
  ) {}

  recordEvent(dto: CreateEventDto): EventRecordResponse {
    const occurredAt = dto.occurredAt
      ? new Date(dto.occurredAt)
      : new Date(); // UTC now

    const occurredAtISO = occurredAt.toISOString();

    // Track user activity
    const existing: UserActivity | undefined = this.users.get(dto.userId);
    if (!existing) {
      const user: UserActivity = {
        userId: dto.userId,
        timezone: dto.timezone,
        lastActiveAt: occurredAt,
        activityHistory: [occurredAt],
      };
      this.users.set(dto.userId, user);
    } else {
      existing.lastActiveAt = occurredAt;
      existing.activityHistory.push(occurredAt);
      existing.timezone = dto.timezone;
    }

    // Trigger rules engine to generate actions
    const actions = this.rulesService.evaluate({
      userId: dto.userId,
      eventType: dto.eventType,
      timezone: dto.timezone,
      occurredAt: occurredAt,
      metadata: undefined,
    });

    const event = {
      userId: dto.userId,
      eventType: dto.eventType,
      occurredAt: occurredAtISO,
      timezone: dto.timezone,
    };

    this.events.push(event);

    return {
      status: 'ok',
      userId: dto.userId,
      eventType: dto.eventType,
      occurredAt: occurredAtISO,
      timezone: dto.timezone,
      actionsGenerated: actions,
    };
  }

  getUser(userId: string): UserActivity | null {
    return this.users.get(userId) ?? null;
  }
}
