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
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { MaterialEstado } from '../../../../material-estado.enum';

@Entity({
  name: 'materiales',
})
export class MaterialEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  obra_id: string;

  @ManyToOne(() => ObraEntity, (obra) => obra.materiales, {
    eager: false,
  })
  @JoinColumn({ name: 'obra_id' })
  obra: ObraEntity;

  @Column({ type: String })
  nombre: string;

  @Column({ type: String, nullable: true })
  categoria?: string;

  @Column({ type: 'numeric', nullable: true })
  cantidad?: number;

  @Column({ type: 'numeric', nullable: true, default: 0 })
  cantidad_disponible?: number;

  @Column({ type: 'numeric', nullable: true })
  cantidad_requerida?: number;

  @Column({ type: String, nullable: true })
  unidad?: string;

  @Column({ type: String, nullable: true })
  proveedor?: string;

  @Column({
    type: 'enum',
    enum: MaterialEstado,
    default: MaterialEstado.PENDIENTE,
    enumName: 'material_estado_enum',
  })
  @Index()
  estado?: MaterialEstado;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
