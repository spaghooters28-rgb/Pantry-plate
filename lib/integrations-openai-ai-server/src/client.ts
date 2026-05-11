import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
      throw new Error(
        "AI_INTEGRATIONS_OPENAI_BASE_URL must be set. Did you forget to provision the OpenAI AI integration? " +
          "Alternatively, set GEMINI_API_KEY to use Google Gemini instead.",
      );
    }
    if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      throw new Error(
        "AI_INTEGRATIONS_OPENAI_API_KEY must be set. Did you forget to provision the OpenAI AI integration? " +
          "Alternatively, set GEMINI_API_KEY to use Google Gemini instead.",
      );
    }
    _openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return _openai;
}

// Proxy defers initialization until first property access, so the server
// boots successfully with only GEMINI_API_KEY set (no OpenAI env vars needed).
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    return Reflect.get(getOpenAIClient(), prop, receiver);
  },
});
