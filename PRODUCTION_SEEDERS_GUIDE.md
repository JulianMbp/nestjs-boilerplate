# 🌱 Guía: Ejecutar Seeders en Producción con Docker

## 📋 Opciones para Ejecutar Seeders en Producción

Hay **3 formas** de ejecutar los seeders en producción con Docker:

---

## 🚀 Opción 1: Ejecutar dentro del Contenedor en Ejecución (Recomendado)

Si tu contenedor Docker ya está corriendo:

```bash
# 1. Entrar al contenedor
docker exec -it <nombre-contenedor-api> sh

# 2. Ejecutar seeders (desde dentro del contenedor)
npm run seed:run:relational

# O si prefieres ejecutar directamente el archivo compilado:
node dist/database/seeds/relational/run-seed.js
```

**Ejemplo completo:**
```bash
# Ver contenedores en ejecución
docker ps

# Ejecutar seeders (reemplaza 'nestjs-boilerplate-api-1' con el nombre de tu contenedor)
docker exec -it nestjs-boilerplate-api-1 npm run seed:run:relational
```

---

## 🐳 Opción 2: Ejecutar con Docker Compose

Si estás usando `docker-compose`:

```bash
# Ejecutar seeders en el contenedor api
docker-compose exec api npm run seed:run:relational

# O ejecutar directamente el archivo compilado
docker-compose exec api node dist/database/seeds/relational/run-seed.js
```

**Con archivo de entorno específico:**
```bash
# Si tienes un archivo .env específico
docker-compose --env-file .env.production exec api npm run seed:run:relational
```

---

## 📝 Opción 3: Crear Script de Startup para Producción

Crea un script de startup para producción que incluya los seeders:

### 3.1 Crear Script de Startup para Producción

Crea el archivo `startup.relational.prod.sh`:

```bash
#!/usr/bin/env bash
set -e

# Esperar a que PostgreSQL esté listo
/opt/wait-for-it.sh postgres:5432 -t 30

echo "🔄 Running migrations..."
npm run migration:run

echo "🌱 Running seeds..."
npm run seed:run:relational

echo "🚀 Starting application..."
npm run start:prod
```

### 3.2 Modificar Dockerfile para Producción

Agrega el script al Dockerfile:

```dockerfile
FROM node:22.18.0-alpine

RUN apk add --no-cache bash
RUN npm i -g @nestjs/cli typescript ts-node

COPY package*.json /tmp/app/
RUN cd /tmp/app && npm install

COPY . /usr/src/app
RUN cp -a /tmp/app/node_modules /usr/src/app
COPY ./wait-for-it.sh /opt/wait-for-it.sh
RUN chmod +x /opt/wait-for-it.sh

# Copiar script de startup para producción
COPY ./startup.relational.prod.sh /opt/startup.relational.prod.sh
RUN chmod +x /opt/startup.relational.prod.sh
RUN sed -i 's/\r//g' /opt/wait-for-it.sh
RUN sed -i 's/\r//g' /opt/startup.relational.prod.sh

WORKDIR /usr/src/app
RUN npm run build

# Usar script de producción en CMD
CMD ["/opt/startup.relational.prod.sh"]
```

### 3.3 Usar el Script

Al iniciar el contenedor, ejecutará automáticamente:
1. Migraciones
2. Seeders
3. Aplicación

```bash
docker-compose up -d
```

---

## ⚠️ Opción 4: Ejecutar Seeders Manualmente (Una Sola Vez)

Si solo necesitas ejecutar los seeders **una vez** después del despliegue:

```bash
# 1. Construir la imagen
docker-compose build

# 2. Ejecutar migraciones
docker-compose run --rm api npm run migration:run

# 3. Ejecutar seeders
docker-compose run --rm api npm run seed:run:relational

# 4. Iniciar la aplicación
docker-compose up -d
```

---

## 🔧 Solución de Problemas

### Error: "Cannot find module"

Si obtienes un error de módulo no encontrado:

```bash
# Asegúrate de que el proyecto esté compilado
docker-compose exec api npm run build

# Luego ejecuta los seeders
docker-compose exec api npm run seed:run:relational
```

### Error: "Database connection failed"

Verifica que PostgreSQL esté corriendo:

```bash
# Verificar estado de PostgreSQL
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar variables de entorno
docker-compose exec api env | grep DATABASE
```

### Error: "Permission denied"

Asegúrate de que los scripts tengan permisos de ejecución:

```bash
# Dar permisos al script
chmod +x startup.relational.prod.sh
chmod +x wait-for-it.sh

# Reconstruir la imagen
docker-compose build --no-cache
```

---

## 📊 Verificar que los Seeders se Ejecutaron

### Verificar datos en la base de datos:

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U ${DATABASE_USERNAME} -d ${DATABASE_NAME}

# Verificar roles
SELECT * FROM role;

# Verificar usuarios
SELECT id, email, "firstName", "lastName" FROM "user";

# Verificar obras
SELECT id, nombre FROM obras;

# Salir de PostgreSQL
\q
```

---

## 🎯 Recomendación para Producción

**Para producción, recomiendo la Opción 1 o 2:**

1. **Primera vez (setup inicial):**
   ```bash
   # Ejecutar migraciones
   docker-compose exec api npm run migration:run
   
   # Ejecutar seeders
   docker-compose exec api npm run seed:run:relational
   ```

2. **Después de actualizaciones:**
   ```bash
   # Solo ejecutar migraciones (los seeders solo se ejecutan una vez)
   docker-compose exec api npm run migration:run
   ```

3. **Si necesitas re-ejecutar seeders:**
   ```bash
   # Los seeders eliminan datos existentes, ten cuidado
   docker-compose exec api npm run seed:run:relational
   ```

---

## 📝 Notas Importantes

1. **⚠️ Los seeders eliminan datos existentes:** Los seeders limpian las tablas antes de insertar nuevos datos. Úsalos con precaución en producción.

2. **🔒 Variables de entorno:** Asegúrate de que las variables de entorno estén configuradas correctamente en `docker-compose.yaml` o en el archivo `.env`.

3. **🔄 Migraciones primero:** Siempre ejecuta las migraciones antes de los seeders.

4. **📦 Código compilado:** En producción, el código está compilado en `dist/`. Los seeders pueden ejecutarse con `ts-node` (desarrollo) o `node` (producción compilada).

---

## 🚀 Comandos Rápidos

```bash
# Ver contenedores
docker ps

# Ejecutar seeders (reemplaza 'api' con el nombre de tu servicio)
docker-compose exec api npm run seed:run:relational

# Ver logs del contenedor
docker-compose logs -f api

# Reiniciar contenedor
docker-compose restart api

# Reconstruir y reiniciar
docker-compose up -d --build
```

---

**Última actualización:** Noviembre 2024

