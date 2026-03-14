"use client";

import React from "react";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label?: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export function ToolbarButton({
  icon,
  label,
  title,
  active = false,
  disabled = false,
  onClick,
  className = "",
}: ToolbarButtonProps) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 rounded px-2 py-1.5 text-xs transition-colors
        ${active ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "hover:bg-[var(--muted)]"}
        ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
        ${className}`}
      style={{ color: active ? "var(--accent-foreground)" : "var(--foreground)" }}
    >
      {icon}
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}

interface ToolbarSeparatorProps {
  className?: string;
}

export function ToolbarSeparator({ className = "" }: ToolbarSeparatorProps) {
  return (
    <div
      className={`mx-1 h-6 w-px ${className}`}
      style={{ backgroundColor: "var(--border)" }}
    />
  );
}

interface ToolbarDropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  title: string;
  className?: string;
}

export function ToolbarDropdown({
  value,
  options,
  onChange,
  title,
  className = "",
}: ToolbarDropdownProps) {
  return (
    <select
      title={title}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-7 rounded border px-1.5 text-xs outline-none ${className}`}
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
