import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixObraUserIdTypes1762203838359 implements MigrationInterface {
  name = 'FixObraUserIdTypes1762203838359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_asistencias_usuario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_asistencias_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" DROP CONSTRAINT "FK_bitacoras_usuario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" DROP CONSTRAINT "FK_bitacoras_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" DROP CONSTRAINT "FK_documentos_usuario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" DROP CONSTRAINT "FK_documentos_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" DROP CONSTRAINT "FK_obra_usuario_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" DROP CONSTRAINT "FK_obra_usuario_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_user_profiles_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP CONSTRAINT "FK_usuarios_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_activity_logs_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_activity_logs_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "materiales" DROP CONSTRAINT "FK_materiales_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" DROP CONSTRAINT "FK_presupuestos_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obras" DROP CONSTRAINT "FK_obras_admin"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_asistencias_obra_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_asistencias_usuario_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_asistencias_fecha"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bitacoras_obra_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bitacoras_usuario_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bitacoras_fecha"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_documentos_obra_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_documentos_usuario_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_obra_usuario_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_obra_usuario_obra_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_profiles_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_usuarios_email"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_usuarios_role"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_activity_logs_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_activity_logs_obra_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_activity_logs_created_at"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_materiales_obra_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_presupuestos_obra_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_obras_admin_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_obras_estado"`);
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" DROP CONSTRAINT "UQ_obra_usuario_user_obra"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ALTER COLUMN "fecha" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ALTER COLUMN "fecha" SET DEFAULT ('now'::text)::date`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."asistencia_estado_enum" RENAME TO "asistencia_estado_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."asistencias_estado_enum" AS ENUM('presente', 'ausente', 'justificado')`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ALTER COLUMN "estado" TYPE "public"."asistencias_estado_enum" USING "estado"::"text"::"public"."asistencias_estado_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."asistencia_estado_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "descripcion" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "avance_porcentaje" TYPE numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "avance_porcentaje" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "archivos" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "fecha" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "fecha" SET DEFAULT ('now'::text)::date`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ALTER COLUMN "tipo" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ALTER COLUMN "nombre" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ALTER COLUMN "url" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ALTER COLUMN "version" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ALTER COLUMN "version" SET DEFAULT '1.0'`,
    );
    await queryRunner.query(`ALTER TABLE "obra_usuario" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" ADD "user_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ALTER COLUMN "metadata" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ALTER COLUMN "provider" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ALTER COLUMN "metadata" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "cantidad" TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "cantidad" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "valor_unitario" TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "valor_unitario" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "valor_ejecutado" TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "valor_ejecutado" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "obras" ALTER COLUMN "estado" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "obras" DROP COLUMN "admin_id"`);
    await queryRunner.query(`ALTER TABLE "obras" ADD "admin_id" integer`);
    await queryRunner.query(
      `CREATE INDEX "IDX_4355bf239318b33ebe727c2740" ON "asistencias" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_866d44e39ba259695090716fc7" ON "asistencias" ("usuario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d065fe41e31a5a38eabcbb00f6" ON "asistencias" ("fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57355b70c849edb7eefd6f4130" ON "bitacoras" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_876acd42272c395392ba2ac6e2" ON "bitacoras" ("usuario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_afa1c694c9c05c9402ca1ba05a" ON "bitacoras" ("fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae2c6b223c0e340b4f3d83bd85" ON "documentos" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e9b11350fa9df14f0b56cdf02" ON "documentos" ("usuario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3154b6b06375dd236aa601ff95" ON "documentos" ("nombre") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_98a927883c8e33043823bce2ab" ON "obra_usuario" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_251b5eeaf2656f18d9a3d5e77f" ON "obra_usuario" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ca9503d77ae39b4b5a6cc3ba8" ON "user_profiles" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_446adfc18b35418aac32ae0b7b" ON "usuarios" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_933f1f766daaa16d3848d186a5" ON "usuarios" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d54f841fa5478e4734590d4403" ON "activity_logs" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_009a0739731f059472e6d2229a" ON "activity_logs" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1fa31efc2a0bc0b517b9f7225d" ON "activity_logs" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ff436d2fff6ccd912f338b51e" ON "materiales" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46b27873be4aeaff38f8feb130" ON "presupuestos" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f165ae1fed43e6931ef588c7b0" ON "obras" ("estado") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64d05b7b12862047b280d19124" ON "obras" ("admin_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "UQ_3270a99705e5b604a1feec9c453" UNIQUE ("obra_id", "usuario_id", "fecha")`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_4355bf239318b33ebe727c27408" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_866d44e39ba259695090716fc79" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ADD CONSTRAINT "FK_57355b70c849edb7eefd6f41309" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ADD CONSTRAINT "FK_876acd42272c395392ba2ac6e2b" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ADD CONSTRAINT "FK_ae2c6b223c0e340b4f3d83bd854" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ADD CONSTRAINT "FK_8e9b11350fa9df14f0b56cdf02a" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" ADD CONSTRAINT "FK_98a927883c8e33043823bce2ab2" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" ADD CONSTRAINT "FK_251b5eeaf2656f18d9a3d5e77fb" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD CONSTRAINT "FK_933f1f766daaa16d3848d186a59" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_d54f841fa5478e4734590d44036" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_009a0739731f059472e6d2229a5" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "materiales" ADD CONSTRAINT "FK_2ff436d2fff6ccd912f338b51ed" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ADD CONSTRAINT "FK_46b27873be4aeaff38f8feb130d" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "obras" ADD CONSTRAINT "FK_64d05b7b12862047b280d19124f" FOREIGN KEY ("admin_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "obras" DROP CONSTRAINT "FK_64d05b7b12862047b280d19124f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" DROP CONSTRAINT "FK_46b27873be4aeaff38f8feb130d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "materiales" DROP CONSTRAINT "FK_2ff436d2fff6ccd912f338b51ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_009a0739731f059472e6d2229a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_d54f841fa5478e4734590d44036"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP CONSTRAINT "FK_933f1f766daaa16d3848d186a59"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" DROP CONSTRAINT "FK_251b5eeaf2656f18d9a3d5e77fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" DROP CONSTRAINT "FK_98a927883c8e33043823bce2ab2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" DROP CONSTRAINT "FK_8e9b11350fa9df14f0b56cdf02a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" DROP CONSTRAINT "FK_ae2c6b223c0e340b4f3d83bd854"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" DROP CONSTRAINT "FK_876acd42272c395392ba2ac6e2b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" DROP CONSTRAINT "FK_57355b70c849edb7eefd6f41309"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_866d44e39ba259695090716fc79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_4355bf239318b33ebe727c27408"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "UQ_3270a99705e5b604a1feec9c453"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64d05b7b12862047b280d19124"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f165ae1fed43e6931ef588c7b0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46b27873be4aeaff38f8feb130"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ff436d2fff6ccd912f338b51e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1fa31efc2a0bc0b517b9f7225d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_009a0739731f059472e6d2229a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d54f841fa5478e4734590d4403"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_933f1f766daaa16d3848d186a5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_446adfc18b35418aac32ae0b7b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6ca9503d77ae39b4b5a6cc3ba8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_251b5eeaf2656f18d9a3d5e77f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_98a927883c8e33043823bce2ab"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3154b6b06375dd236aa601ff95"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8e9b11350fa9df14f0b56cdf02"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae2c6b223c0e340b4f3d83bd85"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_afa1c694c9c05c9402ca1ba05a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_876acd42272c395392ba2ac6e2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57355b70c849edb7eefd6f4130"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d065fe41e31a5a38eabcbb00f6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_866d44e39ba259695090716fc7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4355bf239318b33ebe727c2740"`,
    );
    await queryRunner.query(`ALTER TABLE "obras" DROP COLUMN "admin_id"`);
    await queryRunner.query(`ALTER TABLE "obras" ADD "admin_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "obras" ALTER COLUMN "estado" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "valor_ejecutado" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "valor_ejecutado" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "valor_unitario" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "valor_unitario" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "cantidad" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ALTER COLUMN "cantidad" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ALTER COLUMN "metadata" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ALTER COLUMN "provider" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ALTER COLUMN "metadata" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "obra_usuario" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" ADD "user_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ALTER COLUMN "version" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ALTER COLUMN "version" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ALTER COLUMN "url" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ALTER COLUMN "nombre" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ALTER COLUMN "tipo" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "fecha" SET DEFAULT CURRENT_DATE`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "fecha" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "archivos" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "avance_porcentaje" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "avance_porcentaje" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ALTER COLUMN "descripcion" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."asistencia_estado_enum_old" AS ENUM('presente', 'ausente', 'justificado')`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ALTER COLUMN "estado" TYPE "public"."asistencia_estado_enum_old" USING "estado"::"text"::"public"."asistencia_estado_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."asistencias_estado_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."asistencia_estado_enum_old" RENAME TO "asistencia_estado_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ALTER COLUMN "fecha" SET DEFAULT CURRENT_DATE`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ALTER COLUMN "fecha" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" ADD CONSTRAINT "UQ_obra_usuario_user_obra" UNIQUE ("user_id", "obra_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_obras_estado" ON "obras" ("estado") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_obras_admin_id" ON "obras" ("admin_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_presupuestos_obra_id" ON "presupuestos" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_materiales_obra_id" ON "materiales" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_logs_created_at" ON "activity_logs" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_logs_obra_id" ON "activity_logs" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_logs_user_id" ON "activity_logs" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_usuarios_role" ON "usuarios" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_usuarios_email" ON "usuarios" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_profiles_user_id" ON "user_profiles" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_obra_usuario_obra_id" ON "obra_usuario" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_obra_usuario_user_id" ON "obra_usuario" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_documentos_usuario_id" ON "documentos" ("usuario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_documentos_obra_id" ON "documentos" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bitacoras_fecha" ON "bitacoras" ("fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bitacoras_usuario_id" ON "bitacoras" ("usuario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bitacoras_obra_id" ON "bitacoras" ("obra_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_asistencias_fecha" ON "asistencias" ("fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_asistencias_usuario_id" ON "asistencias" ("usuario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_asistencias_obra_id" ON "asistencias" ("obra_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "obras" ADD CONSTRAINT "FK_obras_admin" FOREIGN KEY ("admin_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "presupuestos" ADD CONSTRAINT "FK_presupuestos_obra" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "materiales" ADD CONSTRAINT "FK_materiales_obra" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_activity_logs_user" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_activity_logs_obra" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD CONSTRAINT "FK_usuarios_role" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_user_profiles_user" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" ADD CONSTRAINT "FK_obra_usuario_user" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "obra_usuario" ADD CONSTRAINT "FK_obra_usuario_obra" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ADD CONSTRAINT "FK_documentos_obra" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documentos" ADD CONSTRAINT "FK_documentos_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ADD CONSTRAINT "FK_bitacoras_obra" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bitacoras" ADD CONSTRAINT "FK_bitacoras_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_asistencias_obra" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_asistencias_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
