import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObraUsuarioEntity } from '../../../../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';
import { ObraEntity } from '../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ObraUsuarioSeedService } from './obra-usuario-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ObraUsuarioEntity,
      UserEntity,
      ObraEntity,
      RoleEntity,
    ]),
  ],
  providers: [ObraUsuarioSeedService],
  exports: [ObraUsuarioSeedService],
})
export class ObraUsuarioSeedModule {}
