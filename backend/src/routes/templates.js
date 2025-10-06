import express from 'express';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from '../controllers/templates.js';
import { authenticate } from '../middleware/auth.js';
import { validate, templateSchemas } from '../middleware/validation.js';

const router = express.Router();

// All template routes require authentication
router.use(authenticate);

router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.post('/', validate(templateSchemas.create), createTemplate);
router.put('/:id', validate(templateSchemas.update), updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/:id/duplicate', duplicateTemplate);

export default router;
