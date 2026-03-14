"use client";

interface StatusBarProps {
  wordCount: number;
  charCount: number;
  lineCount: number;
  pageSize: string;
  zoom: number;
  lastSaved: Date | null;
  onZoomChange: (zoom: number) => void;
}

const PAGE_SIZE_LABELS: Record<string, string> = {
  a4: "A4",
  a3: "A3",
  a5: "A5",
  letter: "Letter",
  legal: "Legal",
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function StatusBar({
  wordCount,
  charCount,
  lineCount,
  pageSize,
  zoom,
  lastSaved,
  onZoomChange,
}: StatusBarProps) {
  return (
    <div
      className="no-print flex h-7 items-center justify-between border-t px-3 text-xs"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        color: "var(--muted-foreground)",
      }}
    >
      {/* Left: doc stats */}
      <div className="flex items-center gap-4">
        <span>
          <strong style={{ color: "var(--foreground)" }}>{wordCount.toLocaleString()}</strong> words
        </span>
        <span>
          <strong style={{ color: "var(--foreground)" }}>{charCount.toLocaleString()}</strong> characters
        </span>
        <span>
          <strong style={{ color: "var(--foreground)" }}>{lineCount}</strong> lines
        </span>
        <span
          className="hidden rounded px-1.5 py-0.5 text-xs font-medium sm:inline"
          style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
        >
          {PAGE_SIZE_LABELS[pageSize] || pageSize.toUpperCase()}
        </span>
      </div>

      {/* Center: save status */}
      <div className="hidden sm:block">
        {lastSaved ? (
          <span style={{ color: "var(--muted-foreground)" }}>
            Saved at {formatTime(lastSaved)}
          </span>
        ) : (
          <span style={{ color: "var(--muted-foreground)" }}>Auto-save every 15s</span>
        )}
      </div>

      {/* Right: zoom */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onZoomChange(Math.max(50, zoom - 10))}
          className="flex h-4 w-4 items-center justify-center rounded text-xs hover:opacity-80"
          style={{ color: "var(--foreground)" }}
        >
          −
        </button>
        <input
          type="range"
          min={50}
          max={200}
          step={10}
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="w-20 accent-[var(--primary)]"
          style={{ accentColor: "var(--primary)" }}
        />
        <button
          onClick={() => onZoomChange(Math.min(200, zoom + 10))}
          className="flex h-4 w-4 items-center justify-center rounded text-xs hover:opacity-80"
          style={{ color: "var(--foreground)" }}
        >
          +
        </button>
        <span className="w-10 text-right" style={{ color: "var(--foreground)" }}>
          {zoom}%
        </span>
      </div>
    </div>
  );
}
