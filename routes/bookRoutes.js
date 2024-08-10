import express from 'express';
const router = express.Router();

import { adminCheck } from '../middleware/adminCheck.js';
import { authenticate } from '../middleware/authenticate.js';
import { addBook, allBook, search } from '../controllers/bookController.js';

router.post('/addBook', authenticate, adminCheck, addBook);
router.get('/allBook', authenticate, allBook);
router.get('/search', authenticate, search);

export default router;
