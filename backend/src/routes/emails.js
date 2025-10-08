import express from "express";
import { authenticate } from "../middleware/auth.js";
import { validate, emailSchemas } from "../middleware/validation.js";
import { previewEmail, sendTestEmail } from "../controllers/emails.js";

const router = express.Router();

router.use(authenticate);

router.post("/preview", validate(emailSchemas.preview), previewEmail);
router.post("/send-test", validate(emailSchemas.sendTest), sendTestEmail);

export default router;
