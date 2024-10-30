import knex from "knex";
import knexConfig from "./knexfile";
import dotenv from "dotenv";
dotenv.config();

const environment = process.env.NODE_ENV || "development";
const db = knex(knexConfig[environment]);

export default db;
