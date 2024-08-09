// File to handle users ORM in database

import { DataTypes } from 'sequelize';
import sequelize from '../utils/dbConfig.js';
import { Books } from './bookModel.js';
import { BorrowedBooks } from './borrowedBook.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  resetLink: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
}, {
  timestamps: true, // This enables automatic createdAt and updatedAt
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
    {
      unique: false,
      fields: ['token'],
    },
    {
      unique: false,
      fields: ['isAdmin'],
    },
  ],
});

// Association
User.belongsToMany(Books, { through: BorrowedBooks });
Books.belongsToMany(User, { through: BorrowedBooks });

export default User;
