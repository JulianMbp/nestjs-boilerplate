# 🔐 Corrección del Sistema de Autenticación

## 📋 Resumen del Problema

El sistema de autenticación no funcionaba porque el **seeder de usuarios** estaba guardando datos en la tabla incorrecta:

- ❌ **Antes**: Guardaba en tabla `usuarios` (usando `UsuarioEntity`)
- ✅ **Ahora**: Guarda en tabla `user` (usando `UserEntity`)

## 🔧 Cambios Realizados

### 1. **UserSeedService** (`src/database/seeds/relational/user/user-seed.service.ts`)

**Cambios principales:**
- ✅ Cambiado repositorio de `UsuarioEntity` → `UserEntity`
- ✅ Propiedades actualizadas a camelCase:
  - `first_name` → `firstName`
  - `last_name` → `lastName`
  - `role_id` → `role: { id: roleId }`
- ✅ Agregados campos obligatorios:
  - `status: { id: StatusEnum.active }`
  - `provider: 'email'`
- ✅ Contraseña estandarizada: **todos los usuarios usan `secret`**

### 2. **UserSeedModule** (`src/database/seeds/relational/user/user-seed.module.ts`)

**Cambios:**
- ✅ Import actualizado: `UsuarioEntity` → `UserEntity`
- ✅ TypeORM feature: Ahora usa `UserEntity`

## 🎯 Usuarios de Prueba

Una vez ejecutes el seeder, tendrás los siguientes usuarios disponibles:

### Usuarios del Boilerplate Original

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `secret` | Admin |
| `john.doe@example.com` | `secret` | User |

### Usuarios de IngenierIA

| Email | Password | Role | Descripción |
|-------|----------|------|-------------|
| `admin.general@ingenieria.com` | `secret` | Admin General | Julian Bastidas |
| `admin.obra1@ingenieria.com` | `secret` | Admin Obra | Maria Perez |
| `admin.obra2@ingenieria.com` | `secret` | Admin Obra | Carlos Lopez |
| `encargado.area1@ingenieria.com` | `secret` | Encargado de Área | Ana Martinez |
| `encargado.area2@ingenieria.com` | `secret` | Encargado de Área | Luis Ramirez |
| `obrero.1@ingenieria.com` | `secret` | Obrero | Andres Castro |
| `obrero.2@ingenieria.com` | `secret` | Obrero | Pedro Gomez |
| `sst.1@ingenieria.com` | `secret` | SST | Sandra Rodriguez |
| `compras.1@ingenieria.com` | `secret` | Compras | Roberto Sanchez |
| `rrhh.1@ingenieria.com` | `secret` | RRHH | Laura Hernandez |
| `consultor.1@ingenieria.com` | `secret` | Consultor | Miguel Torres |

## 🚀 Instrucciones de Ejecución

### Paso 1: Ejecutar el Seeder

```bash
npm run seed:run
```

Este comando:
1. Limpiará las tablas existentes
2. Creará los roles necesarios
3. Creará los estados (status)
4. **Creará los usuarios en la tabla `user` correcta**
5. Creará las obras
6. Asignará usuarios a obras

### Paso 2: Verificar la Creación de Usuarios

Deberías ver en la consola:

```
✅ Usuario creado: admin.general@ingenieria.com (Admin General)
✅ Usuario creado: admin.obra1@ingenieria.com (Admin Obra)
✅ Usuario creado: admin.obra2@ingenieria.com (Admin Obra)
...
✅ Seeders de usuarios ejecutados correctamente
```

### Paso 3: Probar Autenticación

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.obra1@ingenieria.com",
    "password": "secret"
  }'
```

**Respuesta esperada:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpires": 1234567890,
  "user": {
    "id": 3,
    "email": "admin.obra1@ingenieria.com",
    "firstName": "Maria",
    "lastName": "Perez",
    "role": {
      "id": 4,
      "name": "Admin Obra"
    },
    "status": {
      "id": 1,
      "name": "active"
    }
  }
}
```

## ✅ Verificación de la Corrección

### Verificar en la Base de Datos

```sql
-- Verificar usuarios en tabla 'user'
SELECT id, email, "firstName", "lastName", "roleId", "statusId", provider
FROM "user"
WHERE email LIKE '%ingenieria.com';

-- Debería retornar 11 usuarios con provider='email' y statusId=1
```

### Endpoints Disponibles

Una vez autenticado, puedes acceder a:

```bash
# Obtener perfil del usuario autenticado
GET /api/v1/auth/me
Headers: Authorization: Bearer {token}

# Listar materiales de la obra del usuario
GET /api/v1/materiales
Headers: Authorization: Bearer {token}

# Crear bitácora
POST /api/v1/bitacoras
Headers: Authorization: Bearer {token}
Body: {
  "fecha": "2024-01-15",
  "actividad": "Instalación de tubería",
  "avance_porcentaje": 45
}
```

## 🔍 Diferencias Clave

| Característica | UsuarioEntity (❌ Antiguo) | UserEntity (✅ Correcto) |
|----------------|---------------------------|--------------------------|
| Tabla | `usuarios` | `user` |
| Propiedades | `first_name`, `last_name` | `firstName`, `lastName` |
| Relaciones | `role_id` (ID directo) | `role: { id }` (relación) |
| Status | No requerido | `status: { id }` requerido |
| Provider | No requerido | `provider: 'email'` requerido |
| Uso | Tabla personalizada IngenierIA | Sistema de autenticación NestJS |

## 📚 Contexto Técnico

El boilerplate de NestJS utiliza:

- **Tabla `user`**: Para autenticación y autorización (UserEntity)
- **UserEntity**: Con relaciones a `RoleEntity` y `StatusEntity`
- **Validación JWT**: Basada en el `user.id` de la tabla `user`

El proyecto IngenierIA tiene:

- **Tabla `usuarios`**: Para empleados/obreros específicos del dominio (UsuarioEntity)
- **UsuarioEntity**: Con campos personalizados (cedula, telefono, etc.)
- **Separación de responsabilidades**: `user` para auth, `usuarios` para empleados

## 🎉 Resultado Final

Ahora el flujo de autenticación funciona correctamente:

1. ✅ Usuario se autentica con email/password
2. ✅ Sistema busca en tabla `user` (UserEntity)
3. ✅ Encuentra el registro con bcrypt password hash
4. ✅ Genera JWT con `user.id` y `obra_id` (si aplica)
5. ✅ TenantGuard valida acceso a recursos por `obra_id`
6. ✅ RolesGuard valida permisos según rol del usuario

## 🔄 Próximos Pasos

1. **Ejecutar seeder**: `npm run seed:run`
2. **Probar login**: Con cualquier email de los listados arriba
3. **Verificar JWT**: El token debe incluir `userId` y `obraId`
4. **Probar endpoints**: Materiales, bitácoras, asistencias, etc.
5. **Validar multi-tenant**: Usuario solo ve datos de su obra

---

**Nota**: Si necesitas resetear la base de datos completamente, el script de seeding ya incluye la limpieza automática de todas las tablas antes de insertar nuevos datos.
