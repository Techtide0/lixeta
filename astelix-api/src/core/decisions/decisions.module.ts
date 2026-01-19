import { Module } from '@nestjs/common';
import { DecisionsController } from './decisions.controller';
import { DecisionsService } from './decisions.service';
import { RulesModule } from '../rules/rules.module';
import { SignalsModule } from '../signals/signals.module';

@Module({
  imports: [RulesModule, SignalsModule],
  controllers: [DecisionsController],
  providers: [DecisionsService],
  exports: [DecisionsService],
})
export class DecisionsModule {}
