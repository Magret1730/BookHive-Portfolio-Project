import express from 'express';
const router = express.Router();

import { adminCheck } from '../middleware/adminCheck.js';
import { authenticate } from '../middleware/authenticate.js';
import { userCheck } from '../middleware/userCheck.js';
import { borrowBook, BorrowHistory, getBorrowedBookDetails, getUserBorrowHistory, returnBook } from '../controllers/borrowController.js';

// Only users routes
router.post('/:bookId', authenticate, userCheck, borrowBook); // Route to borrow books. POST http://localhost:8000/api/v1/borrow/:bookId
router.put('/:bookId', authenticate, userCheck, returnBook); // Route to return books. PUT http://localhost:8000/api/v1/borrow/:bookId
router.get('/', authenticate, userCheck, BorrowHistory); // Route to get borrowed history per user. GET http://localhost:8000/api/v1/borrow?page=2&size=10

// Only admin routes
router.get('/user/:userId', authenticate, adminCheck, getUserBorrowHistory); // Route to get users borrowed history. GET http://localhost:8000/api/v1/borrow/user/:userId?page=2&size=10
router.get('/book/:bookId', authenticate, adminCheck, getBorrowedBookDetails); // Route to get a single borrowed book details. GET http://localhost:8000/api/v1/borrow/book/:bookid

export default router;
