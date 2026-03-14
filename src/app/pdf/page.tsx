import { FileDown } from "lucide-react";

export default function PdfPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <FileDown size={48} style={{ color: "var(--primary)" }} />
      <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        PDF Tools
      </h1>
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        PDF Tools coming in P6
      </p>
      <div
        className="mt-4 rounded-lg border px-6 py-3 text-sm"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--card-foreground)",
        }}
      >
        PDF viewing, editing, merging, splitting, and AI-powered form filling.
      </div>
    </div>
  );
}
