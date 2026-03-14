import { FileText } from "lucide-react";

export default function DocumentPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <FileText size={48} style={{ color: "var(--primary)" }} />
      <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        Document Editor
      </h1>
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        Document Editor coming in P3
      </p>
      <div
        className="mt-4 rounded-lg border px-6 py-3 text-sm"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--card-foreground)",
        }}
      >
        Rich text editing with AI-powered writing assistance, formatting, and real-time collaboration.
      </div>
    </div>
  );
}
