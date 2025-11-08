import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObraUsuarioEntity } from '../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';
import { TareaEntity } from './infrastructure/persistence/relational/entities/tarea.entity';
import { TareasController } from './tareas.controller';
import { TareasService } from './tareas.service';

@Module({
  imports: [TypeOrmModule.forFeature([TareaEntity, ObraUsuarioEntity])],
  controllers: [TareasController],
  providers: [TareasService],
  exports: [TareasService],
})
export class TareasModule {}
