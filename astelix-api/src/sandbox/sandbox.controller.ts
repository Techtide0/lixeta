import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { SandboxUserService } from './users/sandbox-user.service';
import { MessageService } from './messages/message.service';
import { MessageStateService } from './messages/message-state.service';
import { RuleEvaluator } from './messages/rule.evaluator';
import { ActiveHoursService } from './users/active-hours.service';
import { ApiKeyGuard } from './auth/api-key.guard';
import { SendMessageDto } from './messages/dto/send-message.dto';
import { ScheduleMessageDto } from './messages/dto/schedule-message.dto';
import { SandboxEventDto } from './dto/sandbox-event.dto';

@Controller('sandbox')
@UseGuards(ApiKeyGuard)
export class SandboxController {
  constructor(
    private readonly sandboxService: SandboxService,
    private readonly userService: SandboxUserService,
    private readonly messageService: MessageService,
    private readonly messageStateService: MessageStateService,
    private readonly ruleEvaluator: RuleEvaluator,
    private readonly activeHoursService: ActiveHoursService,
  ) {}

  // User endpoints
  @Get('users')
  getUsers() {
    return this.userService.findAll();
  }

  // Message endpoints (S2)
  @Post('send-message')
  sendMessage(@Body() dto: SendMessageDto) {
    return this.messageService.sendNow(dto);
  }

  @Post('schedule')
  scheduleMessage(@Body() dto: ScheduleMessageDto) {
    return this.messageService.schedule(dto);
  }

  @Get('messages/sent/:senderId')
  getMessagesBySender(@Param('senderId') senderId: string) {
    return this.messageService.getMessagesBySender(senderId);
  }

  @Get('messages/received/:receiverId')
  getMessagesByReceiver(@Param('receiverId') receiverId: string) {
    return this.messageService.getMessagesByReceiver(receiverId);
  }

  // Message state endpoints (S3)
  @Get('message-state/:messageId')
  getMessageState(@Param('messageId') messageId: string) {
    return this.messageStateService.getByMessageId(messageId);
  }

  @Post('message/:messageId/mark-delivered')
  markDelivered(@Param('messageId') messageId: string) {
    const nowUtc = new Date().toISOString();
    return this.messageStateService.markDelivered(messageId, nowUtc);
  }

  @Post('message/:messageId/mark-read')
  markRead(@Param('messageId') messageId: string) {
    const nowUtc = new Date().toISOString();
    return this.messageStateService.markRead(messageId, nowUtc);
  }

  @Post('message/:messageId/mark-replied')
  markReplied(@Param('messageId') messageId: string) {
    const nowUtc = new Date().toISOString();
    return this.messageStateService.markReplied(messageId, nowUtc);
  }

  // Rule evaluation endpoints (S3)
  @Post('evaluate-rules/:messageId')
  async evaluateRules(@Param('messageId') messageId: string) {
    const message = await this.messageService.getMessageById(messageId);
    if (!message) {
      return { error: 'Message not found' };
    }
    const evaluationResult = await this.ruleEvaluator.evaluateRules(
      message,
      new Date(),
    );
    return evaluationResult;
  }

  // Active hours endpoints (S4)
  @Get('active-hours/:userId')
  getActiveHours(@Param('userId') userId: string) {
    return this.activeHoursService.getActiveHours(userId);
  }

  @Get('can-deliver/:userId')
  async canDeliverNow(@Param('userId') userId: string) {
    const activeHours = await this.activeHoursService.getActiveHours(userId);
    if (!activeHours) {
      return { userId, canDeliver: true, reason: 'No active hours set' };
    }

    const nowUtc = new Date();
    const localStr = nowUtc.toLocaleString('en-US', {
      timeZone:
        (await this.userService.findByExternalId(userId))?.timezone || 'UTC',
    });
    const localDate = new Date(localStr);
    const localHour = localDate.getHours();

    const canDeliver = this.activeHoursService.canDeliverNow(
      localHour,
      activeHours,
    );
    return {
      userId,
      canDeliver,
      localHour,
      activeHours: `${activeHours.startHour}:00 - ${activeHours.endHour}:00`,
    };
  }

  @Get('next-allowed-delivery/:userId')
  async getNextAllowedDelivery(@Param('userId') userId: string) {
    const activeHours = await this.activeHoursService.getActiveHours(userId);
    if (!activeHours) {
      return {
        userId,
        nextDelivery: new Date().toISOString(),
        reason: 'No active hours set',
      };
    }

    const user = await this.userService.findByExternalId(userId);
    if (!user) {
      return { userId, error: 'User not found' };
    }

    const nowUtc = new Date();
    const delayResult = await this.activeHoursService.getNextAllowedDeliveryUtc(
      nowUtc,
      user.timezone,
      activeHours,
    );

    return {
      userId,
      nextDeliveryUtc: delayResult.utc.toISOString(),
      localTime: delayResult.localTime,
      isDelayed: delayResult.isDelayed,
    };
  }

  // Signal endpoints
  @Post('signals')
  recordSignal() {
    return this.sandboxService.recordSignal();
  }

  // Message delivery endpoints
  @Post('messages/deliver')
  deliverMessage(
    @Body()
    messageData: {
      senderId: string;
      receiverId: string;
      senderTimezone: string;
      receiverTimezone: string;
      messageContent: string;
    },
  ) {
    return this.sandboxService.deliverMessage(messageData);
  }

  // Behavior rules endpoints
  @Post('events/process')
  processEvent(@Body() eventData: any) {
    return this.sandboxService.processEvent(eventData);
  }

  @Get('rules')
  getAllRules() {
    return this.sandboxService.getAllRules();
  }

  // Decision endpoints
  @Get('decisions/:userId')
  getDecisions(@Param('userId') userId: string) {
    return this.sandboxService.getDecisions(userId);
  }

  // Orchestration endpoints
  @Post('orchestrate/:userId')
  orchestrate(@Param('userId') userId: string) {
    return this.sandboxService.orchestrate(userId);
  }

  // Audit endpoints
  @Get('audit/:userId')
  getAuditLogs(@Param('userId') userId: string) {
    return this.sandboxService.getAuditLogs(userId);
  }

  @Get('audit')
  getAllAuditLogs() {
    return this.sandboxService.getAllAuditLogs();
  }

  // ============================================================
  // STEP 5: SANDBOX ACTION SURFACING
  // Generic event triggering + Action feed + Fake users
  // ============================================================

  /**
   * 1️⃣ Trigger ANY Event (popups, notifications, banners, nudges)
   * POST /sandbox/events
   */
  @Post('events')
  triggerEvent(@Body() dto: SandboxEventDto) {
    return this.sandboxService.triggerEvent(dto);
  }

  /**
   * 2️⃣ Expose Pending Actions (All Types)
   * GET /sandbox/users/:id/actions
   */
  @Get('users/:id/actions')
  getUserActions(@Param('id') userId: string) {
    return this.sandboxService.getUserActions(userId);
  }

  /**
   * 3️⃣ Execute Actions (Generic Executor - All Types)
   * POST /sandbox/users/:id/execute
   */
  @Post('users/:id/execute')
  executeUserActions(@Param('id') userId: string) {
    // Get pending actions
    const actionsResponse = this.sandboxService.getUserActions(userId);

    if (actionsResponse.actions.length === 0) {
      return {
        userId,
        executed: 0,
        delayed: 0,
        actions: [],
        message: 'No pending actions',
      };
    }

    // Execute all pending actions (no branching by type - truly generic)
    const executed: Record<string, unknown>[] = [];
    const delayed: Record<string, unknown>[] = [];

    for (const action of actionsResponse.actions) {
      const now = new Date().getTime();
      const scheduledTime = new Date(action.scheduledAt).getTime();

      if (scheduledTime > now) {
        // Not yet time to execute
        delayed.push({
          actionId: action.actionId,
          actionType: action.actionType,
          scheduledAt: action.scheduledAt,
          waitTime: scheduledTime - now,
        });
      } else {
        // Execute action
        executed.push({
          actionId: action.actionId,
          actionType: action.actionType,
          executedAt: new Date().toISOString(),
          payload: action.payload,
          status: 'executed',
        });
      }
    }

    return {
      userId,
      executed: executed.length,
      delayed: delayed.length,
      actions: {
        executed,
        delayed,
      },
      message: `Executed ${executed.length} actions, ${delayed.length} delayed`,
    };
  }

  /**
   * 4️⃣ Fake Users Endpoint (For CTO Demos)
   * GET /sandbox/users
   * Returns: [{ id, timezone }, ...]
   */
  @Get('users')
  async getSandboxUsers() {
    // Return seeded sandbox users with timezones
    const users = await this.userService.findAll();
    return users.map((u) => ({
      id: u.externalUserId,
      timezone: u.timezone,
      internalId: u.id,
    }));
  }
}
