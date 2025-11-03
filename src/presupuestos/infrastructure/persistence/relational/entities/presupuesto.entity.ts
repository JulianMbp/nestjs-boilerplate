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

@Entity({
  name: 'presupuestos',
})
export class PresupuestoEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  obra_id: string;

  @ManyToOne(() => ObraEntity, (obra) => obra.presupuestos, {
    eager: false,
  })
  @JoinColumn({ name: 'obra_id' })
  obra: ObraEntity;

  @Column({ type: String })
  partida: string;

  @Column({ type: String, nullable: true })
  unidad?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  cantidad: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  valor_unitario: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  valor_ejecutado: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
