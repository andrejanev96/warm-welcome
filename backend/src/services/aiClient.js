import OpenAI from "openai";
import { logger } from "../utils/logger.js";

let client = null;

export const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (client) {
    return client;
  }

  try {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
    return client;
  } catch (error) {
    logger.error("Failed to initialize OpenAI client", error);
    throw error;
  }
};
