import { Module } from '@nestjs/common';
import { TemporalService } from './temporal.service';

@Module({
  providers: [TemporalService]
})
export class TemporalModule {}
