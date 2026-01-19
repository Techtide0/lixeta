import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyEntity } from './api-key.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly repo: Repository<ApiKeyEntity>,
  ) {}

  async createKey(): Promise<ApiKeyEntity> {
    const key = this.repo.create({
      key: randomUUID(),
    });
    return this.repo.save(key);
  }

  async validate(key: string): Promise<boolean> {
    const record = await this.repo.findOne({
      where: { key, active: true },
    });
    return !!record;
  }
}
