import Joi from 'joi';
import { errorResponse } from '../utils/helpers.js';

/**
 * Validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json(
        errorResponse('Validation failed', errors)
      );
    }

    next();
  };
};

/**
 * Auth validation schemas
 */
export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
    firstName: Joi.string().optional().allow(''),
    lastName: Joi.string().optional().allow(''),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
  }),
};

/**
 * Campaign validation schemas
 */
export const campaignSchemas = {
  create: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Campaign name is required',
    }),
    description: Joi.string().optional().allow(''),
    goal: Joi.string().optional().valid('welcome', 're-engage', 'upsell', 'milestone', 'nurture', 'feedback'),
    storeId: Joi.string().optional().allow(null),
    triggerType: Joi.string().optional().valid(
      'user_signup',
      'first_purchase',
      'abandoned_cart',
      'post_purchase',
      'no_activity',
      'high_value'
    ),
    triggerConditions: Joi.object().optional(),
    startDate: Joi.date().optional().allow(null),
    endDate: Joi.date().optional().allow(null).min(Joi.ref('startDate')).messages({
      'date.min': 'End date must be after start date',
    }),
  }),

  update: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional().allow(''),
    goal: Joi.string().optional().valid('welcome', 're-engage', 'upsell', 'milestone', 'nurture', 'feedback'),
    storeId: Joi.string().optional().allow(null),
    startDate: Joi.date().optional().allow(null),
    endDate: Joi.date().optional().allow(null),
    triggerType: Joi.string()
      .valid('user_signup', 'first_purchase', 'abandoned_cart', 'post_purchase', 'no_activity', 'high_value')
      .optional()
      .allow(null),
    triggerConditions: Joi.object().optional().allow(null),
  }),

  updateStatus: Joi.object({
    status: Joi.string().required().valid('active', 'paused', 'completed', 'draft').messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be: draft, active, paused, or completed',
    }),
  }),
};
