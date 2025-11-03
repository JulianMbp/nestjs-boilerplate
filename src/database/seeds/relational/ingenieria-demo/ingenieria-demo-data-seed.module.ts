import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BitacoraEntity } from '../../../../bitacoras/infrastructure/persistence/relational/entities/bitacora.entity';
import { MaterialEntity } from '../../../../materiales/infrastructure/persistence/relational/entities/material.entity';
import { ObraEntity } from '../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { IngenieriaDemoDataSeedService } from './ingenieria-demo-data-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialEntity,
      BitacoraEntity,
      ObraEntity,
      UserEntity,
    ]),
  ],
  providers: [IngenieriaDemoDataSeedService],
  exports: [IngenieriaDemoDataSeedService],
})
export class IngenieriaDemoDataSeedModule {}
