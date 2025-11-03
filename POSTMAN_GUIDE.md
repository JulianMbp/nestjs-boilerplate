# Guía de Uso - Colección Postman Multi-Tenant

## 📋 Contenido

Esta colección de Postman contiene **30+ requests** organizados en 7 categorías para probar el flujo completo del sistema multi-tenant de obras.

## 🚀 Importar la Colección

1. Abre Postman
2. Click en **Import** (esquina superior izquierda)
3. Arrastra el archivo `postman_collection.json` o click en **Upload Files**
4. La colección "NestJS Multi-Tenant Boilerplate" aparecerá en tu sidebar

## ⚙️ Configuración Inicial

La colección ya incluye las variables necesarias. Solo necesitas verificar que el servidor esté corriendo:

```bash
npm run start:dev
```

### Variables de Entorno

La colección usa estas variables que se configuran automáticamente:

- `baseUrl`: http://localhost:3000/api/v1
- `accessToken`: Se actualiza automáticamente al hacer login
- `refreshToken`: Se actualiza automáticamente al hacer login
- `userId`: ID del usuario autenticado
- `obraId`: ID de la obra seleccionada
- `obraName`: Nombre de la obra seleccionada
- `materialId`, `bitacoraId`, `asistenciaId`: IDs de recursos

## 🎯 Camino Feliz - Flujo Completo

### **PASO 1: Autenticación**

#### 1.1 Login - Admin General
Ejecuta: `1. Autenticación > 1.1 Login - Admin General`

**Credenciales:**
- Email: `admin.general@ingenieria.com`
- Password: `secret`

**Resultado esperado:**
- ✅ Status 200
- ✅ Token JWT en la respuesta
- ✅ Variable `accessToken` se actualiza automáticamente
- ✅ Variable `userId` se guarda

**Usuario creado en seeders:**
- Tiene acceso a **todas las 4 obras**
- Rol: Admin General de IngenierIA

---

#### 1.4 Me - Información del usuario
Ejecuta: `1. Autenticación > 1.4 Me - Información del usuario`

**Resultado esperado:**
- ✅ Status 200
- ✅ Información del usuario actual
- ✅ Roles asignados

---

### **PASO 2: Listar Mis Obras**

#### 2.1 Mis Obras - Listar
Ejecuta: `2. Gestión de Obras > 2.1 Mis Obras - Listar`

**Resultado esperado:**
```json
[
  {
    "id": "abc-123...",
    "obra": {
      "id": "uuid-obra-1",
      "nombre": "Edificio Central Plaza",
      "descripcion": "...",
      "direccion": "..."
    },
    "role": {
      "id": 8,
      "name": "Admin General IngenierIA"
    }
  },
  {
    "obra": {
      "nombre": "Torre Empresarial Norte"
    }
  },
  // ... más obras
]
```

**Variables actualizadas:**
- `obraId`: ID de la primera obra
- `obraName`: Nombre de la primera obra

---

### **PASO 3: Entender el Sistema Multi-Tenant**

#### 🔑 Dos Formas de Acceder a Recursos por Obra

El sistema soporta dos enfoques para el filtrado multi-tenant:

**Enfoque 1: Rutas Anidadas (Actual - Materiales, Bitácoras, Asistencias)**
- URL: `/api/v1/obras/{obraId}/materiales`
- El `obraId` se especifica en el path de la URL
- El `TenantGuard` valida que el usuario tenga acceso a esa obra
- **Ventaja:** Explícito, RESTful, fácil de entender
- **Uso:** Cambiar de obra = cambiar el `obraId` en la URL

**Enfoque 2: JWT con obraId (Opcional - Para Uso Futuro)**
- El endpoint `POST /auth/switch-obra` genera un nuevo JWT con `obraId` en el payload
- Los endpoints podrían usar este `obraId` del token para filtrar
- **Ventaja:** No requiere `obraId` en cada URL
- **Nota:** Los endpoints actuales NO usan este enfoque

Para esta colección, usaremos **Enfoque 1** (rutas anidadas).

#### 2.2 Switch Obra (Opcional - Solo para Testing JWT)
Ejecuta: `2. Gestión de Obras > 2.2 Cambiar de Obra - Switch`

**Nota:** Este endpoint existe pero **NO es necesario** para acceder a materiales/bitácoras/asistencias, ya que esos endpoints usan rutas anidadas con `obraId` en el path.

**Uso opcional:** Si en el futuro se implementan endpoints que lean `obraId` del JWT en lugar del path.

---

### **PASO 4: Ver Materiales de la Obra**

#### 3.1 Listar Materiales de la Obra
Ejecuta: `3. Materiales > 3.1 Listar Materiales de la Obra`

**URL:** `GET /api/v1/obras/{{obraId}}/materiales?page=1&limit=20`

**Importante:** El `obraId` debe estar en la variable de entorno (se guardó automáticamente en el PASO 2)

**Resultado esperado:**
```json
{
  "data": [
    {
      "id": "uuid-material",
      "nombre": "Cemento Portland",
      "descripcion": "Cemento tipo I para construcción general",
      "unidadMedida": "bolsa",
      "cantidadDisponible": 500,
      "precioUnitario": 32.50,
      "obraId": "uuid-obra-1"
    },
    {
      "nombre": "Varilla de acero"
    },
    // ... más materiales
  ],
  "meta": {
    "page": 1,
    "take": 20,
    "itemCount": 7,
    "pageCount": 1
  }
}
```

**Variables actualizadas:**
- `materialId`: ID del primer material

---

#### 3.2 Buscar Material por Nombre
Ejecuta: `3. Materiales > 3.2 Buscar Material por Nombre`

**Filtros aplicados:**
- `filters[nombre]=$eq:Cemento`

**Resultado:** Solo materiales con "Cemento" en el nombre de la obra actual.

---

#### 3.3 Obtener Material por ID
Ejecuta: `3. Materiales > 3.3 Obtener Material por ID`

**Resultado:** Detalles completos del material seleccionado.

---

### **PASO 5: Ver Bitácoras de la Obra**

#### 4.1 Listar Bitácoras de la Obra
Ejecuta: `4. Bitácoras > 4.1 Listar Bitácoras de la Obra`

**URL:** `GET /api/v1/obras/{{obraId}}/bitacoras?page=1&limit=20`

**Resultado esperado:**
```json
{
  "data": [
    {
      "id": "uuid-bitacora",
      "titulo": "Inicio de cimentación",
      "descripcion": "Se dio inicio a los trabajos de cimentación...",
      "fecha": "2025-11-01T08:00:00.000Z",
      "obraId": "uuid-obra-1",
      "createdAt": "2025-11-03T00:00:00.000Z"
    },
    // ... más bitácoras
  ],
  "meta": {
    "page": 1,
    "itemCount": 7
  }
}
```

**Variables actualizadas:**
- `bitacoraId`: ID de la primera bitácora

---

#### 4.2 Filtrar por Fecha
Ejecuta: `4. Bitácoras > 4.2 Filtrar por Fecha`

**Filtros aplicados:**
- `filters[fecha]=$gte:2025-11-01` (bitácoras desde el 1 de noviembre)

---

### **PASO 6: Ver Asistencias de la Obra**

#### 5.1 Listar Asistencias de la Obra
Ejecuta: `5. Asistencias > 5.1 Listar Asistencias de la Obra`

**URL:** `GET /api/v1/obras/{{obraId}}/asistencias?page=1&limit=20`

**Resultado esperado:**
```json
{
  "data": [
    {
      "id": "uuid-asistencia",
      "fecha": "2025-11-03T08:00:00.000Z",
      "estado": "presente",
      "notas": "Entrada registrada a tiempo",
      "obraId": "uuid-obra-1",
      "usuarioId": "uuid-usuario"
    },
    // ... más asistencias
  ]
}
```

**Variables actualizadas:**
- `asistenciaId`: ID de la primera asistencia

---

#### 5.2 Filtrar por Estado
Ejecuta: `5. Asistencias > 5.2 Filtrar por Estado`

**Filtros aplicados:**
- `filters[estado]=$eq:presente`

**Valores posibles:** `presente`, `ausente`, `tardanza`

---

### **PASO 7: Ver Activity Logs**

#### 6.1 Listar Activity Logs del Sistema
Ejecuta: `6. Activity Logs > 6.1 Listar Activity Logs de la Obra`

**URL:** `GET /api/v1/logs?page=1&limit=20`

**Nota:** Este endpoint NO requiere obraId en el path, solo permisos de Admin General.

**Resultado:** Todos los registros de actividad del sistema completo (todas las obras).

---

### **PASO 8: Cambiar a Otra Obra**

#### Verificar el Multi-Tenant

1. Ejecuta nuevamente `2.1 Mis Obras - Listar`
2. **Manualmente** copia el `id` de otra obra de la respuesta
3. Actualiza la variable `obraId` en Postman:
   - Click en el ícono del ojo 👁️ (esquina superior derecha)
   - Edita el valor de `obraId` con el ID de otra obra
4. Ejecuta nuevamente `3.1 Listar Materiales`

**Resultado esperado:**
- ✅ Los materiales mostrados son **diferentes**
- ✅ Corresponden a la nueva obra (mismo obraId que está en la URL)
- ✅ El filtrado funciona porque la URL incluye `/obras/{obraId}/materiales`

**Nota importante:** Ya NO necesitas hacer "Switch Obra" para ver recursos de otra obra. Solo cambia la variable `obraId` en Postman y los endpoints usarán ese ID en la URL.

---

## 🔄 Flujos Adicionales

### Crear Nuevos Recursos

#### Crear Material
Ejecuta: `3. Materiales > 3.4 Crear Material`

**Body:**
```json
{
  "nombre": "Material de Prueba",
  "descripcion": "Material creado desde Postman",
  "unidadMedida": "unidad",
  "cantidadDisponible": 100,
  "precioUnitario": 25.50,
  "obraId": "{{obraId}}"
}
```

---

#### Crear Bitácora
Ejecuta: `4. Bitácoras > 4.4 Crear Bitácora`

**Body:**
```json
{
  "titulo": "Bitácora de Prueba",
  "descripcion": "Entrada de bitácora creada desde Postman para testing",
  "fecha": "2025-11-03T10:00:00.000Z",
  "obraId": "{{obraId}}"
}
```

---

#### Crear Asistencia
Ejecuta: `5. Asistencias > 5.4 Crear Asistencia`

**Body:**
```json
{
  "fecha": "2025-11-03T08:00:00.000Z",
  "estado": "presente",
  "notas": "Asistencia registrada desde Postman",
  "obraId": "{{obraId}}"
}
```

---

### Actualizar Recursos

#### Actualizar Material
Ejecuta: `3. Materiales > 3.5 Actualizar Material`

**Body (PATCH - solo campos a actualizar):**
```json
{
  "cantidadDisponible": 150,
  "precioUnitario": 27.00
}
```

---

#### Actualizar Bitácora
Ejecuta: `4. Bitácoras > 4.5 Actualizar Bitácora`

---

#### Actualizar Asistencia
Ejecuta: `5. Asistencias > 5.5 Actualizar Asistencia`

**Body:**
```json
{
  "estado": "tardanza",
  "notas": "Llegó 15 minutos tarde"
}
```

---

## 👥 Usuarios de Prueba Disponibles

Todos con password: **`secret`**

### Administradores

| Email | Obras con Acceso | Descripción |
|-------|-----------------|-------------|
| `admin.general@ingenieria.com` | Todas (4) | Admin general con acceso total |
| `admin.obra1@ingenieria.com` | 2 obras | Admin de obras específicas |
| `admin.obra2@ingenieria.com` | 2 obras | Admin de obras específicas |

### Usuarios Regulares

| Email | Rol |
|-------|-----|
| `john.doe@example.com` | Usuario estándar |
| `ingeniero1@ingenieria.com` | Ingeniero |
| `supervisor1@ingenieria.com` | Supervisor |
| `trabajador1@ingenieria.com` | Trabajador |
| Y más... (13 usuarios en total) |

---

## 🏗️ Obras Disponibles (Seeders)

1. **Edificio Central Plaza**
   - Descripción: Edificio comercial de 20 pisos en el centro de la ciudad
   - 7 materiales
   - 7 bitácoras

2. **Torre Empresarial Norte**
   - Descripción: Torre de oficinas corporativas de 25 pisos
   - 7 materiales
   - 7 bitácoras

3. **Conjunto Residencial Alameda**
   - Descripción: Complejo residencial de 100 unidades habitacionales
   - 7 materiales
   - 7 bitácoras

4. **Centro Comercial Portal del Sur**
   - Descripción: Centro comercial de 3 niveles con estacionamiento subterráneo
   - 7 materiales
   - 7 bitácoras

---

## 🧪 Tests Automáticos

Cada request incluye **tests automáticos** que verifican:

✅ Status code correcto (200, 201, etc.)
✅ Estructura de la respuesta
✅ Variables se actualizan automáticamente
✅ Logs en la consola de Postman

Para ver los resultados:
1. Ejecuta un request
2. Abre la pestaña **Test Results** en la parte inferior
3. Verás los tests pasados ✓ o fallados ✗

---

## 🎨 Orden Recomendado de Ejecución

### **Flujo Completo (Happy Path)**

```
1. Login (1.1)
   ↓
2. Ver información del usuario (1.4)
   ↓
3. Listar mis obras (2.1)
   ↓
4. Cambiar a una obra (2.2) ← CLAVE
   ↓
5. Ver materiales (3.1)
   ↓
6. Ver bitácoras (4.1)
   ↓
7. Ver asistencias (5.1)
   ↓
8. Ver activity logs (6.1)
   ↓
9. Cambiar a otra obra (2.2 con nuevo obraId)
   ↓
10. Ver materiales de la nueva obra (3.1)
    ↓
11. Confirmar que son diferentes ✓
```

---

## 🔐 Autenticación

Todas las requests (excepto login) usan **Bearer Token Authentication**.

El token se configura automáticamente en:
- **Collection Level**: Todas las carpetas heredan la autenticación
- **Variable**: `{{accessToken}}`

No necesitas configurar nada manualmente, los scripts automáticos lo hacen por ti.

---

## 🐛 Troubleshooting

### Error: "Cannot GET /api/v1/..."

**Solución:** Verifica que el servidor esté corriendo
```bash
npm run start:dev
```

---

### Error: 401 Unauthorized

**Solución:** 
1. Ejecuta nuevamente `1.1 Login - Admin General`
2. El token se actualizará automáticamente

---

### Error: No veo materiales/bitácoras

**Solución:**
1. Verifica que ejecutaste `2.2 Cambiar de Obra - Switch`
2. El `obraId` debe estar en el token JWT
3. Ejecuta `1.4 Me` para confirmar el token actual

---

### Variables no se actualizan

**Solución:**
1. Abre la consola de Postman (View > Show Postman Console)
2. Verifica los logs de los scripts
3. Revisa la pestaña **Test Results** para ver errores

---

## 📊 Verificar el Multi-Tenant

Para confirmar que el sistema multi-tenant funciona correctamente:

1. **Login** con `admin.general@ingenieria.com`
2. **Listar obras** (2.1) → Deberías ver 4 obras
3. **Copiar obraId de la primera obra** → Actualizar variable `obraId` en Postman
4. **Listar materiales** (3.1) → Anota cuántos hay y sus nombres
5. **Copiar obraId de otra obra** → Actualizar variable `obraId` en Postman
6. **Listar materiales** (3.1) → Deberías ver materiales **diferentes**

**URLs que se usan:**
- Obra 1: `GET /api/v1/obras/{obraId-1}/materiales`
- Obra 2: `GET /api/v1/obras/{obraId-2}/materiales`

Si los materiales son diferentes en cada obra, ✅ **el multi-tenant funciona correctamente**.

**Nota:** El filtrado por obra se hace a nivel de URL (path parameter `obraId`), no mediante JWT. El `TenantGuard` valida que el usuario tenga acceso a la obra especificada en la URL.

---

## 🎯 Casos de Uso Reales

### Usuario que trabaja en múltiples obras

1. Login como `admin.obra1@ingenieria.com`
2. Listar mis obras → Ver 2 obras asignadas
3. Copiar `obraId` de "Edificio Central Plaza"
4. Actualizar variable `obraId` en Postman
5. Crear material en `GET /obras/{obraId}/materiales`
6. Copiar `obraId` de "Torre Empresarial Norte"
7. Actualizar variable `obraId` en Postman
8. Crear material diferente
9. Volver al primer `obraId`
10. Confirmar que solo ves el primer material

---

### Administrador general supervisando todas las obras

1. Login como `admin.general@ingenieria.com`
2. Listar mis obras → Ver 4 obras
3. Para cada obra:
   - Copiar su `obraId`
   - Actualizar variable en Postman
   - Ver materiales: `GET /obras/{obraId}/materiales`
   - Ver bitácoras: `GET /obras/{obraId}/bitacoras`
   - Ver asistencias: `GET /obras/{obraId}/asistencias`
4. Identificar obras con bajo inventario de materiales
5. Crear reportes por obra

---

## 📝 Notas Importantes

- 🔑 **Todos los passwords:** `secret`
- 🏢 **Total de obras:** 4
- 👥 **Total de usuarios:** 13
- 📦 **Materiales por obra:** 7
- 📖 **Bitácoras por obra:** 7
- ⚡ **Puerto del servidor:** 3000
- 🌐 **Base URL:** http://localhost:3000/api/v1

---

## 🚀 Próximos Pasos

Después de completar el flujo básico:

1. ✅ Probar filtros avanzados (por fecha, estado, etc.)
2. ✅ Crear nuevos recursos (materiales, bitácoras, asistencias)
3. ✅ Actualizar recursos existentes
4. ✅ Probar con diferentes usuarios
5. ✅ Verificar permisos por rol
6. ✅ Implementar TenantGuard para seguridad adicional

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs del servidor: `npm run start:dev`
2. Revisa la consola de Postman
3. Verifica que los seeders se ejecutaron correctamente:
   ```bash
   npm run seed:run:relational
   ```

---

¡Feliz testing! 🎉
