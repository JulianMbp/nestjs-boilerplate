import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { ObraUsuarioSeedService } from './obra-usuario/obra-usuario-seed.service';
import { ObraSeedService } from './obra/obra-seed.service';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './status/status-seed.service';
import { UserSeedService } from './user/user-seed.service';

const cleanDatabase = async (dataSource: DataSource) => {
  console.log('🧹 Limpiando base de datos...\n');

  try {
    // Orden inverso de dependencias: eliminar primero las tablas dependientes

    // 1. Limpiar tabla obra_usuario (depende de user, obra, role)
    console.log('🗑️  Limpiando tabla obra_usuario...');
    await dataSource.query('DELETE FROM "obra_usuario"');
    console.log('✅ Tabla obra_usuario limpiada');

    // 2. Limpiar tabla obra (depende de user)
    console.log('🗑️  Limpiando tabla obra...');
    await dataSource.query('DELETE FROM "obra"');
    console.log('✅ Tabla obra limpiada');

    // 3. Limpiar tabla session (depende de user)
    console.log('🗑️  Limpiando tabla session...');
    await dataSource.query('DELETE FROM "session"');
    console.log('✅ Tabla session limpiada');

    // 4. Limpiar tabla user (depende de role y status)
    console.log('🗑️  Limpiando tabla user...');
    await dataSource.query('DELETE FROM "user" WHERE id > 0');
    console.log('✅ Tabla user limpiada');

    // 5. Reiniciar secuencia de IDs de user
    console.log('🔄 Reiniciando secuencia de user_id...');
    await dataSource.query('ALTER SEQUENCE user_id_seq RESTART WITH 1');
    console.log('✅ Secuencia reiniciada');

    // 6. Limpiar tabla role (roles de IngenierIA solamente, preservar roles base)
    console.log('🗑️  Limpiando roles de IngenierIA...');
    await dataSource.query('DELETE FROM "role" WHERE id >= 3');
    console.log('✅ Roles de IngenierIA limpiados');

    console.log('\n✅ Base de datos limpiada correctamente\n');
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    throw error;
  }
};

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // Obtener el DataSource para operaciones de limpieza
  const dataSource = app.get(DataSource);

  console.log('🌱 Iniciando proceso de seeders de IngenierIA...\n');

  // Paso 1: Limpiar base de datos
  await cleanDatabase(dataSource);

  // Paso 2: Ejecutar seeders en orden
  console.log('📝 Ejecutando seeders...\n');

  // Orden de ejecución: Roles → Status → Users → Obras → Obra-Usuario
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(ObraSeedService).run();
  await app.get(ObraUsuarioSeedService).run();

  console.log('\n✅ Todos los seeders ejecutados correctamente');
  console.log('🎉 Proceso completado exitosamente\n');

  await app.close();
};

void runSeed();
