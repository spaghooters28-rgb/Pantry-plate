const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash";

export function isGeminiEnabled(): boolean {
  return Boolean(GEMINI_API_KEY);
}

interface GeminiPart { text: string }
export interface GeminiContent { role: "user" | "model"; parts: GeminiPart[] }

interface GeminiResponse {
  candidates?: Array<{ content: { parts: GeminiPart[] } }>;
  error?: { message: string };
}

export async function geminiGenerate(prompt: string, systemInstruction?: string): Promise<string> {
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };
  if (systemInstruction) {
    body.system_instruction = { parts: [{ text: systemInstruction }] };
  }
  const res = await fetch(`${BASE_URL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json() as GeminiResponse;
  if (data.error) throw new Error(`Gemini error: ${data.error.message}`);
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
}

export async function* geminiStreamChat(
  history: GeminiContent[],
  systemInstruction: string,
): AsyncGenerator<string> {
  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: history,
  };
  const res = await fetch(`${BASE_URL}:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini streaming error ${res.status}: ${errText}`);
  }
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;
      try {
        const chunk = JSON.parse(jsonStr) as GeminiResponse;
        const text = chunk.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
        if (text) yield text;
      } catch { /* skip malformed chunks */ }
    }
  }
}
