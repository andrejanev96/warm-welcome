import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getBlueprints,
  getBlueprint,
  createBlueprint,
  updateBlueprint,
  deleteBlueprint,
} from '../controllers/blueprints.js';
import { validate, blueprintSchemas } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticate, getBlueprints);
router.get('/:id', authenticate, getBlueprint);
router.post('/', authenticate, validate(blueprintSchemas.create), createBlueprint);
router.put('/:id', authenticate, validate(blueprintSchemas.update), updateBlueprint);
router.delete('/:id', authenticate, deleteBlueprint);

export default router;
