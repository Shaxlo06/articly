import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function hasAnthropicKey() {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return Boolean(key) && key !== "sk-ant-...";
}

export function getAnthropic() {
  if (!hasAnthropicKey()) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const ENGINE_MODEL = "claude-sonnet-5";

/**
 * Sends a single-turn prompt and returns the text content. Callers are
 * responsible for falling back to a mock when `hasAnthropicKey()` is false —
 * this function assumes a key is present.
 */
export async function completeText(prompt: string, system?: string, maxTokens = 2000) {
  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: ENGINE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}

/** Same as completeText but parses the response as JSON, per a schema described in the prompt. */
export async function completeJson<T>(prompt: string, system?: string, maxTokens = 2000): Promise<T> {
  const text = await completeText(
    `${prompt}\n\nRespond with ONLY valid JSON, no markdown fences, no commentary.`,
    system,
    maxTokens
  );
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  return JSON.parse(cleaned) as T;
}
