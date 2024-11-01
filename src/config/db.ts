import knex, { Knex } from 'knex';
import knexConfig from './knexfile';
import dotenv from 'dotenv';
dotenv.config();

const environment = process.env.NODE_ENV || 'development';
let db: Knex | null = null;

//singleton pattern
if (!db) {
  db = knex(knexConfig[environment]);
}

export default db;
