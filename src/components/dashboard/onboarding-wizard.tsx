"use client";

import { useState } from "react";
import {
  FileText,
  Table2,
  Presentation,
  FileDown,
  FolderOpen,
  Search,
  Sparkles,
  Users,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
} from "lucide-react";

const steps = [
  {
    title: "Welcome to Vidyalaya Office",
    description: "Your AI-native office suite for creating documents, spreadsheets, presentations, and PDF tools — all in one place.",
    icon: Sparkles,
    tips: [
      "Create any document type from the Quick Create section",
      "Pin important files for quick access",
      "Use keyboard shortcuts to work faster (press ? anytime)",
    ],
  },
  {
    title: "Powerful Editors",
    description: "Choose from four powerful editors, each with rich formatting, templates, and AI assistance built in.",
    icon: FileText,
    features: [
      { icon: FileText, label: "Document Editor", desc: "Word processing with ribbon toolbar" },
      { icon: Table2, label: "Spreadsheet", desc: "Formulas, charts, and pivot tables" },
      { icon: Presentation, label: "Presentations", desc: "Slides with animations and themes" },
      { icon: FileDown, label: "PDF Tools", desc: "View, edit, merge, split, and convert" },
    ],
  },
  {
    title: "Organize & Collaborate",
    description: "Keep your files organized with folders, share with your team, and track changes with version history.",
    icon: Users,
    features: [
      { icon: FolderOpen, label: "File Manager", desc: "Organize with folders and tags" },
      { icon: Search, label: "Global Search", desc: "Find any file instantly" },
      { icon: Users, label: "Collaboration", desc: "Share, comment, and review together" },
    ],
  },
];

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onComplete} />
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Close button */}
        <button
          onClick={onComplete}
          className="absolute right-4 top-4 rounded-md p-1 hover:opacity-70 z-10"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Icon size={24} style={{ color: "var(--primary)" }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--card-foreground)" }}>
            {current.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {current.description}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 pb-4">
          {current.tips && (
            <div className="space-y-2">
              {current.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 shrink-0" style={{ color: "#16a34a" }} />
                  <span className="text-sm" style={{ color: "var(--card-foreground)" }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
          {current.features && (
            <div className="grid grid-cols-1 gap-2">
              {current.features.map((feat) => (
                <div
                  key={feat.label}
                  className="flex items-center gap-3 rounded-lg p-3"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <feat.icon size={18} style={{ color: "var(--primary)" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{feat.label}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-8 py-4" style={{ borderColor: "var(--border)" }}>
          {/* Step indicators */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === step ? 24 : 8,
                  backgroundColor: i === step ? "var(--primary)" : "var(--border)",
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Get Started <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
