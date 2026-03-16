"use client";

import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

const STAGES = [
  { id: "draft", label: "Draft", color: "#6b7280" },
  { id: "review", label: "Review", color: "#f59e0b" },
  { id: "approved", label: "Approved", color: "#10b981" },
  { id: "published", label: "Published", color: "#3b82f6" },
] as const;

type StageId = (typeof STAGES)[number]["id"];

interface DocumentRoutePathProps {
  currentStage: string;
}

function stageIndex(stage: string): number {
  const map: Record<string, number> = { Draft: 0, "Under Review": 1, Approved: 2, Published: 3 };
  return map[stage] ?? 0;
}

export default function DocumentRoutePath({ currentStage }: DocumentRoutePathProps) {
  const activeIdx = stageIndex(currentStage);

  return (
    <div className="flex items-center gap-1">
      {STAGES.map((stage, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        const color = done || active ? stage.color : "var(--muted-foreground)";

        return (
          <div key={stage.id} className="flex items-center gap-1">
            <div
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all"
              style={{
                borderColor: done || active ? color : "var(--border)",
                backgroundColor: active ? color + "18" : "transparent",
                color,
              }}
            >
              {done ? (
                <CheckCircle2 size={12} style={{ color }} />
              ) : (
                <Circle size={12} style={{ color }} fill={active ? color : "none"} />
              )}
              {stage.label}
            </div>
            {i < STAGES.length - 1 && (
              <ArrowRight size={12} style={{ color: done ? STAGES[i + 1].color : "var(--muted-foreground)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
