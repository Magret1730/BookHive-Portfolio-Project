import express from 'express';
const router = express.Router();

import { adminCheck } from '../middleware/adminCheck.js';
import { authenticate } from '../middleware/authenticate.js';
import { addBook } from '../controllers/bookController.js';

router.post('/addBook', authenticate, adminCheck, addBook);

export default router;
