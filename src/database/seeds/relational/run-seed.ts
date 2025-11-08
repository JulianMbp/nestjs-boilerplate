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
    try {
      await dataSource.query('DELETE FROM "activity_logs"');
      await dataSource.query('DELETE FROM "tareas"');
      await dataSource.query('DELETE FROM "presupuestos"');
      await dataSource.query('DELETE FROM "documentos"');
      await dataSource.query('DELETE FROM "asistencias"');
      await dataSource.query('DELETE FROM "bitacoras"');
      await dataSource.query('DELETE FROM "materiales"');
      console.log('✅ Tablas de IngenierIA limpiadas');
    } catch (error) {
      console.log(
        '⚠️  Error al limpiar tablas de IngenierIA (puede que no existan):',
        error.message,
      );
    }

    // 2. Limpiar tabla obra_usuario
    console.log('🗑️  Limpiando tabla obra_usuario...');
    try {
      await dataSource.query('DELETE FROM "obra_usuario"');
      console.log('✅ Tabla obra_usuario limpiada');
    } catch (error) {
      console.log('⚠️  Error al limpiar obra_usuario:', error.message);
    }

    // 3. Limpiar tabla obras
    console.log('🗑️  Limpiando tabla obras...');
    try {
      await dataSource.query('DELETE FROM "obras"');
      console.log('✅ Tabla obras limpiada');
    } catch (error) {
      console.log('⚠️  Error al limpiar obras:', error.message);
    }

    // 4. Limpiar tabla user_profiles
    console.log('🗑️  Limpiando tabla user_profiles...');
    try {
      await dataSource.query('DELETE FROM "user_profiles"');
      console.log('✅ Tabla user_profiles limpiada');
    } catch (error) {
      console.log('⚠️  Error al limpiar user_profiles:', error.message);
    }

    // 5. Limpiar tabla session (si existe)
    console.log('🗑️  Limpiando tabla session...');
    try {
      await dataSource.query('DELETE FROM "session"');
      console.log('✅ Tabla session limpiada');
    } catch (error) {
      console.log(
        '⚠️  Tabla session no existe o error al limpiar, omitiendo...',
        error.message,
      );
    }

    // 6. Limpiar tabla usuarios (nueva tabla)
    console.log('🗑️  Limpiando tabla usuarios...');
    try {
      await dataSource.query('DELETE FROM "usuarios"');
      console.log('✅ Tabla usuarios limpiada');
    } catch (error) {
      console.log('⚠️  Error al limpiar usuarios:', error.message);
    }

    // 7. Actualizar usuarios que usan roles >= 3 ANTES de intentar eliminar esos roles
    console.log('🔄 Actualizando usuarios que usan roles de IngenierIA...');
    try {
      // Verificar si la tabla user existe
      const userTableExists = await dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'user'
        )
      `);

      if (userTableExists && userTableExists[0]?.exists) {
        // Verificar si hay usuarios con roles >= 3
        const usersWithIngenieriaRoles = await dataSource.query(`
          SELECT COUNT(*)::int as count 
          FROM "user" 
          WHERE "roleId" >= 3
        `);

        if (
          usersWithIngenieriaRoles &&
          usersWithIngenieriaRoles[0]?.count > 0
        ) {
          // Verificar qué roles base existen (1 o 2)
          const adminRoleExists = await dataSource.query(`
            SELECT COUNT(*)::int as count FROM "role" WHERE id = 1
          `);
          const userRoleExists = await dataSource.query(`
            SELECT COUNT(*)::int as count FROM "role" WHERE id = 2
          `);

          // Usar el rol que exista, priorizando Admin (1), luego User (2)
          let defaultRoleId: number | null = null;
          if (adminRoleExists && adminRoleExists[0]?.count > 0) {
            defaultRoleId = 1;
          } else if (userRoleExists && userRoleExists[0]?.count > 0) {
            defaultRoleId = 2;
          }

          if (defaultRoleId) {
            await dataSource.query(`
              UPDATE "user" 
              SET "roleId" = ${defaultRoleId} 
              WHERE "roleId" >= 3
            `);
            console.log(
              `✅ Usuarios actualizados para usar rol por defecto (id: ${defaultRoleId})`,
            );
          } else {
            console.log(
              '⚠️  No se encontraron roles base (1 o 2), no se pueden actualizar usuarios',
            );
          }
        } else {
          console.log(
            'ℹ️  No hay usuarios con roles de IngenierIA para actualizar',
          );
        }
      } else {
        console.log(
          'ℹ️  Tabla user no existe, omitiendo actualización de usuarios',
        );
      }
    } catch (error) {
      console.log('⚠️  Error al actualizar usuarios:', error.message);
    }

    // 8. Limpiar tabla user antigua (si existe y no tiene restricciones)
    console.log('🗑️  Limpiando tabla user (antigua)...');
    try {
      // Intentar eliminar usuarios, pero manejar errores de restricciones de clave foránea
      await dataSource.query('DELETE FROM "user" WHERE id > 0');
      console.log('✅ Tabla user limpiada');
    } catch (error) {
      // Si hay restricciones de clave foránea, solo loguear el warning
      if (error.code === '23503') {
        console.log(
          '⚠️  No se pueden eliminar todos los usuarios debido a restricciones de clave foránea',
        );
        console.log('ℹ️  Se mantendrán los usuarios existentes');
      } else {
        console.log('⚠️  Error al limpiar tabla user:', error.message);
      }
    }

    // 9. Limpiar tabla role (preservar roles base 1 y 2)
    console.log('🗑️  Limpiando roles de IngenierIA (id >= 3)...');
    try {
      // Verificar que no haya usuarios usando estos roles antes de eliminarlos
      const userTableExists = await dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'user'
        )
      `);

      if (userTableExists && userTableExists[0]?.exists) {
        const rolesInUse = await dataSource.query(`
          SELECT COUNT(*)::int as count 
          FROM "user" 
          WHERE "roleId" >= 3
        `);

        if (rolesInUse && rolesInUse[0]?.count > 0) {
          console.log(
            '⚠️  Aún hay usuarios usando roles >= 3, no se pueden eliminar',
          );
          console.log(
            'ℹ️  Los roles se recrearán/actualizarán en el proceso de seeding',
          );
        } else {
          await dataSource.query('DELETE FROM "role" WHERE id >= 3');
          console.log('✅ Roles de IngenierIA limpiados');
        }
      } else {
        // Si no existe la tabla user, podemos eliminar los roles directamente
        await dataSource.query('DELETE FROM "role" WHERE id >= 3');
        console.log('✅ Roles de IngenierIA limpiados');
      }
    } catch (error) {
      if (error.code === '23503') {
        console.log(
          '⚠️  No se pueden eliminar roles debido a restricciones de clave foránea',
        );
        console.log(
          'ℹ️  Los roles existentes se actualizarán durante el seeding',
        );
      } else {
        console.log('⚠️  Error al limpiar roles:', error.message);
      }
    }

    console.log('\n✅ Proceso de limpieza completado\n');
  } catch (error) {
    console.error('❌ Error crítico al limpiar la base de datos:', error);
    // No lanzar el error, permitir que el seeding continúe
    console.log('⚠️  Continuando con el proceso de seeding...\n');
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
