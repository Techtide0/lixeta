import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sandbox_message_state')
export class MessageStateEntity {
  @PrimaryColumn('varchar')
  messageId: string;

  @Column('varchar', { nullable: true })
  deliveredAtUtc: string | null;

  @Column('varchar', { nullable: true })
  readAtUtc: string | null;

  @Column('varchar', { nullable: true })
  repliedAtUtc: string | null;

  @Column('boolean', { default: false })
  unreadNudgeSent: boolean;

  @Column('boolean', { default: false })
  reminderSent: boolean;

  @Column('boolean', { default: false })
  followUpSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column('varchar', { nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: string | null;
}
