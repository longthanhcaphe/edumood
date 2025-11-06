import express from 'express';
import { login, getMe, changePassword } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, authorize('student'), changePassword);

export default router;
