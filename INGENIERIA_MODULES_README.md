# 🧱 IngenierIA Modules - Quick Start Guide

## 📚 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Module Details](#module-details)
5. [API Examples](#api-examples)
6. [Authentication & Security](#authentication--security)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This implementation includes **6 functional modules** for the IngenierIA construction management platform:

| Module | Purpose | Key Features |
|--------|---------|--------------|
| **Materiales** | Material inventory | CRUD, tenant isolation |
| **Bitácoras** | Work logs | Progress tracking (0-100%), file attachments |
| **Asistencias** | Attendance | Unique constraint, enum states |
| **Presupuestos** | Budget management | Calculated totals, role-based access |
| **Documentos** | Document versioning | Auto-increment versions |
| **Activity Logs** | Audit trail | Automatic logging via interceptor |

---

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- NestJS CLI: `npm i -g @nestjs/cli`
- JWT tokens with `obra_id` claim

---

## Installation

### 1. Database Setup

```bash
# Run TypeORM migrations
npm run migration:generate -- src/database/migrations/AddIngenierIAModules
npm run migration:run

# Optional: Run SQL optimizations
psql -U your_user -d your_database -f database-schema-updates.sql
```

### 2. Verify Modules

```bash
# Check compilation
npm run build

# Run in development
npm run start:dev
```

### 3. Test Endpoints

The API will be available at: `http://localhost:3000/v1/`

---

## Module Details

### 🧱 Materiales (Materials)

**Base Route:** `/v1/obras/:obraId/materiales`

**Access:** Admin General, Admin Obra

**Fields:**
- `nombre` (string, required)
- `categoria` (string, optional)
- `cantidad` (number, optional)
- `unidad` (string, optional)
- `proveedor` (string, optional)

**Example:**
```json
{
  "nombre": "Cemento Portland",
  "categoria": "Materiales de construcción",
  "cantidad": 100,
  "unidad": "sacos",
  "proveedor": "Cementos del Pacífico"
}
```

---

### 📝 Bitácoras (Work Logs)

**Base Route:** `/v1/obras/:obraId/bitacoras`

**Access:** All authenticated users (owner-based for updates/deletes)

**Fields:**
- `descripcion` (string, required)
- `avance_porcentaje` (number, 0-100, required)
- `archivos` (string[], optional)
- `fecha` (date, optional, defaults to today)

**Example:**
```json
{
  "descripcion": "Vaciado de concreto en planta baja",
  "avance_porcentaje": 75.5,
  "archivos": ["https://cdn.example.com/photo1.jpg"],
  "fecha": "2025-11-03"
}
```

---

### 👥 Asistencias (Attendance)

**Base Route:** `/v1/obras/:obraId/asistencias`

**Access:** Admin General, Admin Obra, RRHH

**Fields:**
- `usuario_id` (UUID, required)
- `fecha` (date, optional, defaults to today)
- `estado` (enum: "presente" | "ausente" | "justificado", required)
- `observaciones` (string, optional)

**Example:**
```json
{
  "usuario_id": "123e4567-e89b-12d3-a456-426614174000",
  "fecha": "2025-11-03",
  "estado": "presente",
  "observaciones": "Llegó temprano"
}
```

**Unique Constraint:** One record per (obra, user, date)

---

### 💰 Presupuestos (Budget)

**Base Route:** `/v1/obras/:obraId/presupuestos`

**Access:** Admin General, Admin Obra

**Fields:**
- `partida` (string, required)
- `unidad` (string, optional)
- `cantidad` (number, required, min: 0)
- `valor_unitario` (number, required, min: 0)
- `valor_ejecutado` (number, optional, default: 0)

**Example:**
```json
{
  "partida": "Excavación manual",
  "unidad": "m³",
  "cantidad": 50,
  "valor_unitario": 25.50,
  "valor_ejecutado": 0
}
```

**Response includes:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "partida": "Excavación manual",
    "cantidad": 50,
    "valor_unitario": 25.50,
    "valor_total": 1275.00,  // ← Auto-calculated
    "valor_ejecutado": 0
  }
}
```

---

### 📁 Documentos (Documents)

**Base Route:** `/v1/obras/:obraId/documentos`

**Access:** All authenticated users

**Fields:**
- `tipo` (string, required)
- `nombre` (string, required)
- `url` (string, required)
- `version` (string, optional, auto-generated)

**Example:**
```json
{
  "tipo": "Plano",
  "nombre": "Planta Arquitectónica",
  "url": "https://cdn.example.com/planos/planta-arq.pdf"
}
```

**Versioning Logic:**
- First upload: `version = "1.0"`
- Same `nombre`: `version = "1.1"`, `"1.2"`, etc.
- Different `nombre`: resets to `"1.0"`

---

### 📊 Activity Logs

**Base Route:** `/v1/logs`

**Access:** Admin General only

**Auto-logged Actions:**
- All HTTP requests (GET, POST, PATCH, DELETE)
- User ID and Obra ID context
- Request metadata (params, body)
- Timestamps

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "user_id": "...",
      "obra_id": "...",
      "action": "POST /obras/123/materiales",
      "description": "User performed POST on /obras/123/materiales",
      "metadata": {
        "method": "POST",
        "url": "/obras/123/materiales",
        "params": { "obraId": "123" },
        "timestamp": "2025-11-03T10:30:00Z"
      },
      "created_at": "2025-11-03T10:30:00Z"
    }
  ]
}
```

---

## API Examples

### Authentication

All requests require JWT token with `obra_id` claim:

```bash
# Login first to get token
POST /v1/auth/email/login
{
  "email": "admin@example.com",
  "password": "secret123"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "obra_id": "..." }
}
```

### Create Material

```bash
curl -X POST http://localhost:3000/v1/obras/123e4567/materiales \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Acero corrugado",
    "categoria": "Estructural",
    "cantidad": 500,
    "unidad": "kg",
    "proveedor": "Aceros del Norte"
  }'
```

### List Work Logs

```bash
curl http://localhost:3000/v1/obras/123e4567/bitacoras \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Register Attendance

```bash
curl -X POST http://localhost:3000/v1/obras/123e4567/asistencias \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": "456e7890-e89b-12d3-a456-426614174000",
    "estado": "presente",
    "observaciones": "Asistencia regular"
  }'
```

---

## Authentication & Security

### Multi-Tenant Isolation

Every request is scoped to an `obra` (construction site):

1. **JWT Token** must contain `obra_id` claim
2. **TenantGuard** validates user has access via `obra_usuario` table
3. **Route Params** include `:obraId` for double validation

### Role-Based Access Control

| Module | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Materiales | Admin Obra, Admin General | All | Admin Obra, Admin General | Admin Obra, Admin General |
| Bitácoras | All | All | Owner only | Owner only |
| Asistencias | RRHH, Admin | All | RRHH, Admin | RRHH, Admin |
| Presupuestos | Admin | All | Admin | Admin |
| Documentos | All | All | All | All |
| Activity Logs | N/A | Admin General | N/A | N/A |

### Guards Applied

```typescript
@UseGuards(AuthGuard('jwt'), TenantGuard)  // All modules
@UseGuards(RolesGuard)                     // Specific endpoints
```

---

## Troubleshooting

### Error: "User does not have access to this obra"

**Cause:** User is not assigned to the obra in `obra_usuario` table

**Solution:**
```sql
INSERT INTO obra_usuario (user_id, obra_id, role_id)
VALUES ('user-uuid', 'obra-uuid', 'role-uuid');
```

### Error: "Bitácora not found in this obra"

**Cause:** Resource doesn't exist or belongs to different obra

**Solution:** Verify `obra_id` in route matches JWT claim

### Error: "Attendance record already exists"

**Cause:** Unique constraint violation (obra + user + date)

**Solution:** Update existing record instead of creating new one

### Validation Error: "avance_porcentaje must not be greater than 100"

**Cause:** Progress percentage exceeds allowed range

**Solution:** Ensure value is between 0-100

---

## Development Tips

### Enable Global Activity Logging

The interceptor is already registered. To customize:

```typescript
// main.ts
app.useGlobalInterceptors(
  new ActivityLogInterceptor(activityLogRepository)
);
```

### Custom Response Messages

Override in controller:

```typescript
@Post()
create(@Body() dto: CreateDto) {
  const result = await this.service.create(dto);
  return {
    success: true,
    data: result,
    message: 'Custom success message'  // ← Override
  };
}
```

### Query Filtering

Add query params support:

```typescript
// Example: Filter bitácoras by date range
@Get()
findAll(
  @Param('obraId') obraId: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string
) {
  return this.service.findWithFilters(obraId, { startDate, endDate });
}
```

---

## Next Steps

1. ✅ Run migrations
2. ✅ Seed roles and test users
3. ✅ Test each module with Postman/Insomnia
4. ✅ Configure file upload for documentos
5. ✅ Set up frontend integration
6. ✅ Deploy to staging environment

---

**Questions?** Check the full implementation summary: [MODULES_IMPLEMENTATION_SUMMARY.md](./MODULES_IMPLEMENTATION_SUMMARY.md)

**Documentation:** All modules follow NestJS best practices and Clean Architecture principles.
