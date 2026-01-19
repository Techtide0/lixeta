import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sandbox_active_hours')
export class ActiveHoursEntity {
  @PrimaryColumn('varchar')
  userId: string;

  @Column('int')
  startHour: number; // 0-23

  @Column('int')
  endHour: number; // 0-23

  @CreateDateColumn()
  createdAt: Date;
}
