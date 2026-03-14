"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Loader2, Sparkles, FileText, Palette, Mic } from "lucide-react";
import { usePresentationStore } from "@/store/presentation-store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  {
    icon: <Sparkles size={13} />,
    label: "Generate Slide Content",
    prompt: "Generate compelling slide content for the current slide. Include a strong title, 3-5 bullet points, and a key takeaway.",
  },
  {
    icon: <FileText size={13} />,
    label: "Create Outline",
    prompt: "Create a complete presentation outline with 8 slides. Include slide titles and key points for each slide.",
  },
  {
    icon: <Palette size={13} />,
    label: "Suggest Design",
    prompt: "Suggest design improvements for this presentation. Include color scheme, font recommendations, and layout tips.",
  },
  {
    icon: <Mic size={13} />,
    label: "Write Speaker Notes",
    prompt: "Write detailed, engaging speaker notes for the current slide. Make them conversational and include transitions.",
  },
];

export default function AIPanel() {
  const { toggleAIPanel, slides, currentSlideIndex, updateSlideNotes, updateElement } =
    usePresentationStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "Hi! I'm your AI presentation assistant. I can help you generate slide content, create outlines, suggest designs, and write speaker notes. What would you like help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentSlide = slides[currentSlideIndex];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Build context
    const slideContext = currentSlide
      ? `Current slide (${currentSlideIndex + 1}/${slides.length}): Background: ${currentSlide.background}. Elements: ${currentSlide.elements
          .filter((el) => el.type === "text")
          .map((el) => {
            const t = el as import("@/store/presentation-store").TextElement;
            return `"${t.content || t.placeholder || ""}"`;
          })
          .join(", ")}`
      : "";

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: content.trim() },
          ],
          system: `You are an expert presentation designer and content strategist. You help users create compelling, professional presentations. ${slideContext} Provide concise, actionable advice. When generating content, format it clearly with titles and bullet points.`,
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      const assistantContent =
        data.content?.[0]?.text ??
        data.message ??
        "Sorry, I couldn't generate a response. Please try again.";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please check your API configuration and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleInsertNotes() {
    const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant" && m.id !== "0");
    if (!lastAssistantMsg || !currentSlide) return;
    updateSlideNotes(currentSlide.id, lastAssistantMsg.content);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div
      className="flex flex-col border-l no-print"
      style={{
        width: 300,
        flexShrink: 0,
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Bot size={15} style={{ color: "var(--primary)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            AI Assistant
          </span>
        </div>
        <button
          onClick={toggleAIPanel}
          className="p-1 rounded hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Quick actions */}
      <div
        className="flex flex-col gap-1 px-2 py-2 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => sendMessage(action.prompt)}
            disabled={loading}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-foreground)",
            }}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className="rounded-lg px-3 py-2 text-xs max-w-full"
              style={{
                backgroundColor:
                  msg.role === "user"
                    ? "var(--primary)"
                    : "var(--secondary)",
                color:
                  msg.role === "user"
                    ? "var(--primary-foreground)"
                    : "var(--secondary-foreground)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </div>
            {msg.role === "assistant" && msg.id !== "0" && (
              <button
                onClick={handleInsertNotes}
                className="text-xs px-2 py-0.5 rounded hover:opacity-80"
                style={{ color: "var(--primary)", fontSize: 10 }}
                title="Insert as speaker notes"
              >
                → Insert as notes
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <Loader2 size={12} className="animate-spin" style={{ color: "var(--primary)" }} />
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Thinking...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-end gap-2 px-3 py-2 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI anything..."
          rows={2}
          className="flex-1 resize-none rounded px-2 py-1.5 text-xs outline-none border"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="p-2 rounded flex-shrink-0 disabled:opacity-40"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
