"use client";
import { useTasksStore } from "@/store/tasks-store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";

const STATUS_COLORS = {
  "Backlog": "#6b7280",
  "To Do": "#06b6d4",
  "In Progress": "#f59e0b",
  "Review": "#8b5cf6",
  "Done": "#10b981",
};

const PRIORITY_COLORS = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Medium: "#06b6d4",
  Low: "#6b7280",
};

export function ProgressDashboard() {
  const { tasks } = useTasksStore();

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "Done").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const overdue = tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "Done").length;
  const completion = total > 0 ? Math.round((done / total) * 100) : 0;

  const byStatus = Object.entries(STATUS_COLORS).map(([name, color]) => ({
    name,
    count: tasks.filter((t) => t.status === name).length,
    color,
  }));

  const byPriority = Object.entries(PRIORITY_COLORS).map(([name, color]) => ({
    name,
    count: tasks.filter((t) => t.priority === name).length,
    color,
  }));

  const byAssignee = ["Alice Chen", "Bob Kumar", "Carol White", "David Lee"].map((a) => ({
    name: a.split(" ")[0],
    total: tasks.filter((t) => t.assignee === a).length,
    done: tasks.filter((t) => t.assignee === a && t.status === "Done").length,
  }));

  const stats = [
    { label: "Total Tasks", value: total, icon: TrendingUp, color: "#8b5cf6" },
    { label: "Completed", value: done, icon: CheckCircle2, color: "#10b981" },
    { label: "In Progress", value: inProgress, icon: Clock, color: "#f59e0b" },
    { label: "Overdue", value: overdue, icon: AlertTriangle, color: "#ef4444" },
  ];

  return (
    <div className="h-full overflow-y-auto p-6" style={{ backgroundColor: "var(--background)" }}>
      <h2 className="text-base font-semibold mb-5" style={{ color: "var(--foreground)" }}>Progress Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs opacity-50" style={{ color: "var(--foreground)" }}>{label}</span>
              <div className="rounded-lg p-1.5" style={{ backgroundColor: color + "22" }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Completion progress */}
      <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Overall Completion</span>
          <span className="text-sm font-bold" style={{ color: "#10b981" }}>{completion}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${completion}%`, background: "linear-gradient(90deg, #8b5cf6, #10b981)" }}
          />
        </div>
        <p className="text-xs opacity-40 mt-1.5" style={{ color: "var(--foreground)" }}>{done} of {total} tasks completed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Status distribution */}
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <h3 className="text-xs font-semibold opacity-50 mb-3" style={{ color: "var(--foreground)" }}>Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byStatus} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--foreground)", opacity: 0.5 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "var(--foreground)", opacity: 0.5 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority distribution pie */}
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <h3 className="text-xs font-semibold opacity-50 mb-3" style={{ color: "var(--foreground)" }}>Tasks by Priority</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={160}>
              <PieChart>
                <Pie data={byPriority} dataKey="count" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2}>
                  {byPriority.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {byPriority.map(({ name, count, color }) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs opacity-60" style={{ color: "var(--foreground)" }}>{name}</span>
                  <span className="text-xs font-medium ml-auto" style={{ color: "var(--foreground)" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assignee workload */}
      <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
        <h3 className="text-xs font-semibold opacity-50 mb-3" style={{ color: "var(--foreground)" }}>Team Workload</h3>
        <div className="space-y-3">
          {byAssignee.map(({ name, total, done }) => {
            const pct = total > 0 ? (done / total) * 100 : 0;
            return (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: "var(--foreground)" }}>{name}</span>
                  <span className="text-xs opacity-50" style={{ color: "var(--foreground)" }}>{done}/{total} done</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#8b5cf6" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
