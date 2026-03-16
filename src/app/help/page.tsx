"use client";

import { useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  Info,
  ExternalLink,
  BookOpen,
  Video,
  Mail,
  Send,
  Check,
  Keyboard,
  FileText,
  Table2,
  Presentation,
  FileDown,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

const helpLinks = [
  { label: "Getting Started Guide", icon: BookOpen, desc: "Learn the basics of Vidyalaya Office" },
  { label: "Document Editor Help", icon: FileText, desc: "Formatting, styles, and templates" },
  { label: "Spreadsheet Help", icon: Table2, desc: "Formulas, charts, and data tools" },
  { label: "Presentation Help", icon: Presentation, desc: "Slides, animations, and transitions" },
  { label: "PDF Tools Help", icon: FileDown, desc: "View, edit, merge, and convert PDFs" },
  { label: "Video Tutorials", icon: Video, desc: "Step-by-step video guides" },
];

const faqItems = [
  { q: "How do I share a document?", a: "Open the document and click the Share button in the toolbar, or right-click a file and select Share. You can invite collaborators by email and set their permissions." },
  { q: "Can I work offline?", a: "Yes! Documents are cached locally and sync automatically when you reconnect. Look for the sync indicator in the status bar." },
  { q: "How do I use AI features?", a: "Click the AI button in the top bar or press Ctrl+. to open the AI assistant. You can ask it to help with writing, formatting, data analysis, and more." },
  { q: "Where are my deleted files?", a: "Deleted files go to the Trash, accessible from the sidebar. Files in Trash are kept for 30 days before automatic permanent deletion." },
  { q: "How do I change the theme?", a: "Go to Profile > Theme, or use the theme switcher in the top bar. You can choose from 5 color themes and light/dark modes." },
];

export default function HelpPage() {
  const { setShowKeyboardShortcuts } = useAppStore();
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "general">("general");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSendFeedback = () => {
    if (feedbackText.trim()) {
      setFeedbackSent(true);
      setFeedbackText("");
      setTimeout(() => setFeedbackSent(false), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Help & Feedback</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Find answers, learn features, or send us feedback</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Help Center */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>
            <BookOpen size={14} /> Help Center
          </h2>
          <div className="space-y-2">
            {helpLinks.map((link) => (
              <div
                key={link.label}
                className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.01]"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                <link.icon size={20} style={{ color: "var(--primary)" }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{link.label}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{link.desc}</p>
                </div>
                <ExternalLink size={14} style={{ color: "var(--muted-foreground)" }} />
              </div>
            ))}
            <button
              onClick={() => setShowKeyboardShortcuts(true)}
              className="flex w-full items-center gap-3 rounded-xl border p-4 transition-all hover:scale-[1.01]"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <Keyboard size={20} style={{ color: "var(--primary)" }} />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>Keyboard Shortcuts</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>View all shortcuts (press ? anytime)</p>
              </div>
            </button>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>
            <HelpCircle size={14} /> FAQ
          </h2>
          <div className="rounded-xl border divide-y" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            {faqItems.map((item, i) => (
              <div key={i} style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
                  style={{ color: "var(--card-foreground)" }}
                >
                  {item.q}
                  <span className="shrink-0 ml-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {expandedFaq === i ? "−" : "+"}
                  </span>
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-3 text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Feedback Form */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>
          <MessageSquare size={14} /> Send Feedback
        </h2>
        <div className="rounded-xl border p-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          {/* Type selector */}
          <div className="flex gap-2 mb-4">
            {([
              { value: "general", label: "General" },
              { value: "bug", label: "Bug Report" },
              { value: "feature", label: "Feature Request" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFeedbackType(opt.value)}
                className="rounded-lg border px-3 py-1.5 text-sm transition-colors"
                style={{
                  backgroundColor: feedbackType === opt.value ? "var(--accent)" : "transparent",
                  borderColor: feedbackType === opt.value ? "var(--primary)" : "var(--border)",
                  color: feedbackType === opt.value ? "var(--accent-foreground)" : "var(--muted-foreground)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Text area */}
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={
              feedbackType === "bug"
                ? "Describe the bug, steps to reproduce, and expected behavior..."
                : feedbackType === "feature"
                  ? "Describe the feature you'd like to see..."
                  : "Tell us what you think..."
            }
            rows={4}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              <Mail size={10} className="inline mr-1" />
              Responses sent to admin@vidyalaya.edu
            </p>
            <button
              onClick={handleSendFeedback}
              disabled={!feedbackText.trim()}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: feedbackSent ? "#16a34a" : "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {feedbackSent ? (
                <><Check size={14} /> Sent!</>
              ) : (
                <><Send size={14} /> Send Feedback</>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section>
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="flex items-center gap-2 text-sm hover:opacity-80"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Info size={14} /> About Vidyalaya Office
        </button>
        {showAbout && (
          <div className="mt-3 rounded-xl border p-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>विद्यालय</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>Vidyalaya Office</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>AI-Native Office Suite</p>
              </div>
            </div>
            <div className="space-y-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <p>Version: 1.0.0</p>
              <p>Build: 2026.03.16</p>
              <p>Framework: Next.js 14 with React 18</p>
              <p>AI Engine: Claude by Anthropic</p>
              <p>License: MIT</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
