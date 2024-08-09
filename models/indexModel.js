// File to handle model initialization and synchronization:

import sequelize from '../utils/dbConfig.js'; // Import the sequelize instance
import User from './userModel.js';
import Books from './bookModel.js';

const db = {};

// Initialize the models
db.User = User;
db.Books = Books;

// Synchronize models
const syncDb = async () => {
  try {
    await sequelize.sync({ alter: true }); // You can use { force: true } to drop and recreate tables - { alter: true }
    console.log('Database & tables synced');
  } catch (err) {
    console.error('Failed to sync db: ', err);
  }
};

db.syncDb = syncDb;

export default db;
