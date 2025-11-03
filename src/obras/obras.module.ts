import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObraUsuarioEntity } from '../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';
import { RoleEntity } from '../roles/infrastructure/persistence/relational/entities/role.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { ObraEntity } from './infrastructure/persistence/relational/entities/obra.entity';
import { ObrasRelationalRepository } from './infrastructure/persistence/relational/repositories/obras.repository';
import { ObrasController } from './obras.controller';
import { ObrasService } from './obras.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ObraEntity,
      ObraUsuarioEntity,
      UserEntity,
      RoleEntity,
    ]),
  ],
  controllers: [ObrasController],
  providers: [ObrasService, ObrasRelationalRepository],
  exports: [ObrasService, ObrasRelationalRepository],
})
export class ObrasModule {}
