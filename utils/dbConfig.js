// Configures the db

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  logging: false, // Set to true for SQL query logging

  pool: {
    max: parseInt(process.env.POOLMAX, 10), // Maximum number of connections in the pool
    min: parseInt(process.env.POOLMIN, 10), //  Minimum number of connections in the pool
    acquire: parseInt(process.env.POOLACQUIRE, 10), // Maximum time (in ms) to acquire a connection before throwing an error
    idle: parseInt(process.env.POOLIDLE, 10), // Maximum time (in ms) a connection can be idle before being released
  },
});

export default sequelize;
