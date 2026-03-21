"use client";
import {
  Sparkles,
  Wand2,
  Download,
  BarChart2,
  CalendarDays,
  Calendar,
  Image as ImageIcon,
  FileDown,
} from "lucide-react";
import { usePriorityMatrixStore, MatrixTask } from "@/store/priority-matrix-store";
import { cn } from "@/lib/utils";

interface Props {
  tasks: MatrixTask[];
}

function exportAsPNG(tasks: MatrixTask[]) {
  const canvas = document.createElement("canvas");
  const W = 1200;
  const H = 800;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.fillText("Eisenhower Priority Matrix", 40, 46);
  ctx.font = "13px system-ui, sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(`Generated ${new Date().toLocaleDateString()}`, 40, 68);

  const quadrants: Array<{ id: "q1" | "q2" | "q3" | "q4"; label: string; color: string; x: number; y: number }> = [
    { id: "q1", label: "Q1 — Do First\nUrgent + Important", color: "#ef4444", x: 40, y: 90 },
    { id: "q2", label: "Q2 — Schedule\nNot Urgent + Important", color: "#3b82f6", x: 620, y: 90 },
    { id: "q3", label: "Q3 — Delegate\nUrgent + Not Important", color: "#f59e0b", x: 40, y: 460 },
    { id: "q4", label: "Q4 — Eliminate\nNeither", color: "#6b7280", x: 620, y: 460 },
  ];

  for (const q of quadrants) {
    const qTasks = tasks.filter((t) => t.quadrant === q.id);
    const qW = 540;
    const qH = 340;

    // Card bg
    ctx.fillStyle = q.color + "18";
    ctx.strokeStyle = q.color + "60";
    ctx.lineWidth = 1.5;
    roundRect(ctx, q.x, q.y, qW, qH, 10);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.fillStyle = q.color;
    roundRect(ctx, q.x, q.y, qW, 44, 10);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px system-ui, sans-serif";
    const [line1, line2] = q.label.split("\n");
    ctx.fillText(line1, q.x + 14, q.y + 17);
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText(line2, q.x + 14, q.y + 33);

    // Task count
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${qTasks.length} tasks`, q.x + qW - 12, q.y + 26);
    ctx.textAlign = "left";

    // Tasks
    let ty = q.y + 56;
    for (const task of qTasks.slice(0, 6)) {
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      roundRect(ctx, q.x + 10, ty, qW - 20, 34, 6);
      ctx.fill();

      ctx.fillStyle = task.completed ? "#666" : "#ddd";
      ctx.font = task.completed ? "11px system-ui" : "11px system-ui, sans-serif";
      const shortTitle = task.title.length > 52 ? task.title.slice(0, 49) + "…" : task.title;
      ctx.fillText(shortTitle, q.x + 24, ty + 14);

      // Priority dot
      const pColors: Record<string, string> = { Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" };
      ctx.fillStyle = pColors[task.priority] || "#888";
      ctx.beginPath();
      ctx.arc(q.x + 16, ty + 11, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Deadline
      const days = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000);
      ctx.fillStyle = days < 0 ? "#ef4444" : "#888";
      ctx.font = "10px system-ui";
      ctx.fillText(days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`, q.x + 24, ty + 27);

      ty += 40;
      if (ty > q.y + qH - 14) break;
    }
    if (qTasks.length > 6) {
      ctx.fillStyle = "#888";
      ctx.font = "10px system-ui";
      ctx.fillText(`+${qTasks.length - 6} more…`, q.x + 14, q.y + qH - 6);
    }
  }

  // Axis labels
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "bold 11px system-ui";
  ctx.fillText("◀ NOT URGENT", 40, H - 10);
  ctx.textAlign = "right";
  ctx.fillText("URGENT ▶", W - 40, H - 10);
  ctx.textAlign = "center";
  ctx.fillText("IMPORTANT ▲", W / 2, H - 10);
  ctx.textAlign = "left";

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "priority-matrix.png";
    a.click();
    URL.revokeObjectURL(url);
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function exportAsPDF() {
  window.print();
}

export function MatrixToolbar({ tasks }: Props) {
  const { viewMode, setViewMode, toggleAnalytics, toggleAiSuggestions, showAnalytics, showAiSuggestions, autoSuggest } =
    usePriorityMatrixStore();

  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b gap-3 flex-wrap no-print"
      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
    >
      {/* Left: title */}
      <div>
        <h1 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
          Eisenhower Priority Matrix
        </h1>
        <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          {tasks.length} tasks · {tasks.filter((t) => t.completed).length} completed
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View toggle */}
        <div
          className="flex rounded-lg overflow-hidden border text-xs font-medium"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setViewMode("weekly")}
            className={cn("flex items-center gap-1 px-2.5 py-1.5 transition-colors")}
            style={{
              backgroundColor: viewMode === "weekly" ? "var(--primary)" : "transparent",
              color: viewMode === "weekly" ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >
            <CalendarDays size={12} />
            Weekly
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={cn("flex items-center gap-1 px-2.5 py-1.5 transition-colors")}
            style={{
              backgroundColor: viewMode === "monthly" ? "var(--primary)" : "transparent",
              color: viewMode === "monthly" ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >
            <Calendar size={12} />
            Monthly
          </button>
        </div>

        {/* Auto-suggest */}
        <button
          onClick={autoSuggest}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 border"
          style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--card)" }}
          title="Auto-assign quadrants based on priority and deadline"
        >
          <Wand2 size={13} />
          Auto-Sort
        </button>

        {/* AI Suggestions */}
        <button
          onClick={toggleAiSuggestions}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
          style={{
            backgroundColor: showAiSuggestions ? "#8b5cf6" : "rgba(139,92,246,0.15)",
            color: showAiSuggestions ? "#fff" : "#8b5cf6",
          }}
        >
          <Sparkles size={13} />
          AI Suggest
        </button>

        {/* Analytics */}
        <button
          onClick={toggleAnalytics}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
          style={{
            backgroundColor: showAnalytics ? "var(--primary)" : "var(--card)",
            color: showAnalytics ? "var(--primary-foreground)" : "var(--muted-foreground)",
            border: `1px solid var(--border)`,
          }}
        >
          <BarChart2 size={13} />
          Analytics
        </button>

        {/* Export */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => exportAsPNG(tasks)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 border"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", backgroundColor: "var(--card)" }}
            title="Export as PNG"
          >
            <ImageIcon size={13} />
            PNG
          </button>
          <button
            onClick={exportAsPDF}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 border"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", backgroundColor: "var(--card)" }}
            title="Export as PDF"
          >
            <FileDown size={13} />
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
