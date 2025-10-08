import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getBrandVoice, upsertBrandVoice, deleteBrandVoice } from "../controllers/brandVoice.js";

const router = express.Router();

router.get("/", authenticate, getBrandVoice);
router.put("/", authenticate, upsertBrandVoice);
router.delete("/", authenticate, deleteBrandVoice);

export default router;
