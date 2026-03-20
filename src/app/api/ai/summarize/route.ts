import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, style = "concise", provider = "claude", providerConfig } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'text' field" }, { status: 400 });
    }

    if (text.length > 100000) {
      return NextResponse.json({ error: "Text too long. Maximum 100,000 characters." }, { status: 400 });
    }

    const styleInstructions: Record<string, string> = {
      concise: "Provide a concise 2-3 sentence summary capturing the main points.",
      detailed: "Provide a detailed summary with key points, main arguments, and conclusions in 150-200 words.",
      bullets: "Summarize as 5-7 bullet points covering the most important information.",
      headline: "Provide a single headline sentence (under 20 words) that captures the essence.",
    };

    const instruction = styleInstructions[style] || styleInstructions.concise;
    const systemPrompt = `You are a professional summarization assistant. ${instruction} Be clear, accurate, and preserve the original meaning.`;

    const apiKey = providerConfig?.apiKey || process.env.ANTHROPIC_API_KEY;

    // Try to call the AI provider
    if (provider === "claude" && apiKey) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: providerConfig?.model || "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: `Please summarize the following text:\n\n${text}` }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const summary = data.content?.[0]?.text || "";
          return NextResponse.json({ summary, style, wordCount: text.split(/\s+/).length });
        }
      } catch {
        // Fall through to mock response
      }
    }

    // Fallback: generate a mock summary for demo purposes
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    let summary = "";

    if (style === "headline") {
      summary = sentences[0]?.trim().substring(0, 100) + "." || "Document summary not available.";
    } else if (style === "bullets") {
      const points = sentences.slice(0, 5).map((s) => `• ${s.trim()}`);
      summary = points.join("\n");
    } else if (style === "detailed") {
      summary = sentences.slice(0, 4).join(". ").trim() + ".";
    } else {
      summary = sentences.slice(0, 2).join(". ").trim() + ".";
    }

    return NextResponse.json({
      summary: summary || "Unable to generate summary for this content.",
      style,
      wordCount: text.split(/\s+/).length,
      fallback: true,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process summarization request" }, { status: 500 });
  }
}
