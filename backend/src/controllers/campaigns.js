import prisma from '../utils/database.js';
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js';

const parseConditions = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const serializeTrigger = (trigger) => ({
  ...trigger,
  conditions: parseConditions(trigger?.conditions),
});

const withStats = (campaign) => {
  const emails = campaign.emails ?? [];
  const sent = emails.filter((email) => email.status === 'sent').length;
  const pending = emails.filter((email) => email.status === 'pending').length;
  const failed = emails.filter((email) => email.status === 'failed').length;
  const opened = emails.filter((email) => Boolean(email.openedAt)).length;
  const clicked = emails.filter((email) => Boolean(email.clickedAt)).length;

  const { triggers = [], emails: _emails, ...rest } = campaign;

  return {
    ...rest,
    triggers: triggers.map(serializeTrigger),
    emailsSent: sent,
    emailsPending: pending,
    emailsFailed: failed,
    openRate: sent ? Number(((opened / sent) * 100).toFixed(2)) : 0,
    clickRate: sent ? Number(((clicked / sent) * 100).toFixed(2)) : 0,
  };
};

/**
 * Get all campaigns for authenticated user
 */
export const getCampaigns = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const where = {
    userId: req.user.id,
    ...(status && { status }),
  };

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      emails: {
        select: {
          id: true,
          status: true,
          openedAt: true,
          clickedAt: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      triggers: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const campaignsWithStats = campaigns.map((campaign) => withStats(campaign));

  res.status(200).json(successResponse(campaignsWithStats));
});

/**
 * Get single campaign by ID
 */
export const getCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      emails: true,
      template: true,
      triggers: true,
    },
  });

  if (!campaign) {
    return res.status(404).json(errorResponse('Campaign not found'));
  }

  res.status(200).json(successResponse(withStats(campaign)));
});

/**
 * Create new campaign
 */
export const createCampaign = asyncHandler(async (req, res) => {
  const { name, description, templateId, triggerType, triggerConditions, startDate, endDate } = req.body;

  if (!templateId) {
    return res.status(400).json(errorResponse('Template is required'));
  }

  const template = await prisma.emailTemplate.findFirst({
    where: {
      id: templateId,
      OR: [
        { userId: req.user.id },
        { isDefault: true },
      ],
    },
  });

  if (!template) {
    return res.status(404).json(errorResponse('Template not found'));
  }

  let campaign;

  try {
    campaign = await prisma.campaign.create({
      data: {
        name,
        description: description?.trim() ? description : null,
        status: 'paused',
        userId: req.user.id,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        templateId: template.id,
        triggers: {
          create: {
            name: `${name} - Trigger`,
            type: triggerType,
            delay: triggerConditions?.delay ?? 0,
            conditions: triggerConditions ? JSON.stringify(triggerConditions) : null,
          },
        },
      },
      include: {
        template: true,
        triggers: true,
        emails: {
          select: {
            id: true,
            status: true,
            openedAt: true,
            clickedAt: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('createCampaign error', error);
    throw error;
  }

  res.status(201).json(successResponse(withStats(campaign), 'Campaign created successfully'));
});

/**
 * Update campaign
 */
export const updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, templateId, startDate, endDate } = req.body;

  const existingCampaign = await prisma.campaign.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!existingCampaign) {
    return res.status(404).json(errorResponse('Campaign not found'));
  }

  const data = {};

  if (name !== undefined) {
    data.name = name;
  }

  if (description !== undefined) {
    data.description = description?.trim() ? description : null;
  }

  if (startDate !== undefined) {
    data.startDate = startDate ? new Date(startDate) : null;
  }

  if (endDate !== undefined) {
    data.endDate = endDate ? new Date(endDate) : null;
  }

  if (templateId) {
    const template = await prisma.emailTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { userId: req.user.id },
          { isDefault: true },
        ],
      },
    });

    if (!template) {
      return res.status(404).json(errorResponse('Template not found'));
    }

    data.templateId = template.id;
  }

  const updatedCampaign = await prisma.campaign.update({
    where: { id },
    data,
    include: {
      template: true,
      triggers: true,
      emails: {
        select: {
          id: true,
          status: true,
          openedAt: true,
          clickedAt: true,
        },
      },
    },
  });

  res.status(200).json(successResponse(withStats(updatedCampaign), 'Campaign updated successfully'));
});

/**
 * Update campaign status (activate/pause/complete)
 */
export const updateCampaignStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'paused', 'completed'].includes(status)) {
    return res.status(400).json(errorResponse('Invalid status. Must be: active, paused, or completed'));
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!campaign) {
    return res.status(404).json(errorResponse('Campaign not found'));
  }

  const updatedCampaign = await prisma.campaign.update({
    where: { id },
    data: { status },
    include: {
      template: true,
      triggers: true,
      emails: {
        select: {
          id: true,
          status: true,
          openedAt: true,
          clickedAt: true,
        },
      },
    },
  });

  res.status(200).json(successResponse(withStats(updatedCampaign), `Campaign ${status} successfully`));
});

/**
 * Delete campaign
 */
export const deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      emails: true,
    },
  });

  if (!campaign) {
    return res.status(404).json(errorResponse('Campaign not found'));
  }

  if (campaign.status === 'active' && campaign.emails.some((email) => email.status === 'sent')) {
    return res.status(400).json(
      errorResponse('Cannot delete active campaign with sent emails. Pause it first.')
    );
  }

  await prisma.campaign.delete({
    where: { id: campaign.id },
  });

  res.status(200).json(successResponse(null, 'Campaign deleted successfully'));
});

/**
 * Get campaign statistics
 */
export const getCampaignStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      emails: true,
    },
  });

  if (!campaign) {
    return res.status(404).json(errorResponse('Campaign not found'));
  }

  const stats = withStats({ ...campaign, triggers: [] });

  res.status(200).json(successResponse({
    totalEmails: stats.emailsSent + stats.emailsPending + stats.emailsFailed,
    sent: stats.emailsSent,
    pending: stats.emailsPending,
    failed: stats.emailsFailed,
    opened: campaign.emails.filter((email) => Boolean(email.openedAt)).length,
    clicked: campaign.emails.filter((email) => Boolean(email.clickedAt)).length,
    openRate: stats.openRate,
    clickRate: stats.clickRate,
  }));
});
