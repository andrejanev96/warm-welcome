import prisma from '../utils/database.js';
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js';

const parseJSON = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const serializeBlueprint = (blueprint) => ({
  ...blueprint,
  variables: parseJSON(blueprint.variables) || [],
  optionalVars: parseJSON(blueprint.optionalVars) || [],
  structure: parseJSON(blueprint.structure) || {},
});

/**
 * Get all blueprints for authenticated user
 */
export const getBlueprints = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const where = {
    userId: req.user.id,
    ...(category && { category }),
  };

  const blueprints = await prisma.emailBlueprint.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const serialized = blueprints.map(serializeBlueprint);
  res.status(200).json(successResponse(serialized));
});

/**
 * Get single blueprint by ID
 */
export const getBlueprint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blueprint = await prisma.emailBlueprint.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!blueprint) {
    return res.status(404).json(errorResponse('Blueprint not found'));
  }

  res.status(200).json(successResponse(serializeBlueprint(blueprint)));
});

/**
 * Create new blueprint
 */
export const createBlueprint = asyncHandler(async (req, res) => {
  const { name, description, category, subjectPattern, structure, variables, optionalVars, example } = req.body;

  if (!name || !subjectPattern || !structure || !variables) {
    return res.status(400).json(errorResponse('Name, subject pattern, structure, and variables are required'));
  }

  const blueprint = await prisma.emailBlueprint.create({
    data: {
      userId: req.user.id,
      name,
      description: description?.trim() || null,
      category: category || null,
      subjectPattern,
      structure: JSON.stringify(structure),
      variables: JSON.stringify(variables),
      optionalVars: optionalVars ? JSON.stringify(optionalVars) : null,
      example: example?.trim() || null,
    },
  });

  res.status(201).json(successResponse(serializeBlueprint(blueprint), 'Blueprint created successfully'));
});

/**
 * Update blueprint
 */
export const updateBlueprint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, category, subjectPattern, structure, variables, optionalVars, example } = req.body;

  const existingBlueprint = await prisma.emailBlueprint.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!existingBlueprint) {
    return res.status(404).json(errorResponse('Blueprint not found'));
  }

  const data = {};

  if (name !== undefined) {
    data.name = name;
  }

  if (description !== undefined) {
    data.description = description?.trim() || null;
  }

  if (category !== undefined) {
    data.category = category || null;
  }

  if (subjectPattern !== undefined) {
    data.subjectPattern = subjectPattern;
  }

  if (structure !== undefined) {
    data.structure = JSON.stringify(structure);
  }

  if (variables !== undefined) {
    data.variables = JSON.stringify(variables);
  }

  if (optionalVars !== undefined) {
    data.optionalVars = optionalVars ? JSON.stringify(optionalVars) : null;
  }

  if (example !== undefined) {
    data.example = example?.trim() || null;
  }

  const updatedBlueprint = await prisma.emailBlueprint.update({
    where: { id },
    data,
  });

  res.status(200).json(successResponse(serializeBlueprint(updatedBlueprint), 'Blueprint updated successfully'));
});

/**
 * Delete blueprint
 */
export const deleteBlueprint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blueprint = await prisma.emailBlueprint.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      campaigns: true,
    },
  });

  if (!blueprint) {
    return res.status(404).json(errorResponse('Blueprint not found'));
  }

  // Check if blueprint is being used by any campaigns
  if (blueprint.campaigns.length > 0) {
    return res.status(400).json(
      errorResponse(`Cannot delete blueprint. It is being used by ${blueprint.campaigns.length} campaign(s)`)
    );
  }

  await prisma.emailBlueprint.delete({
    where: { id },
  });

  res.status(200).json(successResponse(null, 'Blueprint deleted successfully'));
});
