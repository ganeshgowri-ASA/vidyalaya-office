"use client";
import { useTasksStore } from "@/store/tasks-store";
import type { Priority } from "@/store/tasks-store";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: "#ef4444", High: "#f59e0b", Medium: "#8b5cf6", Low: "#6b7280",
};

const WEEKS = 8;
const START_DATE = new Date();
START_DATE.setDate(START_DATE.getDate() - 7);

function getWeekDays(): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(START_DATE);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function getWeekHeaders(): { label: string; days: number }[] {
  const weeks: { label: string; days: number }[] = [];
  let current = new Date(START_DATE);
  for (let w = 0; w < WEEKS; w++) {
    weeks.push({
      label: current.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      days: 7,
    });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

function getBarPosition(startDate: string | undefined, deadline: string): { left: number; width: number } {
  const totalDays = WEEKS * 7;
  const start = startDate ? new Date(startDate) : new Date(deadline);
  start.setDate(start.getDate() - 3);
  const end = new Date(deadline);

  const startOffset = Math.max(0, (start.getTime() - START_DATE.getTime()) / 86400000);
  const endOffset = Math.min(totalDays, (end.getTime() - START_DATE.getTime()) / 86400000);
  const duration = Math.max(1, endOffset - startOffset);

  return {
    left: (startOffset / totalDays) * 100,
    width: (duration / totalDays) * 100,
  };
}

export function GanttChart() {
  const { tasks, searchQuery, filterPriority, filterAssignee, filterLabel, myTasksOnly } = useTasksStore();

  const filtered = tasks.filter((t) => {
    if (!t.deadline) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    if (filterAssignee && t.assignee !== filterAssignee) return false;
    if (filterLabel !== "All" && !t.labels.includes(filterLabel)) return false;
    if (myTasksOnly && t.assignee !== "Alice Chen") return false;
    return true;
  });

  const weeks = getWeekHeaders();
  const totalDays = WEEKS * 7;
  const today = new Date();
  const todayOffset = ((today.getTime() - START_DATE.getTime()) / 86400000 / totalDays) * 100;

  return (
    <div className="h-full overflow-auto" style={{ backgroundColor: "var(--background)" }}>
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="flex sticky top-0 z-10 border-b" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          {/* Task name column */}
          <div className="w-56 flex-shrink-0 px-4 py-3 border-r text-xs font-semibold opacity-50" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Task
          </div>
          {/* Timeline header */}
          <div className="flex-1 flex">
            {weeks.map((w, i) => (
              <div
                key={i}
                className="flex-1 px-2 py-3 text-xs font-semibold opacity-50 border-r last:border-r-0"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {w.label}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {filtered.map((task, i) => {
          const { left, width } = getBarPosition(task.startDate, task.deadline);
          const isOverdue = new Date(task.deadline) < today && task.status !== "Done";
          const barColor = task.status === "Done" ? "#10b981" : isOverdue ? "#ef4444" : PRIORITY_COLORS[task.priority];
          const initials = task.assignee.split(" ").map((w: string) => w[0]).join("").slice(0, 2);

          return (
            <div
              key={task.id}
              className="flex border-b group hover:opacity-90 transition-opacity"
              style={{ borderColor: "var(--border)", backgroundColor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
            >
              {/* Task info */}
              <div className="w-56 flex-shrink-0 flex items-center gap-2.5 px-4 py-3 border-r" style={{ borderColor: "var(--border)" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ backgroundColor: task.assigneeColor }}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-xs font-medium truncate", task.status === "Done" && "line-through opacity-50")} style={{ color: "var(--foreground)" }}>
                    {task.title}
                  </p>
                  <p className="text-[10px] opacity-40" style={{ color: "var(--foreground)" }}>{task.status}</p>
                </div>
              </div>

              {/* Timeline bar */}
              <div className="flex-1 relative py-3 px-1">
                {/* Today line */}
                {todayOffset >= 0 && todayOffset <= 100 && (
                  <div
                    className="absolute top-0 bottom-0 w-px z-10 opacity-60"
                    style={{ left: `${todayOffset}%`, backgroundColor: "#ef4444" }}
                  />
                )}

                {/* Bar */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 rounded-full h-5 flex items-center px-2 overflow-hidden"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: barColor + "33",
                    borderLeft: `3px solid ${barColor}`,
                    minWidth: 24,
                  }}
                >
                  <span className="text-[9px] font-medium truncate" style={{ color: barColor }}>
                    {task.title}
                  </span>
                </div>

                {/* Milestone dot at deadline */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border-2 z-20"
                  style={{
                    left: `calc(${Math.min(Math.max(((new Date(task.deadline).getTime() - START_DATE.getTime()) / 86400000 / totalDays) * 100, 0), 100)}% - 6px)`,
                    backgroundColor: barColor,
                    borderColor: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 opacity-30" style={{ color: "var(--foreground)" }}>
            <p className="text-sm">No tasks to display</p>
          </div>
        )}
      </div>
    </div>
  );
}
