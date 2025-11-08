import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTareasAsignadoAId1762572476949 implements MigrationInterface {
  name = 'FixTareasAsignadoAId1762572476949';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('tareas');

    if (table) {
      const asignadoAIdColumn = table.findColumnByName('asignado_a_id');

      if (asignadoAIdColumn) {
        // Column exists, update NULL values first
        await queryRunner.query(`
          UPDATE "tareas" 
          SET "asignado_a_id" = "usuario_id" 
          WHERE "asignado_a_id" IS NULL
        `);

        // Check if it's nullable and make it NOT NULL if needed
        const isNullable = asignadoAIdColumn.isNullable;
        if (isNullable) {
          await queryRunner.query(`
            ALTER TABLE "tareas" 
            ALTER COLUMN "asignado_a_id" SET NOT NULL
          `);
        }
      } else {
        // Column doesn't exist, add it
        await queryRunner.query(`
          ALTER TABLE "tareas" 
          ADD COLUMN "asignado_a_id" integer
        `);

        // Update existing rows
        await queryRunner.query(`
          UPDATE "tareas" 
          SET "asignado_a_id" = "usuario_id" 
          WHERE "asignado_a_id" IS NULL
        `);

        // Make it NOT NULL
        await queryRunner.query(`
          ALTER TABLE "tareas" 
          ALTER COLUMN "asignado_a_id" SET NOT NULL
        `);
      }

      // Add index if it doesn't exist
      const indexes = table.indices || [];
      const hasAsignadoAIndex = indexes.some(
        (idx) => idx.columnNames && idx.columnNames.includes('asignado_a_id'),
      );

      if (!hasAsignadoAIndex) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS "IDX_tareas_asignado_a_id" 
          ON "tareas" ("asignado_a_id")
        `);
      }

      // Add foreign key if it doesn't exist
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
        // Constraint might already exist
      }

      // Add avance_porcentaje if it doesn't exist
      const avancePorcentajeColumn =
        table.findColumnByName('avance_porcentaje');
      if (!avancePorcentajeColumn) {
        await queryRunner.query(`
          ALTER TABLE "tareas" 
          ADD COLUMN "avance_porcentaje" NUMERIC(5,2)
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration is safe to rollback by dropping the column
    // but we'll leave it as it's a data migration
    const table = await queryRunner.getTable('tareas');
    if (table) {
      try {
        await queryRunner.query(`
          ALTER TABLE "tareas" 
          DROP CONSTRAINT IF EXISTS "FK_tareas_asignado_a"
        `);
      } catch {
        // Ignore if doesn't exist
      }

      try {
        await queryRunner.query(`
          DROP INDEX IF EXISTS "IDX_tareas_asignado_a_id"
        `);
      } catch {
        // Ignore if doesn't exist
      }
    }
  }
}
