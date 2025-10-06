import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/database.js';
import { successResponse, errorResponse, asyncHandler } from '../utils/helpers.js';

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
