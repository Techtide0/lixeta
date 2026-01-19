import { Injectable } from '@nestjs/common';
import type {
  UserActivityState,
  DualTimeMetadata,
  MessageDeliveryResult,
} from './message-delivery.types';

@Injectable()
export class MessageDeliveryService {
  private readonly INACTIVITY_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_ACTIVE_START_HOUR = 8; // 8 AM
  private readonly DEFAULT_ACTIVE_END_HOUR = 21; // 9 PM

  /**
   * Check if user is actively using the app (within last 5 minutes)
   */
  isUserActive(user: UserActivityState): boolean {
    const lastActive = new Date(user.lastActiveAt);
    const now = new Date();
    const inactivityMs = now.getTime() - lastActive.getTime();
    return inactivityMs < this.INACTIVITY_THRESHOLD_MS;
  }

  /**
   * Check if current time in user's timezone is within active hours
   */
  isWithinActiveHours(
    user: UserActivityState,
    startHour: number = this.DEFAULT_ACTIVE_START_HOUR,
    endHour: number = this.DEFAULT_ACTIVE_END_HOUR,
  ): boolean {
    try {
      const now = new Date();
      const tzFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: user.timezone,
        hour: '2-digit',
        hour12: false,
      });

      const tzDateParts = tzFormatter.formatToParts(now);
      const hour = parseInt(
        tzDateParts.find((p) => p.type === 'hour')?.value || '0',
        10,
      );

      return hour >= startHour && hour < endHour;
    } catch (error) {
      // If timezone is invalid, assume user is in active hours
      console.warn(`Invalid timezone: ${user.timezone}`, error);
      return true;
    }
  }

  /**
   * Compute dual-time metadata for message (sender local time + receiver local time)
   */
  getDualTime(
    senderTimezone: string,
    receiverTimezone: string,
    sentAtUTC: Date,
  ): DualTimeMetadata {
    try {
      const timeFormatter = (tz: string) => {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(sentAtUTC);
      };

      return {
        senderLocal: timeFormatter(senderTimezone),
        receiverLocal: timeFormatter(receiverTimezone),
        sentAtUTC: sentAtUTC.toISOString(),
      };
    } catch (error) {
      console.warn('Error computing dual time', error);
      return {
        senderLocal: sentAtUTC.toISOString(),
        receiverLocal: sentAtUTC.toISOString(),
        sentAtUTC: sentAtUTC.toISOString(),
      };
    }
  }

  /**
   * Determine message delivery status based on receiver activity and active hours
   */
  determineDeliveryStatus(
    receiver: UserActivityState,
    senderTimezone: string,
    messageContent: string,
  ): MessageDeliveryResult {
    const messageId = `msg_${Date.now()}`;
    const now = new Date();
    const dualTime = this.getDualTime(senderTimezone, receiver.timezone, now);

    const isActive = this.isUserActive(receiver);
    const withinActiveHours = this.isWithinActiveHours(receiver);

    if (!isActive) {
      return {
        messageId,
        status: 'pending',
        dualTime,
        message: messageContent,
        delayReason: 'Receiver inactive (no activity in last 5 minutes)',
        nextRetryAt: new Date(now.getTime() + 5 * 60 * 1000),
      };
    }

    if (!withinActiveHours) {
      return {
        messageId,
        status: 'delayed',
        dualTime,
        message: messageContent,
        delayReason: 'Outside receiver active hours (8 AM - 9 PM local time)',
        nextRetryAt: this.getNextActiveHourStart(receiver),
      };
    }

    return {
      messageId,
      status: 'delivered',
      dualTime,
      message: messageContent,
    };
  }

  /**
   * Calculate the next start of active hours for a user
   */
  private getNextActiveHourStart(user: UserActivityState): Date {
    const now = new Date();
    const tzFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: user.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
    });

    const parts = tzFormatter.formatToParts(now);
    const hour = parseInt(
      parts.find((p) => p.type === 'hour')?.value || '0',
      10,
    );

    const next = new Date(now);
    next.setHours(this.DEFAULT_ACTIVE_START_HOUR, 0, 0, 0);

    if (hour >= this.DEFAULT_ACTIVE_START_HOUR) {
      // Past active hours for today, schedule for tomorrow
      next.setDate(next.getDate() + 1);
    }

    // Convert local time back to UTC
    return next;
  }
}
