"use client";
import { useTasksStore } from "@/store/tasks-store";
import { TaskFilters } from "./task-filters";
import { KanbanBoard } from "./kanban-board";
import { GanttChart } from "./gantt-chart";
import { TaskListView } from "./task-list-view";
import { TaskDetailPanel } from "./task-detail-panel";
import { ProgressDashboard } from "./progress-dashboard";
import { BarChart2 } from "lucide-react";
import { useState } from "react";

export function TaskPlanner() {
  const { viewMode, selectedTaskId } = useTasksStore();
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
      {/* Filters / toolbar */}
      <TaskFilters />

      {/* Dashboard toggle */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b flex-shrink-0" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
        <span className="text-xs opacity-40" style={{ color: "var(--foreground)" }}>
          {viewMode === "kanban" ? "Kanban Board" : viewMode === "gantt" ? "Timeline (Gantt)" : "List View"}
        </span>
        <button
          onClick={() => setShowDashboard(!showDashboard)}
          className="flex items-center gap-1.5 text-xs opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: showDashboard ? "var(--primary)" : "var(--foreground)" }}
        >
          <BarChart2 size={13} /> {showDashboard ? "Hide" : "Show"} Dashboard
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {showDashboard ? (
          <ProgressDashboard />
        ) : (
          <>
            <div className="flex-1 min-w-0 overflow-hidden">
              {viewMode === "kanban" && <KanbanBoard />}
              {viewMode === "gantt" && <GanttChart />}
              {viewMode === "list" && <TaskListView />}
            </div>
            {selectedTaskId && <TaskDetailPanel />}
          </>
        )}
      </div>
    </div>
  );
}
