import express from 'express';
const router = express.Router();

import { registerUser, loginUser, logoutUser,
  allUsers, forgotPassword, resetPassword, 
  deleteAccount} from '../controllers/userController.js';
import { adminCheck } from '../middleware/adminCheck.js';
import { authenticate } from '../middleware/authenticate.js';

// Only admin routes
router.get('/', authenticate, adminCheck, allUsers); // Routes to get all users. GET http://localhost:8000/api/v1/users/

// Both admin and user routes
router.post('/register', registerUser); // Routes to register. POST http://localhost:8000/api/v1/users/register
router.post('/login', loginUser); // Routes to login. POST http://localhost:8000/api/v1/users/login
router.post('/logout', authenticate, logoutUser); // Routes to logout. POST http://localhost:8000/api/v1/users/logout
router.put('/forgotPassword', forgotPassword); // Routes to forgot Password. PUT http://localhost:8000/api/v1/users/forgotPassword // Supply email in req.body
router.put('/resetPassword', resetPassword); // Routes to reset Password. You will be directed from email address. Supply newPassword, resetLink in req.body

// Only user routes
router.delete('/deactivate', authenticate, deleteAccount) // Routes to delete/deactivate account. DELETE http://localhost:8000/api/v1/users/deactivate

export default router;
