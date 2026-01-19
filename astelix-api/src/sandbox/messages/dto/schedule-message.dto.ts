import { IsString, IsISO8601 } from 'class-validator';

export class ScheduleMessageDto {
  @IsString()
  senderId: string;

  @IsString()
  receiverId: string;

  @IsString()
  content: string;

  @IsISO8601()
  deliverAtLocalTime: string;
}
