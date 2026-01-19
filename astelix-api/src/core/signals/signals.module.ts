import { Module } from '@nestjs/common';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';
import { MessageDeliveryService } from './message-delivery.service';
import { RulesModule } from '../rules/rules.module';

@Module({
  imports: [RulesModule],
  controllers: [SignalsController],
  providers: [SignalsService, MessageDeliveryService],
  exports: [SignalsService, MessageDeliveryService],
})
export class SignalsModule {}
