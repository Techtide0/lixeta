import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveHoursEntity } from './active-hours.entity';

@Injectable()
export class ActiveHoursService implements OnModuleInit {
  constructor(
    @InjectRepository(ActiveHoursEntity)
    private readonly repo: Repository<ActiveHoursEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count > 0) return;

    // Seed default active hours for sandbox users
    await this.repo.save([
      { userId: 'user_ng', startHour: 8, endHour: 21 },
      { userId: 'user_us', startHour: 9, endHour: 18 },
      { userId: 'user_sa', startHour: 8, endHour: 20 },
    ]);
  }

  async getActiveHours(
    userId: string,
  ): Promise<{ startHour: number; endHour: number } | null> {
    const hours = await this.repo.findOne({ where: { userId } });
    return hours
      ? { startHour: hours.startHour, endHour: hours.endHour }
      : null;
  }

  canDeliverNow(
    localHour: number,
    activeHours: { startHour: number; endHour: number },
  ): boolean {
    return (
      localHour >= activeHours.startHour && localHour < activeHours.endHour
    );
  }

  getNextAllowedDeliveryUtc(
    nowUtc: Date,
    timezone: string,
    activeHours: { startHour: number; endHour: number },
  ): { utc: Date; localTime: string; isDelayed: boolean } {
    const localStr = nowUtc.toLocaleString('en-US', { timeZone: timezone });
    const localDate = new Date(localStr);
    const localHour = localDate.getHours();

    // Check if current time is within active hours
    if (localHour >= activeHours.startHour && localHour < activeHours.endHour) {
      return {
        utc: nowUtc,
        localTime: localStr,
        isDelayed: false,
      };
    }

    // Calculate next allowed delivery time
    const nextLocalDate = new Date(localDate);

    if (localHour < activeHours.startHour) {
      // Before work hours today
      nextLocalDate.setHours(activeHours.startHour, 0, 0, 0);
    } else {
      // After work hours today -> next day
      nextLocalDate.setDate(nextLocalDate.getDate() + 1);
      nextLocalDate.setHours(activeHours.startHour, 0, 0, 0);
    }

    // Convert back to UTC
    const nextLocalStr = nextLocalDate.toLocaleString('en-US', {
      timeZone: timezone,
    });
    const nextLocalParsed = new Date(nextLocalStr);

    // Calculate UTC offset and convert
    const offsetMs = nextLocalDate.getTime() - nextLocalParsed.getTime();
    const utcTime = new Date(nextLocalDate.getTime() + offsetMs);

    return {
      utc: utcTime,
      localTime: nextLocalDate.toLocaleString('en-US', { timeZone: timezone }),
      isDelayed: true,
    };
  }
}
