"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { VFile } from "@/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const TYPE_COLORS: Record<string, string> = {
  document: "#3b82f6",
  spreadsheet: "#16a34a",
  presentation: "#f59e0b",
  pdf: "#dc2626",
};

const TYPE_LABELS: Record<string, string> = {
  document: "Documents",
  spreadsheet: "Spreadsheets",
  presentation: "Presentations",
  pdf: "PDFs",
};

interface StorageChartProps {
  files: VFile[];
  totalStorageBytes?: number;
}

const RADIAN = Math.PI / 180;
function renderCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function StorageChart({ files, totalStorageBytes = 10 * 1024 * 1024 * 1024 }: StorageChartProps) {
  const usedByType: Record<string, number> = {};
  let totalUsed = 0;

  files.forEach((f) => {
    const bytes = f.size || 0;
    usedByType[f.type] = (usedByType[f.type] || 0) + bytes;
    totalUsed += bytes;
  });

  const chartData = Object.entries(usedByType)
    .filter(([, v]) => v > 0)
    .map(([type, bytes]) => ({
      name: TYPE_LABELS[type] || type,
      value: bytes,
      color: TYPE_COLORS[type] || "#6b7280",
    }));

  const usedPercent = Math.round((totalUsed / totalStorageBytes) * 100);

  // By folder
  const folderCounts: Record<string, number> = {};
  files.forEach((f) => {
    const folder = f.folderId || "root";
    folderCounts[folder] = (folderCounts[folder] || 0) + (f.size || 0);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--card-foreground)" }}>
            Storage by File Type
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatFileSize(value), "Size"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No files to analyze</p>
            </div>
          )}
        </div>

        {/* Storage overview */}
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--card-foreground)" }}>
            Storage Overview
          </h3>

          {/* Usage bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Used</span>
              <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                {formatFileSize(totalUsed)} / {formatFileSize(totalStorageBytes)}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(usedPercent, 100)}%`,
                  backgroundColor: usedPercent > 80 ? "#dc2626" : usedPercent > 60 ? "#f59e0b" : "var(--primary)",
                }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              {usedPercent}% used · {formatFileSize(totalStorageBytes - totalUsed)} free
            </p>
          </div>

          {/* By type breakdown */}
          <div className="space-y-2">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs flex-1" style={{ color: "var(--foreground)" }}>{item.name}</span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {formatFileSize(item.value)}
                </span>
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: totalUsed > 0 ? `${(item.value / totalUsed) * 100}%` : "0%",
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* File count */}
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3" style={{ borderColor: "var(--border)" }}>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{files.length}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Files</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{formatFileSize(totalUsed)}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Size</p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-type stats table */}
      <div
        className="rounded-xl border"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>File Type Breakdown</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {Object.entries(TYPE_LABELS).map(([type, label]) => {
            const typeFiles = files.filter((f) => f.type === type);
            const typeSize = typeFiles.reduce((s, f) => s + (f.size || 0), 0);
            return (
              <div key={type} className="flex items-center gap-3 px-4 py-3">
                <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[type] }} />
                <span className="text-sm flex-1" style={{ color: "var(--foreground)" }}>{label}</span>
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{typeFiles.length} files</span>
                <span className="text-sm font-medium w-24 text-right" style={{ color: "var(--foreground)" }}>
                  {formatFileSize(typeSize)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
