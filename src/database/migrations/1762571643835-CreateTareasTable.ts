import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTareasTable1762571643835 implements MigrationInterface {
  name = 'CreateTareasTable1762571643835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const table = await queryRunner.getTable('tareas');

    // Create enum for tarea estado
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "tarea_estado_enum" AS ENUM ('pendiente', 'en_progreso', 'completada', 'cancelada');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create enum for tarea prioridad
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "tarea_prioridad_enum" AS ENUM ('baja', 'media', 'alta', 'urgente');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    if (!table) {
      // Create tareas table if it doesn't exist
      await queryRunner.query(`
        CREATE TABLE "tareas" (
          "id" uuid NOT NULL DEFAULT gen_random_uuid(),
          "obra_id" uuid NOT NULL,
          "usuario_id" integer NOT NULL,
          "asignado_a_id" integer NOT NULL,
          "titulo" character varying NOT NULL,
          "descripcion" TEXT,
          "estado" tarea_estado_enum NOT NULL DEFAULT 'pendiente',
          "prioridad" tarea_prioridad_enum NOT NULL DEFAULT 'media',
          "avance_porcentaje" NUMERIC(5,2),
          "fecha_limite" DATE,
          "fecha_inicio" DATE,
          "fecha_fin" DATE,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "PK_tareas" PRIMARY KEY ("id")
        )
      `);
    } else {
      // Table exists, check and add missing columns
      const usuarioIdColumn = table.findColumnByName('usuario_id');
      if (!usuarioIdColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "usuario_id" integer`,
        );
      }

      const asignadoAIdColumn = table.findColumnByName('asignado_a_id');
      if (!asignadoAIdColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "asignado_a_id" integer NOT NULL DEFAULT 1`,
        );
        // Update existing rows to use usuario_id as default
        await queryRunner.query(
          `UPDATE "tareas" SET "asignado_a_id" = "usuario_id" WHERE "asignado_a_id" IS NULL`,
        );
        // Remove default after updating
        await queryRunner.query(
          `ALTER TABLE "tareas" ALTER COLUMN "asignado_a_id" DROP DEFAULT`,
        );
      }

      const tituloColumn = table.findColumnByName('titulo');
      if (!tituloColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "titulo" character varying NOT NULL DEFAULT ''`,
        );
      }

      const descripcionColumn = table.findColumnByName('descripcion');
      if (!descripcionColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "descripcion" TEXT`,
        );
      }

      const estadoColumn = table.findColumnByName('estado');
      if (!estadoColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "estado" tarea_estado_enum NOT NULL DEFAULT 'pendiente'`,
        );
      }

      const prioridadColumn = table.findColumnByName('prioridad');
      if (!prioridadColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "prioridad" tarea_prioridad_enum NOT NULL DEFAULT 'media'`,
        );
      }

      const fechaLimiteColumn = table.findColumnByName('fecha_limite');
      if (!fechaLimiteColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "fecha_limite" DATE`,
        );
      }

      const fechaInicioColumn = table.findColumnByName('fecha_inicio');
      if (!fechaInicioColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "fecha_inicio" DATE`,
        );
      }

      const fechaFinColumn = table.findColumnByName('fecha_fin');
      if (!fechaFinColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "fecha_fin" DATE`,
        );
      }

      const updatedAtColumn = table.findColumnByName('updated_at');
      if (!updatedAtColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
        );
      }

      const avancePorcentajeColumn = table.findColumnByName('avance_porcentaje');
      if (!avancePorcentajeColumn) {
        await queryRunner.query(
          `ALTER TABLE "tareas" ADD COLUMN "avance_porcentaje" NUMERIC(5,2)`,
        );
      }
    }

    // Refresh table reference after potential column additions
    const updatedTable = await queryRunner.getTable('tareas');

    // Create indexes - verify columns exist first
    if (updatedTable?.findColumnByName('usuario_id')) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_tareas_usuario_id" ON "tareas" ("usuario_id")`,
      );
    }

    if (updatedTable?.findColumnByName('asignado_a_id')) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_tareas_asignado_a_id" ON "tareas" ("asignado_a_id")`,
      );
    }

    if (updatedTable?.findColumnByName('obra_id')) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_tareas_obra_id" ON "tareas" ("obra_id")`,
      );
    }

    if (updatedTable?.findColumnByName('estado')) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_tareas_estado" ON "tareas" ("estado")`,
      );
    }

    if (updatedTable?.findColumnByName('prioridad')) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_tareas_prioridad" ON "tareas" ("prioridad")`,
      );
    }

    if (updatedTable?.findColumnByName('fecha_limite')) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS "IDX_tareas_fecha_limite" ON "tareas" ("fecha_limite")`,
      );
    }

    // Add foreign keys (will fail if they already exist, but that's okay)
    try {
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'FK_tareas_obra'
          ) THEN
            ALTER TABLE "tareas" 
            ADD CONSTRAINT "FK_tareas_obra" 
            FOREIGN KEY ("obra_id") 
            REFERENCES "obras"("id") 
            ON DELETE CASCADE;
          END IF;
        END $$;
      `);
    } catch {
      // Constraint might already exist, continue
    }

    try {
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'FK_tareas_usuario'
          ) THEN
            ALTER TABLE "tareas" 
            ADD CONSTRAINT "FK_tareas_usuario" 
            FOREIGN KEY ("usuario_id") 
            REFERENCES "user"("id") 
            ON DELETE CASCADE;
          END IF;
        END $$;
      `);
    } catch {
      // Constraint might already exist, continue
    }

    try {
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'FK_tareas_asignado_a'
          ) THEN
            ALTER TABLE "tareas" 
            ADD CONSTRAINT "FK_tareas_asignado_a" 
            FOREIGN KEY ("asignado_a_id") 
            REFERENCES "user"("id") 
            ON DELETE CASCADE;
          END IF;
        END $$;
      `);
    } catch {
      // Constraint might already exist, continue
    }

    // Create trigger for updated_at
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_tareas_updated_at ON "tareas";
      CREATE TRIGGER update_tareas_updated_at
      BEFORE UPDATE ON "tareas"
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "tareas" DROP CONSTRAINT IF EXISTS "FK_tareas_usuario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tareas" DROP CONSTRAINT IF EXISTS "FK_tareas_obra"`,
    );

    // Drop triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_tareas_updated_at ON "tareas"`,
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tareas_fecha_limite"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tareas_prioridad"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tareas_estado"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tareas_usuario_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tareas_obra_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "tareas"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "tarea_prioridad_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tarea_estado_enum"`);
  }
}
