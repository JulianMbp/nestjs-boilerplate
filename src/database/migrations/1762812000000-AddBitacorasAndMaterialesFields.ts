import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBitacorasAndMaterialesFields1762812000000
  implements MigrationInterface
{
  name = 'AddBitacorasAndMaterialesFields1762812000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columna generada_por_ia a la tabla bitacoras
    const bitacorasTable = await queryRunner.getTable('bitacoras');
    if (bitacorasTable) {
      const generadaPorIaColumn =
        bitacorasTable.findColumnByName('generada_por_ia');
      if (!generadaPorIaColumn) {
        await queryRunner.query(`
          ALTER TABLE "bitacoras" 
          ADD COLUMN "generada_por_ia" boolean NOT NULL DEFAULT false;
        `);
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS "IDX_bitacoras_generada_por_ia" 
          ON "bitacoras" ("generada_por_ia");
        `);
      }
    }

    // 2. Crear enum para material_estado_enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "material_estado_enum" AS ENUM ('pendiente', 'comprado', 'en_transito', 'disponible');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. Agregar columnas a la tabla materiales
    const materialesTable = await queryRunner.getTable('materiales');
    if (materialesTable) {
      // Agregar cantidad_disponible
      const cantidadDisponibleColumn = materialesTable.findColumnByName(
        'cantidad_disponible',
      );
      if (!cantidadDisponibleColumn) {
        await queryRunner.query(`
          ALTER TABLE "materiales" 
          ADD COLUMN "cantidad_disponible" NUMERIC DEFAULT 0;
        `);
      }

      // Agregar cantidad_requerida
      const cantidadRequeridaColumn =
        materialesTable.findColumnByName('cantidad_requerida');
      if (!cantidadRequeridaColumn) {
        await queryRunner.query(`
          ALTER TABLE "materiales" 
          ADD COLUMN "cantidad_requerida" NUMERIC;
        `);
      }

      // Agregar estado
      const estadoColumn = materialesTable.findColumnByName('estado');
      if (!estadoColumn) {
        await queryRunner.query(`
          ALTER TABLE "materiales" 
          ADD COLUMN "estado" material_estado_enum NOT NULL DEFAULT 'pendiente';
        `);
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS "IDX_materiales_estado" 
          ON "materiales" ("estado");
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios en orden inverso

    // 1. Eliminar columnas de materiales
    const materialesTable = await queryRunner.getTable('materiales');
    if (materialesTable) {
      const estadoColumn = materialesTable.findColumnByName('estado');
      if (estadoColumn) {
        await queryRunner.query(`
          DROP INDEX IF EXISTS "IDX_materiales_estado";
        `);
        await queryRunner.query(`
          ALTER TABLE "materiales" DROP COLUMN IF EXISTS "estado";
        `);
      }

      const cantidadRequeridaColumn =
        materialesTable.findColumnByName('cantidad_requerida');
      if (cantidadRequeridaColumn) {
        await queryRunner.query(`
          ALTER TABLE "materiales" DROP COLUMN IF EXISTS "cantidad_requerida";
        `);
      }

      const cantidadDisponibleColumn = materialesTable.findColumnByName(
        'cantidad_disponible',
      );
      if (cantidadDisponibleColumn) {
        await queryRunner.query(`
          ALTER TABLE "materiales" DROP COLUMN IF EXISTS "cantidad_disponible";
        `);
      }
    }

    // 2. Eliminar enum material_estado_enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS "material_estado_enum";
    `);

    // 3. Eliminar columna generada_por_ia de bitacoras
    const bitacorasTable = await queryRunner.getTable('bitacoras');
    if (bitacorasTable) {
      const generadaPorIaColumn =
        bitacorasTable.findColumnByName('generada_por_ia');
      if (generadaPorIaColumn) {
        await queryRunner.query(`
          DROP INDEX IF EXISTS "IDX_bitacoras_generada_por_ia";
        `);
        await queryRunner.query(`
          ALTER TABLE "bitacoras" DROP COLUMN IF EXISTS "generada_por_ia";
        `);
      }
    }
  }
}
