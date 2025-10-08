import prisma from "../utils/database.js";
import { asyncHandler, successResponse, errorResponse } from "../utils/helpers.js";
import { generateEmailFromBlueprint } from "../services/aiEmails.js";
import { sendEmail } from "../services/email.js";

const DEFAULT_CUSTOMER = {
  firstName: "Jamie",
  lastName: "Lee",
  email: "jamie@example.com",
};

const parseJsonField = (value, fallback) => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeBrandVoice = (brandVoice) => {
  if (!brandVoice) {
    return null;
  }

  const valuesRaw = brandVoice.values ? parseJsonField(brandVoice.values, []) : [];
  const talkingPointsRaw = brandVoice.talkingPoints ? parseJsonField(brandVoice.talkingPoints, []) : [];
  const dosDontsRaw = brandVoice.dosDonts ? parseJsonField(brandVoice.dosDonts, {}) : {};

  const formatList = (value) => {
    if (Array.isArray(value)) {
      return value.filter(Boolean).join(", ");
    }
    return typeof value === "string" ? value : "";
  };

  const formatDosDonts = (value) => {
    if (!value || typeof value !== "object") {
      return "";
    }
    const dos = Array.isArray(value.dos) ? value.dos.join(", ") : "";
    const donts = Array.isArray(value.donts) ? value.donts.join(", ") : "";
    return `Do: ${dos}. Don't: ${donts}`.trim();
  };

  return {
    businessName: brandVoice.businessName,
    businessDescription: brandVoice.businessDescription,
    tone: brandVoice.tone,
    values: formatList(valuesRaw),
    talkingPoints: formatList(talkingPointsRaw),
    dosDonts: formatDosDonts(dosDontsRaw),
    exampleCopy: brandVoice.exampleCopy,
  };
};

const serializeBlueprint = (blueprint) => {
  if (!blueprint) {
    return null;
  }

  return {
    name: blueprint.name,
    subjectPattern: blueprint.subjectPattern,
    structure: parseJsonField(blueprint.structure, {}),
    variables: parseJsonField(blueprint.variables, []),
    optionalVars: blueprint.optionalVars ? parseJsonField(blueprint.optionalVars, []) : [],
    example: blueprint.example,
  };
};

const loadCampaignContext = async ({ campaignId, userId }) => {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      userId,
    },
    include: {
      blueprint: true,
      store: {
        select: {
          id: true,
          shopDomain: true,
        },
      },
    },
  });

  if (!campaign) {
    return { error: errorResponse("Campaign not found") };
  }

  if (!campaign.blueprint) {
    return { error: errorResponse("Attach a blueprint to the campaign before generating emails") };
  }

  const brandVoice = await prisma.brandVoice.findUnique({
    where: { userId },
  });

  return {
    campaign,
    blueprint: serializeBlueprint(campaign.blueprint),
    brandVoice: normalizeBrandVoice(brandVoice),
  };
};

export const previewEmail = asyncHandler(async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(503)
      .json(errorResponse("AI provider is not configured. Set OPENAI_API_KEY to enable previews."));
  }

  const { campaignId, customer } = req.body;

  if (!campaignId) {
    return res.status(400).json(errorResponse("campaignId is required"));
  }

  const context = await loadCampaignContext({ campaignId, userId: req.user.id });
  if (context.error) {
    return res.status(404).json(context.error);
  }

  const mergedCustomer = {
    ...DEFAULT_CUSTOMER,
    ...(customer || {}),
  };

  const generated = await generateEmailFromBlueprint({
    brandVoice: context.brandVoice,
    campaign: context.campaign,
    blueprint: context.blueprint,
    customer: mergedCustomer,
  });

  res.status(200).json(
    successResponse({
      subject: generated.subject,
      html: generated.html,
      text: generated.text,
      customer: mergedCustomer,
    }),
  );
});

export const sendTestEmail = asyncHandler(async (req, res) => {
  const { campaignId, customer, to } = req.body;

  if (!campaignId) {
    return res.status(400).json(errorResponse("campaignId is required"));
  }

  if (!to) {
    return res.status(400).json(errorResponse("Recipient email is required"));
  }

  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(503)
      .json(errorResponse("AI provider is not configured. Set OPENAI_API_KEY to enable previews."));
  }

  const context = await loadCampaignContext({ campaignId, userId: req.user.id });
  if (context.error) {
    return res.status(404).json(context.error);
  }

  const mergedCustomer = {
    ...DEFAULT_CUSTOMER,
    ...(customer || {}),
  };

  const generated = await generateEmailFromBlueprint({
    brandVoice: context.brandVoice,
    campaign: context.campaign,
    blueprint: context.blueprint,
    customer: mergedCustomer,
  });

  const recipientName = [mergedCustomer.firstName, mergedCustomer.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const sendResult = await sendEmail({
    to,
    subject: generated.subject,
    html: generated.html,
    text: generated.text,
  });

  await prisma.email.create({
    data: {
      campaignId: context.campaign.id,
      recipientEmail: to.toLowerCase(),
      recipientName: recipientName || null,
      subject: generated.subject,
      body: generated.html,
      aiGenerated: true,
      status: sendResult ? "sent" : "failed",
      sentAt: sendResult ? new Date() : null,
      clickedAt: null,
      openedAt: null,
      metadata: JSON.stringify({
        customerProfile: mergedCustomer,
        testSend: true,
      }),
      errorMessage: sendResult ? null : "Unable to send email via SMTP transporter",
    },
  });

  if (!sendResult) {
    return res
      .status(500)
      .json(errorResponse("Failed to send email. Check SMTP configuration and try again."));
  }

  res.status(200).json(successResponse({ success: true }, "Test email sent"));
});
