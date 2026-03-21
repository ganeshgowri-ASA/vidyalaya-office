"use client";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { MatrixTask, MatrixQuadrant } from "@/store/priority-matrix-store";
import { TrendingUp, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const Q_CONFIG: Record<MatrixQuadrant, { label: string; color: string; shortLabel: string }> = {
  q1: { label: "Do First", color: "#ef4444", shortLabel: "Q1" },
  q2: { label: "Schedule", color: "#3b82f6", shortLabel: "Q2" },
  q3: { label: "Delegate", color: "#f59e0b", shortLabel: "Q3" },
  q4: { label: "Eliminate", color: "#6b7280", shortLabel: "Q4" },
};

interface Props {
  tasks: MatrixTask[];
}

export function AnalyticsPanel({ tasks }: Props) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const overdue = tasks.filter((t) => {
      const days = Math.ceil((new Date(t.deadline).getTime() - Date.now()) / 86400000);
      return days < 0 && !t.completed;
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byQuadrant = (["q1", "q2", "q3", "q4"] as MatrixQuadrant[]).map((q) => {
      const qTasks = tasks.filter((t) => t.quadrant === q);
      const qDone = qTasks.filter((t) => t.completed).length;
      return {
        name: Q_CONFIG[q].shortLabel,
        total: qTasks.length,
        done: qDone,
        color: Q_CONFIG[q].color,
        label: Q_CONFIG[q].label,
      };
    });

    const byPriority = [
      { name: "Critical", count: tasks.filter((t) => t.priority === "Critical").length, color: "#ef4444" },
      { name: "High", count: tasks.filter((t) => t.priority === "High").length, color: "#f97316" },
      { name: "Medium", count: tasks.filter((t) => t.priority === "Medium").length, color: "#eab308" },
      { name: "Low", count: tasks.filter((t) => t.priority === "Low").length, color: "#22c55e" },
    ].filter((p) => p.count > 0);

    return { total, completed, overdue, completionRate, byQuadrant, byPriority };
  }, [tasks]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-lg border px-2.5 py-2 text-xs shadow-lg"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
            <span>{p.name}: {p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="w-72 shrink-0 flex flex-col border-l overflow-y-auto"
      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
    >
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
        <TrendingUp size={15} style={{ color: "var(--primary)" }} />
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Matrix Analytics</h2>
      </div>

      <div className="p-3 space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Total Tasks", value: stats.total, icon: Clock, color: "#6b7280" },
            { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "#22c55e" },
            { label: "Completion", value: `${stats.completionRate}%`, icon: TrendingUp, color: "#3b82f6" },
            { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "#ef4444" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-lg p-2.5 border"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} style={{ color }} />
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{label}</p>
              </div>
              <p className="text-lg font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tasks per quadrant */}
        <div>
          <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
            TASKS BY QUADRANT
          </h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={stats.byQuadrant} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total" radius={[3, 3, 0, 0]}>
                {stats.byQuadrant.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Bar>
              <Bar dataKey="done" name="Done" radius={[3, 3, 0, 0]}>
                {stats.byQuadrant.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm opacity-70" style={{ backgroundColor: "#6b7280" }} />
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Total</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: "#22c55e" }} />
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Done</span>
            </div>
          </div>
        </div>

        {/* Priority distribution */}
        <div>
          <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
            PRIORITY DISTRIBUTION
          </h3>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={90} height={90}>
              <PieChart>
                <Pie
                  data={stats.byPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={24}
                  outerRadius={40}
                  dataKey="count"
                  paddingAngle={2}
                >
                  {stats.byPriority.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {stats.byPriority.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[10px]" style={{ color: "var(--foreground)" }}>{p.name}</span>
                  <span className="text-[10px] font-semibold ml-auto" style={{ color: p.color }}>{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Per-quadrant breakdown */}
        <div>
          <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
            COMPLETION BY QUADRANT
          </h3>
          <div className="space-y-2">
            {stats.byQuadrant.map((q) => (
              <div key={q.name}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px]" style={{ color: "var(--foreground)" }}>{q.label}</span>
                  <span className="text-[10px] font-medium" style={{ color: q.color }}>
                    {q.total > 0 ? Math.round((q.done / q.total) * 100) : 0}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${q.total > 0 ? (q.done / q.total) * 100 : 0}%`,
                      backgroundColor: q.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
