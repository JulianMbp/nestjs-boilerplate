import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../../../../usuarios/infrastructure/persistence/relational/entities/usuario.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'user_profiles',
})
export class UserProfileEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  @Index()
  user_id: string;

  @OneToOne(() => UsuarioEntity, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: UsuarioEntity;

  @Column({ type: String, unique: true })
  email: string;

  @Column({ type: String, nullable: true })
  first_name?: string;

  @Column({ type: String, nullable: true })
  last_name?: string;

  @Column({ type: String, nullable: true })
  phone?: string;

  @Column({ type: String, nullable: true })
  avatar_url?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
