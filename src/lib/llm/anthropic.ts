/**
 * Minimal Anthropic Messages API client — fetch-based, zero-dependency, to
 * match the codebase convention (see razorpay.ts). Returns null config when
 * unset so every caller degrades gracefully to static templates.
 */

const ANTHROPIC_BASE = "https://api.anthropic.com/v1";
const ANTHROPIC_VERSION = "2023-06-01";

/** Default model. Override with LLM_PLAN_MODEL (e.g. a cheaper tier) if needed. */
const DEFAULT_MODEL = "claude-opus-4-8";

export type AnthropicConfig = {
  apiKey: string;
  model: string;
};

export function getAnthropicConfig(): AnthropicConfig | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return { apiKey, model: process.env.LLM_PLAN_MODEL || DEFAULT_MODEL };
}

type MessageContentBlock = { type: string; text?: string };

type MessagesResponse = {
  content?: MessageContentBlock[];
  stop_reason?: string;
};

/**
 * Single structured-output completion. `schema` constrains the response to
 * valid JSON of type T via output_config.format. Throws on transport/HTTP
 * errors — callers catch and fall back to static content.
 */
export async function generateStructured<T>(params: {
  config: AnthropicConfig;
  system: string;
  userPrompt: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<T> {
  const { config, system, userPrompt, schema, maxTokens = 4096 } = params;

  const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userPrompt }],
      output_config: { format: { type: "json_schema", schema } },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text}`);
  }

  const data = (await res.json()) as MessagesResponse;
  if (data.stop_reason === "refusal") {
    throw new Error("Anthropic declined the request (refusal).");
  }
  const textBlock = data.content?.find((b) => b.type === "text" && b.text);
  if (!textBlock?.text) {
    throw new Error("Anthropic returned no text content.");
  }
  return JSON.parse(textBlock.text) as T;
}
