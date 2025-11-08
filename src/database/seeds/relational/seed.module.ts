import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import appConfig from '../../../config/app.config';
import databaseConfig from '../../config/database.config';
import { TypeOrmConfigService } from '../../typeorm-config.service';
import { IngenieriaDemoDataSeedModule } from './ingenieria-demo/ingenieria-demo-data-seed.module';
import { ObraUsuarioSeedModule } from './obra-usuario/obra-usuario-seed.module';
import { ObraSeedModule } from './obra/obra-seed.module';
import { RoleSeedModule } from './role/role-seed.module';
import { StatusSeedModule } from './status/status-seed.module';
import { TareaSeedModule } from './tarea/tarea-seed.module';
import { UserSeedModule } from './user/user-seed.module';

@Module({
  imports: [
    RoleSeedModule,
    StatusSeedModule,
    UserSeedModule,
    ObraSeedModule,
    ObraUsuarioSeedModule,
    TareaSeedModule,
    IngenieriaDemoDataSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
  ],
})
export class SeedModule {}
