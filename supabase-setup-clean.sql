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

-- Sección 9: Insertar usuarios (UUIDs REALES de Supabase Auth)
INSERT INTO public.users (id, email) VALUES
  ('9aa0276b-9779-4202-a71c-4fd48440b309', 'admin.general@ingenieria.com'),
  ('44122da5-6a3b-4200-826f-17479c824756', 'admin.obra1@ingenieria.com'),
  ('7eed50f3-9c04-44f4-9126-2f0f0ff4b841', 'admin.obra2@ingenieria.com'),
  ('5662d520-2e79-4ac3-9704-5d130777da51', 'compras.1@ingenieria.com'),
  ('4bfb9996-4c1f-421f-a8d6-8c05bde8e3f0', 'consultor.1@ingenieria.com'),
  ('96a89fb4-bcec-4658-92e7-595b524a59a0', 'encargado.area1@ingenieria.com'),
  ('06c6e9ba-6243-4848-b596-ec9224d1c1da', 'encargado.area2@ingenieria.com'),
  ('bbb62ea2-ffc6-4aeb-ba21-a310187b5d2e', 'obrero.1@ingenieria.com'),
  ('3b77715b-6bc3-48b5-859d-029be9a0744c', 'obrero.2@ingenieria.com'),
  ('3f0aac8b-f27b-46e5-8504-c11b153ec6e9', 'rrhh.1@ingenieria.com'),
  ('7f4eabaa-b2a8-42ae-bbb2-aa05f82364ca', 'sst.1@ingenieria.com');

-- 10. Insertar las 4 obras de prueba
INSERT INTO public.obras (id, nombre, direccion) VALUES
  ('c13e4b9e-41f1-4273-a18e-c26699edab61', 'Edificio Central Plaza', 'Calle 100 #15-20, Bogotá D.C.'),
  ('b46ecadd-3277-4fc9-a62e-d48e2fbf491e', 'Torre Empresarial Norte', 'Av. El Poblado #43-50, Medellín'),
  ('887f3d9d-fc67-455e-9e17-824275f8c763', 'Conjunto Residencial Alameda', 'Calle 170 #54-32, Bogotá D.C.'),
  ('759199e3-7d40-44d4-9083-928ff05c219e', 'Centro Comercial Portal del Sur', 'Autopista Sur Km 5, Bogotá D.C.')
ON CONFLICT (id) DO NOTHING;

-- 11. Asignar usuarios a obras (multi-tenancy con UUIDs REALES)
INSERT INTO public.obra_usuario (user_id, obra_id, role_name) VALUES
  -- Admin General tiene acceso a TODAS las obras
  ('9aa0276b-9779-4202-a71c-4fd48440b309', 'c13e4b9e-41f1-4273-a18e-c26699edab61', 'Admin General'),
  ('9aa0276b-9779-4202-a71c-4fd48440b309', 'b46ecadd-3277-4fc9-a62e-d48e2fbf491e', 'Admin General'),
  ('9aa0276b-9779-4202-a71c-4fd48440b309', '887f3d9d-fc67-455e-9e17-824275f8c763', 'Admin General'),
  ('9aa0276b-9779-4202-a71c-4fd48440b309', '759199e3-7d40-44d4-9083-928ff05c219e', 'Admin General'),
  
  -- Obra 1: Edificio Central Plaza (admin.obra1, compras.1, consultor.1)
  ('44122da5-6a3b-4200-826f-17479c824756', 'c13e4b9e-41f1-4273-a18e-c26699edab61', 'Admin Obra'),
  ('5662d520-2e79-4ac3-9704-5d130777da51', 'c13e4b9e-41f1-4273-a18e-c26699edab61', 'Compras'),
  ('4bfb9996-4c1f-421f-a8d6-8c05bde8e3f0', 'c13e4b9e-41f1-4273-a18e-c26699edab61', 'Consultor'),
  
  -- Obra 2: Torre Empresarial Norte (admin.obra2, encargado.area1, obrero.1)
  ('7eed50f3-9c04-44f4-9126-2f0f0ff4b841', 'b46ecadd-3277-4fc9-a62e-d48e2fbf491e', 'Admin Obra'),
  ('96a89fb4-bcec-4658-92e7-595b524a59a0', 'b46ecadd-3277-4fc9-a62e-d48e2fbf491e', 'Encargado Área'),
  ('bbb62ea2-ffc6-4aeb-ba21-a310187b5d2e', 'b46ecadd-3277-4fc9-a62e-d48e2fbf491e', 'Obrero'),
  
  -- Obra 3: Conjunto Residencial Alameda (encargado.area2, obrero.2, rrhh.1)
  ('06c6e9ba-6243-4848-b596-ec9224d1c1da', '887f3d9d-fc67-455e-9e17-824275f8c763', 'Encargado Área'),
  ('3b77715b-6bc3-48b5-859d-029be9a0744c', '887f3d9d-fc67-455e-9e17-824275f8c763', 'Obrero'),
  ('3f0aac8b-f27b-46e5-8504-c11b153ec6e9', '887f3d9d-fc67-455e-9e17-824275f8c763', 'RRHH'),
  
  -- Obra 4: Centro Comercial Portal del Sur (sst.1)
  ('7f4eabaa-b2a8-42ae-bbb2-aa05f82364ca', '759199e3-7d40-44d4-9083-928ff05c219e', 'SST')
ON CONFLICT (user_id, obra_id) DO NOTHING;

-- 12. Verificación final
SELECT 
  u.email,
  COUNT(ou.obra_id) as obras_asignadas
FROM public.users u
LEFT JOIN public.obra_usuario ou ON u.id = ou.user_id
GROUP BY u.email
ORDER BY u.email;
