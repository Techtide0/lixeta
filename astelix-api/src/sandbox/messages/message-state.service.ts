import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageStateEntity } from './message-state.entity';
import { SandboxMessageEntity } from './message.entity';

@Injectable()
export class MessageStateService {
  constructor(
    @InjectRepository(MessageStateEntity)
    private readonly stateRepo: Repository<MessageStateEntity>,
    @InjectRepository(SandboxMessageEntity)
    private readonly msgRepo: Repository<SandboxMessageEntity>,
  ) {}

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

  async getByMessageId(messageId: string): Promise<MessageStateEntity | null> {
    return this.stateRepo.findOne({ where: { messageId } });
  }

  async markDelivered(
    messageId: string,
    utcTime: string,
  ): Promise<MessageStateEntity | null> {
    const state = await this.getByMessageId(messageId);
    if (!state) return null;
    state.deliveredAtUtc = utcTime;
    state.updatedAt = new Date().toISOString();
    return this.stateRepo.save(state);
  }

  async markRead(
    messageId: string,
    utcTime: string,
  ): Promise<MessageStateEntity | null> {
    const state = await this.getByMessageId(messageId);
    if (!state) return null;
    state.readAtUtc = utcTime;
    state.updatedAt = new Date().toISOString();
    return this.stateRepo.save(state);
  }

  async markReplied(
    messageId: string,
    utcTime: string,
  ): Promise<MessageStateEntity | null> {
    const state = await this.getByMessageId(messageId);
    if (!state) return null;
    state.repliedAtUtc = utcTime;
    state.updatedAt = new Date().toISOString();
    return this.stateRepo.save(state);
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
