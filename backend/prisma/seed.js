import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    name: 'Warm Welcome Email',
    subject: 'Welcome to {{storeName}}! 🎉',
    body: `Hi {{firstName}},

We're thrilled to have you join the {{storeName}} family!

As a warm welcome, we wanted to let you know that we're here to help make your experience amazing. Whether you're browsing for something special or just exploring, we've got you covered.

Here's what you can expect from us:
✨ Handpicked products with love
📦 Fast & reliable shipping
💝 Exclusive member perks

Feel free to reach out anytime - we'd love to hear from you!

Warmly,
The {{storeName}} Team

P.S. Keep an eye on your inbox for special offers just for you!`,
    category: 'welcome',
    isDefault: true,
  },
  {
    name: 'First Purchase Thank You',
    subject: 'Thank you for your first order! 💝',
    body: `Hey {{firstName}}!

We just wanted to send a quick note to say THANK YOU for your first purchase with us!

Your order #{{orderNumber}} is being prepared with care and will be on its way to you soon. We can't wait for you to receive it!

Track your order: {{trackingLink}}

This is just the beginning of something special. We're so glad you chose us, and we promise to make every experience with {{storeName}} worth your while.

With gratitude,
The {{storeName}} Team

P.S. How are we doing? We'd love to hear your feedback!`,
    category: 'purchase',
    isDefault: true,
  },
  {
    name: 'Engagement - Come Back',
    subject: 'We miss you, {{firstName}}! 🌟',
    body: `Hi {{firstName}},

It's been a while since we've seen you around, and we wanted to check in!

We've added some amazing new items since your last visit, and we thought you might like to take a peek. Plus, we have a little something special waiting for you...

{{specialOffer}}

No pressure - just wanted to let you know we're thinking of you and hope everything's going well!

Come say hi anytime,
The {{storeName}} Team

P.S. If you're getting too many emails from us, you can always adjust your preferences.`,
    category: 'engagement',
    isDefault: true,
  },
  {
    name: 'Abandoned Cart Reminder',
    subject: 'You left something behind! 🛒',
    body: `Hey {{firstName}},

Looks like you left a few items in your cart!

We've saved them for you:
{{cartItems}}

Total: {{cartTotal}}

Sometimes life gets busy - we totally get it. But we didn't want you to miss out on these goodies!

{{checkoutLink}}

Need help with your order? Just hit reply and we'll be happy to assist!

Cheers,
The {{storeName}} Team

P.S. Your cart will be held for {{cartHoldDays}} days.`,
    category: 'abandoned_cart',
    isDefault: true,
  },
  {
    name: 'Product Review Request',
    subject: 'How\'s everything with your order? ⭐',
    body: `Hi {{firstName}},

We hope you're loving your recent purchase from {{storeName}}!

We'd absolutely love to hear what you think. Your feedback helps us improve and helps other customers make great choices too.

{{reviewLink}}

As a thank you for taking the time, we'll send you a special discount code for your next order!

Thank you for being an amazing customer!

Best,
The {{storeName}} Team

P.S. Got questions or concerns? We're here to help - just reply to this email!`,
    category: 'engagement',
    isDefault: true,
  },
];

async function main() {
  console.log('🌱 Seeding database with default email templates...');

  for (const template of defaultTemplates) {
    // Check if template already exists
    const existing = await prisma.emailTemplate.findFirst({
      where: { name: template.name },
    });

    if (!existing) {
      await prisma.emailTemplate.create({
        data: template,
      });
      console.log(`✅ Created template: ${template.name}`);
    } else {
      console.log(`⏭️  Skipped (already exists): ${template.name}`);
    }
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
