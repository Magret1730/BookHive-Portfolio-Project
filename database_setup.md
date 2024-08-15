# Database Setup for BookHive Application

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v16+)
- **npm**
- **PostgreSQL** (v14.12 or higher)
- **Sequelize CLI** (optional, for generating models and migrations)

## Install Dependencies

Install the necessary Node.js packages: `npm install sequelize pg pg-hstore`

## Configure Sequelize
- Create a config/config.json file with the following content:

`import dotenv from 'dotenv';
dotenv.config();
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
  },
};`

- Create a .env file in your root directory with:
`DB_HOST=hostName
DB_PORT=pgPort
DB_NAME=dbName
DB_USER=yourusername
DB_PASS=yourpassword`

- Run `npm run admin-seed` to generate an admin in db.

