import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObraEntity } from '../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ObraSeedService } from './obra-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([ObraEntity, UserEntity])],
  providers: [ObraSeedService],
  exports: [ObraSeedService],
})
export class ObraSeedModule {}
