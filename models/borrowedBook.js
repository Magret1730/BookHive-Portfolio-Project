import { DataTypes } from 'sequelize';
import sequelize from '../utils/dbConfig.js';
import User from './userModel.js';
import Books from './bookModel.js';

const BorrowedBooks = sequelize.define('BorrowedBooks', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  borrowDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default BorrowedBooks;

