-- AlterTable
ALTER TABLE "triggers" ADD COLUMN "name" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeId" TEXT,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "campaigns_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "shopify_stores" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_campaigns" ("createdAt", "description", "id", "name", "status", "storeId", "updatedAt", "userId") SELECT "createdAt", "description", "id", "name", "status", "storeId", "updatedAt", "userId" FROM "campaigns";
DROP TABLE "campaigns";
ALTER TABLE "new_campaigns" RENAME TO "campaigns";
CREATE TABLE "new_email_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "email_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_email_templates" ("body", "category", "createdAt", "id", "isDefault", "name", "subject", "updatedAt") SELECT "body", "category", "createdAt", "id", "isDefault", "name", "subject", "updatedAt" FROM "email_templates";
DROP TABLE "email_templates";
ALTER TABLE "new_email_templates" RENAME TO "email_templates";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
