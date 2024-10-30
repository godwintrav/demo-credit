import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();
const DB_CLIENT = "mysql2";
const config: { [key: string]: Knex.Config } = {
  development: {
    client: DB_CLIENT,
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "database",
    },
    migrations: {
      directory: "./src/migrations",
    },
  },
  production: {
    client: DB_CLIENT,
    connection: {
      host: process.env.PROD_DB_HOST,
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
    },
    migrations: {
      directory: "./src/migrations",
    },
  },
};

export default config;
