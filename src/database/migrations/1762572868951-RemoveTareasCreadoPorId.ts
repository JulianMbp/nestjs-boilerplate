import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTareasCreadoPorId1762572868951
  implements MigrationInterface
{
  name = 'RemoveTareasCreadoPorId1762572868951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('tareas');

    if (table) {
      const creadoPorIdColumn = table.findColumnByName('creado_por_id');

      if (creadoPorIdColumn) {
        // Find and drop foreign key constraints related to creado_por_id
        const foreignKeys = table.foreignKeys.filter((fk) =>
          fk.columnNames.includes('creado_por_id'),
        );

        for (const fk of foreignKeys) {
          await queryRunner.query(
            `ALTER TABLE "tareas" DROP CONSTRAINT IF EXISTS "${fk.name}"`,
          );
        }

        // Drop index if it exists
        const indexes = table.indices.filter((idx) =>
          idx.columnNames.includes('creado_por_id'),
        );

        for (const index of indexes) {
          await queryRunner.query(`DROP INDEX IF EXISTS "${index.name}"`);
        }

        // Drop the column (this will also drop any constraints/indexes automatically)
        await queryRunner.query(
          `ALTER TABLE "tareas" DROP COLUMN IF EXISTS "creado_por_id"`,
        );
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    // We don't need to restore this column as it shouldn't exist
    // This migration is idempotent and only removes the column if it exists
  }
}
