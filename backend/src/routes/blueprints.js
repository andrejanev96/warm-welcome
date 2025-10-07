import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getBlueprints,
  getBlueprint,
  createBlueprint,
  updateBlueprint,
  deleteBlueprint,
} from '../controllers/blueprints.js';

const router = express.Router();

router.get('/', authenticate, getBlueprints);
router.get('/:id', authenticate, getBlueprint);
router.post('/', authenticate, createBlueprint);
router.put('/:id', authenticate, updateBlueprint);
router.delete('/:id', authenticate, deleteBlueprint);

export default router;
