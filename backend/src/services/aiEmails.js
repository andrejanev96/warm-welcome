import { getOpenAIClient } from "./aiClient.js";
import { logger } from "../utils/logger.js";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const buildSystemPrompt = ({ brandVoice }) => {
  const lines = [
    "You are WarmWelcome AI, an expert at writing friendly, high-performing onboarding emails for ecommerce brands.",
    "Use the brand guidance provided to match tone and perspective.",
    "Always return valid JSON with the following shape: { \"subject\": string, \"html\": string, \"text\": string }.",
    "The html field should contain semantic HTML ready for email sending (no extraneous styles, inline basic styling where needed).",
    "The text field should be a plain-text version of the HTML.",
  ];

  if (brandVoice) {
    const details = [];
    if (brandVoice.businessName) {
      details.push(`Business name: ${brandVoice.businessName}`);
    }
    if (brandVoice.tone) {
      details.push(`Tone: ${brandVoice.tone}`);
    }
    if (brandVoice.values) {
      details.push(`Values: ${brandVoice.values}`);
    }
    if (brandVoice.talkingPoints) {
      details.push(`Talking points: ${brandVoice.talkingPoints}`);
    }
    if (brandVoice.dosDonts) {
      details.push(`Dos & Don'ts: ${brandVoice.dosDonts}`);
    }
    if (brandVoice.exampleCopy) {
      details.push(`Example copy: ${brandVoice.exampleCopy}`);
    }

    if (details.length > 0) {
      lines.push("Brand guidance:");
      lines.push(details.join("\n"));
    }
  }

  return lines.join("\n");
};

const buildUserPrompt = ({ campaign, blueprint, customer }) => {
  const payload = {
    campaign: {
      name: campaign?.name,
      goal: campaign?.goal,
      description: campaign?.description,
    },
    customer,
    blueprint,
  };

  return [
    "Generate a personalised onboarding email using the following context.",
    "Respond ONLY with JSON and do not include markdown fences.",
    JSON.stringify(payload, null, 2),
  ].join("\n\n");
};

const parseModelResponse = (content) => {
  try {
    const trimmed = content.trim();
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in response");
    }

    const jsonString = trimmed.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonString);

    if (!parsed.subject || !parsed.html) {
      throw new Error("Response missing subject or html");
    }

    return {
      subject: parsed.subject,
      html: parsed.html,
      text: parsed.text || parsed.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    };
  } catch (error) {
    logger.error("Failed to parse OpenAI response", error);
    throw new Error("AI response parsing failed");
  }
};

export const generateEmailFromBlueprint = async ({ brandVoice, campaign, blueprint, customer }) => {
  const client = getOpenAIClient();

  const messages = [
    {
      role: "system",
      content: buildSystemPrompt({ brandVoice }),
    },
    {
      role: "user",
      content: buildUserPrompt({ campaign, blueprint, customer }),
    },
  ];

  try {
    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.7,
    });

    const choice = response.choices?.[0]?.message?.content;
    if (!choice) {
      throw new Error("OpenAI returned an empty response");
    }

    return parseModelResponse(choice);
  } catch (error) {
    logger.error("generateEmailFromBlueprint error", error);
    throw new Error("Failed to generate email content");
  }
};
