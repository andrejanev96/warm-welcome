-- Drop email_templates table and its foreign keys
PRAGMA foreign_keys=off;

-- Remove templateId from emails table
CREATE TABLE "new_emails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" DATETIME,
    "openedAt" DATETIME,
    "clickedAt" DATETIME,
    "errorMessage" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "emails_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_emails" ("id", "campaignId", "recipientEmail", "subject", "body", "status", "sentAt", "openedAt", "clickedAt", "errorMessage", "metadata", "createdAt", "updatedAt")
SELECT "id", "campaignId", "recipientEmail", "subject", "body", "status", "sentAt", "openedAt", "clickedAt", "errorMessage", "metadata", "createdAt", "updatedAt"
FROM "emails";

DROP TABLE "emails";
ALTER TABLE "new_emails" RENAME TO "emails";

-- Remove templateId and add goal to campaigns table
CREATE TABLE "new_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "campaigns_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "shopify_stores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_campaigns" ("id", "userId", "storeId", "name", "description", "status", "startDate", "endDate", "createdAt", "updatedAt")
SELECT "id", "userId", "storeId", "name", "description", "status", "startDate", "endDate", "createdAt", "updatedAt"
FROM "campaigns";

DROP TABLE "campaigns";
ALTER TABLE "new_campaigns" RENAME TO "campaigns";

-- Drop email_templates table
DROP TABLE IF EXISTS "email_templates";

-- Create brand_voice table
CREATE TABLE "brand_voice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessName" TEXT,
    "businessDescription" TEXT,
    "tone" TEXT,
    "values" TEXT,
    "talkingPoints" TEXT,
    "dosDonts" TEXT,
    "exampleCopy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "brand_voice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "brand_voice_userId_key" ON "brand_voice"("userId");

PRAGMA foreign_keys=on;
