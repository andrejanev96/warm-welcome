import prisma from '../utils/database.js';
import { asyncHandler, successResponse } from '../utils/helpers.js';

/**
 * Get onboarding progress for authenticated user
 */
export const getOnboardingProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Check each onboarding step
  const [stores, brandVoice, blueprints, campaigns] = await Promise.all([
    prisma.shopifyStore.count({
      where: { userId, isActive: true },
    }),
    prisma.brandVoice.findUnique({
      where: { userId },
    }),
    prisma.emailBlueprint.count({
      where: { userId },
    }),
    prisma.campaign.count({
      where: { userId },
    }),
  ]);

  const steps = [
    {
      id: 'connect_store',
      title: 'Connect your Shopify store',
      description: 'Link your e-commerce store to start collecting customer data',
      completed: stores > 0,
      link: '/integrations',
      icon: '🏪',
    },
    {
      id: 'setup_brand_voice',
      title: 'Define your brand voice',
      description: 'Teach AI how to write emails that sound like you',
      completed: Boolean(brandVoice),
      link: '/brand-voice',
      icon: '🎤',
    },
    {
      id: 'create_blueprint',
      title: 'Create your first blueprint',
      description: 'Design a reusable email template structure',
      completed: blueprints > 0,
      link: '/blueprints/new',
      icon: '📋',
    },
    {
      id: 'launch_campaign',
      title: 'Launch your first campaign',
      description: 'Set up AI-powered automated emails',
      completed: campaigns > 0,
      link: '/campaigns/new',
      icon: '🚀',
    },
  ];

  const completedCount = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progress = Math.round((completedCount / totalSteps) * 100);

  res.status(200).json(
    successResponse({
      steps,
      completedCount,
      totalSteps,
      progress,
      isComplete: completedCount === totalSteps,
    })
  );
});
