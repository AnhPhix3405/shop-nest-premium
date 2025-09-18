import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}