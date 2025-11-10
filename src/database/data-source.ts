import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

// IMPORTANTE: En Docker, las variables de entorno vienen de docker-compose.yaml
// y tienen prioridad sobre cualquier archivo .env que pueda existir.
// Dentro de Docker, siempre usamos el nombre del servicio (postgres) y puerto interno (5432)

// Verificamos si tenemos todas las variables individuales necesarias
const hasIndividualConfig =
  process.env.DATABASE_HOST &&
  process.env.DATABASE_USERNAME &&
  process.env.DATABASE_PASSWORD &&
  process.env.DATABASE_NAME;

// Solo usamos DATABASE_URL si NO hay configuración individual disponible
// y si DATABASE_URL está definida y no está vacía
// Esto previene que TypeORM use una URL con puerto externo (5435) cuando estamos en Docker
const databaseUrl =
  !hasIndividualConfig &&
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.trim() !== ''
    ? process.env.DATABASE_URL.trim()
    : undefined;

// En Docker, docker-compose.yaml establece DATABASE_HOST=postgres y DATABASE_PORT=5432
// Estas variables tienen prioridad y se usan en lugar de DATABASE_URL

// Log de depuración para verificar qué configuración se está usando
if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 Database Configuration Debug:');
  console.log('  DATABASE_HOST:', process.env.DATABASE_HOST);
  console.log('  DATABASE_PORT:', process.env.DATABASE_PORT);
  console.log(
    '  DATABASE_URL:',
    process.env.DATABASE_URL ? '***DEFINED***' : 'undefined',
  );
  console.log('  hasIndividualConfig:', hasIndividualConfig);
  console.log('  databaseUrl:', databaseUrl ? '***DEFINED***' : 'undefined');
}

export const AppDataSource = new DataSource({
  type: process.env.DATABASE_TYPE || 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT
          ? parseInt(process.env.DATABASE_PORT, 10)
          : 5432,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
      }),
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  dropSchema: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  extra: {
    // based on https://node-postgres.com/api/pool
    // max connection pool size
    max: process.env.DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      : 100,
    ssl:
      process.env.DATABASE_SSL_ENABLED === 'true'
        ? {
            rejectUnauthorized:
              process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
            ca: process.env.DATABASE_CA ?? undefined,
            key: process.env.DATABASE_KEY ?? undefined,
            cert: process.env.DATABASE_CERT ?? undefined,
          }
        : undefined,
  },
} as DataSourceOptions);
