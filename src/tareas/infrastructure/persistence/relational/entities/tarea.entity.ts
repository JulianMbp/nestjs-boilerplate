import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ObraEntity } from '../../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { TareaEstado } from '../../../../tarea-estado.enum';
import { TareaPrioridad } from '../../../../tarea-prioridad.enum';

@Entity({
  name: 'tareas',
})
export class TareaEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  obra_id: string;

  @Column({ type: 'integer' })
  @Index()
  usuario_id: number;

  @Column({ type: 'integer' })
  @Index()
  asignado_a_id: number;

  @ManyToOne(() => ObraEntity, (obra) => obra.tareas, {
    eager: false,
  })
  @JoinColumn({ name: 'obra_id' })
  obra: ObraEntity;

  @ManyToOne(() => UserEntity, {
    eager: false,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UserEntity;

  @ManyToOne(() => UserEntity, {
    eager: false,
  })
  @JoinColumn({ name: 'asignado_a_id' })
  asignadoA: UserEntity;

  @Column({ type: String })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({
    type: 'enum',
    enum: TareaEstado,
    default: TareaEstado.PENDIENTE,
    enumName: 'tarea_estado_enum',
  })
  @Index()
  estado: TareaEstado;

  @Column({
    type: 'enum',
    enum: TareaPrioridad,
    default: TareaPrioridad.MEDIA,
    enumName: 'tarea_prioridad_enum',
  })
  @Index()
  prioridad: TareaPrioridad;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  avance_porcentaje?: number;

  @Column({ type: 'date', nullable: true })
  @Index()
  fecha_limite?: Date;

  @Column({ type: 'date', nullable: true })
  fecha_inicio?: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
