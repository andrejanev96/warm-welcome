-- AlterTable
ALTER TABLE "users" ADD COLUMN "passwordResetExpires" DATETIME;
ALTER TABLE "users" ADD COLUMN "passwordResetToken" TEXT;
