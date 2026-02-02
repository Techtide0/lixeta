import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SandboxMessageEntity } from './message.entity';
import { SandboxUserService } from '../users/sandbox-user.service';
import { MessageStateService } from './message-state.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ScheduleMessageDto } from './dto/schedule-message.dto';
import { ActiveHoursService } from '../users/active-hours.service';
import { AuditService } from '../../core/audit/audit.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(SandboxMessageEntity)
    private readonly repo: Repository<SandboxMessageEntity>,
    private readonly userService: SandboxUserService,
    private readonly stateService: MessageStateService,
    private readonly activeHoursService: ActiveHoursService,
    private readonly auditService: AuditService,
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
    let decisionReason: string | undefined;

    if (!canDeliver && activeHours) {
      // Calculate next allowed delivery time

      const delayResult = this.activeHoursService.getNextAllowedDeliveryUtc(
        nowUtc,
        receiver.timezone,
        activeHours,
      );
      scheduledForUtc = delayResult.utc.toISOString();
      status = 'delayed';
      decisionReason = 'Outside receiver active hours';
    }

    const message = this.repo.create({
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      content: dto.content,
      senderTimezone: sender.timezone,
      receiverTimezone: receiver.timezone,
      senderLocalTime: this.formatWithTimezoneOffset(nowUtc, sender.timezone),
      receiverLocalTime: this.formatWithTimezoneOffset(nowUtc, receiver.timezone),
      utcTime: nowUtc.toISOString(),
      status,
      scheduledForUtc,
      decisionReason,
    });

    const savedMessage = await this.repo.save(message);
    await this.stateService.createFromMessage(savedMessage);
    
    // ✅ Write audit event
    this.auditService.logMessageDelivery({
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      messageId: `msg_${savedMessage.id}`,
      status: savedMessage.status,
      timezone: receiver.timezone,
    });
    console.log('[AUDIT] message_created:', savedMessage.id, 'status:', savedMessage.status);
    
    return this.formatMessageResponse(savedMessage);
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
    let decisionReason: string | undefined;

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
        decisionReason = 'Outside receiver active hours';
      }
    }

    const message = this.repo.create({
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      content: dto.content,
      senderTimezone: sender.timezone,
      receiverTimezone: receiver.timezone,
      senderLocalTime: this.formatWithTimezoneOffset(utcDate, sender.timezone),
      receiverLocalTime: this.formatWithTimezoneOffset(utcDate, receiver.timezone),
      utcTime: utcDate.toISOString(),
      scheduledForUtc: finalScheduledUtc.toISOString(),
      status,
      decisionReason,
    });

    const savedMessage = await this.repo.save(message);
    await this.stateService.createFromMessage(savedMessage);
    
    // ✅ Write audit event
    this.auditService.logMessageDelivery({
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      messageId: `msg_${savedMessage.id}`,
      status: savedMessage.status,
      timezone: receiver.timezone,
    });
    console.log('[AUDIT] message_scheduled:', savedMessage.id, 'status:', savedMessage.status);
    
    return this.formatMessageResponse(savedMessage);
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

  private formatWithTimezoneOffset(date: Date, timezone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const dateObj = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        dateObj[part.type] = part.value;
      }
    }

    const offset = this.getTimezoneOffsetString(timezone, date);
    return `${dateObj['year']}-${dateObj['month']}-${dateObj['day']}T${dateObj['hour']}:${dateObj['minute']}:${dateObj['second']}${offset}`;
  }

  private getTimezoneOffsetString(timezone: string, date: Date): string {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const offsetMs = tzDate.getTime() - utcDate.getTime();
    const offsetMinutes = Math.abs(offsetMs / 60000);
    const hours = Math.floor(offsetMinutes / 60);
    const minutes = offsetMinutes % 60;
    const sign = offsetMs >= 0 ? '+' : '-';
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private formatMessageResponse(message: SandboxMessageEntity) {
    return {
      messageId: `msg_${message.id}`,
      sandbox: true,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      senderTimezone: message.senderTimezone,
      receiverTimezone: message.receiverTimezone,
      senderLocalTime: message.senderLocalTime,
      receiverLocalTime: message.receiverLocalTime,
      utcTime: message.utcTime,
      status: message.status,
      decisionReason: message.decisionReason,
      scheduledForUtc: message.scheduledForUtc,
      createdAt: message.createdAt,
    };
  }}