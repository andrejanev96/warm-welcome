import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/helpers.js";
import prisma from "../utils/database.js";

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(errorResponse("Authentication required. Please provide a valid token."));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json(errorResponse("User not found. Token may be invalid."));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json(errorResponse("Invalid token. Please login again."));
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json(errorResponse("Token expired. Please login again."));
    }

    return res.status(500).json(errorResponse("Authentication failed. Please try again."));
  }
};
