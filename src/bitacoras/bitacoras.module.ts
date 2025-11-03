import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObraUsuarioEntity } from '../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';
import { BitacorasController } from './bitacoras.controller';
import { BitacorasService } from './bitacoras.service';
import { BitacoraEntity } from './infrastructure/persistence/relational/entities/bitacora.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BitacoraEntity, ObraUsuarioEntity])],
  controllers: [BitacorasController],
  providers: [BitacorasService],
  exports: [BitacorasService],
})
export class BitacorasModule {}
