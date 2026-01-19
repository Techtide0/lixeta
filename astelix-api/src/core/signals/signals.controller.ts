import { Body, Controller, Post } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  recordEvent(@Body() dto: CreateEventDto) {
    const user = this.signalsService.recordEvent(dto);

    return {
      status: 'ok',
      message: 'Signal recorded successfully',
      userId: user.userId,
      eventType: dto.eventType,
      occurredAt: dto.occurredAt,
      timezone: user.timezone,
    };
  }
}
