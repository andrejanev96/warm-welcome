import crypto from "node:crypto";
import { logger } from "./logger.js";

/**
 * Encryption utilities for sensitive data
 * Uses AES-256-GCM encryption
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derive encryption key from secret
 */
const deriveKey = (secret, salt) => {
  return crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, "sha256");
};

/**
 * Get encryption secret from environment
 */
const getEncryptionSecret = () => {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  if (secret.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters long");
  }
  return secret;
};

/**
 * Encrypt a string value
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text with salt, IV, and auth tag (format: salt:iv:authTag:encrypted)
 */
export const encrypt = (text) => {
  if (!text) return null;

  try {
    const secret = getEncryptionSecret();

    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from secret and salt
    const key = deriveKey(secret, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Return combined format: salt:iv:authTag:encrypted
    return `${salt.toString("hex")}:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (error) {
    logger.error("Encryption error:", error.message);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypt an encrypted string
 * @param {string} encryptedData - Encrypted data (format: salt:iv:authTag:encrypted)
 * @returns {string} - Decrypted plain text
 */
export const decrypt = (encryptedData) => {
  if (!encryptedData) return null;

  try {
    const secret = getEncryptionSecret();

    // Parse encrypted data
    const parts = encryptedData.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted data format");
    }

    const salt = Buffer.from(parts[0], "hex");
    const iv = Buffer.from(parts[1], "hex");
    const authTag = Buffer.from(parts[2], "hex");
    const encrypted = parts[3];

    // Derive key from secret and salt
    const key = deriveKey(secret, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    logger.error("Decryption error:", error.message);
    throw new Error("Failed to decrypt data");
  }
};

/**
 * Check if a value is encrypted (has the expected format)
 */
export const isEncrypted = (value) => {
  if (!value || typeof value !== "string") return false;
  const parts = value.split(":");
  return parts.length === 4;
};
