"use client";
import { usePresentationStore } from "@/store/presentation-store";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

export default function NotesPanel() {
  const { slides, currentSlideIndex, updateSlideNotes, showNotes, toggleNotes } =
    usePresentationStore();

  const currentSlide = slides[currentSlideIndex];

  return (
    <div
      className="border-t flex flex-col no-print"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
        height: showNotes ? 140 : 36,
        transition: "height 0.2s ease",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <button
        onClick={toggleNotes}
        className="flex items-center gap-2 px-4 py-2 text-xs font-medium w-full text-left"
        style={{ color: "var(--muted-foreground)" }}
      >
        <MessageSquare size={13} />
        Speaker Notes
        <span className="ml-auto">
          {showNotes ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </span>
      </button>

      {showNotes && (
        <textarea
          value={currentSlide?.notes ?? ""}
          onChange={(e) => {
            if (currentSlide) {
              updateSlideNotes(currentSlide.id, e.target.value);
            }
          }}
          placeholder="Add speaker notes for this slide..."
          className="flex-1 resize-none px-4 pb-3 text-sm outline-none"
          style={{
            backgroundColor: "transparent",
            color: "var(--foreground)",
            borderTop: "1px solid var(--border)",
          }}
        />
      )}
    </div>
  );
}
