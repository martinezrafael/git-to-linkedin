import OpenAI from "openai";
import buildSystemPrompt from "./buildSystemPrompt.js";
import buildUserPrompt from "./buildUserPrompt.js";

const groq = new OpenAI({
  apiKey: process.env.TEXT_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Gera o texto do post utilizando a API da Groq/OpenAI
 * @param {string} diff - O diff do git
 * @param {object} promptConfig - O objeto de configuração carregado do JSON
 */
async function generatePostFromDiff(diff, promptConfig) {
  // Verificação de segurança caso o config venha vazio
  if (!promptConfig) {
    throw new Error(
      "A configuração 'promptConfig' não foi fornecida para generatePostFromDiff.",
    );
  }

  const completion = await groq.chat.completions.create({
    model: promptConfig.model || "llama-3.3-70b-versatile", // Fallback caso o modelo não esteja no JSON
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
