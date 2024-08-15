import express from 'express';
const router = express.Router();

import { adminCheck } from '../middleware/adminCheck.js';
import { authenticate } from '../middleware/authenticate.js';
import { addBook, allBook, BookById, deleteBook, editBook, search } from '../controllers/bookController.js';

// Both admin and user routes
router.get('/', authenticate, allBook); //  GET http://localhost:8000/api/v1/books/ Route to get all books
router.get('/search', authenticate, search); // GET http://localhost:8000/api/v1/books/search?genre=sport Route to search books based on title, author or genre

// Only admin routes
router.post('/addBook', authenticate, adminCheck, addBook); // POST http://localhost:8000/api/v1/books/addBook Route to add a book
router.delete('/:id', authenticate, adminCheck, deleteBook); // DELETE http://localhost:8000/api/v1/books/:id (id: bookId). Route to deletes book
router.put('/:id', authenticate, adminCheck, editBook); // PUT http://localhost:8000/api/v1/books/:id (id: bookId). Routes to edit book details
router.get('/:id', authenticate, adminCheck, BookById); // GET http://localhost:8000/api/v1/books/:id (id: bookId). Routes to get books by ID

export default router;
