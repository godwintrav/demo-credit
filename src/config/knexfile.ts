import type { Knex } from 'knex';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env' });

const DB_CLIENT = 'mysql2';
const MIGRATION_PATH = '../migrations';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
      ssl: {
        rejectUnauthorized: true,
        ca: fs
          .readFileSync(process.env.PATH_TO_SSL_CERTIFICATE as string)
          .toString(),
      },
    },
    migrations: {
      directory: MIGRATION_PATH,
    },
  },
  production: {
    client: DB_CLIENT,
    connection: {
      host: process.env.PROD_DB_HOST,
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      port: Number(process.env.PROD_DB_PORT),
      ssl: {
        rejectUnauthorized: true,
        ca: fs
          .readFileSync(process.env.PATH_TO_SSL_CERTIFICATE as string)
          .toString(),
      },
    },
    migrations: {
      directory: MIGRATION_PATH,
    },
  },
};

export default config;
