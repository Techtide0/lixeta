import { Injectable } from '@nestjs/common';
import { MessageStateService } from './message-state.service';
import { RuleAction, RuleEvaluationResult, RuleLog } from './message-events';
import { SandboxMessageEntity } from './message.entity';
import { MessageStateEntity } from './message-state.entity';
import { SandboxUserService } from '../users/sandbox-user.service';
import { ActiveHoursService } from '../users/active-hours.service';

@Injectable()
export class RuleEvaluator {
  private readonly UNREAD_NUDGE_MINUTES = 5;
  private readonly NO_REPLY_REMINDER_MINUTES = 10;
  private readonly AUTO_FOLLOWUP_MINUTES = 15;

  constructor(
    private readonly stateService: MessageStateService,
    private readonly userService: SandboxUserService,
    private readonly activeHoursService: ActiveHoursService,
  ) {}

  async evaluateRules(
    message: SandboxMessageEntity,
    evaluateAtUtc: Date,
  ): Promise<RuleEvaluationResult> {
    const state = await this.stateService.getByMessageId(message.id);
    if (!state) {
      return {
        messageId: message.id,
        evaluatedAtUtc: evaluateAtUtc.toISOString(),
        actions: [],
        logs: [],
      };
    }

    const actions: RuleAction[] = [];
    const logs: RuleLog[] = [];
    const nowUtc = evaluateAtUtc;

    // R2: Unread Nudge
    const unreadNudgeLog = this.checkUnreadNudge(state, message.id, nowUtc);
    logs.push(unreadNudgeLog);
    if (unreadNudgeLog.triggered) {
      const sender = await this.userService.findByExternalId(message.senderId);
      const receiver = await this.userService.findByExternalId(
        message.receiverId,
      );
      if (sender && receiver) {
        // Check if receiver is within active hours for nudge delivery
        const receiverActiveHours =
          await this.activeHoursService.getActiveHours(message.receiverId);
        const canDeliver = receiverActiveHours
          ? this.canDeliverActionNow(
              nowUtc,
              receiver.timezone,
              receiverActiveHours,
            )
          : true;

        if (canDeliver) {
          const action = this.createAction(
            'receiver_nudge',
            message,
            sender.timezone,
            receiver.timezone,
            nowUtc,
          );
          actions.push(action);
          await this.stateService.markUnreadNudgeSent(message.id);
        } else {
          logs.push({
            rule: 'unread_nudge_delayed',
            messageId: message.id,
            triggered: false,
            reason: `Nudge action delayed: receiver outside active hours`,
            utcTime: nowUtc.toISOString(),
          });
        }
      }
    }

    // R1: No Reply Reminder
    const reminderLog = this.checkNoReplyReminder(state, message.id, nowUtc);
    logs.push(reminderLog);
    if (reminderLog.triggered) {
      const sender = await this.userService.findByExternalId(message.senderId);
      const receiver = await this.userService.findByExternalId(
        message.receiverId,
      );
      if (sender && receiver) {
        // Check if sender is within active hours for reminder delivery
        const senderActiveHours = await this.activeHoursService.getActiveHours(
          message.senderId,
        );
        const canDeliver = senderActiveHours
          ? this.canDeliverActionNow(nowUtc, sender.timezone, senderActiveHours)
          : true;

        if (canDeliver) {
          const action = this.createAction(
            'sender_reminder',
            message,
            sender.timezone,
            receiver.timezone,
            nowUtc,
          );
          actions.push(action);
          await this.stateService.markReminderSent(message.id);
        } else {
          logs.push({
            rule: 'no_reply_reminder_delayed',
            messageId: message.id,
            triggered: false,
            reason: `Reminder action delayed: sender outside active hours`,
            utcTime: nowUtc.toISOString(),
          });
        }
      }
    }

    // R3: Auto Follow-Up
    const followUpLog = this.checkAutoFollowUp(state, message.id, nowUtc);
    logs.push(followUpLog);
    if (followUpLog.triggered) {
      const sender = await this.userService.findByExternalId(message.senderId);
      const receiver = await this.userService.findByExternalId(
        message.receiverId,
      );
      if (sender && receiver) {
        // Check if sender is within active hours for follow-up delivery
        const senderActiveHours = await this.activeHoursService.getActiveHours(
          message.senderId,
        );
        const canDeliver = senderActiveHours
          ? this.canDeliverActionNow(nowUtc, sender.timezone, senderActiveHours)
          : true;

        if (canDeliver) {
          const action = this.createAction(
            'auto_followup',
            message,
            sender.timezone,
            receiver.timezone,
            nowUtc,
          );
          actions.push(action);
          await this.stateService.markFollowUpSent(message.id);
        } else {
          logs.push({
            rule: 'auto_followup_delayed',
            messageId: message.id,
            triggered: false,
            reason: `Follow-up action delayed: sender outside active hours`,
            utcTime: nowUtc.toISOString(),
          });
        }
      }
    }

    return {
      messageId: message.id,
      evaluatedAtUtc: nowUtc.toISOString(),
      actions,
      logs,
    };
  }

  private checkUnreadNudge(
    state: MessageStateEntity,
    messageId: string,
    nowUtc: Date,
  ): RuleLog {
    const triggered =
      state.deliveredAtUtc !== null &&
      state.readAtUtc === null &&
      state.unreadNudgeSent === false &&
      this.hasElapsedMinutes(
        state.deliveredAtUtc,
        nowUtc,
        this.UNREAD_NUDGE_MINUTES,
      );

    return {
      rule: 'unread_nudge',
      messageId,
      triggered,
      reason: triggered
        ? `Message unread for ${this.UNREAD_NUDGE_MINUTES} minutes`
        : `Conditions not met: delivered=${!!state.deliveredAtUtc}, unread=${!state.readAtUtc}, not_yet_nudged=${!state.unreadNudgeSent}`,
      utcTime: nowUtc.toISOString(),
    };
  }

  private checkNoReplyReminder(
    state: MessageStateEntity,
    messageId: string,
    nowUtc: Date,
  ): RuleLog {
    const triggered =
      state.deliveredAtUtc !== null &&
      state.repliedAtUtc === null &&
      state.reminderSent === false &&
      this.hasElapsedMinutes(
        state.deliveredAtUtc,
        nowUtc,
        this.NO_REPLY_REMINDER_MINUTES,
      );

    return {
      rule: 'no_reply_reminder',
      messageId,
      triggered,
      reason: triggered
        ? `Message not replied to for ${this.NO_REPLY_REMINDER_MINUTES} minutes`
        : `Conditions not met: delivered=${!!state.deliveredAtUtc}, no_reply=${!state.repliedAtUtc}, reminder_not_sent=${!state.reminderSent}`,
      utcTime: nowUtc.toISOString(),
    };
  }

  private checkAutoFollowUp(
    state: MessageStateEntity,
    messageId: string,
    nowUtc: Date,
  ): RuleLog {
    const triggered =
      state.deliveredAtUtc !== null &&
      state.repliedAtUtc === null &&
      state.followUpSent === false &&
      this.hasElapsedMinutes(
        state.deliveredAtUtc,
        nowUtc,
        this.AUTO_FOLLOWUP_MINUTES,
      );

    return {
      rule: 'auto_followup',
      messageId,
      triggered,
      reason: triggered
        ? `No reply for ${this.AUTO_FOLLOWUP_MINUTES} minutes, sending follow-up`
        : `Conditions not met: delivered=${!!state.deliveredAtUtc}, no_reply=${!state.repliedAtUtc}, followup_not_sent=${!state.followUpSent}`,
      utcTime: nowUtc.toISOString(),
    };
  }

  private hasElapsedMinutes(
    startUtcString: string,
    endUtc: Date,
    minutes: number,
  ): boolean {
    const startUtc = new Date(startUtcString);
    const elapsedMs = endUtc.getTime() - startUtc.getTime();
    const elapsedMinutes = elapsedMs / (1000 * 60);
    return elapsedMinutes >= minutes;
  }

  private canDeliverActionNow(
    nowUtc: Date,
    timezone: string,
    activeHours: { startHour: number; endHour: number },
  ): boolean {
    const localStr = nowUtc.toLocaleString('en-US', { timeZone: timezone });
    const localDate = new Date(localStr);
    const localHour = localDate.getHours();
    return this.activeHoursService.canDeliverNow(localHour, activeHours);
  }

  private createAction(
    actionType: 'sender_reminder' | 'receiver_nudge' | 'auto_followup',
    message: SandboxMessageEntity,
    senderTimezone: string,
    receiverTimezone: string,
    utcTime: Date,
  ): RuleAction {
    const senderLocalTime = utcTime.toLocaleString('en-US', {
      timeZone: senderTimezone,
    });
    const receiverLocalTime = utcTime.toLocaleString('en-US', {
      timeZone: receiverTimezone,
    });

    const descriptions = {
      sender_reminder: `Reminder: No reply to message "${message.content}"`,
      receiver_nudge: `Nudge: You have an unread message "${message.content}"`,
      auto_followup: `Follow-up: Original message was "${message.content}"`,
    };

    return {
      action: actionType,
      messageId: message.id,
      utcTime: utcTime.toISOString(),
      senderLocalTime,
      receiverLocalTime,
      senderTimezone,
      receiverTimezone,
      description: descriptions[actionType],
    };
  }
}
