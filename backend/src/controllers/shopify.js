import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../utils/database.js';
import { errorResponse, successResponse, asyncHandler } from '../utils/helpers.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { logger } from '../utils/logger.js';

const DEFAULT_CUSTOMER_LIMIT = 50;
const MAX_CUSTOMER_LIMIT = 250;

const getScopes = () => {
  const rawScopes = process.env.SHOPIFY_SCOPES || '';
  return rawScopes
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean)
    .join(',');
};

const buildInstallUrl = ({ shop, state }) => {
  const scopes = getScopes();
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
  const clientId = process.env.SHOPIFY_API_KEY;

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
};

const SHOPIFY_HMAC_REGEX = /^[0-9a-f]{64}$/i;

const getFirstParam = (value) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const buildHmacMessage = (query) => {
  const entries = [];
  let index = 0;

  for (const key of Object.keys(query)) {
    if (key === 'hmac' || key === 'signature') {
      continue;
    }

    const rawValue = query[key];
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        if (value === undefined || value === null) continue;
        entries.push({ key, value: String(value), index: index++ });
      }
    } else if (rawValue !== undefined && rawValue !== null) {
      entries.push({ key, value: String(rawValue), index: index++ });
    }
  }

  entries.sort((a, b) => {
    const keyCompare = a.key.localeCompare(b.key);
    return keyCompare !== 0 ? keyCompare : a.index - b.index;
  });

  return entries.map(({ key, value }) => `${key}=${value}`).join('&');
};

const verifyHmac = (query) => {
  const rawHmac = getFirstParam(query.hmac);
  if (typeof rawHmac !== 'string' || !SHOPIFY_HMAC_REGEX.test(rawHmac)) {
    return false;
  }

  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) {
    return false;
  }

  const message = buildHmacMessage(query);
  const generated = crypto
    .createHmac('sha256', secret)
    .update(Buffer.from(message, 'utf-8'))
    .digest();

  let provided;
  try {
    provided = Buffer.from(rawHmac, 'hex');
  } catch {
    return false;
  }

  if (provided.length !== generated.length) {
    return false;
  }

  return crypto.timingSafeEqual(generated, provided);
};

const decodeState = (state) => {
  try {
    const secret = process.env.SHOPIFY_STATE_SECRET || process.env.JWT_SECRET;
    return jwt.verify(state, secret);
  } catch (error) {
    return null;
  }
};

const createState = (payload) => {
  const secret = process.env.SHOPIFY_STATE_SECRET || process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: '10m' });
};

export const startInstall = asyncHandler(async (req, res) => {
  const { shop } = req.body;

  if (!shop) {
    return res.status(400).json(errorResponse('Missing shop parameter.'));
  }

  const normalizedShop = shop.endsWith('.myshopify.com') ? shop : `${shop}.myshopify.com`;

  if (!/^([a-zA-Z0-9-]+)\.myshopify\.com$/.test(normalizedShop)) {
    return res.status(400).json(errorResponse('Invalid shop domain.'));
  }

  if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET || !process.env.SHOPIFY_REDIRECT_URI) {
    return res.status(500).json(errorResponse('Shopify credentials are not configured.'));
  }

  const state = createState({ userId: req.user.id, shop: normalizedShop, nonce: crypto.randomUUID() });
  const installUrl = buildInstallUrl({ shop: normalizedShop, state });

  res.status(200).json(successResponse({ installUrl }, 'Redirect to Shopify to approve access.'));
});

export const oauthCallback = asyncHandler(async (req, res) => {
  const { shop, code, state } = req.query;

  if (!shop || !code || !state) {
    return res.status(400).json(errorResponse('Missing required OAuth parameters.'));
  }

  if (!verifyHmac(req.query)) {
    return res.status(400).json(errorResponse('Invalid HMAC signature.'));
  }

  const decodedState = decodeState(state);
  if (!decodedState) {
    return res.status(400).json(errorResponse('Invalid or expired state parameter.'));
  }

  if (decodedState.shop !== shop) {
    return res.status(400).json(errorResponse('Shop mismatch between state and callback parameters.'));
  }

  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error('Shopify token exchange failed', text);
      return res.status(400).json(errorResponse('Failed to exchange token with Shopify.'));
    }

    const data = await response.json();
    const accessToken = data.access_token;
    const scope = data.scope;

    // Encrypt access token before storing
    const encryptedToken = encrypt(accessToken);

    await prisma.shopifyStore.upsert({
      where: { shopDomain: shop },
      update: {
        userId: decodedState.userId,
        accessToken: encryptedToken,
        scope,
        isActive: true,
      },
      create: {
        shopDomain: shop,
        userId: decodedState.userId,
        accessToken: encryptedToken,
        scope,
        isActive: true,
      },
    });

    const redirectBase = process.env.FRONTEND_URL;
    const shouldRedirect = redirectBase && redirectBase.startsWith('https://');
    if (shouldRedirect) {
      const redirect = `${redirectBase}/integrations?shop=${shop}`;
      return res.redirect(redirect);
    }

    return res.status(200).json(
      successResponse({ shop, scope }, 'Shopify store connected successfully. You can close this window.')
    );
  } catch (error) {
    logger.error('Shopify OAuth callback error', error);
    return res.status(500).json(errorResponse('Unexpected error completing Shopify connection.'));
  }
});

export const listStores = asyncHandler(async (req, res) => {
  const stores = await prisma.shopifyStore.findMany({
    where: { userId: req.user.id },
    select: {
      id: true,
      shopDomain: true,
      scope: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.status(200).json(successResponse(stores));
});

export const fetchCustomers = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { limit: limitParam } = req.query;
  const parsedLimit = Number.parseInt(Array.isArray(limitParam) ? limitParam[0] : limitParam ?? '', 10);
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, MAX_CUSTOMER_LIMIT)
    : DEFAULT_CUSTOMER_LIMIT;

  const store = await prisma.shopifyStore.findFirst({
    where: {
      id: storeId,
      userId: req.user.id,
      isActive: true,
    },
  });

  if (!store) {
    return res.status(404).json(errorResponse('Store not found or access denied.'));
  }

  try {
    // Decrypt access token for API use
    const decryptedToken = decrypt(store.accessToken);

    const searchParams = new URLSearchParams({ limit: String(limit) });
    const response = await fetch(`https://${store.shopDomain}/admin/api/2024-10/customers.json?${searchParams.toString()}`, {
      headers: {
        'X-Shopify-Access-Token': decryptedToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error('Shopify API error:', text);
      return res.status(response.status).json(errorResponse('Failed to fetch customers from Shopify.'));
    }

    const data = await response.json();
    const customers = data.customers || [];

    const emailLookup = new Map();
    const uniqueEmails = Array.from(
      new Set(
        customers
          .map((customer) => customer.email?.toLowerCase())
          .filter((email) => Boolean(email))
      )
    );

    if (uniqueEmails.length) {
      const perRecipientLimit = 10;
      const emailRecords = await prisma.email.findMany({
        where: {
          recipientEmail: {
            in: uniqueEmails,
          },
          campaign: {
            userId: req.user.id,
            storeId,
          },
        },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              goal: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      for (const record of emailRecords) {
        const key = record.recipientEmail.toLowerCase();
        const existing = emailLookup.get(key) || [];

        if (existing.length < perRecipientLimit) {
          existing.push(record);
          emailLookup.set(key, existing);
        }
      }
    }

    const enrichedCustomers = customers.map((customer) => {
      const key = customer.email?.toLowerCase();
      const emails = (key && emailLookup.get(key)) || [];

      return {
        ...customer,
        emailHistory: emails.map((email) => ({
          id: email.id,
          campaignId: email.campaignId,
          campaignName: email.campaign.name,
          campaignGoal: email.campaign.goal,
          subject: email.subject,
          status: email.status,
          sentAt: email.sentAt,
          openedAt: email.openedAt,
          clickedAt: email.clickedAt,
          createdAt: email.createdAt,
        })),
        emailStats: {
          total: emails.length,
          sent: emails.filter((email) => email.status === 'sent').length,
          opened: emails.filter((email) => email.openedAt).length,
          clicked: emails.filter((email) => email.clickedAt).length,
        },
      };
    });

    return res.status(200).json(successResponse(enrichedCustomers, 'Customers fetched successfully.'));
  } catch (error) {
    logger.error('Error fetching customers:', error);
    return res.status(500).json(errorResponse('Unexpected error fetching customers.'));
  }
});

export const disconnectStore = asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  const store = await prisma.shopifyStore.findFirst({
    where: {
      id: storeId,
      userId: req.user.id,
    },
  });

  if (!store) {
    return res.status(404).json(errorResponse('Store not found or access denied.'));
  }

  await prisma.shopifyStore.update({
    where: { id: storeId },
    data: { isActive: false },
  });

  return res.status(200).json(successResponse({ id: storeId }, 'Store disconnected successfully.'));
});

export const reconnectStore = asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  const store = await prisma.shopifyStore.findFirst({
    where: {
      id: storeId,
      userId: req.user.id,
    },
  });

  if (!store) {
    return res.status(404).json(errorResponse('Store not found or access denied.'));
  }

  await prisma.shopifyStore.update({
    where: { id: storeId },
    data: { isActive: true },
  });

  return res.status(200).json(successResponse({ id: storeId }, 'Store reconnected successfully.'));
});
