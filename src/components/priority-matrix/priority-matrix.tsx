"use client";
import { useMemo } from "react";
import { usePriorityMatrixStore, MatrixQuadrant } from "@/store/priority-matrix-store";
import { MatrixQuadrant as QuadrantComponent } from "./matrix-quadrant";
import { MatrixToolbar } from "./matrix-toolbar";
import { AnalyticsPanel } from "./analytics-panel";
import { AiSuggestionsPanel } from "./ai-suggestions-panel";

const QUADRANTS: MatrixQuadrant[] = ["q1", "q2", "q3", "q4"];

export function PriorityMatrix() {
  const { matrixTasks, viewMode, showAnalytics, showAiSuggestions, aiSuggestions } = usePriorityMatrixStore();

  // Filter by view mode
  const filteredTasks = useMemo(() => {
    if (viewMode === "weekly") {
      return matrixTasks.filter((t) => {
        const days = Math.ceil((new Date(t.deadline).getTime() - Date.now()) / 86400000);
        // Weekly: show tasks due within 7 days OR overdue, OR in Q1 always
        return days <= 7 || t.quadrant === "q1";
      });
    }
    // Monthly: show tasks due within 30 days, or overdue, or Q1/Q2
    return matrixTasks.filter((t) => {
      const days = Math.ceil((new Date(t.deadline).getTime() - Date.now()) / 86400000);
      return days <= 30 || t.quadrant === "q1" || t.quadrant === "q2";
    });
  }, [matrixTasks, viewMode]);

  const tasksByQuadrant = useMemo(() => {
    return Object.fromEntries(
      QUADRANTS.map((q) => [q, filteredTasks.filter((t) => t.quadrant === q)])
    ) as Record<MatrixQuadrant, typeof filteredTasks>;
  }, [filteredTasks]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <MatrixToolbar tasks={filteredTasks} />

      <div className="flex flex-1 overflow-hidden">
        {/* Main matrix area */}
        <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
          {/* View mode indicator */}
          <div className="flex items-center gap-2">
            <div
              className="text-[10px] rounded-full px-2.5 py-1 font-semibold border"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: "var(--border)",
                color: "var(--muted-foreground)",
              }}
            >
              {viewMode === "weekly" ? "📅 Weekly View — tasks due within 7 days" : "📅 Monthly View — tasks due within 30 days"}
            </div>
            <div
              className="text-[10px] rounded-full px-2.5 py-1 font-semibold"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "var(--muted-foreground)" }}
            >
              {filteredTasks.length} tasks shown
            </div>
          </div>

          {/* AI Suggestions */}
          {showAiSuggestions && <AiSuggestionsPanel suggestions={aiSuggestions} />}

          {/* 2x2 Grid */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
            {/* Q1: Urgent + Important */}
            <QuadrantComponent quadrant="q1" tasks={tasksByQuadrant.q1} />

            {/* Q2: Not Urgent + Important */}
            <QuadrantComponent quadrant="q2" tasks={tasksByQuadrant.q2} />

            {/* Q3: Urgent + Not Important */}
            <QuadrantComponent quadrant="q3" tasks={tasksByQuadrant.q3} />

            {/* Q4: Neither */}
            <QuadrantComponent quadrant="q4" tasks={tasksByQuadrant.q4} />
          </div>

          {/* Axis labels */}
          <div className="flex items-center justify-between px-1 no-print">
            <div className="flex items-center gap-4 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-1">
                <span className="font-semibold" style={{ color: "#ef4444" }}>↑ Important</span>
                <span className="opacity-50">·</span>
                <span className="font-semibold" style={{ color: "#6b7280" }}>↓ Not Important</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="font-semibold" style={{ color: "#f59e0b" }}>← Urgent</span>
                <span className="opacity-50">·</span>
                <span className="font-semibold" style={{ color: "#3b82f6" }}>→ Not Urgent</span>
              </span>
            </div>
            <span className="text-[10px] italic" style={{ color: "var(--muted-foreground)" }}>
              Drag tasks between quadrants to re-prioritize
            </span>
          </div>
        </div>

        {/* Analytics sidebar */}
        {showAnalytics && <AnalyticsPanel tasks={filteredTasks} />}
      </div>
    </div>
  );
}
