import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivityLogEntity } from '../../../../../activity-logs/infrastructure/persistence/relational/entities/activity-log.entity';
import { AsistenciaEntity } from '../../../../../asistencias/infrastructure/persistence/relational/entities/asistencia.entity';
import { BitacoraEntity } from '../../../../../bitacoras/infrastructure/persistence/relational/entities/bitacora.entity';
import { DocumentoEntity } from '../../../../../documentos/infrastructure/persistence/relational/entities/documento.entity';
import { ObraUsuarioEntity } from '../../../../../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';
import { ObraEntity } from '../../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { UserProfileEntity } from '../../../../../user-profiles/infrastructure/persistence/relational/entities/user-profile.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'usuarios',
})
export class UsuarioEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String, unique: true })
  @Index()
  email: string;

  @Column({ type: String })
  password: string;

  @Column({ type: String, nullable: true })
  first_name?: string;

  @Column({ type: String, nullable: true })
  last_name?: string;

  @Column({ type: Number, nullable: true })
  @Index()
  role_id?: number;

  @ManyToOne(() => RoleEntity, {
    eager: false,
  })
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity;

  @Column({ type: String, default: 'email' })
  provider: string;

  @Column({ type: String, nullable: true })
  social_id?: string;

  @Column({ type: String, nullable: true })
  hash?: string;

  @OneToOne(() => UserProfileEntity, (profile) => profile.user)
  profile?: UserProfileEntity;

  @OneToMany(() => ObraEntity, (obra) => obra.admin)
  obrasAsAdmin?: ObraEntity[];

  @OneToMany(() => ObraUsuarioEntity, (obraUsuario) => obraUsuario.user)
  obraUsuarios?: ObraUsuarioEntity[];

  @OneToMany(() => BitacoraEntity, (bitacora) => bitacora.usuario)
  bitacoras?: BitacoraEntity[];

  @OneToMany(() => AsistenciaEntity, (asistencia) => asistencia.usuario)
  asistencias?: AsistenciaEntity[];

  @OneToMany(() => DocumentoEntity, (documento) => documento.usuario)
  documentos?: DocumentoEntity[];

  @OneToMany(() => ActivityLogEntity, (log) => log.user)
  activityLogs?: ActivityLogEntity[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone' })
  deleted_at?: Date;
}
