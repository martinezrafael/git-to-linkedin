import OpenAI from "openai";
import buildSystemPrompt from "./buildSystemPrompt.js";
import buildUserPrompt from "./buildUserPrompt.js";

const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";

/**
 * @param {string} diff
 * @param {object} promptConfig
 * @param {string} apiKey
 */
async function generatePostFromDiff(diff, promptConfig, apiKey) {
  if (!promptConfig) {
    throw new Error("Prompt configuration was not provided.");
  }
  if (!apiKey) {
    throw new Error("API key was not provided.");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: promptConfig.baseURL || DEFAULT_BASE_URL,
  });

  const completion = await client.chat.completions.create({
    model: promptConfig.model || "llama-3.3-70b-versatile",
    temperature: promptConfig.temperature ?? 0.7,
    max_tokens: promptConfig.maxTokens || 1024,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(promptConfig),
      },
      {
        role: "user",
        content: buildUserPrompt(promptConfig, diff),
      },
    ],
  });

  return completion.choices[0].message.content.trim();
}

export default generatePostFromDiff;
