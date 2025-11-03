import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ObraUsuarioEntity } from '../../../../../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'obra',
})
export class ObraEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String })
  nombre: string;

  @Column({ type: String })
  direccion: string;

  @ManyToOne(() => UserEntity, {
    eager: false,
  })
  @JoinColumn({ name: 'administrador_id' })
  administrador?: UserEntity | null;

  @OneToMany(() => ObraUsuarioEntity, (obraUsuario) => obraUsuario.obra)
  asignaciones?: ObraUsuarioEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
