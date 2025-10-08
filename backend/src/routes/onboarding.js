import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getOnboardingProgress } from "../controllers/onboarding.js";

const router = express.Router();

router.get("/progress", authenticate, getOnboardingProgress);

export default router;
