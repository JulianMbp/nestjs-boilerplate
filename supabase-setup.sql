-- =====================================================
-- SCRIPT DE CONFIGURACIÓN DE SUPABASE
-- Multi-tenant con RLS para IngenierIA
-- =====================================================

-- 1. Crear tabla de usuarios (sincronizada con PostgreSQL)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla de obras (proyectos de construcción)
CREATE TABLE IF NOT EXISTS public.obras (
  id UUID PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla de relación usuario-obra (multi-tenant)
CREATE TABLE IF NOT EXISTS public.obra_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  role_name VARCHAR(100),
  fecha_asignacion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, obra_id)
);

-- 4. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_obra_usuario_user_id ON public.obra_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_obra_usuario_obra_id ON public.obra_usuario(obra_id);
CREATE INDEX IF NOT EXISTS idx_obra_usuario_composite ON public.obra_usuario(user_id, obra_id);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obra_usuario ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para users
-- Los usuarios pueden ver su propio registro
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
CREATE POLICY "Users can view own record" 
  ON public.users 
  FOR SELECT 
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'user_uuid');

-- 7. Políticas RLS para obras
-- Los usuarios solo pueden ver obras a las que tienen acceso
DROP POLICY IF EXISTS "Users can view assigned obras" ON public.obras;
CREATE POLICY "Users can view assigned obras" 
  ON public.obras 
  FOR SELECT 
  USING (
    id IN (
      SELECT obra_id 
      FROM public.obra_usuario 
      WHERE user_id::text = current_setting('request.jwt.claims', true)::json->>'user_uuid'
    )
  );

-- 8. Políticas RLS para obra_usuario
-- Los usuarios solo pueden ver sus propias asignaciones
DROP POLICY IF EXISTS "Users can view own assignments" ON public.obra_usuario;
CREATE POLICY "Users can view own assignments" 
  ON public.obra_usuario 
  FOR SELECT 
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_uuid');

-- 9. Insertar los 11 usuarios de IngenierIA
INSERT INTO public.users (id, email) VALUES
  ('9aa0276b-9779-4202-a71c-4fd48440b309', 'admin.general@ingenieria.com'),
  ('2bb1387c-a88a-5313-b82d-5fe59551c41a', 'admin.obra1@ingenieria.com'),
  ('3cc2498d-b99b-6424-c93e-6af60662d52b', 'ingeniero.obra1@ingenieria.com'),
  ('4dd359ae-caac-7535-da4f-7bf71773e63c', 'maestro.obra1@ingenieria.com'),
  ('5ee46abf-dbbd-8646-eb5f-8cb82884f74d', 'admin.obra2@ingenieria.com'),
  ('6ff57bc0-ecce-9757-fc6a-9db93995f85e', 'ingeniero.obra2@ingenieria.com'),
  ('7ff68cd1-fddf-a868-fd7b-a0eaa0a6f96f', 'maestro.obra2@ingenieria.com'),
  ('8aa79de2-fee0-b979-ae8c-b1fbb1b7f07f', 'admin.obra3@ingenieria.com'),
  ('9bb8aef3-aff1-ca8a-bf9d-c2fcc2c8f18a', 'ingeniero.obra3@ingenieria.com'),
  ('a0c9bf04-bff2-db9b-cf0e-d3fdd3d9f29b', 'maestro.obra3@ingenieria.com'),
  ('b1dacf15-cff3-ec0c-df1f-e4fee4e0f30c', 'ayudante.general@ingenieria.com')
ON CONFLICT (email) DO NOTHING;

-- 10. Insertar las 4 obras de prueba
INSERT INTO public.obras (id, nombre, direccion) VALUES
  ('c13e4b9e-41f1-4273-a18e-c26699edab61', 'Edificio Central Plaza', 'Calle 100 #15-20, Bogotá D.C.'),
  ('b46ecadd-3277-4fc9-a62e-d48e2fbf491e', 'Torre Empresarial Norte', 'Av. El Poblado #43-50, Medellín'),
  ('887f3d9d-fc67-455e-9e17-824275f8c763', 'Conjunto Residencial Alameda', 'Calle 170 #54-32, Bogotá D.C.'),
  ('759199e3-7d40-44d4-9083-928ff05c219e', 'Centro Comercial Portal del Sur', 'Autopista Sur Km 5, Bogotá D.C.')
ON CONFLICT (id) DO NOTHING;

-- 11. Asignar usuarios a obras (ejemplos de multi-tenancy)
INSERT INTO public.obra_usuario (user_id, obra_id, role_name) VALUES
  -- Admin General tiene acceso a TODAS las obras
  ('9aa0276b-9779-4202-a71c-4fd48440b309', 'c13e4b9e-41f1-4273-a18e-c26699edab61', 'Admin General'),
  ('9aa0276b-9779-4202-a71c-4fd48440b309', 'b46ecadd-3277-4fc9-a62e-d48e2fbf491e', 'Admin General'),
  ('9aa0276b-9779-4202-a71c-4fd48440b309', '887f3d9d-fc67-455e-9e17-824275f8c763', 'Admin General'),
  ('9aa0276b-9779-4202-a71c-4fd48440b309', '759199e3-7d40-44d4-9083-928ff05c219e', 'Admin General'),
  
  -- Obra 1: Edificio Central Plaza
  ('2bb1387c-a88a-5313-b82d-5fe59551c41a', 'c13e4b9e-41f1-4273-a18e-c26699edab61', 'Admin Obra'),
  ('3cc2498d-b99b-6424-c93e-6af60662d52b', 'c13e4b9e-41f1-4273-a18e-c26699edab61', 'Ingeniero Obra'),
  ('4dd359ae-caac-7535-da4f-7bf71773e63c', 'c13e4b9e-41f1-4273-a18e-c26699edab61', 'Maestro Obra'),
  
  -- Obra 2: Torre Empresarial Norte
  ('5ee46abf-dbbd-8646-eb5f-8cb82884f74d', 'b46ecadd-3277-4fc9-a62e-d48e2fbf491e', 'Admin Obra'),
  ('6ff57bc0-ecce-9757-fc6a-9db93995f85e', 'b46ecadd-3277-4fc9-a62e-d48e2fbf491e', 'Ingeniero Obra'),
  ('7ff68cd1-fddf-a868-fd7b-a0eaa0a6f96f', 'b46ecadd-3277-4fc9-a62e-d48e2fbf491e', 'Maestro Obra'),
  
  -- Obra 3: Conjunto Residencial Alameda
  ('8aa79de2-fee0-b979-ae8c-b1fbb1b7f07f', '887f3d9d-fc67-455e-9e17-824275f8c763', 'Admin Obra'),
  ('9bb8aef3-aff1-ca8a-bf9d-c2fcc2c8f18a', '887f3d9d-fc67-455e-9e17-824275f8c763', 'Ingeniero Obra'),
  ('a0c9bf04-bff2-db9b-cf0e-d3fdd3d9f29b', '887f3d9d-fc67-455e-9e17-824275f8c763', 'Maestro Obra'),
  
  -- Ayudante general solo tiene acceso a Obra 1
  ('b1dacf15-cff3-ec0c-df1f-e4fee4e0f30c', 'c13e4b9e-41f1-4273-a18e-c26699edab61', 'Ayudante')
ON CONFLICT (user_id, obra_id) DO NOTHING;

-- 12. Verificación final
SELECT 
  u.email,
  COUNT(ou.obra_id) as obras_asignadas
FROM public.users u
LEFT JOIN public.obra_usuario ou ON u.id = ou.user_id
GROUP BY u.email
ORDER BY u.email;
