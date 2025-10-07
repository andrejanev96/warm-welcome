import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../utils/database.js';
import { successResponse, errorResponse, asyncHandler } from '../utils/helpers.js';
import { sendPasswordResetEmail } from '../services/email.js';
import { logger } from '../utils/logger.js';

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }

  return req.ip || null;
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return res.status(409).json(
      errorResponse('An account with this email already exists')
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json(
    successResponse(
      {
        user,
        token,
      },
      'Account created successfully'
    )
  );
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return res.status(401).json(
      errorResponse('Invalid email or password')
    );
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json(
      errorResponse('Invalid email or password')
    );
  }

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json(
    successResponse(
      {
        user: userWithoutPassword,
        token,
      },
      'Login successful'
    )
  );
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  // User is already attached to req by authenticate middleware
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json(
    successResponse(user, 'User profile retrieved successfully')
  );
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json(
    successResponse(updatedUser, 'Profile updated successfully')
  );
});

/**
 * Request password reset token
 * POST /api/auth/forgot-password
 */
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email?.toLowerCase();
  const userAgent = req.get('user-agent');

  let auditStatus = 'ignored';
  let userIdForAudit = null;

  if (normalizedEmail) {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      userIdForAudit = user.id;
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: expires,
        },
      });

      const resetLinkBase = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${resetLinkBase}/reset-password/${rawToken}`;

      const sent = await sendPasswordResetEmail({
        to: normalizedEmail,
        resetLink,
        expiresAt: expires,
      });

      auditStatus = sent ? 'email_sent' : 'email_failed';

      if (!sent) {
        logger.info('Password reset email failed to send for user');
      }
    } else {
      auditStatus = 'user_not_found';
    }
  } else {
    auditStatus = 'invalid_email';
  }

  await prisma.passwordResetAudit.create({
    data: {
      email: normalizedEmail || email || 'unknown',
      userId: userIdForAudit,
      status: auditStatus,
      requestIp: getClientIp(req),
      userAgent: userAgent || null,
    },
  });

  res.status(200).json(
    successResponse(null, 'If that email exists in our system, a reset link has been sent.')
  );
});

/**
 * Reset password using token
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json(errorResponse('Reset token is required'));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json(errorResponse('Reset token is invalid or has expired.'));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  res.status(200).json(successResponse(null, 'Password has been updated. You can now sign in.'));
});
