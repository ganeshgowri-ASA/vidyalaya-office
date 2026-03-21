"use client";
import { Sparkles, ArrowRight, X, RefreshCw } from "lucide-react";
import { MatrixQuadrant, AiSuggestion, usePriorityMatrixStore } from "@/store/priority-matrix-store";

const Q_LABELS: Record<MatrixQuadrant, { label: string; color: string }> = {
  q1: { label: "Do First", color: "#ef4444" },
  q2: { label: "Schedule", color: "#3b82f6" },
  q3: { label: "Delegate", color: "#f59e0b" },
  q4: { label: "Eliminate", color: "#6b7280" },
};

interface Props {
  suggestions: AiSuggestion[];
}

export function AiSuggestionsPanel({ suggestions }: Props) {
  const { applyAiSuggestion, generateAiSuggestions, matrixTasks } = usePriorityMatrixStore();

  return (
    <div
      className="border rounded-xl overflow-hidden mb-3"
      style={{ backgroundColor: "rgba(139,92,246,0.06)", borderColor: "rgba(139,92,246,0.3)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: "rgba(139,92,246,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: "#8b5cf6" }} />
          <span className="text-xs font-semibold" style={{ color: "#8b5cf6" }}>
            AI Priority Suggestions
          </span>
          {suggestions.length > 0 && (
            <span
              className="text-[10px] rounded-full px-1.5 py-0.5 font-bold"
              style={{ backgroundColor: "#8b5cf620", color: "#8b5cf6" }}
            >
              {suggestions.length}
            </span>
          )}
        </div>
        <button
          onClick={generateAiSuggestions}
          className="rounded-lg p-1 transition-opacity hover:opacity-70"
          style={{ color: "#8b5cf6" }}
          title="Refresh suggestions"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Suggestions */}
      <div className="p-2 space-y-1.5">
        {suggestions.length === 0 ? (
          <p className="text-xs py-2 text-center" style={{ color: "var(--muted-foreground)" }}>
            All tasks look correctly prioritized!
          </p>
        ) : (
          suggestions.map((s) => {
            const task = matrixTasks.find((t) => t.id === s.taskId);
            if (!task) return null;
            const from = Q_LABELS[s.currentQuadrant];
            const to = Q_LABELS[s.suggestedQuadrant];

            return (
              <div
                key={s.taskId}
                className="rounded-lg p-2.5 border"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(139,92,246,0.2)",
                }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>
                  {task.title}
                </p>
                {/* Move indicator */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="text-[10px] rounded px-1.5 py-0.5 font-medium"
                    style={{ backgroundColor: from.color + "20", color: from.color }}
                  >
                    {from.label}
                  </span>
                  <ArrowRight size={10} style={{ color: "var(--muted-foreground)" }} />
                  <span
                    className="text-[10px] rounded px-1.5 py-0.5 font-medium"
                    style={{ backgroundColor: to.color + "20", color: to.color }}
                  >
                    {to.label}
                  </span>
                </div>
                <p className="text-[10px] mb-2" style={{ color: "var(--muted-foreground)" }}>
                  {s.reason}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => applyAiSuggestion(s.taskId)}
                    className="flex-1 rounded py-1 text-[10px] font-semibold transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "#8b5cf6", color: "#fff" }}
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => applyAiSuggestion(s.taskId)}
                    className="rounded px-2 py-1 transition-opacity hover:opacity-70"
                    style={{ color: "var(--muted-foreground)" }}
                    title="Dismiss"
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
