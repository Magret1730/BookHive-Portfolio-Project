// File to handle books ORM in database
import { DataTypes } from 'sequelize';
import sequelize from '../utils/dbConfig.js';
import { User } from './userModel.js';
import { BorrowedBooks } from './borrowedBook.js';

const Books = sequelize.define('Books', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255], // Title length validation
    },
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255], // Title length validation
    },
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100], // Title length validation
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0, // Ensures quantity is non-negative
    },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  publishedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  }
}, {
  timestamps: true, // This enables automatic createdAt and updatedAt
  indexes: [ // This improve search performance by allowing the database to quickly locate and retrieve rows that match fields
    {
      unique: false,
      fields: ['title', 'author'], // Index for title and author
    },
  ],
});

// Associations
Books.belongsToMany(User, { through: BorrowedBooks });
User.belongsToMany(Books, { through: BorrowedBooks });

export default Books;
