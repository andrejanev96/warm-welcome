import prisma from '../utils/database.js';
import { successResponse, errorResponse, asyncHandler } from '../utils/helpers.js';

const templateWhere = (userId) => ({
  OR: [
    { userId },
    { isDefault: true },
  ],
});

const sanitizeTemplate = (template) => template;

/**
 * Get all email templates
 * GET /api/templates
 */
export const getTemplates = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const templates = await prisma.emailTemplate.findMany({
    where: {
      ...(category && { category }),
      ...templateWhere(req.user.id),
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json(
    successResponse(templates.map(sanitizeTemplate), 'Templates retrieved successfully')
  );
});

/**
 * Get single email template
 * GET /api/templates/:id
 */
export const getTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const template = await prisma.emailTemplate.findFirst({
    where: {
      id,
      ...templateWhere(req.user.id),
    },
  });

  if (!template) {
    return res.status(404).json(
      errorResponse('Template not found')
    );
  }

  res.status(200).json(
    successResponse(sanitizeTemplate(template), 'Template retrieved successfully')
  );
});

/**
 * Create email template
 * POST /api/templates
 */
export const createTemplate = asyncHandler(async (req, res) => {
  const { name, subject, body, category } = req.body;

  const template = await prisma.emailTemplate.create({
    data: {
      name,
      subject,
      body,
      category: category || 'general',
      isDefault: false,
      user: {
        connect: { id: req.user.id },
      },
    },
  });

  res.status(201).json(
    successResponse(sanitizeTemplate(template), 'Template created successfully')
  );
});

/**
 * Update email template
 * PUT /api/templates/:id
 */
export const updateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, subject, body, category } = req.body;

  const existingTemplate = await prisma.emailTemplate.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!existingTemplate) {
    return res.status(404).json(
      errorResponse('Template not found')
    );
  }

  if (existingTemplate.isDefault) {
    return res.status(403).json(
      errorResponse('Cannot edit default templates. Create a copy instead.')
    );
  }

  const template = await prisma.emailTemplate.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(subject !== undefined && { subject }),
      ...(body !== undefined && { body }),
      ...(category !== undefined && { category }),
    },
  });

  res.status(200).json(
    successResponse(sanitizeTemplate(template), 'Template updated successfully')
  );
});

/**
 * Delete email template
 * DELETE /api/templates/:id
 */
export const deleteTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const template = await prisma.emailTemplate.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!template) {
    return res.status(404).json(
      errorResponse('Template not found')
    );
  }

  if (template.isDefault) {
    return res.status(403).json(
      errorResponse('Cannot delete default templates')
    );
  }

  await prisma.emailTemplate.delete({
    where: { id },
  });

  res.status(200).json(
    successResponse(null, 'Template deleted successfully')
  );
});

/**
 * Duplicate template (create copy)
 * POST /api/templates/:id/duplicate
 */
export const duplicateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const original = await prisma.emailTemplate.findFirst({
    where: {
      id,
      ...templateWhere(req.user.id),
    },
  });

  if (!original) {
    return res.status(404).json(
      errorResponse('Template not found')
    );
  }

  const template = await prisma.emailTemplate.create({
    data: {
      name: `${original.name} (Copy)`,
      subject: original.subject,
      body: original.body,
      category: original.category,
      isDefault: false,
      user: {
        connect: { id: req.user.id },
      },
    },
  });

  res.status(201).json(
    successResponse(sanitizeTemplate(template), 'Template duplicated successfully')
  );
});
