import { Router } from 'express';
import { login, logout, register, me } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth';
import { forgotPassword, resetPassword } from '../controllers/password-reset.controller';
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
export default router;
