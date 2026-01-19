import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { BehaviorRulesEngine } from './behavior-rules.engine';
import { EventProcessor } from './event-processor';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [RulesService, BehaviorRulesEngine, EventProcessor],
  exports: [RulesService, BehaviorRulesEngine, EventProcessor],
})
export class RulesModule {}
