import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ObraEntity } from '../../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { AsistenciaEstado } from '../../../../asistencia-estado.enum';

@Entity({
  name: 'asistencias',
})
@Unique(['obra_id', 'usuario_id', 'fecha'])
export class AsistenciaEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  obra_id: string;

  @Column({ type: 'integer' })
  @Index()
  usuario_id: number;

  @ManyToOne(() => ObraEntity, (obra) => obra.asistencias, {
    eager: false,
  })
  @JoinColumn({ name: 'obra_id' })
  obra: ObraEntity;

  @ManyToOne(() => UserEntity, {
    eager: false,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UserEntity;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  @Index()
  fecha: Date;

  @Column({
    type: 'enum',
    enum: AsistenciaEstado,
  })
  estado: AsistenciaEstado;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
