import express from 'express';
const router = express.Router();

import { adminCheck } from '../middleware/adminCheck.js';
import { authenticate } from '../middleware/authenticate.js';
import { userCheck } from '../middleware/userCheck.js';
import { addBook, allBook, BookById, deleteBook, editBook, search } from '../controllers/bookController.js';

// Both admin and user routes
router.get('/', authenticate, allBook); // Route to get all books
router.get('/search', authenticate, search); // Route to search books based on title, author or genre

// Only admin routes
router.post('/addBook', authenticate, adminCheck, addBook); // Route to add a book
router.delete('/:id', authenticate, adminCheck, deleteBook); // (id: bookId) // Route to deletes book
router.put('/:id', authenticate, adminCheck, editBook); // (id: bookId) // Routes to edit book details
router.get('/:id', authenticate, adminCheck, BookById); // (id: bookId) // Routes to get books by ID

export default router;
