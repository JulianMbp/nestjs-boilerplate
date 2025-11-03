import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeIngenieriaSchema1762194778808
  implements MigrationInterface
{
  name = 'NormalizeIngenieriaSchema1762194778808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // 2. Create enum for asistencia estado
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "asistencia_estado_enum" AS ENUM ('presente', 'ausente', 'justificado');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. Drop old obra and obra_usuario tables if they exist (to recreate with correct schema)
    await queryRunner.query(`DROP TABLE IF EXISTS "obra_usuario" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "obra" CASCADE`);

    // 4. Create usuarios table (unified user table with UUID)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "usuarios" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "first_name" character varying,
        "last_name" character varying,
        "role_id" integer,
        "provider" character varying DEFAULT 'email',
        "social_id" character varying,
        "hash" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_usuarios" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_usuarios_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_usuarios_email" ON "usuarios" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_usuarios_role" ON "usuarios" ("role_id")`,
    );

    // 5. Create user_profiles table (UUID FK to usuarios)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "email" character varying NOT NULL,
        "first_name" character varying,
        "last_name" character varying,
        "phone" character varying,
        "avatar_url" character varying,
        "metadata" jsonb DEFAULT '{}'::jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "UQ_user_profiles_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_profiles_user_id" ON "user_profiles" ("user_id")`,
    );

    // 6. Create obras table (UUID PK, admin_id as UUID)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "obras" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "nombre" character varying NOT NULL,
        "direccion" character varying,
        "estado" character varying DEFAULT 'activa',
        "fecha_inicio" DATE,
        "fecha_fin" DATE,
        "admin_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_obras" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_obras_admin_id" ON "obras" ("admin_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_obras_estado" ON "obras" ("estado")`,
    );

    // 7. Create obra_usuario table (user_id and obra_id as UUID)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "obra_usuario" (
        "id" SERIAL,
        "user_id" uuid NOT NULL,
        "obra_id" uuid NOT NULL,
        "role_name" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_obra_usuario" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_obra_usuario_user_obra" UNIQUE ("user_id", "obra_id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_obra_usuario_user_id" ON "obra_usuario" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_obra_usuario_obra_id" ON "obra_usuario" ("obra_id")`,
    );

    // 8. Create materiales table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "materiales" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "obra_id" uuid NOT NULL,
        "nombre" character varying NOT NULL,
        "categoria" character varying,
        "cantidad" NUMERIC,
        "unidad" character varying,
        "proveedor" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_materiales" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_materiales_obra_id" ON "materiales" ("obra_id")`,
    );

    // 9. Create bitacoras table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bitacoras" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "obra_id" uuid NOT NULL,
        "usuario_id" uuid NOT NULL,
        "descripcion" TEXT,
        "avance_porcentaje" NUMERIC,
        "archivos" jsonb DEFAULT '[]'::jsonb,
        "fecha" DATE DEFAULT CURRENT_DATE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bitacoras" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bitacoras_obra_id" ON "bitacoras" ("obra_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bitacoras_usuario_id" ON "bitacoras" ("usuario_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bitacoras_fecha" ON "bitacoras" ("fecha")`,
    );

    // 10. Create asistencias table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "asistencias" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "obra_id" uuid NOT NULL,
        "usuario_id" uuid NOT NULL,
        "fecha" DATE DEFAULT CURRENT_DATE,
        "estado" asistencia_estado_enum NOT NULL,
        "observaciones" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_asistencias" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_asistencias_obra_id" ON "asistencias" ("obra_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_asistencias_usuario_id" ON "asistencias" ("usuario_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_asistencias_fecha" ON "asistencias" ("fecha")`,
    );

    // 11. Create documentos table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "documentos" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "obra_id" uuid NOT NULL,
        "usuario_id" uuid NOT NULL,
        "tipo" character varying,
        "nombre" character varying,
        "url" character varying,
        "version" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documentos" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_documentos_obra_id" ON "documentos" ("obra_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_documentos_usuario_id" ON "documentos" ("usuario_id")`,
    );

    // 12. Create presupuestos table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "presupuestos" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "obra_id" uuid NOT NULL,
        "partida" character varying NOT NULL,
        "unidad" character varying,
        "cantidad" NUMERIC,
        "valor_unitario" NUMERIC,
        "valor_ejecutado" NUMERIC DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_presupuestos" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_presupuestos_obra_id" ON "presupuestos" ("obra_id")`,
    );

    // 13. Create activity_logs table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "obra_id" uuid,
        "action" character varying NOT NULL,
        "description" TEXT,
        "metadata" jsonb DEFAULT '{}'::jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_activity_logs_user_id" ON "activity_logs" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_activity_logs_obra_id" ON "activity_logs" ("obra_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_activity_logs_created_at" ON "activity_logs" ("created_at")`,
    );

    // 14. Add Foreign Keys
    await queryRunner.query(`
      ALTER TABLE "usuarios" 
      ADD CONSTRAINT "FK_usuarios_role" 
      FOREIGN KEY ("role_id") 
      REFERENCES "role"("id") 
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "user_profiles" 
      ADD CONSTRAINT "FK_user_profiles_user" 
      FOREIGN KEY ("user_id") 
      REFERENCES "usuarios"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "obras" 
      ADD CONSTRAINT "FK_obras_admin" 
      FOREIGN KEY ("admin_id") 
      REFERENCES "usuarios"("id") 
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "obra_usuario" 
      ADD CONSTRAINT "FK_obra_usuario_user" 
      FOREIGN KEY ("user_id") 
      REFERENCES "usuarios"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "obra_usuario" 
      ADD CONSTRAINT "FK_obra_usuario_obra" 
      FOREIGN KEY ("obra_id") 
      REFERENCES "obras"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "materiales" 
      ADD CONSTRAINT "FK_materiales_obra" 
      FOREIGN KEY ("obra_id") 
      REFERENCES "obras"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "bitacoras" 
      ADD CONSTRAINT "FK_bitacoras_obra" 
      FOREIGN KEY ("obra_id") 
      REFERENCES "obras"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "bitacoras" 
      ADD CONSTRAINT "FK_bitacoras_usuario" 
      FOREIGN KEY ("usuario_id") 
      REFERENCES "usuarios"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "asistencias" 
      ADD CONSTRAINT "FK_asistencias_obra" 
      FOREIGN KEY ("obra_id") 
      REFERENCES "obras"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "asistencias" 
      ADD CONSTRAINT "FK_asistencias_usuario" 
      FOREIGN KEY ("usuario_id") 
      REFERENCES "usuarios"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "documentos" 
      ADD CONSTRAINT "FK_documentos_obra" 
      FOREIGN KEY ("obra_id") 
      REFERENCES "obras"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "documentos" 
      ADD CONSTRAINT "FK_documentos_usuario" 
      FOREIGN KEY ("usuario_id") 
      REFERENCES "usuarios"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "presupuestos" 
      ADD CONSTRAINT "FK_presupuestos_obra" 
      FOREIGN KEY ("obra_id") 
      REFERENCES "obras"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "activity_logs" 
      ADD CONSTRAINT "FK_activity_logs_user" 
      FOREIGN KEY ("user_id") 
      REFERENCES "usuarios"("id") 
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "activity_logs" 
      ADD CONSTRAINT "FK_activity_logs_obra" 
      FOREIGN KEY ("obra_id") 
      REFERENCES "obras"("id") 
      ON DELETE SET NULL
    `);

    // 15. Create triggers for updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    const tablesWithUpdatedAt = [
      'usuarios',
      'user_profiles',
      'obras',
      'obra_usuario',
      'materiales',
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryRunner.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON "${table}";
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON "${table}"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "FK_activity_logs_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "FK_activity_logs_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" DROP CONSTRAINT IF EXISTS "FK_presupuestos_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" DROP CONSTRAINT IF EXISTS "FK_documentos_usuario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" DROP CONSTRAINT IF EXISTS "FK_documentos_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT IF EXISTS "FK_asistencias_usuario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT IF EXISTS "FK_asistencias_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" DROP CONSTRAINT IF EXISTS "FK_bitacoras_usuario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" DROP CONSTRAINT IF EXISTS "FK_bitacoras_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "materiales" DROP CONSTRAINT IF EXISTS "FK_materiales_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" DROP CONSTRAINT IF EXISTS "FK_obra_usuario_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" DROP CONSTRAINT IF EXISTS "FK_obra_usuario_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obras" DROP CONSTRAINT IF EXISTS "FK_obras_admin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT IF EXISTS "FK_user_profiles_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP CONSTRAINT IF EXISTS "FK_usuarios_role"`,
    );

    // Drop triggers
    const tablesWithUpdatedAt = [
      'usuarios',
      'user_profiles',
      'obras',
      'obra_usuario',
      'materiales',
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryRunner.query(
        `DROP TRIGGER IF EXISTS update_${table}_updated_at ON "${table}"`,
      );
    }

    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "presupuestos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "documentos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "asistencias"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bitacoras"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "materiales"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "obra_usuario"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "obras"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "usuarios"`);

    // Drop enum
    await queryRunner.query(`DROP TYPE IF EXISTS "asistencia_estado_enum"`);
  }
}
