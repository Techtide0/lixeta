import { Controller, Post, Param } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import type { ExecutorResponse } from './executor.types';

@Controller('orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Post('users/:userId/execute')
  execute(@Param('userId') userId: string): ExecutorResponse {
    return this.orchestratorService.executeForUser(userId);
  }
}
