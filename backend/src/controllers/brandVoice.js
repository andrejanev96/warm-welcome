import prisma from '../utils/database.js';
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js';

/**
 * @desc    Get user's brand voice
 * @route   GET /api/brand-voice
 * @access  Private
 */
export const getBrandVoice = asyncHandler(async (req, res) => {
  const brandVoice = await prisma.brandVoice.findUnique({
    where: { userId: req.user.id },
  });

  return res.status(200).json(successResponse(brandVoice, 'Brand voice retrieved successfully.'));
});

/**
 * @desc    Create or update brand voice
 * @route   PUT /api/brand-voice
 * @access  Private
 */
export const upsertBrandVoice = asyncHandler(async (req, res) => {
  const {
    businessName,
    businessDescription,
    tone,
    values,
    talkingPoints,
    dosDonts,
    exampleCopy,
  } = req.body;

  // Validate required fields
  if (!businessName || !tone) {
    return res.status(400).json(errorResponse('Business name and tone are required.'));
  }

  // Convert arrays/objects to JSON strings if provided
  const data = {
    businessName,
    businessDescription,
    tone,
    values: values ? JSON.stringify(values) : null,
    talkingPoints: talkingPoints ? JSON.stringify(talkingPoints) : null,
    dosDonts: dosDonts ? JSON.stringify(dosDonts) : null,
    exampleCopy,
  };

  const brandVoice = await prisma.brandVoice.upsert({
    where: { userId: req.user.id },
    update: data,
    create: {
      ...data,
      userId: req.user.id,
    },
  });

  return res.status(200).json(successResponse(brandVoice, 'Brand voice saved successfully.'));
});

/**
 * @desc    Delete brand voice
 * @route   DELETE /api/brand-voice
 * @access  Private
 */
export const deleteBrandVoice = asyncHandler(async (req, res) => {
  const brandVoice = await prisma.brandVoice.findUnique({
    where: { userId: req.user.id },
  });

  if (!brandVoice) {
    return res.status(404).json(errorResponse('Brand voice not found.'));
  }

  await prisma.brandVoice.delete({
    where: { userId: req.user.id },
  });

  return res.status(200).json(successResponse(null, 'Brand voice deleted successfully.'));
});
