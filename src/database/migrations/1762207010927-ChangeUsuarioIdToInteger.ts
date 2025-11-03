import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUsuarioIdToInteger1762207010927
  implements MigrationInterface
{
  name = 'ChangeUsuarioIdToInteger1762207010927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bitacoras" DROP CONSTRAINT "FK_876acd42272c395392ba2ac6e2b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_876acd42272c395392ba2ac6e2"`,
    );
    await queryRunner.query(`ALTER TABLE "bitacoras" DROP COLUMN "usuario_id"`);
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ADD "usuario_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_876acd42272c395392ba2ac6e2" ON "bitacoras" ("usuario_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ADD CONSTRAINT "FK_876acd42272c395392ba2ac6e2b" FOREIGN KEY ("usuario_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bitacoras" DROP CONSTRAINT "FK_876acd42272c395392ba2ac6e2b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_876acd42272c395392ba2ac6e2"`,
    );
    await queryRunner.query(`ALTER TABLE "bitacoras" DROP COLUMN "usuario_id"`);
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ADD "usuario_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_876acd42272c395392ba2ac6e2" ON "bitacoras" ("usuario_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ADD CONSTRAINT "FK_876acd42272c395392ba2ac6e2b" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
