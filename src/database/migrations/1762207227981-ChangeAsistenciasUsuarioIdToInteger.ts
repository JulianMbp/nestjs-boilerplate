import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAsistenciasUsuarioIdToInteger1762207227981
  implements MigrationInterface
{
  name = 'ChangeAsistenciasUsuarioIdToInteger1762207227981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_866d44e39ba259695090716fc79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "UQ_3270a99705e5b604a1feec9c453"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_866d44e39ba259695090716fc7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP COLUMN "usuario_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD "usuario_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_866d44e39ba259695090716fc7" ON "asistencias" ("usuario_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "UQ_3270a99705e5b604a1feec9c453" UNIQUE ("obra_id", "usuario_id", "fecha")`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_866d44e39ba259695090716fc79" FOREIGN KEY ("usuario_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_866d44e39ba259695090716fc79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "UQ_3270a99705e5b604a1feec9c453"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_866d44e39ba259695090716fc7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP COLUMN "usuario_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD "usuario_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_866d44e39ba259695090716fc7" ON "asistencias" ("usuario_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "UQ_3270a99705e5b604a1feec9c453" UNIQUE ("obra_id", "usuario_id", "fecha")`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_866d44e39ba259695090716fc79" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
