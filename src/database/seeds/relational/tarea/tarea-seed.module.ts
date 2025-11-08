import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObraEntity } from '../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { TareaEntity } from '../../../../tareas/infrastructure/persistence/relational/entities/tarea.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { TareaSeedService } from './tarea-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TareaEntity, ObraEntity, UserEntity]),
  ],
  providers: [TareaSeedService],
  exports: [TareaSeedService],
})
export class TareaSeedModule {}

