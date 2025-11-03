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
import { UsuarioEntity } from '../../../../../usuarios/infrastructure/persistence/relational/entities/usuario.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'documentos',
})
export class DocumentoEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  obra_id: string;

  @Column({ type: 'uuid' })
  @Index()
  usuario_id: string;

  @ManyToOne(() => ObraEntity, (obra) => obra.documentos, {
    eager: false,
  })
  @JoinColumn({ name: 'obra_id' })
  obra: ObraEntity;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.documentos, {
    eager: true,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntity;

  @Column({ type: String })
  tipo: string;

  @Column({ type: String })
  @Index()
  nombre: string;

  @Column({ type: String })
  url: string;

  @Column({ type: String, default: '1.0' })
  version: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
