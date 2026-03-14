"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Link,
  Image,
  Table,
  Minus,
  Quote,
  Code,
  Highlighter,
  Search,
  Printer,
  ZoomIn,
  Sparkles,
  FileText,
  Download,
  LayoutTemplate,
  Superscript,
  Subscript,
  BookOpen,
  AlertCircle,
  Columns,
  CheckSquare,
} from "lucide-react";

const FONTS = [
  "Georgia",
  "Times New Roman",
  "Arial",
  "Helvetica",
  "Calibri",
  "Cambria",
  "Garamond",
  "Palatino",
  "Book Antiqua",
  "Century Schoolbook",
  "Courier New",
  "Consolas",
  "Monaco",
  "Fira Code",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Merriweather",
  "Source Sans Pro",
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#ffffff",
  "#ff0000", "#cc0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff",
  "#0000ff", "#9900ff", "#ff00ff", "#ff0066", "#ff6600", "#ffcc00",
  "#003300", "#003366", "#000099", "#330066", "#993300", "#7f6000",
];

const HIGHLIGHT_COLORS = [
  "#ffff00", "#00ff00", "#00ffff", "#ff00ff",
  "#ff0000", "#0000ff", "#ffcc00", "#ff9900",
  "#ffffff", "#cccccc", "#999999", "#000000",
];

const PAGE_SIZES = [
  { value: "a4", label: "A4 (210×297mm)" },
  { value: "a3", label: "A3 (297×420mm)" },
  { value: "a5", label: "A5 (148×210mm)" },
  { value: "letter", label: "Letter (8.5×11in)" },
  { value: "legal", label: "Legal (8.5×14in)" },
];

const MARGIN_OPTIONS = [
  { value: "normal", label: "Normal (1 inch)" },
  { value: "narrow", label: "Narrow (0.5 inch)" },
  { value: "moderate", label: "Moderate (0.75 inch)" },
  { value: "wide", label: "Wide (1.5 inch)" },
];

const LINE_SPACINGS = [
  { value: "1", label: "Single (1.0)" },
  { value: "1.15", label: "1.15" },
  { value: "1.5", label: "1.5 Lines" },
  { value: "2", label: "Double (2.0)" },
  { value: "2.5", label: "2.5" },
  { value: "3", label: "Triple (3.0)" },
];

type Tab = "home" | "insert" | "layout" | "view";

interface RibbonToolbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;

  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  textColor: string;
  highlightColor: string;
  alignment: string;

  pageSize: string;
  margins: string;
  lineSpacing: string;
  columns: number;
  zoom: number;
  spellCheck: boolean;

  onExecFormat: (command: string, value?: string) => void;
  onApplyFontFamily: (font: string) => void;
  onApplyFontSize: (size: number) => void;
  onApplyTextColor: (color: string) => void;
  onApplyHighlight: (color: string) => void;
  onApplyAlignment: (align: string) => void;
  onApplyHeading: (tag: string) => void;
  onInsertTable: () => void;
  onInsertImage: () => void;
  onInsertEquation: () => void;
  onInsertCodeBlock: () => void;
  onInsertBlockquote: () => void;
  onInsertHR: () => void;
  onInsertLink: () => void;
  onInsertFigure: () => void;
  onInsertCitation: () => void;
  onInsertCallout: () => void;
  onInsertTOC: () => void;
  onPageSizeChange: (size: string) => void;
  onMarginsChange: (m: string) => void;
  onLineSpacingChange: (s: string) => void;
  onColumnsChange: (c: number) => void;
  onZoomChange: (z: number) => void;
  onSpellCheckChange: (v: boolean) => void;
  onShowFindReplace: () => void;
  onPrint: () => void;
  onShowTemplates: () => void;
  onExport: (format: string) => void;
  onShowAIPanel: () => void;
}

function Divider() {
  return (
    <div
      className="mx-1 h-8 w-px self-center"
      style={{ backgroundColor: "var(--border)" }}
    />
  );
}

function ToolButton({
  onClick,
  active,
  title,
  children,
  disabled = false,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs transition-colors hover:opacity-80 disabled:opacity-40"
      style={
        active
          ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
          : { color: "var(--foreground)" }
      }
    >
      {children}
    </button>
  );
}

function ColorPicker({
  colors,
  selectedColor,
  onSelect,
  cols = 6,
}: {
  colors: string[];
  selectedColor: string;
  onSelect: (color: string) => void;
  cols?: number;
}) {
  return (
    <div
      className="grid gap-0.5 p-2"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className="h-5 w-5 rounded border transition-transform hover:scale-110"
          style={{
            backgroundColor: color,
            borderColor: color === selectedColor ? "var(--primary)" : "#999",
            borderWidth: color === selectedColor ? "2px" : "1px",
          }}
          title={color}
        />
      ))}
    </div>
  );
}

function DropdownMenu({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-max rounded-md border shadow-lg"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function RibbonToolbar({
  activeTab,
  onTabChange,
  fontFamily,
  fontSize,
  isBold,
  isItalic,
  isUnderline,
  isStrikethrough,
  textColor,
  highlightColor,
  alignment,
  pageSize,
  margins,
  lineSpacing,
  columns,
  zoom,
  spellCheck,
  onExecFormat,
  onApplyFontFamily,
  onApplyFontSize,
  onApplyTextColor,
  onApplyHighlight,
  onApplyAlignment,
  onApplyHeading,
  onInsertTable,
  onInsertImage,
  onInsertEquation,
  onInsertCodeBlock,
  onInsertBlockquote,
  onInsertHR,
  onInsertLink,
  onInsertFigure,
  onInsertCitation,
  onInsertCallout,
  onInsertTOC,
  onPageSizeChange,
  onMarginsChange,
  onLineSpacingChange,
  onColumnsChange,
  onZoomChange,
  onSpellCheckChange,
  onShowFindReplace,
  onPrint,
  onShowTemplates,
  onExport,
  onShowAIPanel,
}: RibbonToolbarProps) {
  const TABS: { id: Tab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "insert", label: "Insert" },
    { id: "layout", label: "Layout" },
    { id: "view", label: "View" },
  ];

  const renderHomeTab = () => (
    <div className="flex flex-wrap items-center gap-0.5 py-1.5 px-2">
      {/* Font family */}
      <DropdownMenu
        trigger={
          <button
            className="flex h-7 items-center gap-1 rounded border px-2 text-xs hover:opacity-80"
            style={{
              fontFamily,
              borderColor: "var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              minWidth: "120px",
            }}
          >
            <span className="flex-1 text-left truncate max-w-24">{fontFamily}</span>
            <span style={{ color: "var(--muted-foreground)" }}>▾</span>
          </button>
        }
      >
        <div className="max-h-60 overflow-y-auto py-1 min-w-44">
          {FONTS.map((f) => (
            <button
              key={f}
              onClick={() => onApplyFontFamily(f)}
              className="flex w-full items-center px-3 py-1.5 text-xs hover:opacity-80"
              style={{
                fontFamily: f,
                color: "var(--card-foreground)",
                backgroundColor: f === fontFamily ? "var(--accent)" : "transparent",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </DropdownMenu>

      {/* Font size */}
      <DropdownMenu
        trigger={
          <button
            className="flex h-7 w-14 items-center gap-1 rounded border px-2 text-xs hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
            }}
          >
            <span className="flex-1 text-left">{fontSize}</span>
            <span style={{ color: "var(--muted-foreground)" }}>▾</span>
          </button>
        }
      >
        <div className="max-h-48 overflow-y-auto py-1 w-20">
          {FONT_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => onApplyFontSize(s)}
              className="flex w-full items-center px-3 py-1 text-xs hover:opacity-80"
              style={{
                color: "var(--card-foreground)",
                backgroundColor: s === fontSize ? "var(--accent)" : "transparent",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </DropdownMenu>

      <Divider />

      {/* Bold / Italic / Underline / Strikethrough */}
      <ToolButton onClick={() => onExecFormat("bold")} active={isBold} title="Bold (Ctrl+B)">
        <Bold size={14} />
      </ToolButton>
      <ToolButton onClick={() => onExecFormat("italic")} active={isItalic} title="Italic (Ctrl+I)">
        <Italic size={14} />
      </ToolButton>
      <ToolButton onClick={() => onExecFormat("underline")} active={isUnderline} title="Underline (Ctrl+U)">
        <Underline size={14} />
      </ToolButton>
      <ToolButton
        onClick={() => onExecFormat("strikeThrough")}
        active={isStrikethrough}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </ToolButton>

      <Divider />

      {/* Text color */}
      <DropdownMenu
        trigger={
          <button
            className="flex h-7 flex-col items-center justify-center rounded px-1.5 hover:opacity-80"
            title="Text Color"
            style={{ color: "var(--foreground)" }}
          >
            <span className="text-xs font-bold">A</span>
            <span
              className="h-1 w-4 rounded-sm"
              style={{ backgroundColor: textColor }}
            />
          </button>
        }
      >
        <ColorPicker
          colors={TEXT_COLORS}
          selectedColor={textColor}
          onSelect={(c) => onApplyTextColor(c)}
          cols={6}
        />
      </DropdownMenu>

      {/* Highlight color */}
      <DropdownMenu
        trigger={
          <button
            className="flex h-7 items-center gap-0.5 rounded px-1 hover:opacity-80"
            title="Highlight Color"
            style={{ color: "var(--foreground)" }}
          >
            <Highlighter size={13} />
            <span
              className="h-1 w-3 rounded-sm"
              style={{ backgroundColor: highlightColor }}
            />
          </button>
        }
      >
        <ColorPicker
          colors={HIGHLIGHT_COLORS}
          selectedColor={highlightColor}
          onSelect={(c) => onApplyHighlight(c)}
          cols={4}
        />
      </DropdownMenu>

      <Divider />

      {/* Superscript / Subscript */}
      <ToolButton onClick={() => onExecFormat("superscript")} title="Superscript">
        <Superscript size={13} />
      </ToolButton>
      <ToolButton onClick={() => onExecFormat("subscript")} title="Subscript">
        <Subscript size={13} />
      </ToolButton>

      <Divider />

      {/* Headings */}
      <div className="flex items-center gap-0.5">
        {(["h1", "h2", "h3", "p"] as const).map((tag) => (
          <button
            key={tag}
            onClick={() => onApplyHeading(tag)}
            className="h-7 rounded px-2 text-xs font-semibold hover:opacity-80 transition-colors"
            style={{ color: "var(--foreground)" }}
            title={tag === "p" ? "Paragraph" : tag.toUpperCase()}
          >
            {tag === "p" ? "¶" : tag.toUpperCase()}
          </button>
        ))}
      </div>

      <Divider />

      {/* Alignment */}
      <ToolButton onClick={() => onApplyAlignment("left")} active={alignment === "left"} title="Align Left">
        <AlignLeft size={14} />
      </ToolButton>
      <ToolButton onClick={() => onApplyAlignment("center")} active={alignment === "center"} title="Center">
        <AlignCenter size={14} />
      </ToolButton>
      <ToolButton onClick={() => onApplyAlignment("right")} active={alignment === "right"} title="Align Right">
        <AlignRight size={14} />
      </ToolButton>
      <ToolButton onClick={() => onApplyAlignment("justify")} active={alignment === "justify"} title="Justify">
        <AlignJustify size={14} />
      </ToolButton>

      <Divider />

      {/* Lists */}
      <ToolButton onClick={() => onExecFormat("insertUnorderedList")} title="Bullet List">
        <List size={14} />
      </ToolButton>
      <ToolButton onClick={() => onExecFormat("insertOrderedList")} title="Numbered List">
        <ListOrdered size={14} />
      </ToolButton>

      <Divider />

      {/* Indent / Outdent */}
      <ToolButton onClick={() => onExecFormat("indent")} title="Indent">
        <Indent size={14} />
      </ToolButton>
      <ToolButton onClick={() => onExecFormat("outdent")} title="Outdent">
        <Outdent size={14} />
      </ToolButton>
    </div>
  );

  const renderInsertTab = () => (
    <div className="flex flex-wrap items-center gap-1 py-1.5 px-2">
      <ToolButton onClick={onInsertTable} title="Insert Table">
        <div className="flex flex-col items-center gap-0.5">
          <Table size={14} />
          <span className="text-[10px]">Table</span>
        </div>
      </ToolButton>
      <ToolButton onClick={onInsertImage} title="Insert Image">
        <div className="flex flex-col items-center gap-0.5">
          <Image size={14} />
          <span className="text-[10px]">Image</span>
        </div>
      </ToolButton>
      <ToolButton onClick={onInsertEquation} title="Insert Equation (LaTeX)">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-bold">∑</span>
          <span className="text-[10px]">Equation</span>
        </div>
      </ToolButton>
      <ToolButton onClick={onInsertCodeBlock} title="Insert Code Block">
        <div className="flex flex-col items-center gap-0.5">
          <Code size={14} />
          <span className="text-[10px]">Code</span>
        </div>
      </ToolButton>
      <ToolButton onClick={onInsertBlockquote} title="Insert Blockquote">
        <div className="flex flex-col items-center gap-0.5">
          <Quote size={14} />
          <span className="text-[10px]">Quote</span>
        </div>
      </ToolButton>
      <ToolButton onClick={onInsertHR} title="Horizontal Rule">
        <div className="flex flex-col items-center gap-0.5">
          <Minus size={14} />
          <span className="text-[10px]">Rule</span>
        </div>
      </ToolButton>

      <Divider />

      <ToolButton onClick={onInsertLink} title="Insert Hyperlink">
        <div className="flex flex-col items-center gap-0.5">
          <Link size={14} />
          <span className="text-[10px]">Link</span>
        </div>
      </ToolButton>
      <ToolButton onClick={onInsertFigure} title="Figure Placeholder">
        <div className="flex flex-col items-center gap-0.5">
          <FileText size={14} />
          <span className="text-[10px]">Figure</span>
        </div>
      </ToolButton>
      <ToolButton onClick={onInsertCitation} title="Citation (superscript)">
        <div className="flex flex-col items-center gap-0.5">
          <BookOpen size={14} />
          <span className="text-[10px]">Cite</span>
        </div>
      </ToolButton>
      <ToolButton onClick={onInsertCallout} title="Callout / Note Box">
        <div className="flex flex-col items-center gap-0.5">
          <AlertCircle size={14} />
          <span className="text-[10px]">Note</span>
        </div>
      </ToolButton>

      <Divider />

      <ToolButton onClick={onInsertTOC} title="Table of Contents">
        <div className="flex flex-col items-center gap-0.5">
          <ListOrdered size={14} />
          <span className="text-[10px]">TOC</span>
        </div>
      </ToolButton>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="flex flex-wrap items-center gap-2 py-1.5 px-2">
      {/* Page Size */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Page Size</label>
        <DropdownMenu
          trigger={
            <button
              className="flex h-7 items-center gap-1 rounded border px-2 text-xs hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                minWidth: "140px",
              }}
            >
              <span className="flex-1 text-left">
                {PAGE_SIZES.find((p) => p.value === pageSize)?.label || pageSize}
              </span>
              <span style={{ color: "var(--muted-foreground)" }}>▾</span>
            </button>
          }
        >
          <div className="py-1">
            {PAGE_SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => onPageSizeChange(s.value)}
                className="flex w-full items-center px-3 py-1.5 text-xs hover:opacity-80"
                style={{
                  color: "var(--card-foreground)",
                  backgroundColor: s.value === pageSize ? "var(--accent)" : "transparent",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </DropdownMenu>
      </div>

      <Divider />

      {/* Margins */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Margins</label>
        <DropdownMenu
          trigger={
            <button
              className="flex h-7 items-center gap-1 rounded border px-2 text-xs hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                minWidth: "130px",
              }}
            >
              <span className="flex-1 text-left">
                {MARGIN_OPTIONS.find((m) => m.value === margins)?.label || margins}
              </span>
              <span style={{ color: "var(--muted-foreground)" }}>▾</span>
            </button>
          }
        >
          <div className="py-1">
            {MARGIN_OPTIONS.map((m) => (
              <button
                key={m.value}
                onClick={() => onMarginsChange(m.value)}
                className="flex w-full items-center px-3 py-1.5 text-xs hover:opacity-80"
                style={{
                  color: "var(--card-foreground)",
                  backgroundColor: m.value === margins ? "var(--accent)" : "transparent",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </DropdownMenu>
      </div>

      <Divider />

      {/* Line Spacing */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Line Spacing</label>
        <DropdownMenu
          trigger={
            <button
              className="flex h-7 items-center gap-1 rounded border px-2 text-xs hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                minWidth: "110px",
              }}
            >
              <span className="flex-1 text-left">
                {LINE_SPACINGS.find((s) => s.value === lineSpacing)?.label || lineSpacing}
              </span>
              <span style={{ color: "var(--muted-foreground)" }}>▾</span>
            </button>
          }
        >
          <div className="py-1">
            {LINE_SPACINGS.map((s) => (
              <button
                key={s.value}
                onClick={() => onLineSpacingChange(s.value)}
                className="flex w-full items-center px-3 py-1.5 text-xs hover:opacity-80"
                style={{
                  color: "var(--card-foreground)",
                  backgroundColor: s.value === lineSpacing ? "var(--accent)" : "transparent",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </DropdownMenu>
      </div>

      <Divider />

      {/* Columns */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Columns</label>
        <div className="flex gap-1">
          {[1, 2, 3].map((c) => (
            <button
              key={c}
              onClick={() => onColumnsChange(c)}
              className="flex h-7 w-10 items-center justify-center rounded border text-xs hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                backgroundColor: columns === c ? "var(--primary)" : "var(--background)",
                color: columns === c ? "var(--primary-foreground)" : "var(--foreground)",
              }}
              title={`${c} column${c > 1 ? "s" : ""}`}
            >
              <Columns size={13} />
              <span className="ml-0.5">{c}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderViewTab = () => (
    <div className="flex flex-wrap items-center gap-2 py-1.5 px-2">
      {/* Zoom */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Zoom</label>
        <div className="flex items-center gap-1.5">
          <ZoomIn size={14} style={{ color: "var(--muted-foreground)" }} />
          <input
            type="range"
            min={50}
            max={200}
            step={10}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-28"
            style={{ accentColor: "var(--primary)" }}
          />
          <span className="w-12 text-xs text-right" style={{ color: "var(--foreground)" }}>
            {zoom}%
          </span>
          <div className="flex gap-1">
            {[75, 100, 125, 150].map((z) => (
              <button
                key={z}
                onClick={() => onZoomChange(z)}
                className="rounded border px-2 py-0.5 text-xs hover:opacity-80"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: zoom === z ? "var(--primary)" : "var(--background)",
                  color: zoom === z ? "var(--primary-foreground)" : "var(--foreground)",
                }}
              >
                {z}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* Spell Check */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Spell Check</label>
        <button
          onClick={() => onSpellCheckChange(!spellCheck)}
          className="flex h-7 items-center gap-1.5 rounded border px-3 text-xs hover:opacity-80"
          style={{
            borderColor: "var(--border)",
            backgroundColor: spellCheck ? "var(--primary)" : "var(--background)",
            color: spellCheck ? "var(--primary-foreground)" : "var(--foreground)",
          }}
        >
          <CheckSquare size={13} />
          {spellCheck ? "On" : "Off"}
        </button>
      </div>

      <Divider />

      {/* Find & Replace */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Search</label>
        <button
          onClick={onShowFindReplace}
          className="flex h-7 items-center gap-1.5 rounded border px-3 text-xs hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--background)" }}
          title="Find & Replace (Ctrl+F)"
        >
          <Search size={13} />
          Find &amp; Replace
        </button>
      </div>

      <Divider />

      {/* Print */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Print</label>
        <button
          onClick={onPrint}
          className="flex h-7 items-center gap-1.5 rounded border px-3 text-xs hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--background)" }}
          title="Print / Print to PDF"
        >
          <Printer size={13} />
          Print / PDF
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="no-print flex flex-col border-b"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Tab bar + global actions */}
      <div
        className="flex items-center justify-between border-b px-2"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Tabs */}
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="px-4 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
              style={
                activeTab === tab.id
                  ? {
                      borderBottom: "2px solid var(--primary)",
                      color: "var(--primary)",
                      marginBottom: "-1px",
                    }
                  : { color: "var(--muted-foreground)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onShowTemplates}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs hover:opacity-80"
            style={{ color: "var(--muted-foreground)" }}
            title="Templates"
          >
            <LayoutTemplate size={13} />
            <span className="hidden sm:inline">Templates</span>
          </button>
          <DropdownMenu
            trigger={
              <button
                className="flex items-center gap-1.5 rounded px-2 py-1 text-xs hover:opacity-80"
                style={{ color: "var(--muted-foreground)" }}
                title="Export"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Export</span>
              </button>
            }
          >
            <div className="py-1 min-w-40">
              {[
                { value: "html", label: "Export as HTML" },
                { value: "txt", label: "Export as Plain Text" },
                { value: "doc", label: "Export as Word (.doc)" },
                { value: "print", label: "Print to PDF" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onExport(opt.value)}
                  className="flex w-full items-center px-3 py-2 text-xs hover:opacity-80"
                  style={{ color: "var(--card-foreground)" }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </DropdownMenu>
          <button
            onClick={onShowAIPanel}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs hover:opacity-80"
            style={{ color: "var(--primary)" }}
            title="AI Assistant"
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">AI</span>
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-12">
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "insert" && renderInsertTab()}
        {activeTab === "layout" && renderLayoutTab()}
        {activeTab === "view" && renderViewTab()}
      </div>
    </div>
  );
}
