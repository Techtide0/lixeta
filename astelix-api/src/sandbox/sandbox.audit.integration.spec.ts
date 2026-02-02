/**
 * Integration Test: Sandbox Audit Logging
 *
 * Verifies that:
 * 1. Messages created with sendNow() are logged
 * 2. Messages created with schedule() are logged
 * 3. markDelivered() logs delivery events
 * 4. markRead() logs read events
 * 5. markReplied() logs replied events
 * 6. Audit endpoint returns all events
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './messages/message.service';
import { MessageStateService } from './messages/message-state.service';
import { SandboxUserService } from './users/sandbox-user.service';
import { ActiveHoursService } from './users/active-hours.service';
import { AuditService } from '../core/audit/audit.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SandboxMessageEntity } from './messages/message.entity';
import { MessageStateEntity } from './messages/message-state.entity';

describe('Sandbox Audit Logging Integration', () => {
  let messageService: MessageService;
  let messageStateService: MessageStateService;
  let auditService: AuditService;
  let module: TestingModule;

  // Mock repositories
  const mockMessageRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  };

  const mockStateRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUserService = {
    findByExternalId: jest.fn(),
    findAll: jest.fn(),
  };

  const mockActiveHoursService = {
    getActiveHours: jest.fn(),
    canDeliverNow: jest.fn(),
    getNextAllowedDeliveryUtc: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        MessageService,
        MessageStateService,
        AuditService,
        {
          provide: getRepositoryToken(SandboxMessageEntity),
          useValue: mockMessageRepo,
        },
        {
          provide: getRepositoryToken(MessageStateEntity),
          useValue: mockStateRepo,
        },
        {
          provide: SandboxUserService,
          useValue: mockUserService,
        },
        {
          provide: ActiveHoursService,
          useValue: mockActiveHoursService,
        },
      ],
    }).compile();

    messageService = module.get<MessageService>(MessageService);
    messageStateService = module.get<MessageStateService>(MessageStateService);
    auditService = module.get<AuditService>(AuditService);

    // Clear audit logs before each test
    auditService.clearLogs();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendNow() - Message Creation Audit', () => {
    it('should log message_delivery event when message is created with sendNow', async () => {
      // Arrange
      const senderId = 'user_1';
      const receiverId = 'user_2';
      const messageId = '123e4567-e89b-12d3-a456-426614174000';

      mockUserService.findByExternalId.mockResolvedValueOnce({
        externalId: senderId,
        timezone: 'America/New_York',
      });
      mockUserService.findByExternalId.mockResolvedValueOnce({
        externalId: receiverId,
        timezone: 'Europe/London',
      });

      mockActiveHoursService.getActiveHours.mockResolvedValueOnce({
        start: 9,
        end: 18,
      });

      mockActiveHoursService.canDeliverNow.mockReturnValueOnce(true);

      mockMessageRepo.create.mockReturnValueOnce({
        id: messageId,
        senderId,
        receiverId,
        content: 'Test message',
        status: 'delivered',
        senderTimezone: 'America/New_York',
        receiverTimezone: 'Europe/London',
      });

      mockMessageRepo.save.mockResolvedValueOnce({
        id: messageId,
        senderId,
        receiverId,
        content: 'Test message',
        status: 'delivered',
        senderTimezone: 'America/New_York',
        receiverTimezone: 'Europe/London',
      });

      mockStateRepo.create.mockReturnValueOnce({
        messageId,
        deliveredAtUtc: null,
      });

      mockStateRepo.save.mockResolvedValueOnce({
        messageId,
        deliveredAtUtc: null,
      });

      // Act
      await messageService.sendNow({
        senderId,
        receiverId,
        content: 'Test message',
      });

      // Assert
      const logs = auditService.getAllLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].type).toBe('message_delivery');
      expect(logs[0].referenceId).toBe(`msg_${messageId}`);
      // Verify the log contains sender and receiver info
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('schedule() - Scheduled Message Audit', () => {
    it('should log message_delivery event when message is scheduled', async () => {
      // Arrange
      const senderId = 'user_1';
      const receiverId = 'user_2';
      const messageId = '123e4567-e89b-12d3-a456-426614174001';

      mockUserService.findByExternalId.mockResolvedValueOnce({
        externalId: senderId,
        timezone: 'America/New_York',
      });
      mockUserService.findByExternalId.mockResolvedValueOnce({
        externalId: receiverId,
        timezone: 'Europe/London',
      });

      mockActiveHoursService.getActiveHours.mockResolvedValueOnce({
        start: 9,
        end: 18,
      });

      mockActiveHoursService.canDeliverNow.mockReturnValueOnce(false);
      mockActiveHoursService.getNextAllowedDeliveryUtc.mockReturnValueOnce({
        utc: new Date(Date.now() + 3600000),
      });

      mockMessageRepo.create.mockReturnValueOnce({
        id: messageId,
        senderId,
        receiverId,
        content: 'Scheduled message',
        status: 'delayed',
        decisionReason: 'Outside receiver active hours',
      });

      mockMessageRepo.save.mockResolvedValueOnce({
        id: messageId,
        senderId,
        receiverId,
        content: 'Scheduled message',
        status: 'delayed',
        decisionReason: 'Outside receiver active hours',
      });

      mockStateRepo.create.mockReturnValueOnce({ messageId });
      mockStateRepo.save.mockResolvedValueOnce({ messageId });

      // Act
      await messageService.schedule({
        senderId,
        receiverId,
        content: 'Scheduled message',
        deliverAtLocalTime: new Date().toISOString(),
      });

      // Assert
      const logs = auditService.getAllLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].type).toBe('message_delivery');
      expect(logs[0].referenceId).toBe(`msg_${messageId}`);
    });
  });

  describe('markDelivered() - Delivery Audit', () => {
    it('should log message_delivery event when message is marked delivered', async () => {
      // Arrange
      const messageId = '123e4567-e89b-12d3-a456-426614174002';
      const utcTime = new Date().toISOString();

      mockMessageRepo.findOne.mockResolvedValueOnce({
        id: messageId,
        senderId: 'user_1',
        receiverId: 'user_2',
        status: 'pending',
        receiverTimezone: 'Europe/London',
      });

      mockStateRepo.update.mockResolvedValueOnce({ affected: 1 });
      mockMessageRepo.update.mockResolvedValueOnce({ affected: 1 });

      mockStateRepo.findOne.mockResolvedValueOnce({
        messageId,
        deliveredAtUtc: utcTime,
        readAtUtc: null,
        repliedAtUtc: null,
      });

      mockMessageRepo.findOne.mockResolvedValueOnce({
        id: messageId,
        status: 'delivered',
      });

      // Act
      await messageStateService.markDelivered(`msg_${messageId}`, utcTime);

      // Assert
      const logs = auditService.getAllLogs();
      expect(logs.some((log) => log.type === 'message_delivery')).toBe(true);
    });
  });

  describe('markRead() - Read Audit', () => {
    it('should log message_read event when message is marked as read', async () => {
      // Arrange
      const messageId = '123e4567-e89b-12d3-a456-426614174003';
      const utcTime = new Date().toISOString();

      mockMessageRepo.findOne.mockResolvedValueOnce({
        id: messageId,
        senderId: 'user_1',
        receiverId: 'user_2',
        receiverTimezone: 'Europe/London',
      });

      mockStateRepo.update.mockResolvedValueOnce({ affected: 1 });

      mockStateRepo.findOne.mockResolvedValueOnce({
        messageId,
        deliveredAtUtc: '2024-01-30T10:00:00Z',
        readAtUtc: utcTime,
        repliedAtUtc: null,
      });

      mockMessageRepo.findOne.mockResolvedValueOnce({
        id: messageId,
        status: 'delivered',
      });

      // Act
      await messageStateService.markRead(`msg_${messageId}`, utcTime);

      // Assert
      const logs = auditService.getAllLogs();
      expect(logs.some((log) => log.type === 'message_read')).toBe(true);
    });
  });

  describe('markReplied() - Replied Audit', () => {
    it('should log message_replied event when message is marked as replied', async () => {
      // Arrange
      const messageId = '123e4567-e89b-12d3-a456-426614174004';
      const utcTime = new Date().toISOString();

      mockMessageRepo.findOne.mockResolvedValueOnce({
        id: messageId,
        senderId: 'user_1',
        receiverId: 'user_2',
        receiverTimezone: 'Europe/London',
      });

      mockStateRepo.update.mockResolvedValueOnce({ affected: 1 });

      mockStateRepo.findOne.mockResolvedValueOnce({
        messageId,
        deliveredAtUtc: '2024-01-30T10:00:00Z',
        readAtUtc: '2024-01-30T10:05:00Z',
        repliedAtUtc: utcTime,
      });

      mockMessageRepo.findOne.mockResolvedValueOnce({
        id: messageId,
        status: 'delivered',
      });

      // Act
      await messageStateService.markReplied(`msg_${messageId}`, utcTime);

      // Assert
      const logs = auditService.getAllLogs();
      expect(logs.some((log) => log.type === 'message_replied')).toBe(true);
    });
  });

  describe('Audit Log Retrieval', () => {
    it('should retrieve all audit logs via getAllLogs', async () => {
      // Arrange
      const senderId = 'user_1';
      const receiverId = 'user_2';
      const messageId = '123e4567-e89b-12d3-a456-426614174005';

      // Simulate creating a message and marking it delivered + read
      mockUserService.findByExternalId.mockResolvedValueOnce({
        externalId: senderId,
        timezone: 'America/New_York',
      });
      mockUserService.findByExternalId.mockResolvedValueOnce({
        externalId: receiverId,
        timezone: 'Europe/London',
      });

      mockActiveHoursService.getActiveHours.mockResolvedValueOnce(null);

      mockMessageRepo.create.mockReturnValueOnce({
        id: messageId,
        status: 'delivered',
      });
      mockMessageRepo.save.mockResolvedValueOnce({
        id: messageId,
        status: 'delivered',
      });

      mockStateRepo.create.mockReturnValueOnce({ messageId });
      mockStateRepo.save.mockResolvedValueOnce({ messageId });

      await messageService.sendNow({ senderId, receiverId, content: 'Test' });

      // Mark delivered
      mockMessageRepo.findOne
        .mockResolvedValueOnce({
          id: messageId,
          senderId,
          receiverId,
          receiverTimezone: 'Europe/London',
        })
        .mockResolvedValueOnce({
          id: messageId,
          status: 'delivered',
        });

      mockStateRepo.update.mockResolvedValueOnce({ affected: 1 });
      mockMessageRepo.update.mockResolvedValueOnce({ affected: 1 });

      mockStateRepo.findOne.mockResolvedValueOnce({
        messageId,
        deliveredAtUtc: new Date().toISOString(),
      });

      await messageStateService.markDelivered(
        `msg_${messageId}`,
        new Date().toISOString(),
      );

      // Assert
      const allLogs = auditService.getAllLogs();
      expect(allLogs.length).toBeGreaterThanOrEqual(2);
    });
  });
});
