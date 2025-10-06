import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../utils/database.js';
import { errorResponse, successResponse, asyncHandler } from '../utils/helpers.js';

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

const verifyHmac = (query) => {
  const { hmac, ...rest } = query;
  const message = Object.keys(rest)
    .sort()
    .map((key) => {
      const value = rest[key];
      const normalized = Array.isArray(value) ? value.join(',') : value;
      return `${key}=${normalized}`;
    })
    .join('&');

  const generated = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(Buffer.from(message))
    .digest('hex');

  return generated === hmac;
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
      console.error('Shopify token exchange failed', text);
      return res.status(400).json(errorResponse('Failed to exchange token with Shopify.'));
    }

    const data = await response.json();
    const accessToken = data.access_token;
    const scope = data.scope;

    await prisma.shopifyStore.upsert({
      where: { shopDomain: shop },
      update: {
        userId: decodedState.userId,
        accessToken,
        scope,
        isActive: true,
      },
      create: {
        shopDomain: shop,
        userId: decodedState.userId,
        accessToken,
        scope,
        isActive: true,
      },
    });

    const redirect = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/integrations?shop=${shop}` : undefined;
    if (redirect) {
      return res.redirect(redirect);
    }

    return res.status(200).json(successResponse({ shop, scope }, 'Shopify store connected successfully.'));
  } catch (error) {
    console.error('Shopify OAuth callback error', error);
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
    const response = await fetch(`https://${store.shopDomain}/admin/api/2024-10/customers.json?limit=10`, {
      headers: {
        'X-Shopify-Access-Token': store.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Shopify API error:', text);
      return res.status(response.status).json(errorResponse('Failed to fetch customers from Shopify.'));
    }

    const data = await response.json();
    return res.status(200).json(successResponse(data.customers, 'Customers fetched successfully.'));
  } catch (error) {
    console.error('Error fetching customers:', error);
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
