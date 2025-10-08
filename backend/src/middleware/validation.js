import Joi from "joi";
import { errorResponse } from "../utils/helpers.js";

/**
 * Validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json(errorResponse("Validation failed", errors));
    }

    req.body = value;
    next();
  };
};

/**
 * Auth validation schemas
 */
export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required",
    }),
    firstName: Joi.string().optional().allow(""),
    lastName: Joi.string().optional().allow(""),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Reset token is required",
    }),
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required",
    }),
  }),
};

/**
 * Campaign validation schemas
 */
export const campaignSchemas = {
  create: Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Campaign name is required",
    }),
    description: Joi.string().optional().allow(""),
    goal: Joi.string()
      .optional()
      .valid("welcome", "re-engage", "upsell", "milestone", "nurture", "feedback"),
    storeId: Joi.string().optional().allow(null),
    blueprintId: Joi.string().optional().allow(null),
    triggerType: Joi.string()
      .optional()
      .valid(
        "user_signup",
        "first_purchase",
        "abandoned_cart",
        "post_purchase",
        "no_activity",
        "high_value",
      ),
    triggerConditions: Joi.object().optional(),
    startDate: Joi.date().optional().allow(null),
    endDate: Joi.date().optional().allow(null).min(Joi.ref("startDate")).messages({
      "date.min": "End date must be after start date",
    }),
  }),

  update: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional().allow(""),
    goal: Joi.string()
      .optional()
      .valid("welcome", "re-engage", "upsell", "milestone", "nurture", "feedback"),
    storeId: Joi.string().optional().allow(null),
    blueprintId: Joi.string().optional().allow(null),
    startDate: Joi.date().optional().allow(null),
    endDate: Joi.date().optional().allow(null),
    triggerType: Joi.string()
      .valid(
        "user_signup",
        "first_purchase",
        "abandoned_cart",
        "post_purchase",
        "no_activity",
        "high_value",
      )
      .optional()
      .allow(null),
    triggerConditions: Joi.object().optional().allow(null),
  }),

  updateStatus: Joi.object({
    status: Joi.string().required().valid("active", "paused", "completed", "draft").messages({
      "any.required": "Status is required",
      "any.only": "Status must be: draft, active, paused, or completed",
    }),
  }),
};

/**
 * Blueprint validation schemas
 */
export const blueprintSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(1).required().messages({
      "string.empty": "Blueprint name is required",
      "any.required": "Blueprint name is required",
    }),
    description: Joi.string().trim().allow("", null).optional(),
    category: Joi.string().trim().allow("", null).optional(),
    subjectPattern: Joi.string().trim().min(1).required().messages({
      "string.empty": "Subject pattern is required",
      "any.required": "Subject pattern is required",
    }),
    structure: Joi.object().required().messages({
      "any.required": "Structure is required",
      "object.base": "Structure must be an object",
    }),
    variables: Joi.array().items(Joi.string().trim().min(1)).min(1).required().messages({
      "array.min": "Provide at least one required variable",
      "any.required": "Variables are required",
    }),
    optionalVars: Joi.array().items(Joi.string().trim().min(1)).optional().allow(null),
    example: Joi.string().trim().allow("", null).optional(),
  }),

  update: Joi.object({
    name: Joi.string().trim().optional(),
    description: Joi.string().trim().allow("", null).optional(),
    category: Joi.string().trim().allow("", null).optional(),
    subjectPattern: Joi.string().trim().optional(),
    structure: Joi.object().optional(),
    variables: Joi.array().items(Joi.string().trim().min(1)).min(1).optional(),
    optionalVars: Joi.array().items(Joi.string().trim().min(1)).allow(null).optional(),
    example: Joi.string().trim().allow("", null).optional(),
  })
    .min(1)
    .messages({
      "object.min": "Provide at least one field to update",
    }),
};
