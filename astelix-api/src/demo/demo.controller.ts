import { Controller, Post } from '@nestjs/common';
import { DemoService } from './demo.service';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post('dual-time')
  dualTime() {
    return this.demoService.dualTimeScenario();
  }

  @Post('behavior-reminder')
  behaviorReminder() {
    return this.demoService.behaviorReminderScenario();
  }

  @Post('fintech-login')
  fintechLogin() {
    return this.demoService.fintechLoginScenario();
  }

  @Post('active-hours')
  activeHours() {
    return this.demoService.activeHoursScenario();
  }
}
