import express from 'express';
import { register, login, getMe, updateProfile, requestPasswordReset, resetPassword } from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';
import { validate, authSchemas } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(authSchemas.register), register);
router.post('/login', validate(authSchemas.login), login);
router.post('/forgot-password', validate(authSchemas.forgotPassword), requestPasswordReset);
router.post('/reset-password', validate(authSchemas.resetPassword), resetPassword);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
