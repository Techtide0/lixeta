import { IsEnum, IsOptional, IsString, IsISO8601 } from 'class-validator';

export enum EventType {
  USER_LOGIN = 'user_login',
  USER_CLICK = 'user_click',
  MESSAGE_SENT = 'message_sent',
  SESSION_PING = 'session_ping',
}

export class CreateEventDto {
  @IsString()
  userId: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsString()
  timezone: string;

  // Optional — server will auto-set if missing
  @IsOptional()
  @IsISO8601()
  occurredAt?: string;
}
