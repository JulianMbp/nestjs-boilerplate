import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObraEntity } from '../../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { UsuarioEntity } from '../../../../../usuarios/infrastructure/persistence/relational/entities/usuario.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'activity_logs',
})
export class ActivityLogEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  obra_id?: string;

  @ManyToOne(() => UsuarioEntity, (user) => user.activityLogs, {
    eager: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UsuarioEntity;

  @ManyToOne(() => ObraEntity, (obra) => obra.activityLogs, {
    eager: false,
  })
  @JoinColumn({ name: 'obra_id' })
  obra?: ObraEntity;

  @Column({ type: String })
  action: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Index()
  created_at: Date;
}
