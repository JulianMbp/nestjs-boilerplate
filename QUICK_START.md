# 🚀 IngenierIA Backend - Quick Start Guide

## 📋 Resumen Ejecutivo

Se ha implementado la base completa de un sistema multi-tenant para IngenierIA usando NestJS + TypeORM + PostgreSQL. Este sistema incluye:

- ✅ Esquema normalizado con UUIDs
- ✅ 11 entidades TypeORM con relaciones correctas
- ✅ Guards para multi-tenancy (TenantGuard) y roles (RolesGuard)
- ✅ Logging automático de actividades
- ✅ Módulo de ejemplo completo (Materiales)
- ✅ Seeds con datos de prueba

**Progreso: ~40% completado** | **Tiempo estimado para completar: 8-12 horas**

---

## 🏁 Inicio Rápido (5 pasos)

### 1. Ejecutar la Migración

\`\`\`bash
npm run migration:run
\`\`\`

Esto creará todas las tablas en PostgreSQL con el esquema normalizado.

### 2. Ejecutar el Seeder

\`\`\`bash
npm run seed:run:relational
\`\`\`

Esto poblará la base de datos con:
- 4 roles (Admin General, Admin Obra, Supervisor, Operario)
- 4 usuarios de prueba
- 2 obras (Edificio Central, Vía Panamericana)
- Materiales y presupuestos de ejemplo

### 3. Instalar Dependencias Faltantes

\`\`\`bash
npm install @nestjs/throttler
\`\`\`

### 4. Iniciar el Servidor

\`\`\`bash
npm run start:dev
\`\`\`

### 5. Probar con Credenciales

**Admin General:**
- Email: `admin@ingenieria.com`
- Password: `Admin123!`

**Admin Obra:**
- Email: `admin.obra1@ingenieria.com`
- Password: `ObraAdmin123!`

---

## 🔧 Siguiente: Refactorizar AuthModule

El siguiente paso crítico es adaptar el AuthModule para soportar multi-tenancy.

### Archivos a Modificar

1. **`src/auth/auth.service.ts`**
   - Modificar `validateLogin()` para detectar múltiples obras
   - Crear método `selectObra(userId, obraId)` que firma JWT con obra_id
   - Asegurar bcrypt salt >= 10

2. **`src/auth/auth.controller.ts`**
   - Agregar endpoint `POST /auth/select-obra`

3. **`src/auth/strategies/jwt.strategy.ts`**
   - Incluir `obra_id` en el payload del token

### Payload JWT Requerido

\`\`\`typescript
{
  id: "uuid-usuario",
  email: "user@example.com",
  role: { id: 1, name: "Admin Obra" },
  obra_id: "uuid-obra-seleccionada"  // 👈 NUEVO
}
\`\`\`

### Flujo de Login Multi-Tenant

1. Usuario hace POST `/auth/login` con email/password
2. Backend valida credenciales
3. Si usuario tiene **1 obra**: retornar token con obra_id automático
4. Si usuario tiene **múltiples obras**: retornar lista de obras + `requiresObraSelection: true`
5. Usuario selecciona obra y hace POST `/auth/select-obra` con `{ obra_id }`
6. Backend firma JWT con obra_id y lo retorna

---

## 📦 Módulos Pendientes (Usar MaterialesModule como plantilla)

Copiar la estructura de `src/materiales/` para crear:

1. **BitacorasModule** - `/obras/:obraId/bitacoras`
2. **AsistenciasModule** - `/obras/:obraId/asistencias`
3. **DocumentosModule** - `/obras/:obraId/documentos`
4. **PresupuestosModule** - `/obras/:obraId/presupuestos`
5. **ActivityLogsModule** - `/logs` (solo lectura, Admin General)

### Plantilla de Controller

\`\`\`typescript
@ApiTags('NombreModulo')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller({ path: 'obras/:obraId/recurso', version: '1' })
export class RecursoController {
  @Get()
  findAll(@Param('obraId', ParseUUIDPipe) obraId: string) { }

  @Post()
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  create(@Param('obraId') obraId: string, @Body() dto) { }
  
  // ... update, delete
}
\`\`\`

### Plantilla de Service

\`\`\`typescript
@Injectable()
export class RecursoService {
  async findAllByObra(obraId: string) {
    return this.repo.find({ where: { obra_id: obraId } });
  }

  async findOneByIdInObra(id: string, obraId: string) {
    const item = await this.repo.findOne({ where: { id, obra_id: obraId } });
    if (!item) throw new NotFoundException('Not found in this obra');
    return item;
  }

  async updateInObra(id: string, obraId: string, dto) {
    const item = await this.findOneByIdInObra(id, obraId);
    Object.assign(item, dto);
    return this.repo.save(item);
  }
  
  // ... create, delete
}
\`\`\`

---

## 🧪 Testing Rápido

### Test Manual con curl/Postman

1. **Login:**
\`\`\`bash
POST http://localhost:3000/v1/auth/login
{
  "email": "admin@ingenieria.com",
  "password": "Admin123!"
}
\`\`\`

2. **Seleccionar Obra (si aplica):**
\`\`\`bash
POST http://localhost:3000/v1/auth/select-obra
Authorization: Bearer <token>
{
  "obra_id": "uuid-de-la-obra"
}
\`\`\`

3. **Listar Materiales:**
\`\`\`bash
GET http://localhost:3000/v1/obras/:obraId/materiales
Authorization: Bearer <token-con-obra>
\`\`\`

4. **Crear Material:**
\`\`\`bash
POST http://localhost:3000/v1/obras/:obraId/materiales
Authorization: Bearer <token-con-obra>
{
  "nombre": "Cemento",
  "categoria": "Construcción",
  "cantidad": 50,
  "unidad": "bultos"
}
\`\`\`

---

## 📊 Checklist de Implementación

### ✅ Completado (40%)

- [x] Migración de esquema con UUIDs
- [x] 13 entidades TypeORM
- [x] TenantGuard + RolesGuard
- [x] Decorators (@CurrentUser, @CurrentObra, @Roles)
- [x] ActivityLogInterceptor
- [x] MaterialesModule completo (ejemplo)
- [x] IngenieriaSeeder
- [x] Documentación

### 🔨 En Progreso / Pendiente (60%)

- [ ] Refactorizar AuthModule para multi-tenant
- [ ] Completar 5 módulos CRUD restantes
- [ ] Refactorizar UsuariosModule (migrar a UsuarioEntity)
- [ ] Crear UserProfilesModule
- [ ] Actualizar ObrasModule con endpoints de asignación
- [ ] Crear RolesModule
- [ ] Configurar app.module.ts (interceptor global, throttler)
- [ ] Configurar CORS en main.ts
- [ ] Tests E2E
- [ ] Tests unitarios de guards

---

## 🎯 Prioridades

### Alta Prioridad (Para que el sistema funcione)
1. ✅ Migración ejecutada
2. ✅ Seeds ejecutados
3. ⏳ AuthModule refactorizado (multi-tenant login)
4. ⏳ Al menos 1-2 módulos CRUD adicionales

### Media Prioridad (Para completar funcionalidades)
5. ⏳ Resto de módulos CRUD
6. ⏳ Refactorizar módulos existentes
7. ⏳ Configuraciones globales

### Baja Prioridad (Para producción)
8. ⏳ Tests comprehensivos
9. ⏳ Documentación Swagger completa
10. ⏳ Rate limiting configurado

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
**Solución:** Ejecutar `npm run migration:run`

### Error: "column does not exist"
**Solución:** Verificar que la migración se ejecutó completamente

### Error: TypeORM no encuentra entidades
**Solución:** Revisar que las entidades estén en `src/**/*.entity.ts`

### Error: Guards no funcionan
**Solución:** Verificar que ObraUsuarioEntity esté importada en el módulo del guard

### Error: Seed falla
**Solución:** Ejecutar migración primero, verificar que las tablas existan

---

## 📚 Recursos

### Archivos de Referencia

- **Migración:** `src/database/migrations/1762194778808-NormalizeIngenieriaSchema.ts`
- **Entidades:** `src/*/infrastructure/persistence/relational/entities/*.entity.ts`
- **Guards:** `src/common/guards/*.guard.ts`
- **Ejemplo Completo:** `src/materiales/*`
- **Seeder:** `src/database/seeds/relational/ingenieria/ingenieria-seeder.ts`

### Guías Completas

- **`IMPLEMENTATION_GUIDE.md`** - Guía detallada con templates y ejemplos
- **`IMPLEMENTATION_STATUS.md`** - Estado actual y pendientes
- **Este archivo (`QUICK_START.md`)** - Inicio rápido

---

## 💡 Tips de Desarrollo

1. **Copiar y adaptar:** Usa MaterialesModule como base para otros módulos
2. **Validar siempre obra_id:** Nunca confíes en el body, usa TenantGuard
3. **Logs automáticos:** ActivityLogInterceptor ya registra todo
4. **UUIDs everywhere:** Todas las PKs/FKs de usuarios y obras son UUID
5. **Guards en orden:** Siempre `JwtAuthGuard` → `TenantGuard` → `RolesGuard`

---

## 🎉 Resultado Final Esperado

Al completar la implementación tendrás:

✅ Sistema multi-tenant funcional  
✅ Login con selección de obra  
✅ RLS lógico en todos los endpoints  
✅ CRUD completo para 11 entidades  
✅ Logging automático de actividades  
✅ Autenticación y autorización robusta  
✅ Seeds con datos de prueba  
✅ Tests E2E y unitarios  

---

**¿Listo para continuar?** 

👉 Siguiente paso: Refactorizar `src/auth/auth.service.ts` para multi-tenant

---

**Última actualización:** 3 de noviembre de 2025  
**Versión:** 1.0.0  
**Estado:** Base implementada, pendiente refactorización de auth y módulos CRUD
