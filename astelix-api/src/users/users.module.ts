import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SignalsModule } from '../core/signals/signals.module';

@Module({
  imports: [SignalsModule], // 👈 IMPORTANT
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
