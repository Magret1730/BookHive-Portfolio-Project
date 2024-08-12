import express from 'express';
const router = express.Router();

import { adminCheck } from '../middleware/adminCheck.js';
import { authenticate } from '../middleware/authenticate.js';
import { userCheck } from '../middleware/userCheck.js';
import { addBook, allBook, BookById, borrowBook,
    deleteBook, editBook, returnBook, search } from '../controllers/bookController.js';

router.post('/addBook', authenticate, adminCheck, addBook);
router.delete('/:id', authenticate, adminCheck, deleteBook);
router.put('/:id', authenticate, adminCheck, editBook);
router.get('/:id', authenticate, adminCheck, BookById);
router.get('/', authenticate, allBook);
router.get('/search', authenticate, search);
router.post('/borrow/:bookId', authenticate, userCheck, borrowBook);
router.put('/borrow/:bookId', authenticate, userCheck, returnBook);

export default router;
