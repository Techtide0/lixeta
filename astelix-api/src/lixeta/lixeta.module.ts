import { Module } from '@nestjs/common';
import { LixetaController } from './lixeta.controller';
import { LixetaService } from './lixeta.service';

@Module({
  controllers: [LixetaController],
  providers: [LixetaService],
  exports: [LixetaService]
})
export class LixetaModule {}
