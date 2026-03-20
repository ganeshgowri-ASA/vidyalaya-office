"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  FileText,
  Sparkles,
  Command,
  Mic,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vidyalaya_onboarding_complete";

interface TourStep {
  id: number;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  tip?: string;
  shortcut?: string;
}

const steps: TourStep[] = [
  {
    id: 1,
    icon: LayoutDashboard,
    iconColor: "#8b5cf6",
    title: "Welcome to Vidyalaya Office",
    description:
      "Your AI-native office suite for documents, spreadsheets, presentations, email, chat, and more. Everything you need to work smarter — in one place.",
    tip: "Use the sidebar to navigate between modules. Pin your favorites for quick access.",
  },
  {
    id: 2,
    icon: FileText,
    iconColor: "#3b82f6",
    title: "Create Your First Document",
    description:
      "Click 'New Document' on the dashboard or navigate to any editor to get started. Rich text editing, templates, AI-powered writing assistance — all built in.",
    tip: "Use Ctrl+N to quickly create a new document from anywhere in the app.",
    shortcut: "Ctrl+N",
  },
  {
    id: 3,
    icon: Sparkles,
    iconColor: "#f59e0b",
    title: "Meet Your AI Assistant",
    description:
      "Your personal AI assistant can help you write, summarize, translate, generate code, and answer questions. Click the AI button in the top bar or press Ctrl+Period.",
    tip: "The AI assistant has context about your current document and can help you improve it.",
    shortcut: "Ctrl+.",
  },
  {
    id: 4,
    icon: Command,
    iconColor: "#16a34a",
    title: "Power User: Command Bar",
    description:
      "Open the command bar with Ctrl+K to search, navigate, and execute actions without leaving your keyboard. Type any command or file name to jump to it instantly.",
    tip: "The command bar supports fuzzy search — just type a few letters of what you need.",
    shortcut: "Ctrl+K",
  },
  {
    id: 5,
    icon: Mic,
    iconColor: "#ec4899",
    title: "Try Voice Input",
    description:
      "Dictate text using your microphone directly in any editor. Click the mic icon in the document toolbar to start voice input. Great for quick notes and brainstorming.",
    tip: "Voice input works best in a quiet environment. Speak clearly and at a normal pace.",
  },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === current ? "20px" : "6px",
            height: "6px",
            backgroundColor: i === current ? "var(--primary)" : "var(--secondary)",
          }}
        />
      ))}
    </div>
  );
}

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  const close = () => {
    if (dontShowAgain || step === steps.length - 1) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setVisible(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      close();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!visible) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Close */}
        <button
          onClick={close}
          className="absolute right-4 top-4 rounded-md p-1 hover:opacity-70 transition-opacity"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Step icon */}
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${current.iconColor}20` }}
          >
            <Icon size={32} style={{ color: current.iconColor }} />
          </div>

          {/* Step counter */}
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Step {step + 1} of {steps.length}
          </p>

          {/* Title */}
          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--card-foreground)" }}>
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--muted-foreground)" }}>
            {current.description}
          </p>

          {/* Tip */}
          {current.tip && (
            <div
              className="flex items-start gap-2 rounded-lg p-3 mb-4 text-xs"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Sparkles size={12} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
              <span style={{ color: "var(--card-foreground)" }}>{current.tip}</span>
            </div>
          )}

          {/* Shortcut pill */}
          {current.shortcut && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Keyboard shortcut:</span>
              <kbd
                className="rounded-md border px-2 py-1 text-xs font-mono font-semibold"
                style={{
                  backgroundColor: "var(--secondary)",
                  borderColor: "var(--border)",
                  color: "var(--card-foreground)",
                }}
              >
                {current.shortcut}
              </kbd>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex items-center justify-center mb-6">
            <StepIndicator current={step} total={steps.length} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={prev}
              disabled={step === 0}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-opacity",
                step === 0 && "opacity-0 pointer-events-none"
              )}
              style={{ color: "var(--muted-foreground)" }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              onClick={next}
              className="flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {isLast ? (
                <>
                  <Check size={16} /> Get Started
                </>
              ) : (
                <>
                  Next <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Don't show again */}
          <div className="mt-4 flex items-center gap-2">
            <input
              id="dont-show"
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-3.5 w-3.5 rounded"
            />
            <label htmlFor="dont-show" className="text-xs cursor-pointer" style={{ color: "var(--muted-foreground)" }}>
              Don&apos;t show this tour again
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
