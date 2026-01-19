/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Param } from '@nestjs/common';
import { SignalsService } from '../core/signals/signals.service';
import { DateTime } from 'luxon';

@Controller('users')
export class UsersController {
  constructor(private readonly signalsService: SignalsService) {}

  @Get(':id/activity')
  getUserActivity(@Param('id') userId: string) {
    const user = this.signalsService.getUser(userId);
    if (!user) {
      return { message: 'User not found', userId };
    }

    const lastActiveLocal = DateTime.fromJSDate(user.lastActiveAt)
      .setZone(user.timezone)
      .toISO();

    const activityHistoryLocal = user.activityHistory.map((dt) => {
      return DateTime.fromJSDate(dt).setZone(user.timezone).toISO() as string;
    });

    return {
      userId: user.userId,
      lastActiveAt: lastActiveLocal,
      activityHistory: activityHistoryLocal,
      timezone: user.timezone,
    };
  }
}
