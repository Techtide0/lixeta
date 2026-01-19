import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('sandbox_messages')
export class SandboxMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @Column()
  receiverId: string;

  @Column('text')
  content: string;

  @Column()
  senderTimezone: string;

  @Column()
  receiverTimezone: string;

  @Column()
  senderLocalTime: string;

  @Column()
  receiverLocalTime: string;

  @Column()
  utcTime: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'delivered' | 'delayed';

  @Column({ nullable: true })
  scheduledForUtc?: string;

  @CreateDateColumn()
  createdAt: Date;
}
