import Books from "../models/bookModel.js";
import BorrowedBooks from "../models/borrowedBook.js";

// Method to borrow books
export const borrowBook = async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id; // Gets userId from authenticated user

  try {
    if (!bookId) {
      return res.status(400).json({ error: 'Please provide bookId' });
    }

    // Check if the user has already borrowed this book and not returned it
    const existingBorrowRecord = await BorrowedBooks.findOne({ where: { bookId, userId, returnDate: null } });
    if (existingBorrowRecord) {
      return res.status(400).json({ error: 'You have already borrowed this book and not returned it yet' });
    }

    const book = await Books.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check for book quantity
    if (book.quantity <= 0) {
      return res.status(400).json({ error: 'Book is not available' });
    }

    // Create borrowedBook
    const borrowRecord = await BorrowedBooks.create({
      borrowDate: new Date(),
      userId,
      bookId,
    });

    // Decrement the book quantity
    await Books.update({ quantity: book.quantity - 1 }, { where: { id: bookId } });

    return res.status(201).json({ message: 'Book borrowed successfully', borrowRecord});
  } catch (error) {
    return res.status(500).json({ error: `Error Borrowing Books: ${error.message}` });
  }
}

// Method to return books
export const returnBook = async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id; // Gets userId from authenticated user

  try {
    if (!bookId) {
      return res.status(400).json({ error: 'Please provide bookId' });
    }

    // Find the borrow record for the user and book
    const borrowRecord = await BorrowedBooks.findOne({ where: { bookId, userId, returnDate: null } });
    if (!borrowRecord) {
      return res.status(404).json({ error: 'Borrowed book record not found or already returned' });
    }

    // Update the borrow record with the return date
    await BorrowedBooks.update({ returnDate: new Date() }, { where: { id: borrowRecord.id } });

    // Find the book
    const book = await Books.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Increment the book quantity
    await Books.update({ quantity: book.quantity + 1 }, { where: { id: bookId } });

    return res.status(201).json({ message: 'Book returned successfully', book});
  } catch (error) {
    return res.status(500).json({ error: `Error Returning Book: ${error.message}` });
  }
}

// Method to get all borrowed books history per User
export const BorrowHistory = async (req, res) => {
  const { user } = req;
  if (!user) {
    return res.status(401).json({ error: 'User is not authenticated' });
  }

  const userId = req.user.id; // Gets userId from authenticated user
  const userFirstName = user.firstName;

  // Get page and size from query params, with defaults
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const size = parseInt(req.query.size) || 5; // Default to 5 items per page // specifies how many records to return
  const offset = (page - 1) * size; // specifies where to start the records based on the current page.

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Find the borrow record for the user with pagination
    const { count, rows: borrowRecord } = await BorrowedBooks.findAndCountAll({
      where: { userId },
      limit: size,
      offset,
      order: [['createdAt', 'DESC']], // Optional: order by creation date
    });

    if (count === 0) {
      return res.status(404).json({ error: 'No borrowed book history found.' });
    }

    // Calculate total pages
    const totalPages = Math.ceil(count / size);

    return res.status(200).json({ 
      message: `Borrowed books history retrieved successfully for user with ID ${userId}. and name ${userFirstName}`,
      borrowRecord,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({ error: `Error getting borrowed book history: ${error.message}` });
  }
}

// Method to get all borrowed books history for a specific user (Admin only)
export const getUserBorrowHistory = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Get page and size from query params, with defaults
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const size = parseInt(req.query.size) || 5; // Default to 5 items per page
  const offset = (page - 1) * size;

  try {
    // Find the borrow records for the specified user with pagination
    const { count, rows: borrowRecords } = await BorrowedBooks.findAndCountAll({
      where: { userId },
      limit: size,
      offset,
      order: [['createdAt', 'DESC']], // Optional: order by creation date
    });

    if (count === 0) {
      return res.status(404).json({ error: 'No borrowed book history found for this user.' });
    }

    // Calculate total pages
    const totalPages = Math.ceil(count / size);

    return res.status(200).json({
      message: `Borrowed books history retrieved successfully for user with ID ${userId}.`,
      borrowRecords,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({ error: `Error getting borrowed book history: ${error.message}` });
  }
};
