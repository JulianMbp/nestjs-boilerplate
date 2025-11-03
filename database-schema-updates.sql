-- IngenierIA Backend - Database Schema Updates
-- Run this after TypeORM generates migrations

-- Ensure unique constraint for asistencias
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'UQ_asistencias_obra_usuario_fecha'
    ) THEN
        ALTER TABLE asistencias 
        ADD CONSTRAINT UQ_asistencias_obra_usuario_fecha 
        UNIQUE (obra_id, usuario_id, fecha);
    END IF;
END
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_materiales_obra_id ON materiales(obra_id);
CREATE INDEX IF NOT EXISTS idx_bitacoras_obra_id ON bitacoras(obra_id);
CREATE INDEX IF NOT EXISTS idx_bitacoras_usuario_id ON bitacoras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_bitacoras_fecha ON bitacoras(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencias_obra_id ON asistencias(obra_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_usuario_id ON asistencias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_presupuestos_obra_id ON presupuestos(obra_id);
CREATE INDEX IF NOT EXISTS idx_documentos_obra_id ON documentos(obra_id);
CREATE INDEX IF NOT EXISTS idx_documentos_usuario_id ON documentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_documentos_nombre ON documentos(nombre);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_obra_id ON activity_logs(obra_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Comments for documentation
COMMENT ON TABLE materiales IS 'Construction materials inventory per obra';
COMMENT ON TABLE bitacoras IS 'Work log entries with progress tracking';
COMMENT ON TABLE asistencias IS 'Employee attendance records';
COMMENT ON TABLE presupuestos IS 'Budget items and financial planning';
COMMENT ON TABLE documentos IS 'Document management with versioning';
COMMENT ON TABLE activity_logs IS 'System-wide activity audit log';

-- Verify all tables exist
DO $$
DECLARE
    missing_tables TEXT[];
BEGIN
    SELECT ARRAY_AGG(table_name)
    INTO missing_tables
    FROM (
        SELECT unnest(ARRAY['materiales', 'bitacoras', 'asistencias', 
                             'presupuestos', 'documentos', 'activity_logs']) AS table_name
    ) t
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name
    );

    IF missing_tables IS NOT NULL THEN
        RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
        RAISE NOTICE 'Please run TypeORM migrations first: npm run migration:run';
    ELSE
        RAISE NOTICE 'All IngenierIA modules tables are present ✓';
    END IF;
END
$$;
