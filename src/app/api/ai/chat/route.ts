import { NextRequest, NextResponse } from "next/server";

interface ProviderConfig {
  apiKey: string;
  model: string;
}

interface ChatBody {
  provider: string;
  providerConfig?: ProviderConfig;
  messages: { role: string; content: string }[];
  system?: string;
}

async function callClaude(config: ProviderConfig, messages: { role: string; content: string }[], system?: string) {
  const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages,
      system,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Claude API error");
  }

  const data = await res.json();
  return data.content?.[0]?.text || "No response generated.";
}

async function callOpenAI(config: ProviderConfig, messages: { role: string; content: string }[], system?: string) {
  const apiKey = config.apiKey;
  if (!apiKey) throw new Error("OpenAI API key not configured. Add it in Settings > AI Providers.");

  const msgs = system
    ? [{ role: "system", content: system }, ...messages]
    : messages;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || "gpt-4o",
      messages: msgs,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "OpenAI API error");
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
}

async function callGoogleAI(config: ProviderConfig, messages: { role: string; content: string }[], system?: string) {
  const apiKey = config.apiKey;
  if (!apiKey) throw new Error("Google AI API key not configured. Add it in Settings > AI Providers.");

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const model = config.model || "gemini-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = { contents };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Google AI API error");
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}

async function callOpenRouter(config: ProviderConfig, messages: { role: string; content: string }[], system?: string) {
  const apiKey = config.apiKey;
  if (!apiKey) throw new Error("OpenRouter API key not configured. Add it in Settings > AI Providers.");

  const msgs = system
    ? [{ role: "system", content: system }, ...messages]
    : messages;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || "openai/gpt-4o",
      messages: msgs,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "OpenRouter API error");
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatBody = await req.json();
    const { provider, providerConfig, messages, system } = body;

    const config: ProviderConfig = providerConfig || { apiKey: "", model: "" };

    let reply: string;
    switch (provider) {
      case "openai":
        reply = await callOpenAI(config, messages, system);
        break;
      case "google":
        reply = await callGoogleAI(config, messages, system);
        break;
      case "openrouter":
        reply = await callOpenRouter(config, messages, system);
        break;
      case "claude":
      default:
        reply = await callClaude(config, messages, system);
        break;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
