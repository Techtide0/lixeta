import { Controller, Get, Param } from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import type { GetActionsResponse } from './decisions.service';

@Controller('decisions')
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Get('users/:id')
  getUserDecisions(@Param('id') userId: string): GetActionsResponse {
    return this.decisionsService.getActionsForUser(userId);
  }
}
