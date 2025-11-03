# IngenierIA Backend - Multi-Tenant Implementation Guide

## 📋 Implementación Completada

### ✅ 1. Migración de Base de Datos
- **Archivo**: `src/database/migrations/1762194778808-NormalizeIngenieriaSchema.ts`
- **Características**:
  - Extensiones UUID (`uuid-ossp`, `pgcrypto`)
  - Enum `asistencia_estado_enum` (presente, ausente, justificado)
  - Todas las tablas con UUIDs en PKs/FKs
  - Triggers automáticos para `updated_at`
  - Foreign Keys con CASCADE apropiado
  - Índices optimizados para queries

### ✅ 2. Entidades TypeORM Creadas

#### Entidades Base:
- **UsuarioEntity** (`src/usuarios/infrastructure/persistence/relational/entities/usuario.entity.ts`)
  - UUID como PK
  - Relación con Role, UserProfile, Obras, ObraUsuarios
  
- **UserProfileEntity** (`src/user-profiles/infrastructure/persistence/relational/entities/user-profile.entity.ts`)
  - Relación 1-1 con Usuario
  - Metadata JSONB
  
- **ObraEntity** (`src/obras/infrastructure/persistence/relational/entities/obra.entity.ts`)
  - UUID PK
  - admin_id (UUID FK a usuarios)
  - Relaciones con todas las entidades obra-scoped
  
- **ObraUsuarioEntity** (`src/obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity.ts`)
  - user_id y obra_id como UUID
  - UNIQUE constraint en (user_id, obra_id)

#### Entidades Obra-Scoped:
- **MaterialEntity** (`src/materiales/infrastructure/persistence/relational/entities/material.entity.ts`)
- **BitacoraEntity** (`src/bitacoras/infrastructure/persistence/relational/entities/bitacora.entity.ts`)
  - archivos: JSONB array
- **AsistenciaEntity** (`src/asistencias/infrastructure/persistence/relational/entities/asistencia.entity.ts`)
  - estado: enum (presente|ausente|justificado)
- **DocumentoEntity** (`src/documentos/infrastructure/persistence/relational/entities/documento.entity.ts`)
- **PresupuestoEntity** (`src/presupuestos/infrastructure/persistence/relational/entities/presupuesto.entity.ts`)
- **ActivityLogEntity** (`src/activity-logs/infrastructure/persistence/relational/entities/activity-log.entity.ts`)

### ✅ 3. Guards y Decorators

#### Guards:
- **TenantGuard** (`src/common/guards/tenant.guard.ts`)
  - Extrae `obra_id` del JWT o params
  - Valida acceso en tabla `obra_usuario`
  - Inyecta `obraId` en request
  
- **RolesGuard** (`src/common/guards/roles.guard.ts`)
  - Valida roles usando metadata
  - Compatible con decorator `@Roles()`

#### Decorators:
- **@CurrentUser** (`src/common/decorators/current-user.decorator.ts`)
- **@CurrentObra** (`src/common/decorators/current-obra.decorator.ts`)
- **@Roles** (`src/common/decorators/roles.decorator.ts`)

#### Interceptors:
- **ActivityLogInterceptor** (`src/common/interceptors/activity-log.interceptor.ts`)
  - Registra automáticamente todas las acciones
  - user_id, obra_id, action, metadata

---

## 🚀 Próximos Pasos para Completar

### 1. Ejecutar Migración
\`\`\`bash
npm run migration:run
\`\`\`

### 2. Refactorizar AuthModule

#### a) Actualizar DTOs de Auth

**Crear**: `src/auth/dto/select-obra.dto.ts`
\`\`\`typescript
import { IsUUID } from 'class-validator';

export class SelectObraDto {
  @IsUUID()
  obra_id: string;
}
\`\`\`

**Actualizar**: `src/auth/dto/login-response.dto.ts`
\`\`\`typescript
export class LoginResponseDto {
  token?: string;
  refreshToken?: string;
  tokenExpires?: number;
  user: User;
  obras?: Array<{ id: string; nombre: string }>; // Si el usuario tiene múltiples obras
  requiresObraSelection?: boolean;
}
\`\`\`

#### b) Refactorizar `auth.service.ts`

**Funciones clave**:
- `validateLogin()`: Si usuario tiene múltiples obras, retornar lista
- `selectObra(userId, obraId)`: Firmar JWT con obra_id
- `generateJWT(user, obraId)`: Incluir obra_id en payload

**Payload JWT**:
\`\`\`typescript
{
  id: string,        // UUID usuario
  email: string,
  role: { id: number, name: string },
  obra_id: string    // UUID obra seleccionada
}
\`\`\`

**Hash bcrypt**: Asegurar salt >= 10
\`\`\`typescript
const hashedPassword = await bcrypt.hash(password, 10);
\`\`\`

#### c) Actualizar Strategy JWT
- Incluir `obra_id` en validación
- Cargar relación `role` con eager loading

### 3. Crear Módulos CRUD

Para cada módulo (Materiales, Bitácoras, Asistencias, Documentos, Presupuestos):

#### Estructura:
\`\`\`
src/<modulo>/
├── domain/
│   └── <entidad>.ts
├── infrastructure/
│   └── persistence/relational/entities/<entidad>.entity.ts
├── dto/
│   ├── create-<entidad>.dto.ts
│   ├── update-<entidad>.dto.ts
│   └── <entidad>.dto.ts
├── <modulo>.controller.ts
├── <modulo>.service.ts
└── <modulo>.module.ts
\`\`\`

#### Controller Template:
\`\`\`typescript
@ApiTags('Materiales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'obras/:obraId/materiales', version: '1' })
export class MaterialesController {
  
  @Get()
  findAll(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.findAllByObra(obraId);
  }

  @Post()
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  create(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Body() dto: CreateMaterialDto,
    @CurrentUser() user: any,
  ) {
    return this.service.create(obraId, dto);
  }

  @Patch(':id')
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  update(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.service.updateInObra(id, obraId, dto);
  }

  @Delete(':id')
  @Roles('Admin General', 'Admin Obra')
  @UseGuards(RolesGuard)
  remove(
    @Param('obraId', ParseUUIDPipe) obraId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.deleteInObra(id, obraId);
  }
}
\`\`\`

#### Service Template con RLS:
\`\`\`typescript
@Injectable()
export class MaterialesService {
  constructor(
    @InjectRepository(MaterialEntity)
    private readonly repo: Repository<MaterialEntity>,
  ) {}

  async findAllByObra(obraId: string) {
    return this.repo.find({ where: { obra_id: obraId } });
  }

  async findOneByIdInObra(id: string, obraId: string) {
    const material = await this.repo.findOne({
      where: { id, obra_id: obraId },
    });
    if (!material) {
      throw new NotFoundException('Material not found in this obra');
    }
    return material;
  }

  async create(obraId: string, dto: CreateMaterialDto) {
    const material = this.repo.create({ ...dto, obra_id: obraId });
    return this.repo.save(material);
  }

  async updateInObra(id: string, obraId: string, dto: UpdateMaterialDto) {
    const material = await this.findOneByIdInObra(id, obraId);
    Object.assign(material, dto);
    return this.repo.save(material);
  }

  async deleteInObra(id: string, obraId: string) {
    const material = await this.findOneByIdInObra(id, obraId);
    await this.repo.remove(material);
  }
}
\`\`\`

### 4. ObrasService - RLS Helpers

\`\`\`typescript
@Injectable()
export class ObrasService {
  async ensureUserAccess(userId: string, obraId: string) {
    const access = await this.obraUsuarioRepo.findOne({
      where: { user_id: userId, obra_id: obraId },
    });
    
    if (!access) {
      throw new ForbiddenException('User does not have access to this obra');
    }
    
    return access;
  }

  async getUserObras(userId: string) {
    const asignaciones = await this.obraUsuarioRepo.find({
      where: { user_id: userId },
      relations: ['obra'],
    });
    
    return asignaciones.map(a => a.obra);
  }
}
\`\`\`

### 5. Seeders

**Archivo**: `src/database/seeds/relational/ingenieria-seed.ts`

\`\`\`typescript
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export async function seedIngenieriaData(dataSource: DataSource) {
  const roleRepo = dataSource.getRepository('role');
  const usuarioRepo = dataSource.getRepository('usuarios');
  const obraRepo = dataSource.getRepository('obras');
  const obraUsuarioRepo = dataSource.getRepository('obra_usuario');
  const materialRepo = dataSource.getRepository('materiales');
  
  // 1. Roles
  const roles = await roleRepo.save([
    { name: 'Admin General', descripcion: 'Administrador del sistema' },
    { name: 'Admin Obra', descripcion: 'Administrador de obra' },
    { name: 'Supervisor', descripcion: 'Supervisor de obra' },
    { name: 'Operario', descripcion: 'Trabajador operativo' },
  ]);
  
  // 2. Admin General
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await usuarioRepo.save({
    email: 'admin@ingenieria.com',
    password: adminPassword,
    first_name: 'Admin',
    last_name: 'General',
    role_id: roles.find(r => r.name === 'Admin General').id,
  });
  
  // 3. Obras
  const obras = await obraRepo.save([
    {
      nombre: 'Edificio Central',
      direccion: 'Calle 123, Ciudad',
      estado: 'activa',
      admin_id: admin.id,
    },
    {
      nombre: 'Vía Panamericana',
      direccion: 'Km 45, Autopista',
      estado: 'activa',
      admin_id: admin.id,
    },
  ]);
  
  // 4. Asignar admin a obras
  for (const obra of obras) {
    await obraUsuarioRepo.save({
      user_id: admin.id,
      obra_id: obra.id,
      role_name: 'Admin General',
    });
  }
  
  // 5. Materiales ejemplo
  await materialRepo.save([
    {
      obra_id: obras[0].id,
      nombre: 'Cemento',
      categoria: 'Construcción',
      cantidad: 100,
      unidad: 'bultos',
      proveedor: 'Cemex',
    },
    {
      obra_id: obras[1].id,
      nombre: 'Acero',
      categoria: 'Estructura',
      cantidad: 50,
      unidad: 'toneladas',
      proveedor: 'Siderúrgica',
    },
  ]);
}
\`\`\`

### 6. Configuración de Seguridad

**app.module.ts**:
\`\`\`typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ActivityLogInterceptor } from './common/interceptors/activity-log.interceptor';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    // ... otros imports
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
  ],
})
export class AppModule {}
\`\`\`

**CORS** en `main.ts`:
\`\`\`typescript
app.enableCors({
  origin: process.env.FRONTEND_DOMAIN || 'http://localhost:3000',
  credentials: true,
});
\`\`\`

**Rate Limiting** en Auth:
\`\`\`typescript
import { Throttle } from '@nestjs/throttler';

@Throttle(5, 60) // 5 requests per 60 seconds
@Post('login')
async login(@Body() dto: AuthEmailLoginDto) {
  return this.service.validateLogin(dto);
}
\`\`\`

---

## 📝 DTOs Ejemplo

### CreateMaterialDto
\`\`\`typescript
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMaterialDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  cantidad?: number;

  @IsOptional()
  @IsString()
  unidad?: string;

  @IsOptional()
  @IsString()
  proveedor?: string;
}
\`\`\`

### CreateAsistenciaDto
\`\`\`typescript
import { IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { AsistenciaEstado } from '../asistencia-estado.enum';

export class CreateAsistenciaDto {
  @IsUUID()
  usuario_id: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsEnum(AsistenciaEstado)
  estado: AsistenciaEstado;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
\`\`\`

---

## 🧪 Tests

### TenantGuard Test
\`\`\`typescript
describe('TenantGuard', () => {
  it('should allow access when user has access to obra', async () => {
    const mockObraUsuarioRepo = {
      findOne: jest.fn().mockResolvedValue({ user_id: 'uuid', obra_id: 'uuid' }),
    };
    
    const guard = new TenantGuard(mockObraUsuarioRepo as any);
    const context = createMockExecutionContext({
      user: { id: 'uuid', obra_id: 'uuid' },
    });
    
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access when user does not have access to obra', async () => {
    const mockObraUsuarioRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    
    const guard = new TenantGuard(mockObraUsuarioRepo as any);
    const context = createMockExecutionContext({
      user: { id: 'uuid', obra_id: 'other-uuid' },
    });
    
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
\`\`\`

---

## 📊 Estructura Final de Módulos

\`\`\`
src/
├── common/
│   ├── guards/
│   │   ├── tenant.guard.ts ✅
│   │   └── roles.guard.ts ✅
│   ├── decorators/
│   │   ├── current-user.decorator.ts ✅
│   │   ├── current-obra.decorator.ts ✅
│   │   └── roles.decorator.ts ✅
│   └── interceptors/
│       └── activity-log.interceptor.ts ✅
├── usuarios/ ✅
├── user-profiles/ ✅
├── obras/ ✅ (actualizar)
├── obra-usuario/ ✅
├── materiales/ ✅ (completar módulo)
├── bitacoras/ ✅ (completar módulo)
├── asistencias/ ✅ (completar módulo)
├── documentos/ ✅ (completar módulo)
├── presupuestos/ ✅ (completar módulo)
├── activity-logs/ ✅ (completar módulo)
└── auth/ (refactorizar)
\`\`\`

---

## 🔥 Comandos Útiles

\`\`\`bash
# Generar migración
npm run migration:generate src/database/migrations/MigrationName

# Ejecutar migraciones
npm run migration:run

# Revertir migración
npm run migration:revert

# Ejecutar seeds
npm run seed:run:relational

# Ejecutar tests
npm run test

# Ejecutar tests E2E
npm run test:e2e
\`\`\`

---

## ✅ Checklist de Implementación

- [x] Migración de normalización del esquema
- [x] Entidades TypeORM base (Usuario, UserProfile, Obra, ObraUsuario)
- [x] Entidades obra-scoped (Material, Bitacora, Asistencia, Documento, Presupuesto, ActivityLog)
- [x] Guards (TenantGuard, RolesGuard)
- [x] Decorators (@CurrentUser, @CurrentObra, @Roles)
- [x] ActivityLogInterceptor
- [ ] Refactorizar AuthModule para multi-tenant
- [ ] Completar módulos CRUD (6 módulos restantes)
- [ ] Crear seeders
- [ ] Configurar seguridad y CORS
- [ ] Tests E2E
- [ ] Tests unitarios

---

## 🎯 Resultado Final

Un sistema multi-tenant completo con:
- ✅ Autenticación JWT con selección de obra
- ✅ RLS lógico mediante guards y validaciones
- ✅ Políticas de acceso por rol
- ✅ Logging automático de actividades
- ✅ CRUD completo para todas las entidades
- ✅ Seguridad robusta (bcrypt, CORS, rate limiting)
- ✅ Tests comprehensivos
