-- CreateTable
CREATE TABLE "password_reset_audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "requestIp" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "password_reset_audit_email_idx" ON "password_reset_audit"("email");

-- CreateIndex
CREATE INDEX "password_reset_audit_created_at_idx" ON "password_reset_audit"("createdAt");
