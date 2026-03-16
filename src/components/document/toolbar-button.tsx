"use client";

import React from "react";

// ---------------------------------------------------------------------------
// ToolbarButton
// ---------------------------------------------------------------------------

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label?: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  /** Visual size of the button. Defaults to "sm". */
  size?: "sm" | "md" | "lg";
  /** When true, renders a small chevron-down indicator to signal a dropdown. */
  dropdown?: boolean;
}

export function ToolbarButton({
  icon,
  label,
  title,
  active = false,
  disabled = false,
  onClick,
  className = "",
  size = "sm",
  dropdown = false,
}: ToolbarButtonProps) {
  // Base styles shared across all sizes
  const base = [
    "relative inline-flex items-center justify-center rounded transition-all duration-100 select-none",
    disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
  ].join(" ");

  // Active accent: a bottom border highlight (mimics Office ribbon active state)
  const activeStyles = active
    ? "bg-[var(--accent)] text-[var(--accent-foreground)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--primary)]"
    : "hover:bg-[var(--muted)] hover:text-[var(--foreground)]";

  const color = active ? "var(--accent-foreground)" : "var(--foreground)";

  if (size === "lg") {
    // Large: icon (20 px) stacked above label — like Paste / Insert in MS Office
    return (
      <button
        title={title}
        disabled={disabled}
        onClick={onClick}
        className={`${base} ${activeStyles} flex-col gap-0.5 px-2 py-1 min-w-[44px] ${className}`}
        style={{ color }}
      >
        {/* Icon wrapper — force 20 px render size */}
        <span className="flex items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </span>
        {label && (
          <span className="text-[10px] leading-none font-normal whitespace-nowrap">
            {label}
          </span>
        )}
        {dropdown && (
          <ChevronDownIcon className="h-2 w-2 opacity-60 -mt-0.5" />
        )}
      </button>
    );
  }

  if (size === "md") {
    // Medium: icon (16 px) + label side by side
    return (
      <button
        title={title}
        disabled={disabled}
        onClick={onClick}
        className={`${base} ${activeStyles} flex-row gap-1 px-2 py-1.5 ${className}`}
        style={{ color }}
      >
        <span className="flex items-center justify-center [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </span>
        {label && (
          <span className="text-xs leading-none whitespace-nowrap">{label}</span>
        )}
        {dropdown && (
          <ChevronDownIcon className="h-3 w-3 opacity-60 ml-0.5" />
        )}
      </button>
    );
  }

  // Default "sm": icon only (14 px), optional hidden-until-sm label
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${activeStyles} flex-row gap-1 px-2 py-1.5 ${className}`}
      style={{ color }}
    >
      <span className="flex items-center justify-center [&_svg]:h-3.5 [&_svg]:w-3.5">
        {icon}
      </span>
      {label && (
        <span className="hidden sm:inline text-xs leading-none whitespace-nowrap">
          {label}
        </span>
      )}
      {dropdown && (
        <ChevronDownIcon className="h-3 w-3 opacity-60" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ToolbarSeparator
// ---------------------------------------------------------------------------

interface ToolbarSeparatorProps {
  className?: string;
}

export function ToolbarSeparator({ className = "" }: ToolbarSeparatorProps) {
  return (
    <div
      className={`mx-1 h-10 w-px flex-shrink-0 ${className}`}
      style={{ backgroundColor: "var(--border)" }}
    />
  );
}

// ---------------------------------------------------------------------------
// ToolbarDropdown
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// RibbonGroup
// ---------------------------------------------------------------------------

interface RibbonGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Groups toolbar buttons together with a label at the bottom, separated from
 * the next group by a right border — matching the MS Office ribbon pattern.
 */
export function RibbonGroup({ label, children, className = "" }: RibbonGroupProps) {
  return (
    <div
      className={`relative flex flex-col items-stretch pr-3 mr-0 ${className}`}
      style={{ borderRight: "1px solid var(--border)" }}
    >
      {/* Button area */}
      <div className="flex flex-row items-center gap-0.5 flex-1 pb-1">
        {children}
      </div>

      {/* Group label — tiny, centered, like Office ribbon group names */}
      <span
        className="text-[9px] leading-none text-center tracking-wide uppercase select-none truncate px-1"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RibbonGroupSeparator
// ---------------------------------------------------------------------------

interface RibbonGroupSeparatorProps {
  className?: string;
}

/**
 * A taller, lighter vertical divider intended to separate RibbonGroup sections
 * in an MS Office-style ribbon toolbar.
 */
export function RibbonGroupSeparator({ className = "" }: RibbonGroupSeparatorProps) {
  return (
    <div
      className={`mx-2 self-stretch flex-shrink-0 w-px opacity-60 ${className}`}
      style={{ backgroundColor: "var(--border)" }}
    />
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
