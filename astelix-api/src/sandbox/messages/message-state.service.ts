import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageStateEntity } from './message-state.entity';
import { SandboxMessageEntity } from './message.entity';
import { AuditService } from '../../core/audit/audit.service';

@Injectable()
export class MessageStateService {
  constructor(
    @InjectRepository(MessageStateEntity)
    private readonly stateRepo: Repository<MessageStateEntity>,
    @InjectRepository(SandboxMessageEntity)
    private readonly msgRepo: Repository<SandboxMessageEntity>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Compute status from timestamps (authoritative - derived, not stored)
   */
  private computeStatus(
    message: SandboxMessageEntity,
    state: MessageStateEntity,
  ): string {
    if (state.repliedAtUtc) return 'replied';
    if (state.readAtUtc) return 'read';
    if (state.deliveredAtUtc) return 'delivered';
    if (message.status === 'delayed') return 'delayed';
    return 'queued';
  }

  async createFromMessage(
    message: SandboxMessageEntity,
  ): Promise<MessageStateEntity> {
    const state = this.stateRepo.create({
      messageId: message.id,
      deliveredAtUtc: message.status === 'delivered' ? message.utcTime : null,
      readAtUtc: null,
      repliedAtUtc: null,
      unreadNudgeSent: false,
      reminderSent: false,
      followUpSent: false,
    });
    return this.stateRepo.save(state);
  }

  async getByMessageId(messageId: string): Promise<any> {
    console.log('[SANDBOX] Fetching message state:', messageId);
    
    // Handle msg_xxx format - extract full UUID
    let fullMessageId = messageId;
    if (messageId.startsWith('msg_')) {
      fullMessageId = messageId.replace('msg_', '');
    }

    const state = await this.stateRepo.findOne({ where: { messageId: fullMessageId } });
    const message = await this.msgRepo.findOne({ where: { id: fullMessageId } });

    if (!message || !state) {
      console.log('[SANDBOX] Message not found:', messageId);
      throw new NotFoundException(
        `Message ${messageId} not found in sandbox`,
      );
    }

    // ✅ Compute status from timestamps (authoritative)
    const computedStatus = this.computeStatus(message, state);
    
    // ✅ Clear decisionReason once delivered/read/replied
    const decisionReason = computedStatus === 'delayed' ? message.decisionReason : null;

    return {
      sandbox: true,
      messageId: `msg_${message.id}`,
      senderId: message.senderId,
      receiverId: message.receiverId,
      status: computedStatus,
      decisionReason,
      deliveredAtUtc: state.deliveredAtUtc,
      readAtUtc: state.readAtUtc,
      repliedAtUtc: state.repliedAtUtc,
      lastUpdated: state.updatedAt || message.createdAt,
      createdAt: message.createdAt,
    };
  }

  async markDelivered(
    messageId: string,
    utcTime: string,
  ): Promise<any> {
    // Extract UUID if it has msg_ prefix
    let fullMessageId = messageId;
    if (messageId.startsWith('msg_')) {
      fullMessageId = messageId.replace('msg_', '');
    }
    
    console.log('[MARK_DELIVERED] messageId:', messageId, 'fullMessageId:', fullMessageId);
    
    // ✅ Update state table with deliveredAtUtc
    await this.stateRepo.update(
      { messageId: fullMessageId },
      { 
        deliveredAtUtc: utcTime,
        updatedAt: new Date().toISOString()
      },
    );
    
    // ✅ Update message table with status
    const message = await this.msgRepo.findOne({ where: { id: fullMessageId } });
    await this.msgRepo.update(
      { id: fullMessageId },
      { status: 'delivered' },
    );
    
    console.log('[MARK_DELIVERED] Updated both tables');
    
    // ✅ Write audit event
    if (message) {
      this.auditService.logMessageDelivery({
        senderId: message.senderId,
        receiverId: message.receiverId,
        messageId: `msg_${fullMessageId}`,
        status: 'delivered',
        timezone: message.receiverTimezone,
      });
      console.log('[AUDIT] message_delivered:', fullMessageId);
    }
    
    // ✅ Re-fetch fresh data from database
    return await this.getByMessageId(messageId);
  }

  async markRead(
    messageId: string,
    utcTime: string,
  ): Promise<any> {
    // Extract UUID if it has msg_ prefix
    let fullMessageId = messageId;
    if (messageId.startsWith('msg_')) {
      fullMessageId = messageId.replace('msg_', '');
    }
    
    // ✅ Update state table with readAtUtc
    await this.stateRepo.update(
      { messageId: fullMessageId },
      { 
        readAtUtc: utcTime,
        updatedAt: new Date().toISOString()
      },
    );
    
    // ✅ Get message for audit
    const message = await this.msgRepo.findOne({ where: { id: fullMessageId } });
    
    // ✅ Write audit event
    if (message) {
      this.auditService.logMessageRead({
        senderId: message.senderId,
        receiverId: message.receiverId,
        messageId: `msg_${fullMessageId}`,
        timezone: message.receiverTimezone,
      });
      console.log('[AUDIT] message_read:', fullMessageId);
    }
    
    // ✅ Re-fetch fresh data from database
    return await this.getByMessageId(messageId);
  }

  async markReplied(
    messageId: string,
    utcTime: string,
  ): Promise<any> {
    // Extract UUID if it has msg_ prefix
    let fullMessageId = messageId;
    if (messageId.startsWith('msg_')) {
      fullMessageId = messageId.replace('msg_', '');
    }
    
    // ✅ Update state table with repliedAtUtc
    await this.stateRepo.update(
      { messageId: fullMessageId },
      { 
        repliedAtUtc: utcTime,
        updatedAt: new Date().toISOString()
      },
    );
    
    // ✅ Get message for audit
    const message = await this.msgRepo.findOne({ where: { id: fullMessageId } });
    
    // ✅ Write audit event
    if (message) {
      this.auditService.logMessageReplied({
        senderId: message.senderId,
        receiverId: message.receiverId,
        messageId: `msg_${fullMessageId}`,
        timezone: message.receiverTimezone,
      });
      console.log('[AUDIT] message_replied:', fullMessageId);
    }
    
    // ✅ Re-fetch fresh data from database
    return await this.getByMessageId(messageId);
  }

  async markUnreadNudgeSent(
    messageId: string,
  ): Promise<MessageStateEntity | null> {
    const state = await this.getByMessageId(messageId);
    if (!state) return null;
    state.unreadNudgeSent = true;
    state.updatedAt = new Date().toISOString();
    return this.stateRepo.save(state);
  }

  async markReminderSent(
    messageId: string,
  ): Promise<MessageStateEntity | null> {
    const state = await this.getByMessageId(messageId);
    if (!state) return null;
    state.reminderSent = true;
    state.updatedAt = new Date().toISOString();
    return this.stateRepo.save(state);
  }

  async markFollowUpSent(
    messageId: string,
  ): Promise<MessageStateEntity | null> {
    const state = await this.getByMessageId(messageId);
    if (!state) return null;
    state.followUpSent = true;
    state.updatedAt = new Date().toISOString();
    return this.stateRepo.save(state);
  }
}
