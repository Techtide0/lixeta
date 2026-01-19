import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('sandbox_users')
export class SandboxUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  externalUserId: string;

  @Column()
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;
}
