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
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'bitacoras',
})
export class BitacoraEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  obra_id: string;

  @Column({ type: 'integer' })
  @Index()
  usuario_id: number;

  @ManyToOne(() => ObraEntity, (obra) => obra.bitacoras, {
    eager: false,
  })
  @JoinColumn({ name: 'obra_id' })
  obra: ObraEntity;

  @ManyToOne(() => UserEntity, {
    eager: false,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UserEntity;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  avance_porcentaje: number;

  @Column({ type: 'jsonb', default: [] })
  archivos: string[];

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  @Index()
  fecha: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
