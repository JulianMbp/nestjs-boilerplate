import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivityLogEntity } from '../../../../../activity-logs/infrastructure/persistence/relational/entities/activity-log.entity';
import { AsistenciaEntity } from '../../../../../asistencias/infrastructure/persistence/relational/entities/asistencia.entity';
import { BitacoraEntity } from '../../../../../bitacoras/infrastructure/persistence/relational/entities/bitacora.entity';
import { DocumentoEntity } from '../../../../../documentos/infrastructure/persistence/relational/entities/documento.entity';
import { MaterialEntity } from '../../../../../materiales/infrastructure/persistence/relational/entities/material.entity';
import { ObraUsuarioEntity } from '../../../../../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';
import { PresupuestoEntity } from '../../../../../presupuestos/infrastructure/persistence/relational/entities/presupuesto.entity';
import { TareaEntity } from '../../../../../tareas/infrastructure/persistence/relational/entities/tarea.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'obras',
})
export class ObraEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String })
  nombre: string;

  @Column({ type: String, nullable: true })
  direccion?: string;

  @Column({ type: String, default: 'activa' })
  @Index()
  estado: string;

  @Column({ type: 'date', nullable: true })
  fecha_inicio?: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin?: Date;

  @Column({ type: 'int', nullable: true })
  @Index()
  admin_id?: number;

  @ManyToOne(() => UserEntity, {
    eager: false,
  })
  @JoinColumn({ name: 'admin_id' })
  admin?: UserEntity;

  @OneToMany(() => ObraUsuarioEntity, (obraUsuario) => obraUsuario.obra)
  asignaciones?: ObraUsuarioEntity[];

  @OneToMany(() => MaterialEntity, (material) => material.obra)
  materiales?: MaterialEntity[];

  @OneToMany(() => BitacoraEntity, (bitacora) => bitacora.obra)
  bitacoras?: BitacoraEntity[];

  @OneToMany(() => AsistenciaEntity, (asistencia) => asistencia.obra)
  asistencias?: AsistenciaEntity[];

  @OneToMany(() => DocumentoEntity, (documento) => documento.obra)
  documentos?: DocumentoEntity[];

  @OneToMany(() => PresupuestoEntity, (presupuesto) => presupuesto.obra)
  presupuestos?: PresupuestoEntity[];

  @OneToMany(() => TareaEntity, (tarea) => tarea.obra)
  tareas?: TareaEntity[];

  @OneToMany(() => ActivityLogEntity, (log) => log.obra)
  activityLogs?: ActivityLogEntity[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone' })
  deleted_at?: Date;
}
