# 📋 Cambios en la API - Guía para Frontend

**Fecha:** Noviembre 2024  
**Versión API:** v1  
**Compatibilidad:** ✅ **100% Retrocompatible** - No se requieren cambios obligatorios

---

## 🎯 Resumen Ejecutivo

Se agregaron nuevas funcionalidades a **Bitácoras** y **Materiales**. Todos los cambios son **opcionales** y **retrocompatibles**. El frontend puede seguir funcionando sin cambios, o aprovechar las nuevas funcionalidades cuando esté listo.

---

## 📦 1. Bitácoras - Cambios

### 1.1 Nuevo Campo en Respuestas

Todas las respuestas de bitácoras ahora incluyen un campo adicional:

```typescript
interface Bitacora {
  id: string;
  obra_id: string;
  usuario_id: number;
  descripcion: string;
  avance_porcentaje: number;
  archivos: string[];
  fecha: Date;
  generada_por_ia: boolean;  // ← NUEVO (siempre presente)
  created_at: Date;
}
```

**Ejemplo de respuesta:**
```json
{
  "id": "uuid-123",
  "descripcion": "Bitácora de prueba",
  "avance_porcentaje": 50,
  "generada_por_ia": false,  // ← Nuevo campo
  "fecha": "2024-11-10",
  ...
}
```

**Acción requerida:** Ninguna. El campo está siempre presente, puedes ignorarlo o usarlo para mostrar un badge "Generada por IA".

---

### 1.2 Nuevo Filtro Opcional en Listar Bitácoras

**Endpoint:** `GET /api/v1/obras/:obraId/bitacoras`

**Query Parameter Nuevo (opcional):**
- `generada_por_ia=true` - Solo bitácoras generadas por IA
- `generada_por_ia=false` - Solo bitácoras manuales
- Sin parámetro - Todas las bitácoras (comportamiento anterior)

**Ejemplos:**

```typescript
// Obtener todas las bitácoras (comportamiento anterior)
GET /api/v1/obras/{obraId}/bitacoras

// Obtener solo bitácoras generadas por IA
GET /api/v1/obras/{obraId}/bitacoras?generada_por_ia=true

// Obtener solo bitácoras manuales
GET /api/v1/obras/{obraId}/bitacoras?generada_por_ia=false
```

**Acción requerida:** Ninguna. Si no envías el parámetro, funciona igual que antes.

---

### 1.3 Endpoint Generar Informe IA - Respuesta Ampliada

**Endpoint:** `POST /api/v1/obras/:obraId/bitacoras/generar-informe-ia`

**Cambio:** La respuesta ahora incluye la bitácora guardada automáticamente:

**Antes:**
```json
{
  "success": true,
  "data": {
    "html": "<div>...</div>",
    "tokensUsados": 1234
  }
}
```

**Ahora:**
```json
{
  "success": true,
  "data": {
    "html": "<div>...</div>",
    "tokensUsados": 1234,
    "bitacora": {                    // ← NUEVO
      "id": "uuid-123",
      "descripcion": "...",
      "avance_porcentaje": 76,
      "generada_por_ia": true,      // ← Siempre true en este caso
      "fecha": "2024-11-10",
      ...
    }
  }
}
```

**Acción requerida:** Ninguna. Puedes seguir usando solo `data.html` como antes, o usar `data.bitacora` para mostrar la bitácora guardada en la lista.

---

## 📦 2. Materiales - Cambios

### 2.1 Nuevos Campos Opcionales en Requests

Al crear o actualizar materiales, ahora puedes enviar campos adicionales:

**Endpoint:** `POST /api/v1/obras/:obraId/materiales`  
**Endpoint:** `PATCH /api/v1/obras/:obraId/materiales/:id`

**Campos nuevos (todos opcionales):**

```typescript
interface CreateMaterialDto {
  nombre: string;                    // Requerido (sin cambios)
  categoria?: string;                 // Opcional (sin cambios)
  cantidad?: number;                  // Opcional (sin cambios)
  unidad?: string;                    // Opcional (sin cambios)
  proveedor?: string;                 // Opcional (sin cambios)
  
  // ← NUEVOS CAMPOS (todos opcionales)
  cantidad_disponible?: number;      // Cantidad actual disponible
  cantidad_requerida?: number;        // Cantidad total requerida
  estado?: 'pendiente' | 'comprado' | 'en_transito' | 'disponible';
}
```

**Ejemplo de request (sin cambios - sigue funcionando):**
```json
{
  "nombre": "Cemento Portland",
  "cantidad": 100,
  "unidad": "bolsas"
}
```

**Ejemplo de request (con nuevos campos):**
```json
{
  "nombre": "Cemento Portland",
  "cantidad": 100,
  "cantidad_disponible": 50,
  "cantidad_requerida": 100,
  "estado": "pendiente",
  "unidad": "bolsas",
  "proveedor": "Cementos del Norte"
}
```

**Acción requerida:** Ninguna. Los requests anteriores siguen funcionando igual.

---

### 2.2 Nuevos Campos en Respuestas

Todas las respuestas de materiales ahora incluyen campos adicionales:

```typescript
interface Material {
  id: string;
  obra_id: string;
  nombre: string;
  categoria?: string;
  cantidad?: number;
  unidad?: string;
  proveedor?: string;
  
  // ← NUEVOS CAMPOS (siempre presentes en respuestas)
  cantidad_disponible?: number;      // Si se envió en el request
  cantidad_requerida?: number;        // Si se envió en el request
  estado?: string;                    // Si se envió en el request
  cantidad_faltante: number;          // ← Calculado automáticamente
  created_at: Date;
  updated_at: Date;
}
```

**Ejemplo de respuesta:**
```json
{
  "id": "uuid-123",
  "nombre": "Cemento Portland",
  "cantidad": 100,
  "cantidad_disponible": 50,
  "cantidad_requerida": 100,
  "cantidad_faltante": 50,           // ← Calculado: requerida - disponible
  "estado": "pendiente",
  "unidad": "bolsas",
  ...
}
```

**Nota importante:** `cantidad_faltante` se calcula automáticamente como:
```
cantidad_faltante = max(0, cantidad_requerida - cantidad_disponible)
```

Si no se envió `cantidad_requerida`, se usa `cantidad` como referencia.

**Acción requerida:** Ninguna. Los campos están presentes pero puedes ignorarlos. O puedes usarlos para mostrar:
- Badge de estado del material
- Barra de progreso de disponibilidad
- Alerta cuando `cantidad_faltante > 0`

---

### 2.3 Nuevo Filtro Opcional en Listar Materiales

**Endpoint:** `GET /api/v1/obras/:obraId/materiales`

**Query Parameter Nuevo (opcional):**
- `estado=pendiente` - Solo materiales pendientes
- `estado=comprado` - Solo materiales comprados
- `estado=en_transito` - Solo materiales en tránsito
- `estado=disponible` - Solo materiales disponibles
- Sin parámetro - Todos los materiales (comportamiento anterior)

**Ejemplos:**

```typescript
// Obtener todos los materiales (comportamiento anterior)
GET /api/v1/obras/{obraId}/materiales

// Obtener solo materiales pendientes
GET /api/v1/obras/{obraId}/materiales?estado=pendiente

// Obtener solo materiales comprados
GET /api/v1/obras/{obraId}/materiales?estado=comprado
```

**Acción requerida:** Ninguna. Si no envías el parámetro, funciona igual que antes.

---

## 📊 Resumen de Compatibilidad

| Endpoint | Cambio | Requerido | Retrocompatible |
|----------|--------|-----------|-----------------|
| `GET /bitacoras` | Campo `generada_por_ia` en respuesta | ❌ No | ✅ Sí |
| `GET /bitacoras` | Query param `generada_por_ia` | ❌ No | ✅ Sí |
| `POST /bitacoras/generar-informe-ia` | Campo `bitacora` en respuesta | ❌ No | ✅ Sí |
| `GET /materiales` | Query param `estado` | ❌ No | ✅ Sí |
| `POST /materiales` | Campos opcionales nuevos | ❌ No | ✅ Sí |
| `PATCH /materiales/:id` | Campos opcionales nuevos | ❌ No | ✅ Sí |
| Respuestas materiales | Campos nuevos en respuesta | ❌ No | ✅ Sí |

---

## 🎨 Sugerencias de UI/UX (Opcional)

### Bitácoras

1. **Badge de tipo:**
   ```tsx
   {bitacora.generada_por_ia && (
     <Badge color="blue">Generada por IA</Badge>
   )}
   ```

2. **Filtros en la lista:**
   ```tsx
   <FilterButtons>
     <Button onClick={() => fetchBitacoras()}>Todas</Button>
     <Button onClick={() => fetchBitacoras('true')}>IA</Button>
     <Button onClick={() => fetchBitacoras('false')}>Manuales</Button>
   </FilterButtons>
   ```

### Materiales

1. **Filtros por estado:**
   ```tsx
   <FilterButtons>
     <Button onClick={() => fetchMateriales()}>Todos</Button>
     <Button onClick={() => fetchMateriales('pendiente')}>Pendientes</Button>
     <Button onClick={() => fetchMateriales('comprado')}>Comprados</Button>
     <Button onClick={() => fetchMateriales('en_transito')}>En Tránsito</Button>
     <Button onClick={() => fetchMateriales('disponible')}>Disponibles</Button>
   </FilterButtons>
   ```

2. **Badge de estado:**
   ```tsx
   <Badge color={getEstadoColor(material.estado)}>
     {material.estado}
   </Badge>
   ```

3. **Barra de progreso:**
   ```tsx
   <ProgressBar
     current={material.cantidad_disponible}
     total={material.cantidad_requerida}
     faltante={material.cantidad_faltante}
   />
   ```

4. **Alerta de faltante:**
   ```tsx
   {material.cantidad_faltante > 0 && (
     <Alert type="warning">
       Faltan {material.cantidad_faltante} {material.unidad}
     </Alert>
   )}
   ```

---

## 🔍 Ejemplos de Código

### TypeScript Interfaces

```typescript
// Bitácoras
interface Bitacora {
  id: string;
  obra_id: string;
  usuario_id: number;
  descripcion: string;
  avance_porcentaje: number;
  archivos: string[];
  fecha: Date;
  generada_por_ia: boolean;  // ← NUEVO
  created_at: Date;
}

// Materiales
interface Material {
  id: string;
  obra_id: string;
  nombre: string;
  categoria?: string;
  cantidad?: number;
  cantidad_disponible?: number;  // ← NUEVO
  cantidad_requerida?: number;    // ← NUEVO
  cantidad_faltante: number;      // ← NUEVO (calculado)
  estado?: 'pendiente' | 'comprado' | 'en_transito' | 'disponible';  // ← NUEVO
  unidad?: string;
  proveedor?: string;
  created_at: Date;
  updated_at: Date;
}

// Estados de material
type MaterialEstado = 'pendiente' | 'comprado' | 'en_transito' | 'disponible';
```

### Ejemplo de Request (Materiales)

```typescript
// Crear material básico (sin cambios)
const crearMaterialBasico = async (obraId: string) => {
  const response = await fetch(`/api/v1/obras/${obraId}/materiales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Cemento',
      cantidad: 100,
      unidad: 'bolsas'
    })
  });
};

// Crear material con seguimiento (nuevo)
const crearMaterialConSeguimiento = async (obraId: string) => {
  const response = await fetch(`/api/v1/obras/${obraId}/materiales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Cemento Portland',
      cantidad: 100,
      cantidad_disponible: 50,
      cantidad_requerida: 100,
      estado: 'pendiente',
      unidad: 'bolsas',
      proveedor: 'Cementos del Norte'
    })
  });
  
  const material = await response.json();
  console.log('Cantidad faltante:', material.cantidad_faltante); // 50
};
```

### Ejemplo de Filtro (Bitácoras)

```typescript
// Obtener todas las bitácoras (sin cambios)
const todasLasBitacoras = async (obraId: string) => {
  const response = await fetch(`/api/v1/obras/${obraId}/bitacoras`);
  return response.json();
};

// Filtrar por tipo (nuevo)
const bitacorasPorTipo = async (obraId: string, generadaPorIa?: boolean) => {
  const url = generadaPorIa !== undefined
    ? `/api/v1/obras/${obraId}/bitacoras?generada_por_ia=${generadaPorIa}`
    : `/api/v1/obras/${obraId}/bitacoras`;
  
  const response = await fetch(url);
  return response.json();
};

// Uso
const bitacorasIA = await bitacorasPorTipo(obraId, true);
const bitacorasManuales = await bitacorasPorTipo(obraId, false);
```

### Ejemplo de Filtro (Materiales)

```typescript
// Obtener todos los materiales (sin cambios)
const todosLosMateriales = async (obraId: string) => {
  const response = await fetch(`/api/v1/obras/${obraId}/materiales`);
  return response.json();
};

// Filtrar por estado (nuevo)
const materialesPorEstado = async (obraId: string, estado?: string) => {
  const url = estado
    ? `/api/v1/obras/${obraId}/materiales?estado=${estado}`
    : `/api/v1/obras/${obraId}/materiales`;
  
  const response = await fetch(url);
  return response.json();
};

// Uso
const materialesPendientes = await materialesPorEstado(obraId, 'pendiente');
const materialesComprados = await materialesPorEstado(obraId, 'comprado');
```

---

## ✅ Checklist para Frontend

- [ ] **Ningún cambio requerido** - Todo sigue funcionando igual
- [ ] (Opcional) Actualizar interfaces TypeScript con nuevos campos
- [ ] (Opcional) Mostrar badge "Generada por IA" en bitácoras
- [ ] (Opcional) Agregar filtro por tipo en lista de bitácoras
- [ ] (Opcional) Mostrar estado y cantidad faltante en materiales
- [ ] (Opcional) Agregar filtro por estado en lista de materiales
- [ ] (Opcional) Agregar campos de seguimiento al formulario de materiales

---

## 📞 Soporte

Si tienes dudas sobre estos cambios:
- Revisa la documentación Swagger: `http://localhost:3000/docs`
- Prueba los endpoints en Postman: `postman_collection.json`
- Consulta los ejemplos en este documento

---

**Última actualización:** Noviembre 2024

