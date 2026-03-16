"use client";

import { useState, useRef, useEffect } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";
import { X, Send, Sparkles, BarChart3, FileText } from "lucide-react";
import { colToLetter } from "./formula-engine";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AiPanel() {
  const showAiPanel = useSpreadsheetStore((s) => s.showAiPanel);
  const toggleAiPanel = useSpreadsheetStore((s) => s.toggleAiPanel);
  const activeCell = useSpreadsheetStore((s) => s.activeCell);
  const getCellRaw = useSpreadsheetStore((s) => s.getCellRaw);
  const getCellDisplay = useSpreadsheetStore((s) => s.getCellDisplay);
  const getActiveSheet = useSpreadsheetStore((s) => s.getActiveSheet);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!showAiPanel) return null;

  const getContextSnippet = (): string => {
    const sheet = getActiveSheet();
    const keys = Object.keys(sheet.cells).sort();
    if (keys.length === 0) return "The spreadsheet is empty.";
    const lines = keys.slice(0, 30).map((k) => {
      const raw = sheet.cells[k].raw;
      return `${k}: ${raw}`;
    });
    return `Current sheet data (first 30 cells):\n${lines.join("\n")}`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const context = getContextSnippet();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a spreadsheet assistant for Vidyalaya Office. Help users with formulas, data analysis, and chart suggestions. Be concise. Current spreadsheet context:\n${context}`,
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err.error || "Failed to get response"}` },
        ]);
      } else {
        const data = await res.json();
        const reply =
          data.content?.[0]?.text || "Sorry, I could not generate a response.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please check your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickAction = (action: string) => {
    let prompt = "";
    switch (action) {
      case "explain":
        if (activeCell) {
          const raw = getCellRaw(activeCell.col, activeCell.row);
          const display = getCellDisplay(activeCell.col, activeCell.row);
          const ref = `${colToLetter(activeCell.col)}${activeCell.row + 1}`;
          prompt = `Explain this formula in cell ${ref}: "${raw}" (displays as: ${display})`;
        } else {
          prompt = "No cell is selected. Please select a cell with a formula.";
        }
        break;
      case "chart":
        prompt =
          "Based on the current spreadsheet data, suggest the best chart type and which cell range to use. Explain why.";
        break;
      case "generate":
        prompt =
          "Generate sample data that would be useful for this spreadsheet. Suggest formulas and data layout.";
        break;
    }
    if (prompt) sendMessage(prompt);
  };

  return (
    <div
      className="w-72 border-l flex flex-col"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
        color: "var(--card-foreground)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-sm font-semibold flex items-center gap-1.5">
          <Sparkles size={14} /> AI Assistant
        </span>
        <button onClick={toggleAiPanel} className="hover:opacity-70">
          <X size={14} />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-1 p-2 border-b" style={{ borderColor: "var(--border)" }}>
        <button
          className="flex-1 text-xs rounded py-1.5 px-1 flex items-center justify-center gap-1 hover:opacity-80"
          style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
          onClick={() => quickAction("explain")}
        >
          <FileText size={11} /> Explain
        </button>
        <button
          className="flex-1 text-xs rounded py-1.5 px-1 flex items-center justify-center gap-1 hover:opacity-80"
          style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
          onClick={() => quickAction("chart")}
        >
          <BarChart3 size={11} /> Chart
        </button>
        <button
          className="flex-1 text-xs rounded py-1.5 px-1 flex items-center justify-center gap-1 hover:opacity-80"
          style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
          onClick={() => quickAction("generate")}
        >
          <Sparkles size={11} /> Generate
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {messages.length === 0 && (
          <div className="text-xs text-center py-8" style={{ color: "var(--muted-foreground)" }}>
            Ask questions about your data, get formula help, or use quick actions above.
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs rounded-lg px-2.5 py-2 ${
              msg.role === "user" ? "ml-4" : "mr-4"
            }`}
            style={{
              backgroundColor:
                msg.role === "user" ? "var(--primary)" : "var(--muted)",
              color:
                msg.role === "user"
                  ? "var(--primary-foreground)"
                  : "var(--foreground)",
              whiteSpace: "pre-wrap",
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div
            className="text-xs rounded-lg px-2.5 py-2 mr-4 animate-pulse"
            style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-1">
          <input
            className="flex-1 text-xs rounded px-2 py-1.5 border outline-none"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask about your data..."
            disabled={loading}
          />
          <button
            className="rounded p-1.5 hover:opacity-80"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
            onClick={() => sendMessage(input)}
            disabled={loading}
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
