"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Wand2, CheckCheck, FileText, Briefcase, Loader2 } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { getEditorText, getEditorContent, setEditorContent } from "./editor-area";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { label: "Improve Writing", icon: <Wand2 size={14} />, prompt: "Improve the following text. Make it clearer, more concise, and better structured. Return only the improved text in HTML format with appropriate headings, paragraphs, and formatting:" },
  { label: "Fix Grammar", icon: <CheckCheck size={14} />, prompt: "Fix all grammar, spelling, and punctuation errors in the following text. Return only the corrected text in HTML format preserving the original structure:" },
  { label: "Summarize", icon: <FileText size={14} />, prompt: "Provide a concise summary of the following text. Return the summary in HTML format with a heading and key bullet points:" },
  { label: "Professional Tone", icon: <Briefcase size={14} />, prompt: "Rewrite the following text in a professional, formal tone suitable for business communication. Return only the rewritten text in HTML format:" },
];

export function AIPanel() {
  const { showAI, toggleAI } = useDocumentStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAIResponse, setLastAIResponse] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (userMsg: string) => {
    if (!userMsg.trim() || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          system: "You are an AI writing assistant integrated into a document editor. Help the user improve their writing, fix grammar, format content, and generate text. When returning formatted content, use HTML tags (h1, h2, h3, p, ul, ol, li, strong, em, table, etc.). Be concise and helpful.",
        }),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();
      const aiContent = data.content?.[0]?.text || data.error || "No response received.";
      setLastAIResponse(aiContent);
      setMessages((prev) => [...prev, { role: "assistant", content: aiContent }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Failed to get AI response. Please check your API configuration." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleQuickAction = useCallback((actionPrompt: string) => {
    const text = getEditorText();
    if (!text.trim()) {
      setMessages((prev) => [...prev, { role: "assistant", content: "The document is empty. Please add some content first." }]);
      return;
    }
    sendMessage(actionPrompt + "\n\n" + text);
  }, [sendMessage]);

  const insertIntoDocument = useCallback(() => {
    if (!lastAIResponse) return;
    const currentContent = getEditorContent();
    setEditorContent(currentContent + "<hr/>" + lastAIResponse);
  }, [lastAIResponse]);

  const replaceDocument = useCallback(() => {
    if (!lastAIResponse) return;
    setEditorContent(lastAIResponse);
  }, [lastAIResponse]);

  if (!showAI) return null;

  return (
    <div
      className="no-print flex w-[340px] flex-shrink-0 flex-col border-l"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Wand2 size={16} style={{ color: "var(--primary)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>AI Assistant</span>
        </div>
        <button onClick={toggleAI} className="rounded p-1 hover:bg-[var(--muted)]">
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="border-b p-3" style={{ borderColor: "var(--border)" }}>
        <p className="mb-2 text-[11px] font-medium" style={{ color: "var(--muted-foreground)" }}>Quick Actions</p>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.prompt)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs py-8" style={{ color: "var(--muted-foreground)" }}>
            Ask AI to help with your document, or use the quick actions above.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-xs ${
              msg.role === "user" ? "ml-6" : "mr-2"
            }`}
            style={{
              backgroundColor: msg.role === "user" ? "var(--primary)" : "var(--muted)",
              color: msg.role === "user" ? "var(--primary-foreground)" : "var(--foreground)",
            }}
          >
            <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: msg.content }} />
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Loader2 size={14} className="animate-spin" />
            Thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Insert buttons */}
      {lastAIResponse && !loading && (
        <div className="border-t p-2 flex gap-1.5" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={insertIntoDocument}
            className="flex-1 rounded border px-2 py-1.5 text-[11px] transition-colors hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Insert at End
          </button>
          <button
            onClick={replaceDocument}
            className="flex-1 rounded border px-2 py-1.5 text-[11px] transition-colors hover:bg-[var(--muted)]"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Replace All
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask AI anything..."
            className="flex-1 rounded-md border px-3 py-2 text-xs outline-none"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="rounded-md px-3 py-2 transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
