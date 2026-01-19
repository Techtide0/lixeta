import { IsString, IsOptional, IsObject } from 'class-validator';

export class SandboxEventDto {
  @IsString()
  userId: string;

  @IsString()
  eventType: 'user_login' | 'user_click' | 'user_scroll' | 'message_sent';

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
