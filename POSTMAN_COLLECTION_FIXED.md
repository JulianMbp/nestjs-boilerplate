# ✅ Colección de Postman Corregida

## 🐛 Problema Identificado

Los endpoints de la API usan **rutas anidadas** con `obraId` en el path, pero la colección de Postman inicial estaba usando rutas directas.

### ❌ Rutas Incorrectas (No existen)

```
GET /api/v1/materiales
GET /api/v1/bitacoras
GET /api/v1/asistencias
GET /api/v1/activity-logs
```

### ✅ Rutas Correctas (Implementadas en el backend)

```
GET /api/v1/obras/:obraId/materiales
GET /api/v1/obras/:obraId/bitacoras
GET /api/v1/obras/:obraId/asistencias
GET /api/v1/obras/:obraId/documentos
GET /api/v1/obras/:obraId/presupuestos
GET /api/v1/logs  (sin obraId - solo Admin General)
```

---

## 🔧 Correcciones Aplicadas

### 1. **Materiales** (5 endpoints corregidos)

| Request | URL Anterior | URL Corregida |
|---------|-------------|---------------|
| Listar | `/materiales` | `/obras/{{obraId}}/materiales` |
| Buscar | `/materiales?filters[...]` | `/obras/{{obraId}}/materiales?filters[...]` |
| Obtener | `/materiales/{{materialId}}` | `/obras/{{obraId}}/materiales/{{materialId}}` |
| Crear | `/materiales` | `/obras/{{obraId}}/materiales` |
| Actualizar | `/materiales/{{materialId}}` | `/obras/{{obraId}}/materiales/{{materialId}}` |

**Body de creación actualizado:** Se eliminó `"obraId": "{{obraId}}"` porque ahora se toma del path.

```json
{
  "nombre": "Material de Prueba",
  "descripcion": "Material creado desde Postman",
  "unidadMedida": "unidad",
  "cantidadDisponible": 100,
  "precioUnitario": 25.50
}
```

---

### 2. **Bitácoras** (5 endpoints corregidos)

| Request | URL Anterior | URL Corregida |
|---------|-------------|---------------|
| Listar | `/bitacoras` | `/obras/{{obraId}}/bitacoras` |
| Filtrar | `/bitacoras?filters[...]` | `/obras/{{obraId}}/bitacoras?filters[...]` |
| Obtener | `/bitacoras/{{bitacoraId}}` | `/obras/{{obraId}}/bitacoras/{{bitacoraId}}` |
| Crear | `/bitacoras` | `/obras/{{obraId}}/bitacoras` |
| Actualizar | `/bitacoras/{{bitacoraId}}` | `/obras/{{obraId}}/bitacoras/{{bitacoraId}}` |

**Body de creación actualizado:**

```json
{
  "titulo": "Bitácora de Prueba",
  "descripcion": "Entrada de bitácora creada desde Postman",
  "fecha": "2025-11-03T10:00:00.000Z"
}
```

---

### 3. **Asistencias** (5 endpoints corregidos)

| Request | URL Anterior | URL Corregida |
|---------|-------------|---------------|
| Listar | `/asistencias` | `/obras/{{obraId}}/asistencias` |
| Filtrar | `/asistencias?filters[...]` | `/obras/{{obraId}}/asistencias?filters[...]` |
| Obtener | `/asistencias/{{asistenciaId}}` | `/obras/{{obraId}}/asistencias/{{asistenciaId}}` |
| Crear | `/asistencias` | `/obras/{{obraId}}/asistencias` |
| Actualizar | `/asistencias/{{asistenciaId}}` | `/obras/{{obraId}}/asistencias/{{asistenciaId}}` |

**Body de creación actualizado:**

```json
{
  "fecha": "2025-11-03T08:00:00.000Z",
  "estado": "presente",
  "notas": "Asistencia registrada desde Postman"
}
```

---

### 4. **Activity Logs** (1 endpoint corregido)

| Request | URL Anterior | URL Corregida |
|---------|-------------|---------------|
| Listar | `/activity-logs` | `/logs` |

**Nota:** Este endpoint NO usa `obraId` en el path. Solo es accesible por Admin General.

---

## 📝 Cambios en la Guía de Uso

### Actualización del Flujo Principal

**Antes:**
```
1. Login
2. Listar obras
3. Switch obra (genera nuevo JWT con obraId)
4. Listar materiales (filtrado automático por JWT)
```

**Ahora:**
```
1. Login
2. Listar obras
3. Copiar obraId de la obra deseada
4. Actualizar variable {{obraId}} en Postman
5. Listar materiales: GET /obras/{{obraId}}/materiales
```

### Enfoque Multi-Tenant Clarificado

**Rutas Anidadas (Implementación Actual):**
- `obraId` se especifica en el path: `/obras/{obraId}/materiales`
- `TenantGuard` valida que el usuario tenga acceso a esa obra
- **Ventaja:** RESTful, explícito, fácil de entender
- **Para cambiar de obra:** Actualizar variable `obraId` en Postman

**JWT con obraId (Opcional - Disponible pero no usado):**
- Endpoint `POST /auth/switch-obra` genera JWT con `obraId` en payload
- Podría usarse para endpoints que lean del token en lugar del path
- **Nota:** Los endpoints actuales NO usan este enfoque

---

## 🎯 Flujo Correcto para Probar

### 1. Login
```
POST /api/v1/auth/email/login
Body: { "email": "admin.general@ingenieria.com", "password": "secret" }
```

### 2. Listar Mis Obras
```
GET /api/v1/auth/my-obras
```

**Respuesta:**
```json
[
  {
    "obra": {
      "id": "abc-123-uuid",
      "nombre": "Edificio Central Plaza"
    }
  }
]
```

### 3. Actualizar Variable en Postman
- Copiar el `id` de la obra deseada
- Click en el ícono del ojo 👁️ en Postman
- Editar `obraId` con el valor copiado

### 4. Acceder a Materiales de esa Obra
```
GET /api/v1/obras/abc-123-uuid/materiales
```

### 5. Cambiar a Otra Obra
- Copiar otro `obraId` de la lista de obras
- Actualizar variable `obraId` en Postman
- Ejecutar nuevamente: `GET /api/v1/obras/{nuevo-obraId}/materiales`
- ✅ Verás materiales diferentes

---

## 🔐 Validación de Seguridad

El `TenantGuard` implementado hace lo siguiente:

1. **Extrae `obraId` del path** de la URL
2. **Consulta la base de datos** para verificar que el usuario autenticado tiene una asignación en `obra_usuario` para esa obra
3. **Permite el acceso** si la validación es exitosa
4. **Rechaza con 403 Forbidden** si el usuario no tiene acceso a esa obra

**Ejemplo de validación:**

```typescript
// Usuario intenta acceder:
GET /api/v1/obras/obra-uuid-123/materiales

// TenantGuard verifica:
SELECT * FROM obra_usuario 
WHERE user_id = {userId del JWT} 
AND obra_id = 'obra-uuid-123'

// Si no existe → 403 Forbidden
// Si existe → Permite acceso
```

---

## ✅ Verificación de Correcciones

### Test 1: Materiales por Obra

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.general@ingenieria.com","password":"secret"}'

# Listar obras
curl http://localhost:3000/api/v1/auth/my-obras \
  -H "Authorization: Bearer {TOKEN}"

# Materiales de obra 1
curl http://localhost:3000/api/v1/obras/{OBRA_ID_1}/materiales \
  -H "Authorization: Bearer {TOKEN}"

# Materiales de obra 2
curl http://localhost:3000/api/v1/obras/{OBRA_ID_2}/materiales \
  -H "Authorization: Bearer {TOKEN}"
```

**Resultado esperado:** Los materiales son diferentes entre obra 1 y obra 2.

---

### Test 2: Validación de Permisos

```bash
# Login como admin.obra1@ingenieria.com (solo tiene 2 obras)
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.obra1@ingenieria.com","password":"secret"}'

# Listar obras (verás solo 2)
curl http://localhost:3000/api/v1/auth/my-obras \
  -H "Authorization: Bearer {TOKEN}"

# Intentar acceder a una obra NO asignada
curl http://localhost:3000/api/v1/obras/{OBRA_NO_ASIGNADA}/materiales \
  -H "Authorization: Bearer {TOKEN}"
```

**Resultado esperado:** `403 Forbidden` porque el usuario no tiene acceso a esa obra.

---

## 📊 Resumen de Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `postman_collection.json` | 16 endpoints actualizados con rutas anidadas |
| `POSTMAN_GUIDE.md` | Flujo actualizado, explicación de enfoques multi-tenant |
| `POSTMAN_COLLECTION_FIXED.md` | Este documento con detalles de las correcciones |

---

## 🚀 Próximos Pasos

1. ✅ Re-importar la colección en Postman
2. ✅ Ejecutar el flujo completo siguiendo `POSTMAN_GUIDE.md`
3. ✅ Verificar que los materiales/bitácoras/asistencias se filtran correctamente por obra
4. ✅ Probar con diferentes usuarios para validar permisos
5. ✅ Confirmar que `TenantGuard` rechaza accesos no autorizados

---

## 📞 Endpoints Disponibles (Resumen Completo)

### Autenticación
- `POST /auth/email/login`
- `GET /auth/me`
- `GET /auth/my-obras`
- `POST /auth/switch-obra` (opcional)

### Obras
- `GET /obras`
- `POST /obras`
- `GET /obras/:id`
- `PATCH /obras/:id`
- `POST /obras/asignar-usuario`

### Materiales (requieren obraId)
- `GET /obras/:obraId/materiales`
- `POST /obras/:obraId/materiales`
- `GET /obras/:obraId/materiales/:id`
- `PATCH /obras/:obraId/materiales/:id`
- `DELETE /obras/:obraId/materiales/:id`

### Bitácoras (requieren obraId)
- `GET /obras/:obraId/bitacoras`
- `POST /obras/:obraId/bitacoras`
- `GET /obras/:obraId/bitacoras/:id`
- `PATCH /obras/:obraId/bitacoras/:id`
- `DELETE /obras/:obraId/bitacoras/:id`

### Asistencias (requieren obraId)
- `GET /obras/:obraId/asistencias`
- `POST /obras/:obraId/asistencias`
- `GET /obras/:obraId/asistencias/:id`
- `PATCH /obras/:obraId/asistencias/:id`
- `DELETE /obras/:obraId/asistencias/:id`

### Documentos (requieren obraId)
- `GET /obras/:obraId/documentos`
- `POST /obras/:obraId/documentos`
- `GET /obras/:obraId/documentos/:id`
- `PATCH /obras/:obraId/documentos/:id`
- `DELETE /obras/:obraId/documentos/:id`

### Presupuestos (requieren obraId)
- `GET /obras/:obraId/presupuestos`
- `POST /obras/:obraId/presupuestos`
- `GET /obras/:obraId/presupuestos/:id`
- `PATCH /obras/:obraId/presupuestos/:id`
- `DELETE /obras/:obraId/presupuestos/:id`

### Activity Logs
- `GET /logs` (solo Admin General)

### Usuarios y Roles
- `GET /users`
- `GET /roles`

---

¡Colección corregida y lista para usar! 🎉
