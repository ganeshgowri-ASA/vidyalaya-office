"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Copy, ArrowDownToLine, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantPanelProps {
  onClose: () => void;
  onInsertText: (text: string) => void;
  getSelectedText: () => string;
  getDocumentContent: () => string;
}

const QUICK_ACTIONS = [
  { label: "Improve Writing", prompt: "Improve the writing quality, clarity, and style of this text while preserving the original meaning:" },
  { label: "Fix Grammar", prompt: "Fix all grammar, spelling, and punctuation errors in this text:" },
  { label: "Summarize", prompt: "Provide a concise, clear summary of this text in 2-3 sentences:" },
  { label: "Make Professional", prompt: "Rewrite this text in a professional, formal tone suitable for business or academic use:" },
];

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function AIAssistantPanel({
  onClose,
  onInsertText,
  getSelectedText,
  getDocumentContent,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI writing assistant. Select text in your document and use the quick actions, or ask me anything to help with your writing.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const userMsg: Message = { id: generateId(), role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system:
            "You are a professional writing assistant integrated into a document editor called Vidyalaya Office. Help users improve their writing, fix grammar, summarize content, rewrite for different tones, and answer writing-related questions. When providing improved text, present it clearly without extra commentary unless asked. Keep responses concise and practical.",
          messages: [...conversationHistory, { role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const data = await response.json();
      const aiText = data.content?.[0]?.text || "Sorry, I could not generate a response.";

      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: aiText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please check your API key and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    const selected = getSelectedText();
    const docContent = getDocumentContent();
    const textToProcess = selected || docContent.slice(0, 2000);

    if (!textToProcess.trim()) {
      sendMessage(`${action.label} — Please provide some text or select text in the document first.`);
      return;
    }

    sendMessage(`${action.prompt}\n\n---\n${textToProcess}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div
      className="no-print flex w-80 flex-col border-l"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        minWidth: "300px",
        maxWidth: "340px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: "var(--primary)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            AI Assistant
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Quick actions */}
      <div className="border-b p-3" style={{ borderColor: "var(--border)" }}>
        <p className="mb-2 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
          Quick Actions (uses selected text)
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-foreground)",
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
              }`}
              style={
                msg.role === "user"
                  ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                  : { backgroundColor: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }
              }
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === "assistant" && msg.id !== "welcome" && (
                <div className="mt-2 flex gap-2 border-t pt-2" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={() => copyToClipboard(msg.content)}
                    className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
                    title="Copy"
                  >
                    <Copy size={11} />
                    Copy
                  </button>
                  <button
                    onClick={() => onInsertText(msg.content)}
                    className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--primary)" }}
                    title="Insert into document"
                  >
                    <ArrowDownToLine size={11} />
                    Insert
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
              style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
            >
              <Loader2 size={12} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
        <div
          className="flex items-end gap-2 rounded-lg border px-3 py-2"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
        >
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Enter to send)"
            rows={2}
            className="flex-1 resize-none bg-transparent text-xs outline-none"
            style={{ color: "var(--foreground)" }}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="rounded-md p-1.5 transition-colors hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="mt-1 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
