"use client";

import { useState, useRef } from "react";
import {
  Grid3X3,
  Square,
  BoxSelect,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";

type BorderOption = {
  label: string;
  icon: React.ReactNode;
  value: string;
};

export function CellBordersPicker() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const setSelectionStyle = useSpreadsheetStore((s) => s.setSelectionStyle);

  const borderOptions: BorderOption[] = [
    {
      label: "All Borders",
      icon: <Grid3X3 size={14} />,
      value: "all",
    },
    {
      label: "Outside Borders",
      icon: <Square size={14} />,
      value: "outside",
    },
    {
      label: "Thick Box Border",
      icon: <BoxSelect size={14} />,
      value: "thick",
    },
    {
      label: "Bottom Border",
      icon: <ArrowDown size={14} />,
      value: "bottom",
    },
    {
      label: "Top Border",
      icon: <ArrowUp size={14} />,
      value: "top",
    },
    {
      label: "Left Border",
      icon: <ArrowLeft size={14} />,
      value: "left",
    },
    {
      label: "Right Border",
      icon: <ArrowRight size={14} />,
      value: "right",
    },
    {
      label: "No Border",
      icon: <X size={14} />,
      value: "none",
    },
  ];

  const handleSelect = (value: string) => {
    // Store border style as a string on cells
    setSelectionStyle({ border: value } as Record<string, unknown>);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        title="Cell Borders"
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded hover:opacity-80 transition-colors"
        style={{ color: "var(--foreground)" }}
      >
        <Grid3X3 size={15} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg border z-50"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            minWidth: 180,
          }}
        >
          {borderOptions.map((opt) => (
            <button
              key={opt.value}
              className="w-full text-left text-xs px-3 py-1.5 flex items-center gap-2 hover:opacity-80"
              style={{
                backgroundColor: "transparent",
                color: "var(--foreground)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--muted)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => handleSelect(opt.value)}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
