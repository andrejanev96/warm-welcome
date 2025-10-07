-- CreateIndex
CREATE INDEX "campaigns_user_id_idx" ON "campaigns"("userId");

-- CreateIndex
CREATE INDEX "campaigns_store_id_idx" ON "campaigns"("storeId");

-- CreateIndex
CREATE INDEX "campaigns_blueprint_id_idx" ON "campaigns"("blueprintId");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "email_blueprints_user_id_idx" ON "email_blueprints"("userId");

-- CreateIndex
CREATE INDEX "emails_campaign_id_idx" ON "emails"("campaignId");

-- CreateIndex
CREATE INDEX "emails_recipient_email_idx" ON "emails"("recipientEmail");

-- CreateIndex
CREATE INDEX "emails_status_idx" ON "emails"("status");

-- CreateIndex
CREATE INDEX "password_reset_audit_user_id_idx" ON "password_reset_audit"("userId");

-- CreateIndex
CREATE INDEX "shopify_stores_user_id_idx" ON "shopify_stores"("userId");

-- CreateIndex
CREATE INDEX "triggers_campaign_id_idx" ON "triggers"("campaignId");
