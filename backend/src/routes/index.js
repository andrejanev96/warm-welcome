import express from 'express';
import authRoutes from './auth.js';
import templateRoutes from './templates.js';
import campaignRoutes from './campaigns.js';
import shopifyRoutes from './shopify.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WarmWelcome.ai API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/templates', templateRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/shopify', shopifyRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

export default router;
