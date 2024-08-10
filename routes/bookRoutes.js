import express from 'express';
const router = express.Router();

import { adminCheck } from '../middleware/adminCheck.js';
import { authenticate } from '../middleware/authenticate.js';
import { addBook, allBook, deleteBook, search } from '../controllers/bookController.js';

router.post('/addBook', authenticate, adminCheck, addBook);
router.delete('/:id', authenticate, adminCheck, deleteBook);
router.get('/allBook', authenticate, allBook);
router.get('/search', authenticate, search);

export default router;
