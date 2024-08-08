import express from 'express';
const router = express.Router();

import { registerUser, loginUser, logoutUser, allUsers } from '../controllers/userController.js';
// import { getStatus } from '../controllers/appController.js';
import { adminCheck } from '../middleware/adminCheck.js';
import { authenticate } from '../middleware/authenticate.js';

router.get('/', authenticate, adminCheck, allUsers);
// router.get('/stats', authenticate, adminCheck, getStats);
// router.get('/status', authenticate, adminCheck, getStatus);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticate, logoutUser);

export default router;
