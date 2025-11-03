import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIngenieriaModules1730581234567
  implements MigrationInterface
{
  name = 'CreateIngenieriaModules1730581234567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Actualizar tabla role con nuevas columnas
    await queryRunner.query(
      `ALTER TABLE "role" ADD "descripcion" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    // Insertar nuevos roles para IngenierIA
    await queryRunner.query(`
      INSERT INTO "role" ("id", "name", "descripcion") VALUES
      (3, 'Admin General', 'Administrador general del sistema IngenierIA'),
      (4, 'Admin Obra', 'Administrador de una obra específica'),
      (5, 'Encargado de Área', 'Responsable de un área dentro de la obra'),
      (6, 'Obrero', 'Trabajador operativo de la obra'),
      (7, 'SST', 'Responsable de Seguridad y Salud en el Trabajo'),
      (8, 'Compras', 'Encargado de compras y suministros'),
      (9, 'RRHH', 'Recursos Humanos'),
      (10, 'Consultor', 'Consultor externo del proyecto')
      ON CONFLICT ("id") DO NOTHING;
    `);

    // Crear tabla obra
    await queryRunner.query(`
      CREATE TABLE "obra" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying NOT NULL,
        "direccion" character varying NOT NULL,
        "administrador_id" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_obra" PRIMARY KEY ("id")
      )
    `);

    // Crear tabla obra_usuario (relación User-Obra-Role)
    await queryRunner.query(`
      CREATE TABLE "obra_usuario" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" integer NOT NULL,
        "obra_id" uuid NOT NULL,
        "role_id" integer NOT NULL,
        "fechaAsignacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_obra_usuario" PRIMARY KEY ("id")
      )
    `);

    // Crear índice compuesto para obra_usuario
    await queryRunner.query(`
      CREATE INDEX "IDX_obra_usuario_user_obra_role" 
      ON "obra_usuario" ("user_id", "obra_id", "role_id")
    `);

    // Foreign keys para obra
    await queryRunner.query(`
      ALTER TABLE "obra" 
      ADD CONSTRAINT "FK_obra_administrador" 
      FOREIGN KEY ("administrador_id") 
      REFERENCES "user"("id") 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION
    `);

    // Foreign keys para obra_usuario
    await queryRunner.query(`
      ALTER TABLE "obra_usuario" 
      ADD CONSTRAINT "FK_obra_usuario_user" 
      FOREIGN KEY ("user_id") 
      REFERENCES "user"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "obra_usuario" 
      ADD CONSTRAINT "FK_obra_usuario_obra" 
      FOREIGN KEY ("obra_id") 
      REFERENCES "obra"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "obra_usuario" 
      ADD CONSTRAINT "FK_obra_usuario_role" 
      FOREIGN KEY ("role_id") 
      REFERENCES "role"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys de obra_usuario
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" DROP CONSTRAINT "FK_obra_usuario_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" DROP CONSTRAINT "FK_obra_usuario_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" DROP CONSTRAINT "FK_obra_usuario_user"`,
    );

    // Eliminar foreign key de obra
    await queryRunner.query(
      `ALTER TABLE "obra" DROP CONSTRAINT "FK_obra_administrador"`,
    );

    // Eliminar índice
    await queryRunner.query(
      `DROP INDEX "public"."IDX_obra_usuario_user_obra_role"`,
    );

    // Eliminar tablas
    await queryRunner.query(`DROP TABLE "obra_usuario"`);
    await queryRunner.query(`DROP TABLE "obra"`);

    // Eliminar roles de IngenierIA
    await queryRunner.query(
      `DELETE FROM "role" WHERE "id" >= 3 AND "id" <= 10`,
    );

    // Eliminar columnas añadidas a role
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "descripcion"`);
  }
}
