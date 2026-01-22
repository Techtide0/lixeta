import { Controller, Post } from '@nestjs/common';
import { DemoService } from './demo.service';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post('dual-time')
  dualTime(): any {
    return this.demoService.dualTimeScenario();
  }

  @Post('behavior-reminder')
  behaviorReminder(): any {
    return this.demoService.behaviorReminderScenario();
  }

  @Post('fintech-login')
  fintechLogin(): any {
    return this.demoService.fintechLoginScenario();
  }

  @Post('active-hours')
  activeHours(): any {
    return this.demoService.activeHoursScenario();
  }
}
