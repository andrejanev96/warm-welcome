import express from "express";
import { authenticate } from "../middleware/auth.js";
import { validate, campaignSchemas } from "../middleware/validation.js";
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  updateCampaignStatus,
  deleteCampaign,
  getCampaignStats,
} from "../controllers/campaigns.js";

const router = express.Router();

// All campaign routes require authentication
router.use(authenticate);

// Campaign CRUD
router.get("/", getCampaigns);
router.get("/:id", getCampaign);
router.post("/", validate(campaignSchemas.create), createCampaign);
router.put("/:id", validate(campaignSchemas.update), updateCampaign);
router.delete("/:id", deleteCampaign);

// Campaign status management
router.patch("/:id/status", validate(campaignSchemas.updateStatus), updateCampaignStatus);

// Campaign statistics
router.get("/:id/stats", getCampaignStats);

export default router;
