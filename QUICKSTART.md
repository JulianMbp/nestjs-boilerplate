# 🚀 Guía Rápida de Ejecución - IngenierIA

## 📋 Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## 🔧 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configúralo:

```bash
cp env-example-relational .env
```

Asegúrate de configurar:

```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=tu_password
DATABASE_NAME=ingenieria_db

AUTH_JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui
AUTH_JWT_TOKEN_EXPIRES_IN=24h
```

### 3. Crear Base de Datos

```bash
# Usando psql
psql -U postgres
CREATE DATABASE ingenieria_db;
\q
```

### 4. Ejecutar Migraciones

```bash
npm run migration:run
```

Esto creará todas las tablas necesarias:
- `user`
- `role` (actualizada con 8 roles de IngenierIA)
- `obra`
- `obra_usuario`
- `session`
- `status`
- `file`

### 5. Ejecutar Seeders

```bash
npm run seed:run:relational
```

Esto creará:
- **Roles**: admin, user, admin_general, admin_obra, encargado_area, obrero, sst, compras, rrhh, consultor
- **Usuario Admin General**:
  - Email: `admin.general@ingenieria.com`
  - Password: `AdminIngenieria2024!`

## 🏃 Ejecución

### Modo Desarrollo

```bash
npm run start:dev
```

La API estará disponible en: `http://localhost:3000`

### Modo Producción

```bash
npm run build
npm run start:prod
```

## 📚 Documentación Swagger

Accede a la documentación interactiva de la API:

```
http://localhost:3000/docs
```

## 🧪 Pruebas Rápidas

### 1. Login como Admin General

```bash
curl -X POST http://localhost:3000/api/v1/auth/ingenieria/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.general@ingenieria.com",
    "password": "AdminIngenieria2024!"
  }'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "tokenExpires": 1730581234567,
  "user": {
    "id": 1,
    "email": "admin.general@ingenieria.com",
    "role": {
      "id": 3,
      "name": "Admin General"
    }
  }
}
```

### 2. Crear una Obra

```bash
# Reemplaza <TOKEN> con el token obtenido en el paso anterior
curl -X POST http://localhost:3000/api/v1/obras \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Torre Empresarial Norte",
    "direccion": "Av. Principal #100-20, Bogotá"
  }'
```

### 3. Listar Obras

```bash
curl -X GET http://localhost:3000/api/v1/obras?page=1&limit=10 \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. Crear Usuario y Asignarlo a Obra

Primero, registra un usuario:

```bash
curl -X POST http://localhost:3000/api/v1/auth/email/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "obrero1@example.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

Confirma el email (en desarrollo, revisa los logs o maildev):

```bash
curl -X POST http://localhost:3000/api/v1/auth/email/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "<HASH_DEL_EMAIL>"
  }'
```

Asigna el usuario a la obra con rol de obrero:

```bash
curl -X POST http://localhost:3000/api/v1/obras/asignar-usuario \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "obraId": "<UUID_OBRA>",
    "roleId": 6
  }'
```

## 🔍 Verificar Instalación

### Verificar Roles Creados

```bash
# Desde psql
psql -U postgres ingenieria_db
SELECT id, name, descripcion FROM role ORDER BY id;
```

**Resultado esperado:**
```
 id |       name        |                descripcion
----+-------------------+--------------------------------------------
  1 | Admin             | Administrador del sistema
  2 | User              | Usuario regular del sistema
  3 | Admin General     | Administrador general del sistema IngenierIA
  4 | Admin Obra        | Administrador de una obra específica
  5 | Encargado de Área | Responsable de un área dentro de la obra
  6 | Obrero            | Trabajador operativo de la obra
  7 | SST               | Responsable de Seguridad y Salud en el Trabajo
  8 | Compras           | Encargado de compras y suministros
  9 | RRHH              | Recursos Humanos
 10 | Consultor         | Consultor externo del proyecto
```

### Verificar Usuario Admin General

```bash
SELECT id, email, "firstName", "lastName" FROM "user" WHERE email = 'admin.general@ingenieria.com';
```

## 🐛 Troubleshooting

### Error: "relation 'obra' does not exist"

Ejecuta las migraciones:
```bash
npm run migration:run
```

### Error: "No se encuentra el rol Admin General"

Ejecuta los seeders:
```bash
npm run seed:run:relational
```

### Error al conectar con PostgreSQL

Verifica que PostgreSQL esté corriendo:
```bash
# Linux/Mac
sudo systemctl status postgresql

# O verifica manualmente
psql -U postgres
```

### Puerto 3000 ocupado

Cambia el puerto en `.env`:
```env
APP_PORT=3001
```

## 📖 Documentación Completa

Para más detalles, consulta el archivo `INGENIERIA_README.md`.

## 🎯 Endpoints Principales

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/api/v1/auth/ingenieria/login` | Login con obra opcional | Público |
| POST | `/api/v1/obras` | Crear obra | admin_general, admin_obra |
| GET | `/api/v1/obras` | Listar obras | Autenticado |
| GET | `/api/v1/obras/:id` | Ver obra | Autenticado |
| PATCH | `/api/v1/obras/:id` | Actualizar obra | admin_general, admin_obra |
| DELETE | `/api/v1/obras/:id` | Eliminar obra | admin_general |
| POST | `/api/v1/obras/asignar-usuario` | Asignar usuario a obra | admin_general, admin_obra |
| GET | `/api/v1/obras/:id/usuarios` | Usuarios de la obra | Autenticado |

## ✅ Checklist de Instalación

- [ ] Node.js instalado (v18+)
- [ ] PostgreSQL instalado (v14+)
- [ ] Base de datos creada
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] Migraciones ejecutadas (`npm run migration:run`)
- [ ] Seeders ejecutados (`npm run seed:run:relational`)
- [ ] Servidor corriendo (`npm run start:dev`)
- [ ] Swagger accesible (`http://localhost:3000/docs`)
- [ ] Login funcional con admin.general@ingenieria.com

---

**¡Listo! Tu sistema IngenierIA está funcionando.** 🎉
