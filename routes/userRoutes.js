import express from 'express';
const router = express.Router();

import { registerUser, loginUser, logoutUser,
    allUsers, forgotPassword, resetPassword } from '../controllers/userController.js';
import { adminCheck } from '../middleware/adminCheck.js';
import { authenticate } from '../middleware/authenticate.js';

router.get('/', authenticate, adminCheck, allUsers);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticate, logoutUser);
router.put('/forgotPassword', forgotPassword);
router.put('/resetPassword', resetPassword);

export default router;
