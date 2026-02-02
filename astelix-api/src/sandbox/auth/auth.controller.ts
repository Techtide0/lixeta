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
      message: 'Sandbox API key generated successfully',
      apiKey: apiKey.key,
      environment: 'sandbox',
      auth: {
        header: 'x-api-key',
        usage: 'Include the API key in the request header as x-api-key',
      },
      note: 'This key is for sandbox testing only. No real messages are sent.',
    };
  }
}
