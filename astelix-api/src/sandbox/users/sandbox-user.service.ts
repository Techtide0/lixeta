import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SandboxUserEntity } from './sandbox-user.entity';

@Injectable()
export class SandboxUserService implements OnModuleInit {
  constructor(
    @InjectRepository(SandboxUserEntity)
    private readonly repo: Repository<SandboxUserEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count > 0) return;

    await this.repo.save([
      { externalUserId: 'user_ng', timezone: 'Africa/Lagos' },
      { externalUserId: 'user_us', timezone: 'America/New_York' },
      { externalUserId: 'user_sa', timezone: 'Africa/Johannesburg' },
    ]);
  }

  async findAll() {
    return this.repo.find();
  }

  async findByExternalId(
    externalUserId: string,
  ): Promise<SandboxUserEntity | null> {
    return this.repo.findOne({ where: { externalUserId } });
  }
}
