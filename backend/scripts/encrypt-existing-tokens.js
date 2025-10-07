/**
 * Migration script to encrypt existing Shopify access tokens
 * Run this once after deploying the encryption feature
 *
 * Usage: node scripts/encrypt-existing-tokens.js
 */

import prisma from '../src/utils/database.js';
import { encrypt, isEncrypted } from '../src/utils/encryption.js';

async function encryptExistingTokens() {
  console.log('Starting token encryption migration...\n');

  try {
    // Fetch all Shopify stores
    const stores = await prisma.shopifyStore.findMany({
      select: {
        id: true,
        shopDomain: true,
        accessToken: true,
      },
    });

    console.log(`Found ${stores.length} store(s) to process\n`);

    let encryptedCount = 0;
    let alreadyEncryptedCount = 0;
    let errorCount = 0;

    for (const store of stores) {
      try {
        // Skip if already encrypted
        if (isEncrypted(store.accessToken)) {
          console.log(`✓ ${store.shopDomain} - Already encrypted`);
          alreadyEncryptedCount++;
          continue;
        }

        // Encrypt the token
        const encryptedToken = encrypt(store.accessToken);

        // Update in database
        await prisma.shopifyStore.update({
          where: { id: store.id },
          data: { accessToken: encryptedToken },
        });

        console.log(`✓ ${store.shopDomain} - Encrypted successfully`);
        encryptedCount++;
      } catch (error) {
        console.error(`✗ ${store.shopDomain} - Error:`, error.message);
        errorCount++;
      }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Total stores: ${stores.length}`);
    console.log(`Newly encrypted: ${encryptedCount}`);
    console.log(`Already encrypted: ${alreadyEncryptedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('\n✓ Migration complete!');
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
encryptExistingTokens();
