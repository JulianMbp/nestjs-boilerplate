import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { MaterialesModule } from '../materiales/materiales.module';
import { ObraUsuarioEntity } from '../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';
import { ObrasModule } from '../obras/obras.module';
import { TareasModule } from '../tareas/tareas.module';
import { UsersModule } from '../users/users.module';
import { BitacorasController } from './bitacoras.controller';
import { BitacorasService } from './bitacoras.service';
import { BitacoraEntity } from './infrastructure/persistence/relational/entities/bitacora.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BitacoraEntity, ObraUsuarioEntity]),
    AiModule,
    MaterialesModule,
    ObrasModule,
    TareasModule,
    UsersModule,
  ],
  controllers: [BitacorasController],
  providers: [BitacorasService],
  exports: [BitacorasService],
})
export class BitacorasModule {}
