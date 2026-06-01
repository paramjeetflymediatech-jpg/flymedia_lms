// src/db/index.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'my_lms_db',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || 'root',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  }
);
