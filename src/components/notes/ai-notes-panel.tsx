"use client";
import { useState } from "react";
import { useNotesStore } from "@/store/notes-store";
import { Sparkles, X, Send, MessageSquare, Languages, Expand, Shrink, RefreshCw } from "lucide-react";

const AI_SUGGESTIONS = [
  { label: "Summarize", icon: Shrink, prompt: "Summarize this note in 3-5 bullet points" },
  { label: "Expand", icon: Expand, prompt: "Expand this note with more details and examples" },
  { label: "Rephrase", icon: RefreshCw, prompt: "Rephrase this note in a more professional tone" },
  { label: "Translate", icon: Languages, prompt: "Translate this note to Spanish" },
];

const SAMPLE_RESPONSES: Record<string, string> = {
  "Summarize this note in 3-5 bullet points":
    "• Sprint 14 planning completed with 38-point target\n• Auth redesign prioritized as top initiative\n• Daily standup scheduled at 9:30 AM\n• API keys pending from DevOps team",
  "Expand this note with more details and examples":
    "The sprint planning session was comprehensive, covering velocity metrics from Sprint 13 (42 points achieved) and capacity planning for Sprint 14. Given that two team members—Sarah and James—will be on planned PTO during weeks 2-3 of the sprint, the team collectively agreed to reduce the target to 38 points to maintain quality and avoid burnout...",
  "Rephrase this note in a more professional tone":
    "Executive Summary: Sprint 14 Planning Session\n\nThe development team convened on March 19, 2026, to conduct Sprint 14 planning. Following a review of Sprint 13 performance metrics (velocity: 42 story points), the team established a revised target of 38 story points for Sprint 14, accounting for reduced team capacity due to scheduled absences.",
  "Translate this note to Spanish":
    "# Reunión de Planificación del Sprint 14\n\n**Fecha:** 19 de marzo de 2026\n**Asistentes:** Alice Chen, Bob Kumar, Carol White, David Lee\n\n## Agenda\n1. Revisión de los resultados del Sprint 13\n2. Alcance y prioridades del Sprint 14\n3. Asignación de recursos\n4. Revisión de riesgos",
};

export function AINotesPanel() {
  const { toggleAiPanel, selectedNoteId, notes } = useNotesStore();
  const note = notes.find((n) => n.id === selectedNoteId);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I can help you summarize, expand, rephrase, or translate your notes. What would you like to do?" },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = (text: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const response = SAMPLE_RESPONSES[msg] || "I've analyzed your note and here are my suggestions:\n\n• The meeting covered critical sprint planning topics\n• Key decisions have been documented\n• Action items are clearly assigned with deadlines\n• Consider adding risk mitigation strategies for the auth redesign";
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className="flex flex-col h-full border-l"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)", width: 280, minWidth: 240 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <Sparkles size={15} style={{ color: "var(--primary)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--sidebar-foreground)" }}>AI Assistant</span>
        </div>
        <button onClick={toggleAiPanel} className="opacity-50 hover:opacity-100 transition-colors" style={{ color: "var(--sidebar-foreground)" }}>
          <X size={15} />
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-3 py-3 flex-shrink-0 grid grid-cols-2 gap-1.5">
        {AI_SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => sendMessage(s.prompt)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs transition-colors hover:opacity-80"
            style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "var(--sidebar-foreground)" }}
          >
            <s.icon size={12} style={{ color: "var(--primary)" }} />
            {s.label}
          </button>
        ))}
      </div>

      <div className="mx-3 border-t opacity-20" style={{ borderColor: "var(--border)" }} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {msg.role === "ai" && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ backgroundColor: "var(--primary)" }}>
                <Sparkles size={12} color="white" />
              </div>
            )}
            <div
              className="max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap"
              style={{
                backgroundColor: msg.role === "user" ? "var(--primary)" : "var(--card)",
                color: msg.role === "user" ? "white" : "var(--sidebar-foreground)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <Sparkles size={12} color="white" />
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--primary)", animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage("")}
            placeholder="Ask AI anything..."
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "var(--sidebar-foreground)" }}
          />
          <button
            onClick={() => sendMessage("")}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 transition-opacity disabled:opacity-30"
            style={{ color: "var(--primary)" }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
