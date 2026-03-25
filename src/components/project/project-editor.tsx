"use client";

import { useState } from "react";
import {
  BarChart3,
  ListChecks,
  Users,
  LayoutDashboard,
  Diamond,
  AlertTriangle,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Calendar,
  Flag,
  Clock,
  TrendingUp,
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project-store";
import type { ProjectTask } from "@/store/project-store";

// ── Helpers ──────────────────────────────────────────────

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const phaseColors: Record<string, string> = {
  Planning: "#6366f1",
  Design: "#ec4899",
  Development: "#10b981",
  Testing: "#f59e0b",
  Launch: "#ef4444",
};

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} className="text-green-400" />,
  "in-progress": <Clock size={14} className="text-blue-400" />,
  "not-started": <Circle size={14} className="text-gray-500" />,
  delayed: <AlertTriangle size={14} className="text-red-400" />,
};

// ── Toolbar ──────────────────────────────────────────────

function ProjectToolbar() {
  const { activeView, setActiveView, zoomLevel, setZoomLevel, showCriticalPath, toggleCriticalPath } =
    useProjectStore();

  const views: { key: typeof activeView; label: string; icon: React.ReactNode }[] = [
    { key: "gantt", label: "Gantt Chart", icon: <BarChart3 size={16} /> },
    { key: "tasks", label: "Task List", icon: <ListChecks size={16} /> },
    { key: "resources", label: "Resources", icon: <Users size={16} /> },
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  ];

  const zooms: { key: typeof zoomLevel; label: string }[] = [
    { key: "day", label: "Day" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
  ];

  return (
    <div
      className="flex items-center gap-1 border-b px-4 py-2"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
    >
      <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ backgroundColor: "var(--muted)" }}>
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setActiveView(v.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeView === v.key ? "shadow-sm" : "opacity-60 hover:opacity-100"
            )}
            style={
              activeView === v.key
                ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                : { color: "var(--foreground)" }
            }
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      <div className="mx-2 h-5 w-px" style={{ backgroundColor: "var(--border)" }} />

      {activeView === "gantt" && (
        <>
          <div className="flex items-center gap-1">
            <ZoomOut size={14} style={{ color: "var(--muted-foreground)" }} />
            {zooms.map((z) => (
              <button
                key={z.key}
                onClick={() => setZoomLevel(z.key)}
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium transition-colors",
                  zoomLevel === z.key ? "" : "opacity-60 hover:opacity-100"
                )}
                style={
                  zoomLevel === z.key
                    ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }
                    : { color: "var(--foreground)" }
                }
              >
                {z.label}
              </button>
            ))}
            <ZoomIn size={14} style={{ color: "var(--muted-foreground)" }} />
          </div>

          <div className="mx-2 h-5 w-px" style={{ backgroundColor: "var(--border)" }} />

          <button
            onClick={toggleCriticalPath}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors"
            style={{ color: showCriticalPath ? "#ef4444" : "var(--muted-foreground)" }}
          >
            {showCriticalPath ? <Eye size={14} /> : <EyeOff size={14} />}
            Critical Path
          </button>
        </>
      )}

      <div className="flex-1" />
      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        Website Redesign Project
      </span>
    </div>
  );
}

// ── Gantt Chart ──────────────────────────────────────────

function GanttChart() {
  const { tasks, selectedTaskId, setSelectedTaskId, showCriticalPath, zoomLevel } = useProjectStore();
  const projectStart = "2026-03-02";
  const projectEnd = "2026-05-18";
  const totalDays = daysBetween(projectStart, projectEnd);

  const colWidth = zoomLevel === "day" ? 28 : zoomLevel === "week" ? 110 : 200;
  const headerDates: { label: string; span: number }[] = [];

  if (zoomLevel === "week") {
    const start = new Date(projectStart);
    const end = new Date(projectEnd);
    const cur = new Date(start);
    while (cur <= end) {
      const weekEnd = new Date(cur);
      weekEnd.setDate(weekEnd.getDate() + 6);
      headerDates.push({
        label: `${formatShortDate(cur.toISOString())}`,
        span: 1,
      });
      cur.setDate(cur.getDate() + 7);
    }
  } else if (zoomLevel === "month") {
    for (let m = 2; m <= 4; m++) {
      const monthNames = ["", "", "Mar", "Apr", "May"];
      headerDates.push({ label: monthNames[m] + " 2026", span: 1 });
    }
  } else {
    const cur = new Date(projectStart);
    const end = new Date(projectEnd);
    while (cur <= end) {
      headerDates.push({ label: cur.getDate().toString(), span: 1 });
      cur.setDate(cur.getDate() + 1);
    }
  }

  function getBarStyle(task: ProjectTask) {
    const startOffset = daysBetween(projectStart, task.startDate);
    const duration = task.duration;
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 0.8)}%` };
  }

  const phases = Array.from(new Set(tasks.map((t) => t.phase)));

  return (
    <div className="flex flex-1 overflow-auto">
      {/* Left: task list */}
      <div
        className="w-80 shrink-0 border-r"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
      >
        <div
          className="flex h-10 items-center border-b px-3 text-xs font-semibold uppercase tracking-wider"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          Task Name
        </div>
        {phases.map((phase) => (
          <div key={phase}>
            <div
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: phaseColors[phase] || "var(--muted-foreground)", backgroundColor: "var(--muted)" }}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: phaseColors[phase] }} />
              {phase}
            </div>
            {tasks
              .filter((t) => t.phase === phase)
              .map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-sm transition-colors hover:opacity-90",
                    selectedTaskId === task.id ? "ring-1 ring-inset" : ""
                  )}
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: selectedTaskId === task.id ? "var(--accent)" : "transparent",
                    color: "var(--foreground)",
                  }}
                >
                  {statusIcons[task.status]}
                  {task.isMilestone && <Diamond size={12} style={{ color: "#f59e0b" }} />}
                  <span className={cn("truncate", task.isCritical && showCriticalPath ? "font-semibold" : "")}>
                    {task.name}
                  </span>
                  {task.isCritical && showCriticalPath && (
                    <span className="ml-auto shrink-0 rounded bg-red-500/20 px-1 text-[10px] text-red-400">CP</span>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Right: Gantt bars */}
      <div className="flex-1 overflow-x-auto">
        {/* Timeline header */}
        <div
          className="sticky top-0 z-10 flex h-10 border-b"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}
        >
          {headerDates.map((h, i) => (
            <div
              key={i}
              className="shrink-0 border-r px-2 py-2 text-center text-[10px] font-medium"
              style={{
                width: colWidth,
                borderColor: "var(--border)",
                color: "var(--muted-foreground)",
              }}
            >
              {h.label}
            </div>
          ))}
        </div>

        {/* Bars */}
        <div style={{ minWidth: headerDates.length * colWidth }}>
          {phases.map((phase) => (
            <div key={phase}>
              <div className="h-7" style={{ backgroundColor: "var(--muted)" }} />
              {tasks
                .filter((t) => t.phase === phase)
                .map((task) => {
                  const barStyle = getBarStyle(task);
                  return (
                    <div
                      key={task.id}
                      className="relative border-b"
                      style={{ height: 37, borderColor: "var(--border)" }}
                      onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                    >
                      {task.isMilestone ? (
                        <div
                          className="absolute top-1/2 -translate-y-1/2"
                          style={{ left: barStyle.left, marginLeft: -6 }}
                        >
                          <Diamond size={16} fill="#f59e0b" className="text-yellow-500" />
                        </div>
                      ) : (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 cursor-pointer rounded"
                          style={{
                            ...barStyle,
                            height: 22,
                            backgroundColor:
                              task.isCritical && showCriticalPath
                                ? "#ef444480"
                                : phaseColors[task.phase] + "60",
                            border: `1px solid ${
                              task.isCritical && showCriticalPath ? "#ef4444" : phaseColors[task.phase]
                            }`,
                          }}
                        >
                          {/* Progress fill */}
                          <div
                            className="h-full rounded-l"
                            style={{
                              width: `${task.progress}%`,
                              backgroundColor:
                                task.isCritical && showCriticalPath
                                  ? "#ef4444"
                                  : phaseColors[task.phase],
                              opacity: 0.7,
                            }}
                          />
                          <span
                            className="absolute inset-0 flex items-center px-2 text-[10px] font-medium"
                            style={{ color: "var(--foreground)" }}
                          >
                            {task.progress > 0 && `${task.progress}%`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Task List View ───────────────────────────────────────

function TaskListView() {
  const { tasks, selectedTaskId, setSelectedTaskId } = useProjectStore();

  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full text-sm" style={{ color: "var(--foreground)" }}>
        <thead>
          <tr
            className="text-left text-xs uppercase tracking-wider"
            style={{ color: "var(--muted-foreground)" }}
          >
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Status</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Task</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Phase</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Assignee</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Start</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>End</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Duration</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Progress</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Predecessors</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
              className={cn("cursor-pointer transition-colors hover:opacity-80")}
              style={{
                backgroundColor: selectedTaskId === task.id ? "var(--accent)" : "transparent",
              }}
            >
              <td className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-1">
                  {statusIcons[task.status]}
                  {task.isMilestone && <Diamond size={12} className="text-yellow-500" />}
                </div>
              </td>
              <td className="border-b px-3 py-2 font-medium" style={{ borderColor: "var(--border)" }}>
                {task.name}
              </td>
              <td className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: phaseColors[task.phase] + "30", color: phaseColors[task.phase] }}
                >
                  {task.phase}
                </span>
              </td>
              <td className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>{task.assignee}</td>
              <td className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>{formatShortDate(task.startDate)}</td>
              <td className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>{formatShortDate(task.endDate)}</td>
              <td className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>{task.duration}d</td>
              <td className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: "var(--muted)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${task.progress}%`,
                        backgroundColor: task.progress === 100 ? "#10b981" : "var(--primary)",
                      }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{task.progress}%</span>
                </div>
              </td>
              <td className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-1">
                  {task.predecessors.map((pid) => {
                    const pred = tasks.find((t) => t.id === pid);
                    return (
                      <span
                        key={pid}
                        className="rounded px-1 text-[10px]"
                        style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
                      >
                        {pred?.name.slice(0, 15)}...
                      </span>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Resources View ───────────────────────────────────────

function ResourcesView() {
  const { resources, tasks } = useProjectStore();

  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full text-sm" style={{ color: "var(--foreground)" }}>
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Resource</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Role</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Allocation</th>
            <th className="border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>Assigned Tasks</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((res) => (
            <tr key={res.id} className="transition-colors hover:opacity-80">
              <td className="border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: res.color }}
                  >
                    {res.avatar}
                  </div>
                  <span className="font-medium">{res.name}</span>
                </div>
              </td>
              <td className="border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>{res.role}</td>
              <td className="border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: "var(--muted)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${res.allocation}%`,
                        backgroundColor: res.allocation > 90 ? "#ef4444" : res.allocation > 70 ? "#f59e0b" : "#10b981",
                      }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{res.allocation}%</span>
                </div>
              </td>
              <td className="border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex flex-wrap gap-1">
                  {res.assignedTasks.map((tid) => {
                    const task = tasks.find((t) => t.id === tid);
                    return (
                      <span
                        key={tid}
                        className="rounded px-1.5 py-0.5 text-[11px]"
                        style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
                      >
                        {task?.name.slice(0, 20)}
                      </span>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Dashboard View ───────────────────────────────────────

function DashboardView() {
  const { tasks, resources, projectName, projectStartDate, projectEndDate } = useProjectStore();

  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const milestones = tasks.filter((t) => t.isMilestone);
  const criticalTasks = tasks.filter((t) => t.isCritical);
  const overallProgress = Math.round(tasks.reduce((a, t) => a + t.progress, 0) / totalTasks);

  const stats = [
    { label: "Overall Progress", value: `${overallProgress}%`, icon: <TrendingUp size={18} />, color: "#6366f1" },
    { label: "Tasks Completed", value: `${completed}/${totalTasks}`, icon: <CheckCircle2 size={18} />, color: "#10b981" },
    { label: "In Progress", value: inProgress.toString(), icon: <Clock size={18} />, color: "#3b82f6" },
    { label: "Milestones", value: `${milestones.filter((m) => m.status === "completed").length}/${milestones.length}`, icon: <Diamond size={18} />, color: "#f59e0b" },
    { label: "Critical Tasks", value: criticalTasks.length.toString(), icon: <AlertTriangle size={18} />, color: "#ef4444" },
    { label: "Team Members", value: resources.length.toString(), icon: <Users size={18} />, color: "#8b5cf6" },
  ];

  const phases = Array.from(new Set(tasks.map((t) => t.phase)));

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{projectName}</h2>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {formatShortDate(projectStartDate)} — {formatShortDate(projectEndDate)}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border p-3"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
          >
            <div className="mb-2 flex items-center gap-2" style={{ color: s.color }}>
              {s.icon}
              <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="mb-6 rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Project Progress</span>
          <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{overallProgress}%</span>
        </div>
        <div className="h-3 w-full rounded-full" style={{ backgroundColor: "var(--muted)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${overallProgress}%`, backgroundColor: "var(--primary)" }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Phase breakdown */}
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>Phase Progress</h3>
          <div className="space-y-3">
            {phases.map((phase) => {
              const phaseTasks = tasks.filter((t) => t.phase === phase);
              const phaseProgress = Math.round(phaseTasks.reduce((a, t) => a + t.progress, 0) / phaseTasks.length);
              return (
                <div key={phase}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span style={{ color: phaseColors[phase] }}>{phase}</span>
                    <span style={{ color: "var(--muted-foreground)" }}>{phaseProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full" style={{ backgroundColor: "var(--muted)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${phaseProgress}%`, backgroundColor: phaseColors[phase] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>Milestones</h3>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg p-2" style={{ backgroundColor: "var(--muted)" }}>
                <Diamond size={14} style={{ color: m.status === "completed" ? "#10b981" : "#f59e0b" }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{m.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{formatShortDate(m.endDate)}</p>
                </div>
                {statusIcons[m.status]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Editor ──────────────────────────────────────────

export default function ProjectEditor() {
  const { activeView } = useProjectStore();

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <ProjectToolbar />
      {activeView === "gantt" && <GanttChart />}
      {activeView === "tasks" && <TaskListView />}
      {activeView === "resources" && <ResourcesView />}
      {activeView === "dashboard" && <DashboardView />}
    </div>
  );
}
