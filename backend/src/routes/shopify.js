import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { startInstall, oauthCallback, listStores, fetchCustomers, disconnectStore, reconnectStore } from '../controllers/shopify.js';

const router = express.Router();

router.post('/install', authenticate, startInstall);
router.get('/callback', oauthCallback);
router.get('/stores', authenticate, listStores);
router.get('/stores/:storeId/customers', authenticate, fetchCustomers);
router.post('/stores/:storeId/disconnect', authenticate, disconnectStore);
router.post('/stores/:storeId/reconnect', authenticate, reconnectStore);

export default router;
