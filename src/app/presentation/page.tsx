import { Presentation } from "lucide-react";

export default function PresentationPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <Presentation size={48} style={{ color: "var(--primary)" }} />
      <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        Presentation Editor
      </h1>
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        Presentation Editor coming in P5
      </p>
      <div
        className="mt-4 rounded-lg border px-6 py-3 text-sm"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--card-foreground)",
        }}
      >
        Slide-based presentations with AI layout suggestions, animations, and speaker notes.
      </div>
    </div>
  );
}
