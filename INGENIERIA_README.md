# Módulo de Autenticación y Control de Roles - IngenierIA

## Descripción

Este módulo implementa un sistema completo de autenticación y control de roles para el proyecto **IngenierIA**, basado en la arquitectura del [nestjs-boilerplate de Brocoders](https://github.com/brocoders/nestjs-boilerplate).

El sistema está diseñado para gestionar múltiples obras de construcción, con usuarios que pueden tener diferentes roles en diferentes obras.

## Arquitectura

### Entidades Principales

#### 1. **User** (Entidad base del boilerplate)
- ID numérico (mantiene compatibilidad con el boilerplate)
- Información básica: email, nombre, contraseña (bcrypt con 10 salt rounds)
- Rol base del sistema
- Estado activo/inactivo

#### 2. **Role**
Roles disponibles en el sistema:
- `admin` (1) - Administrador del sistema base
- `user` (2) - Usuario base
- `admin_general` (3) - **Administrador general de IngenierIA**
- `admin_obra` (4) - Administrador de una obra específica
- `encargado_area` (5) - Encargado de un área dentro de una obra
- `obrero` (6) - Trabajador operativo
- `sst` (7) - Seguridad y Salud en el Trabajo
- `compras` (8) - Encargado de compras
- `rrhh` (9) - Recursos Humanos
- `consultor` (10) - Consultor externo

#### 3. **Obra**
Representa una obra de construcción:
- ID: UUID
- Nombre de la obra
- Dirección
- Administrador (FK a User)
- Timestamps (createdAt, updatedAt)

#### 4. **ObraUsuario**
Relación N:N entre User, Obra y Role:
- ID: UUID
- user_id (FK a User)
- obra_id (FK a Obra)
- role_id (FK a Role)
- fechaAsignacion
- Timestamps

Esta entidad permite que un usuario tenga diferentes roles en diferentes obras.

## Funcionalidades Implementadas

### 1. Autenticación con JWT

#### Endpoint de Login para IngenierIA
```
POST /api/v1/auth/ingenieria/login
```

**Request Body:**
```json
{
  "email": "admin.general@ingenieria.com",
  "password": "AdminIngenieria2024!",
  "obraId": "uuid-de-la-obra" // opcional
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "tokenExpires": 1234567890,
  "user": {
    "id": 1,
    "email": "admin.general@ingenieria.com",
    "firstName": "Admin",
    "lastName": "General",
    "role": {
      "id": 3,
      "name": "Admin General"
    }
  }
}
```

#### Payload del JWT
```json
{
  "id": 1,
  "role": { "id": 3, "name": "Admin General" },
  "sessionId": 123,
  "email": "admin.general@ingenieria.com",
  "obra_id": "uuid-de-la-obra",  // Si se especificó en el login
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Expiración:** 24 horas (configurable en `.env`)

### 2. Gestión de Obras

#### Crear Obra
```
POST /api/v1/obras
Authorization: Bearer <token>
Roles permitidos: admin_general, admin_obra
```

**Request:**
```json
{
  "nombre": "Edificio Central Plaza",
  "direccion": "Calle 123 #45-67, Bogotá",
  "administradorId": 1  // opcional
}
```

#### Listar Obras
```
GET /api/v1/obras?page=1&limit=10
Authorization: Bearer <token>
```

#### Obtener Obra por ID
```
GET /api/v1/obras/:id
Authorization: Bearer <token>
```

#### Actualizar Obra
```
PATCH /api/v1/obras/:id
Authorization: Bearer <token>
Roles permitidos: admin_general, admin_obra
```

#### Eliminar Obra
```
DELETE /api/v1/obras/:id
Authorization: Bearer <token>
Roles permitidos: admin_general
```

### 3. Asignación de Usuarios a Obras

#### Asignar Usuario a Obra con Rol
```
POST /api/v1/obras/asignar-usuario
Authorization: Bearer <token>
Roles permitidos: admin_general, admin_obra
```

**Request:**
```json
{
  "userId": 1,
  "obraId": "uuid-de-la-obra",
  "roleId": 4  // 4 = admin_obra
}
```

#### Listar Usuarios de una Obra
```
GET /api/v1/obras/:id/usuarios
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "role": {
      "id": 6,
      "name": "Obrero"
    },
    "fechaAsignacion": "2024-11-02T10:30:00Z"
  }
]
```

### 4. Guards y Decoradores

#### @Roles
Protege rutas basadas en roles:
```typescript
@Roles('admin_general', 'admin_obra')
@Get('protegido')
rutaProtegida() {
  return 'Solo accesible para admin_general y admin_obra';
}
```

#### @RequiereObra
Valida que el usuario tenga una obra en su contexto JWT:
```typescript
@RequiereObra()
@Get('obra-especifica')
rutaDeObra() {
  // El usuario DEBE tener obra_id en su JWT
  return 'Acceso específico a una obra';
}
```

## Configuración

### Variables de Entorno

Asegúrate de tener las siguientes variables en tu archivo `.env`:

```env
# JWT Configuration
AUTH_JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui
AUTH_JWT_TOKEN_EXPIRES_IN=24h

# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ingenieria_db
```

## Instalación y Uso

### 1. Ejecutar Migraciones

```bash
npm run migration:run
```

Esto creará las tablas:
- `obra`
- `obra_usuario`
- Actualizará la tabla `role` con las nuevas columnas y roles

### 2. Ejecutar Seeders

```bash
npm run seed:run:relational
```

Esto creará:
- Los 8 roles de IngenierIA
- Usuario Admin General:
  - Email: `admin.general@ingenieria.com`
  - Password: `AdminIngenieria2024!`
  - Rol: Admin General

### 3. Iniciar el Servidor

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

### 4. Acceder a Swagger

La documentación de la API está disponible en:
```
http://localhost:3000/docs
```

## Flujo de Trabajo Típico

### 1. Login como Admin General
```bash
curl -X POST http://localhost:3000/api/v1/auth/ingenieria/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.general@ingenieria.com",
    "password": "AdminIngenieria2024!"
  }'
```

### 2. Crear una Obra
```bash
curl -X POST http://localhost:3000/api/v1/obras \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Torre Empresarial Norte",
    "direccion": "Av. Principal #100-20"
  }'
```

### 3. Asignar Usuario a la Obra
```bash
curl -X POST http://localhost:3000/api/v1/obras/asignar-usuario \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "obraId": "uuid-de-la-obra",
    "roleId": 6
  }'
```

### 4. Login con Obra Específica
```bash
curl -X POST http://localhost:3000/api/v1/auth/ingenieria/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password",
    "obraId": "uuid-de-la-obra"
  }'
```

## Seguridad

### Contraseñas
- Hash con bcrypt
- Salt rounds: 10
- Nunca se devuelven en las respuestas de la API

### JWT
- Firmado con `AUTH_JWT_SECRET`
- Expiración configurable (por defecto 24h)
- Validación en todas las rutas protegidas
- Incluye información mínima necesaria

### Autorización
- Guards basados en roles
- Validación de permisos por endpoint
- Verificación de acceso a obras específicas

## Testing

### Tests Unitarios
```bash
npm run test
```

### Tests E2E
```bash
npm run test:e2e
```

## Estructura de Archivos

```
src/
├── obras/
│   ├── domain/
│   │   └── obra.ts
│   ├── dto/
│   │   ├── create-obra.dto.ts
│   │   ├── update-obra.dto.ts
│   │   └── asignar-usuario-obra.dto.ts
│   ├── infrastructure/
│   │   └── persistence/
│   │       └── relational/
│   │           ├── entities/
│   │           │   └── obra.entity.ts
│   │           ├── mappers/
│   │           │   └── obra.mapper.ts
│   │           └── repositories/
│   │               └── obras.repository.ts
│   ├── obras.controller.ts
│   ├── obras.service.ts
│   └── obras.module.ts
├── obra-usuario/
│   ├── domain/
│   │   └── obra-usuario.ts
│   └── infrastructure/
│       └── persistence/
│           └── relational/
│               └── entities/
│                   └── obra-usuario.entity.ts
├── auth/
│   ├── dto/
│   │   └── auth-email-login-ingenieria.dto.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── types/
│   │       └── jwt-payload.type.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts  (método validateLoginIngenieria)
│   └── auth.module.ts
├── roles/
│   ├── roles.guard.ts  (mejorado con validación de string roles)
│   ├── roles.decorator.ts
│   ├── requiere-obra.decorator.ts
│   └── roles.enum.ts  (con 8 nuevos roles)
└── database/
    ├── migrations/
    │   └── 1730581234567-CreateIngenieriaModules.ts
    └── seeds/
        └── relational/
            ├── role/
            │   └── role-seed.service.ts  (con 8 roles)
            └── user/
                └── user-seed.service.ts  (con Admin General)
```

## Integración con el Boilerplate

Este módulo se integra perfectamente con la arquitectura del boilerplate de Brocoders:

✅ **Estructura modular**: Cada feature en su carpeta `/src/modules`  
✅ **TypeORM + PostgreSQL**: Mantiene la misma estructura de persistencia  
✅ **@nestjs/config**: Variables de entorno centralizadas  
✅ **Seeders**: Datos iniciales para desarrollo  
✅ **Swagger**: Documentación automática de endpoints  
✅ **Guards y Decoradores**: Protección de rutas  
✅ **Domain-Driven Design**: Separación de dominio e infraestructura  

## Próximos Pasos

- [ ] Tests unitarios completos para todos los servicios
- [ ] Tests E2E para flujos completos
- [ ] Migraciones para convertir User.id a UUID (opcional)
- [ ] Endpoint de perfil extendido con obras asociadas
- [ ] Notificaciones al asignar usuarios a obras
- [ ] Logs de auditoría para cambios en obras

## Licencia

Este proyecto mantiene la misma licencia que el boilerplate original de Brocoders.

## Autor

Desarrollado para **IngenierIA** - Sistema de Gestión de Obras de Construcción

---

**Nota:** Este módulo mantiene la consistencia de carpetas, convenciones y nombres de clases del boilerplate de Brocoders. Todas las modificaciones respetan la arquitectura base y son totalmente retrocompatibles.
