import User from './userModel.js';
import Books from './bookModel.js';
import BorrowedBooks from './borrowedBook.js';

// Associations of tables
User.hasMany(BorrowedBooks, { foreignKey: 'userId' });
BorrowedBooks.belongsTo(User, { foreignKey: 'userId' });

Books.hasMany(BorrowedBooks, { foreignKey: 'bookId' });
BorrowedBooks.belongsTo(Books, { foreignKey: 'bookId' });


