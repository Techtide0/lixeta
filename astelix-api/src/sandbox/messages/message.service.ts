import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SandboxMessageEntity } from './message.entity';
import { SandboxUserService } from '../users/sandbox-user.service';
import { MessageStateService } from './message-state.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ScheduleMessageDto } from './dto/schedule-message.dto';
import { ActiveHoursService } from '../users/active-hours.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(SandboxMessageEntity)
    private readonly repo: Repository<SandboxMessageEntity>,
    private readonly userService: SandboxUserService,
    private readonly stateService: MessageStateService,
    private readonly activeHoursService: ActiveHoursService,
  ) {}

  async sendNow(dto: SendMessageDto) {
    const sender = await this.userService.findByExternalId(dto.senderId);
    const receiver = await this.userService.findByExternalId(dto.receiverId);

    if (!sender || !receiver) {
      throw new BadRequestException('Invalid sender or receiver');
    }

    const nowUtc = new Date();
    const senderLocal = nowUtc.toLocaleString('en-US', {
      timeZone: sender.timezone,
    });
    const receiverLocal = nowUtc.toLocaleString('en-US', {
      timeZone: receiver.timezone,
    });

    // Check if receiver is within active hours
    const activeHours = await this.activeHoursService.getActiveHours(
      dto.receiverId,
    );
    const receiverLocalHour = parseInt(
      receiverLocal.split(',')[0].split('/')[2],
      10,
    );
    const canDeliver = activeHours
      ? this.activeHoursService.canDeliverNow(receiverLocalHour, activeHours)
      : true;

    let status: 'pending' | 'delivered' | 'delayed' = 'delivered';
    let scheduledForUtc: string | undefined;

    if (!canDeliver && activeHours) {
      // Calculate next allowed delivery time

      const delayResult = this.activeHoursService.getNextAllowedDeliveryUtc(
        nowUtc,
        receiver.timezone,
        activeHours,
      );
      scheduledForUtc = delayResult.utc.toISOString();
      status = 'delayed';
    }

    const message = this.repo.create({
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      content: dto.content,
      senderTimezone: sender.timezone,
      receiverTimezone: receiver.timezone,
      senderLocalTime: senderLocal,
      receiverLocalTime: receiverLocal,
      utcTime: nowUtc.toISOString(),
      status,
      scheduledForUtc,
    });

    const savedMessage = await this.repo.save(message);
    await this.stateService.createFromMessage(savedMessage);
    return savedMessage;
  }

  async schedule(dto: ScheduleMessageDto) {
    const sender = await this.userService.findByExternalId(dto.senderId);
    const receiver = await this.userService.findByExternalId(dto.receiverId);

    if (!sender || !receiver) {
      throw new BadRequestException('Invalid sender or receiver');
    }

    // Input is sender's local time - convert to UTC using sender's timezone
    const senderLocal = new Date(dto.deliverAtLocalTime);
    const senderLocalFormatted = senderLocal.toLocaleString('en-US', {
      timeZone: sender.timezone,
    });

    const utcTimestamp =
      senderLocal.getTime() +
      this.getTimezoneOffsetMillis(sender.timezone, senderLocal);
    const utcDate = new Date(utcTimestamp);

    // Derive receiver local time from UTC
    const receiverLocalFormatted = utcDate.toLocaleString('en-US', {
      timeZone: receiver.timezone,
    });

    // Check if scheduled time is within receiver's active hours
    const activeHours = await this.activeHoursService.getActiveHours(
      dto.receiverId,
    );
    let finalScheduledUtc = utcDate;
    let status: 'pending' | 'delayed' = 'pending';

    if (activeHours) {
      const receiverLocalHour = parseInt(
        receiverLocalFormatted.split(',')[0].split('/')[2],
        10,
      );
      const canDeliver = this.activeHoursService.canDeliverNow(
        receiverLocalHour,
        activeHours,
      );

      if (!canDeliver) {
        // Shift to next allowed window

        const delayResult = this.activeHoursService.getNextAllowedDeliveryUtc(
          utcDate,
          receiver.timezone,
          activeHours,
        );
        finalScheduledUtc = delayResult.utc;
        status = 'delayed';
      }
    }

    const message = this.repo.create({
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      content: dto.content,
      senderTimezone: sender.timezone,
      receiverTimezone: receiver.timezone,
      senderLocalTime: senderLocalFormatted,
      receiverLocalTime: receiverLocalFormatted,
      utcTime: utcDate.toISOString(),
      scheduledForUtc: finalScheduledUtc.toISOString(),
      status,
    });

    const savedMessage = await this.repo.save(message);
    await this.stateService.createFromMessage(savedMessage);
    return savedMessage;
  }

  async getMessagesByReceiver(receiverId: string) {
    return this.repo.find({
      where: { receiverId },
      order: { createdAt: 'DESC' },
    });
  }

  async getMessagesBySender(senderId: string) {
    return this.repo.find({
      where: { senderId },
      order: { createdAt: 'DESC' },
    });
  }

  async getMessageById(messageId: string) {
    return this.repo.findOne({
      where: { id: messageId },
    });
  }

  private getTimezoneOffsetMillis(timezone: string, date: Date): number {
    const local = new Date(
      date.toLocaleString('en-US', { timeZone: timezone }),
    );
    return date.getTime() - local.getTime();
  }
}
