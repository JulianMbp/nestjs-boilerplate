#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432

# En Docker, las variables de entorno ya están configuradas en docker-compose.yaml
# Ejecutamos los comandos directamente sin env-cmd para evitar conflictos con .env
echo "Running migrations..."
ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js --dataSource=src/database/data-source.ts migration:run

echo "Running seeds..."
ts-node -r tsconfig-paths/register ./src/database/seeds/relational/run-seed.ts

echo "Starting application..."
npm run start:prod
