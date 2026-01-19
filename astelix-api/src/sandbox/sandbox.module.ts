import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SandboxController } from './sandbox.controller';
import { SandboxService } from './sandbox.service';

import { AuthController } from './auth/auth.controller';
import { ApiKeyEntity } from './auth/api-key.entity';
import { ApiKeyService } from './auth/api-key.service';
import { ApiKeyGuard } from './auth/api-key.guard';

import { SandboxUserEntity } from './users/sandbox-user.entity';
import { SandboxUserService } from './users/sandbox-user.service';
import { ActiveHoursEntity } from './users/active-hours.entity';
import { ActiveHoursService } from './users/active-hours.service';

import { SandboxMessageEntity } from './messages/message.entity';
import { MessageStateEntity } from './messages/message-state.entity';
import { MessageService } from './messages/message.service';
import { MessageStateService } from './messages/message-state.service';
import { RuleEvaluator } from './messages/rule.evaluator';

import { SignalsModule } from '../core/signals/signals.module';
import { DecisionsModule } from '../core/decisions/decisions.module';
import { OrchestratorModule } from '../core/orchestrator/orchestrator.module';
import { AuditModule } from '../core/audit/audit.module';
import { RulesModule } from '../core/rules/rules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiKeyEntity,
      SandboxUserEntity,
      SandboxMessageEntity,
      MessageStateEntity,
      ActiveHoursEntity,
    ]),
    SignalsModule,
    DecisionsModule,
    OrchestratorModule,
    AuditModule,
    RulesModule,
  ],
  controllers: [SandboxController, AuthController],
  providers: [
    SandboxService,
    ApiKeyService,
    ApiKeyGuard,
    SandboxUserService,
    MessageService,
    MessageStateService,
    RuleEvaluator,
    ActiveHoursService,
  ],
  exports: [ApiKeyGuard, SandboxUserService, ApiKeyService, ActiveHoursService],
})
export class SandboxModule {}
