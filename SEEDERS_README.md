# 🌱 Seeders de IngenierIA

Este documento explica cómo usar los seeders para poblar la base de datos con datos de prueba para el sistema IngenierIA.

## 📋 Datos que se Crean

### 1. **Roles** (8 roles de IngenierIA)
- `admin_general` (ID: 3) - Administrador General con acceso a todas las obras
- `admin_obra` (ID: 4) - Administrador de Obra específica
- `encargado_area` (ID: 5) - Encargado de Área dentro de una obra
- `obrero` (ID: 6) - Obrero asignado a una o varias obras
- `sst` (ID: 7) - Seguridad y Salud en el Trabajo
- `compras` (ID: 8) - Responsable de Compras
- `rrhh` (ID: 9) - Recursos Humanos
- `consultor` (ID: 10) - Consultor externo

### 2. **Usuarios** (11 usuarios con contraseña "secret")

| Email | Nombre | Apellido | Rol Base |
|-------|--------|----------|----------|
| admin.general@ingenieria.com | Julian | Bastidas | Admin General |
| admin.obra1@ingenieria.com | Maria | Perez | Admin Obra |
| admin.obra2@ingenieria.com | Carlos | Lopez | Admin Obra |
| encargado.area1@ingenieria.com | Ana | Martinez | Encargado Área |
| encargado.area2@ingenieria.com | Luis | Ramirez | Encargado Área |
| obrero.1@ingenieria.com | Andres | Castro | Obrero |
| obrero.2@ingenieria.com | Pedro | Gomez | Obrero |
| sst.1@ingenieria.com | Sandra | Rodriguez | SST |
| compras.1@ingenieria.com | Roberto | Sanchez | Compras |
| rrhh.1@ingenieria.com | Laura | Hernandez | RRHH |
| consultor.1@ingenieria.com | Miguel | Torres | Consultor |

**Contraseña para todos:** `secret`

### 3. **Obras** (4 proyectos de construcción)

| Nombre | Dirección | Administrador |
|--------|-----------|---------------|
| Edificio Central Plaza | Calle 100 #15-20, Bogotá D.C. | admin.obra1@ingenieria.com |
| Torre Empresarial Norte | Av. El Poblado #43-50, Medellín | admin.obra2@ingenieria.com |
| Conjunto Residencial Alameda | Calle 170 #54-32, Bogotá D.C. | admin.general@ingenieria.com |
| Centro Comercial Portal del Sur | Autopista Sur Km 5, Bogotá D.C. | admin.obra1@ingenieria.com |

### 4. **Asignaciones Obra-Usuario**

Estos son los accesos que tendrá cada usuario:

#### Admin General (Julian Bastidas)
- **Acceso:** TODAS las obras (4)
- **Rol:** Admin General en todas

#### Admin Obra 1 (Maria Perez)
- **Acceso:** Edificio Central Plaza, Torre Empresarial Norte
- **Rol:** Admin Obra en ambas

#### Admin Obra 2 (Carlos Lopez)
- **Acceso:** Conjunto Residencial Alameda, Centro Comercial Portal del Sur
- **Rol:** Admin Obra en ambas

#### Encargado Área 1 (Ana Martinez)
- **Acceso:** Edificio Central Plaza
- **Rol:** Encargado de Área

#### Encargado Área 2 (Luis Ramirez)
- **Acceso:** Torre Empresarial Norte
- **Rol:** Encargado de Área

#### Obrero 1 (Andres Castro)
- **Acceso:** Edificio Central Plaza, Torre Empresarial Norte, Conjunto Residencial Alameda
- **Rol:** Obrero en todas

#### Obrero 2 (Pedro Gomez)
- **Acceso:** Torre Empresarial Norte, Conjunto Residencial Alameda, Centro Comercial Portal del Sur
- **Rol:** Obrero en todas

#### SST (Sandra Rodriguez)
- **Acceso:** Edificio Central Plaza, Torre Empresarial Norte
- **Rol:** SST en ambas

#### Compras (Roberto Sanchez)
- **Acceso:** TODAS las obras (4)
- **Rol:** Compras en todas

#### RRHH (Laura Hernandez)
- **Acceso:** TODAS las obras (4)
- **Rol:** RRHH en todas

#### Consultor (Miguel Torres)
- **Acceso:** Edificio Central Plaza, Conjunto Residencial Alameda
- **Rol:** Consultor en ambas

## 🚀 Cómo Ejecutar los Seeders

### Prerrequisitos

1. Asegúrate de tener configurada la base de datos en Supabase
2. Configura las variables de entorno en `.env`
3. Ejecuta las migraciones primero:

```bash
npm run migration:run
```

### Ejecutar Seeders (con limpieza automática)

Los seeders ahora incluyen **limpieza automática** de datos antes de insertar nuevos registros:

```bash
npm run seed:run:relational
```

Este comando ejecutará automáticamente:

#### 1. **Limpieza de datos** (en orden inverso de dependencias):
   - 🗑️ Tabla `obra_usuario` (asignaciones)
   - 🗑️ Tabla `obra` (obras)
   - 🗑️ Tabla `session` (sesiones activas)
   - 🗑️ Tabla `user` (usuarios)
   - 🔄 Reinicio de secuencia de IDs de usuarios
   - 🗑️ Roles de IngenierIA (ID >= 3, preserva roles base)

#### 2. **Inserción de nuevos datos** (en orden correcto):
   1. **RoleSeedService** - Crea los 8 roles de IngenierIA
   2. **StatusSeedService** - Crea los estados (Active, Inactive)
   3. **UserSeedService** - Crea los 11 usuarios con contraseña "secret"
   4. **ObraSeedService** - Crea las 4 obras de construcción
   5. **ObraUsuarioSeedService** - Asigna usuarios a obras con sus roles

### Salida Esperada

```
🌱 Iniciando proceso de seeders de IngenierIA...

🧹 Limpiando base de datos...

🗑️  Limpiando tabla obra_usuario...
✅ Tabla obra_usuario limpiada
🗑️  Limpiando tabla obra...
✅ Tabla obra limpiada
🗑️  Limpiando tabla session...
✅ Tabla session limpiada
🗑️  Limpiando tabla user...
✅ Tabla user limpiada
🔄 Reiniciando secuencia de user_id...
✅ Secuencia reiniciada
🗑️  Limpiando roles de IngenierIA...
✅ Roles de IngenierIA limpiados

✅ Base de datos limpiada correctamente

📝 Ejecutando seeders...

✅ Usuario creado: admin.general@ingenieria.com
✅ Usuario creado: admin.obra1@ingenieria.com
✅ Usuario creado: admin.obra2@ingenieria.com
✅ Usuario creado: encargado.area1@ingenieria.com
✅ Usuario creado: encargado.area2@ingenieria.com
✅ Usuario creado: obrero.1@ingenieria.com
✅ Usuario creado: obrero.2@ingenieria.com
✅ Usuario creado: sst.1@ingenieria.com
✅ Usuario creado: compras.1@ingenieria.com
✅ Usuario creado: rrhh.1@ingenieria.com
✅ Usuario creado: consultor.1@ingenieria.com
✅ Seeders de usuarios ejecutados correctamente

🔄 Ejecutando seeders de obras...
✅ Obra creada: Edificio Central Plaza
✅ Obra creada: Torre Empresarial Norte
✅ Obra creada: Conjunto Residencial Alameda
✅ Obra creada: Centro Comercial Portal del Sur
✅ Seeders de obras ejecutados correctamente

🔄 Ejecutando seeders de asignación obra-usuario...
📋 Obras encontradas: 4
✅ Asignado: admin.general@ingenieria.com → Edificio Central Plaza (Admin General)
✅ Asignado: admin.general@ingenieria.com → Torre Empresarial Norte (Admin General)
✅ Asignado: admin.general@ingenieria.com → Conjunto Residencial Alameda (Admin General)
✅ Asignado: admin.general@ingenieria.com → Centro Comercial Portal del Sur (Admin General)
✅ Asignado: admin.obra1@ingenieria.com → Edificio Central Plaza (Admin Obra)
✅ Asignado: admin.obra1@ingenieria.com → Torre Empresarial Norte (Admin Obra)
... (más asignaciones)
✅ Seeders de obra-usuario ejecutados: 27 creados, 0 omitidos

✅ Todos los seeders ejecutados correctamente
🎉 Proceso completado exitosamente
```

## 🧪 Pruebas con los Datos Creados

### 1. Login como Admin General

```bash
curl -X POST http://localhost:3000/api/v1/auth/ingenieria/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.general@ingenieria.com",
    "password": "secret"
  }'
```

Respuesta: JWT con acceso a todas las obras

### 2. Login como Admin Obra 1 con contexto de obra

```bash
curl -X POST http://localhost:3000/api/v1/auth/ingenieria/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.obra1@ingenieria.com",
    "password": "secret",
    "obraId": "<UUID de Edificio Central Plaza>"
  }'
```

Respuesta: JWT con obra_id específica

### 3. Login como Obrero

```bash
curl -X POST http://localhost:3000/api/v1/auth/ingenieria/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "obrero.1@ingenieria.com",
    "password": "secret"
  }'
```

Respuesta: JWT sin obra_id (debe elegir obra después)

### 4. Verificar Acceso a Obras

```bash
# Obtener todas las obras (requiere Admin General)
curl -X GET http://localhost:3000/api/v1/obras \
  -H "Authorization: Bearer <JWT>"

# Obtener usuarios de una obra
curl -X GET http://localhost:3000/api/v1/obras/<obra-id>/usuarios \
  -H "Authorization: Bearer <JWT>"
```

## 🔄 Re-ejecutar Seeders

Los seeders están diseñados para ser idempotentes. Esto significa que:

- **No crean duplicados**: Verifican si el dato ya existe antes de crearlo
- **Se pueden ejecutar múltiples veces**: Sin problemas de datos duplicados
- **Seguro en desarrollo**: Puedes ejecutarlos cada vez que necesites resetear datos de prueba

Si necesitas resetear completamente la base de datos:

```bash
# 1. Revertir migraciones
npm run migration:revert

# 2. Ejecutar migraciones
npm run migration:run

# 3. Ejecutar seeders
npm run seed:run:relational
```

## 🛠️ Personalizar Seeders

### Agregar más usuarios

Edita: `/src/database/seeds/relational/user/user-seed.service.ts`

```typescript
const ingenieriaUsers = [
  // ... usuarios existentes
  {
    firstName: 'Nuevo',
    lastName: 'Usuario',
    email: 'nuevo.usuario@ingenieria.com',
    roleId: RoleEnum.obrero,
    roleName: 'Obrero',
  },
];
```

### Agregar más obras

Edita: `/src/database/seeds/relational/obra/obra-seed.service.ts`

### Cambiar asignaciones de obras

Edita: `/src/database/seeds/relational/obra-usuario/obra-usuario-seed.service.ts`

## ❓ Troubleshooting

### Error: "No se encuentra el módulo"
- Ejecuta `npm run build` para recompilar TypeScript
- Verifica que todas las dependencias estén instaladas: `npm install`

### Error: "Cannot find entity"
- Asegúrate de que las migraciones se ejecutaron correctamente
- Verifica la conexión a la base de datos en `.env`

### Error: "Duplicate key value"
- Los seeders ya se ejecutaron antes
- Puedes ejecutarlos de nuevo, simplemente omitirán los duplicados

### Usuarios no pueden hacer login
- Verifica que la contraseña sea exactamente "secret"
- Asegúrate de que el usuario esté activo (status_id = 1)

## 📚 Referencias

- Ver arquitectura completa: `INGENIERIA_README.md`
- Ver endpoints disponibles: `API_ENDPOINTS.md`
- Ver migraciones: `/src/database/migrations/`
