import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';
import { validate, authSchemas } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(authSchemas.register), register);
router.post('/login', validate(authSchemas.login), login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
