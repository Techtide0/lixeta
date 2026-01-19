import { Controller, Post } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';

@Controller('sandbox/auth')
export class AuthController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post('generate-key')
  async generateKey() {
    const apiKey = await this.apiKeyService.createKey();
    return {
      success: true,
      message: 'API key generated successfully',
      key: apiKey.key,
      id: apiKey.id,
      active: apiKey.active,
      createdAt: apiKey.createdAt,
      note: 'Use x-api-key header with this key in all sandbox requests',
    };
  }
}
