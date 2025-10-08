const REQUIRED_SETTINGS = [
  {
    key: "JWT_SECRET",
    validate: (value) => typeof value === "string" && value.trim().length >= 16,
    error: "JWT_SECRET must be set and at least 16 characters long",
  },
  {
    key: "ENCRYPTION_KEY",
    validate: (value) => typeof value === "string" && value.trim().length >= 32,
    error: "ENCRYPTION_KEY must be set and at least 32 characters long",
  },
];

const SHOPIFY_KEYS = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_REDIRECT_URI"];

const trimValue = (value) => (typeof value === "string" ? value.trim() : value);

export const validateEnvironment = () => {
  const errors = [];
  const warnings = [];

  for (const setting of REQUIRED_SETTINGS) {
    const value = trimValue(process.env[setting.key]);
    if (!setting.validate(value)) {
      errors.push(setting.error);
    }
  }

  const hasAnyShopifySetting = SHOPIFY_KEYS.some((key) => Boolean(trimValue(process.env[key])));

  if (hasAnyShopifySetting) {
    const missing = SHOPIFY_KEYS.filter((key) => !trimValue(process.env[key]));
    if (missing.length > 0) {
      warnings.push(
        `Partial Shopify configuration detected. Missing: ${missing.join(", ")}. Shopify OAuth will fail until all values are set.`,
      );
    }

    const stateSecret = trimValue(process.env.SHOPIFY_STATE_SECRET || process.env.JWT_SECRET);
    if (!stateSecret) {
      warnings.push("SHOPIFY_STATE_SECRET is not set. Falling back to JWT_SECRET for Shopify state tokens.");
    }
  }

  if (warnings.length > 0) {
    for (const warning of warnings) {
      console.warn(`[config] ${warning}`);
    }
  }

  if (!trimValue(process.env.OPENAI_API_KEY)) {
    console.warn(
      "[config] OPENAI_API_KEY is not set. AI email generation and previews will be disabled until it is configured.",
    );
  }

  if (errors.length > 0) {
    const message = errors.map((error) => `- ${error}`).join("\n");
    throw new Error(`Environment validation failed:\n${message}`);
  }
};
