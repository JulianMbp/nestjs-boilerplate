import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { IngenieriaDemoDataSeedService } from './ingenieria-demo/ingenieria-demo-data-seed.service';
import { ObraUsuarioSeedService } from './obra-usuario/obra-usuario-seed.service';
import { ObraSeedService } from './obra/obra-seed.service';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './status/status-seed.service';
import { TareaSeedService } from './tarea/tarea-seed.service';
import { UserSeedService } from './user/user-seed.service';

const cleanDatabase = async (dataSource: DataSource) => {
  console.log('🧹 Limpiando base de datos...\n');

  try {
    // Orden inverso de dependencias: eliminar primero las tablas dependientes

    // 1. Limpiar tablas de IngenierIA
    console.log('🗑️  Limpiando tablas de IngenierIA...');
    await dataSource.query('DELETE FROM "activity_logs"');
    await dataSource.query('DELETE FROM "tareas"');
    await dataSource.query('DELETE FROM "presupuestos"');
    await dataSource.query('DELETE FROM "documentos"');
    await dataSource.query('DELETE FROM "asistencias"');
    await dataSource.query('DELETE FROM "bitacoras"');
    await dataSource.query('DELETE FROM "materiales"');
    console.log('✅ Tablas de IngenierIA limpiadas');

    // 2. Limpiar tabla obra_usuario
    console.log('🗑️  Limpiando tabla obra_usuario...');
    await dataSource.query('DELETE FROM "obra_usuario"');
    console.log('✅ Tabla obra_usuario limpiada');

    // 3. Limpiar tabla obras
    console.log('🗑️  Limpiando tabla obras...');
    await dataSource.query('DELETE FROM "obras"');
    console.log('✅ Tabla obras limpiada');

    // 4. Limpiar tabla user_profiles
    console.log('🗑️  Limpiando tabla user_profiles...');
    await dataSource.query('DELETE FROM "user_profiles"');
    console.log('✅ Tabla user_profiles limpiada');

    // 5. Limpiar tabla session (si existe)
    console.log('🗑️  Limpiando tabla session...');
    try {
      await dataSource.query('DELETE FROM "session"');
      console.log('✅ Tabla session limpiada');
    } catch {
      console.log('⚠️  Tabla session no existe, omitiendo...');
    }

    // 6. Limpiar tabla usuarios (nueva tabla)
    console.log('🗑️  Limpiando tabla usuarios...');
    await dataSource.query('DELETE FROM "usuarios"');
    console.log('✅ Tabla usuarios limpiada');

    // 7. Limpiar tabla user antigua (si existe)
    console.log('�️  Limpiando tabla user (antigua)...');
    try {
      await dataSource.query('DELETE FROM "user" WHERE id > 0');
      console.log('✅ Tabla user limpiada');
    } catch {
      console.log('⚠️  Tabla user no existe, omitiendo...');
    }

    // 8. Limpiar tabla role (preservar roles base)
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

  // Orden de ejecución: Roles → Status → Users → Obras → Obra-Usuario → Tareas → Datos Demo
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(ObraSeedService).run();
  await app.get(ObraUsuarioSeedService).run();
  await app.get(TareaSeedService).run();
  await app.get(IngenieriaDemoDataSeedService).run();

  console.log('\n✅ Todos los seeders ejecutados correctamente');
  console.log('🎉 Proceso completado exitosamente\n');

  await app.close();
};

void runSeed();
