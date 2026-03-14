"use client";
import { useRef } from "react";
import {
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  ArrowRight,
  Star,
  Palette,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  ChevronUp,
  ChevronDown,
  Play,
  FileDown,
  LayoutTemplate,
  Bot,
  MousePointer,
} from "lucide-react";
import {
  usePresentationStore,
  BACKGROUND_PRESETS,
  TextElement,
  ShapeElement,
  SlideElement,
} from "@/store/presentation-store";

export default function PresentationToolbar() {
  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    activeTool,
    setActiveTool,
    addElement,
    updateElement,
    updateSlideBackground,
    bringToFront,
    sendToBack,
    enterPresenterMode,
    toggleAIPanel,
    toggleTemplates,
    showAIPanel,
  } = usePresentationStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSlide = slides[currentSlideIndex];

  const selectedEl = currentSlide?.elements.find(
    (el) => el.id === selectedElementId
  );
  const selectedText = selectedEl?.type === "text" ? (selectedEl as TextElement) : null;
  const selectedShape = selectedEl?.type === "shape" ? (selectedEl as ShapeElement) : null;

  function handleAddTextBox() {
    if (!currentSlide) return;
    setActiveTool("select");
    const el: Omit<TextElement, "id"> = {
      type: "text",
      x: 20,
      y: 30,
      width: 60,
      height: 20,
      zIndex: 10,
      content: "Text Box",
      fontSize: 20,
      fontWeight: "normal",
      fontStyle: "normal",
      color: "#ffffff",
      textAlign: "left",
    };
    addElement(currentSlide.id, el);
  }

  function handleAddShape(shapeType: "rectangle" | "circle" | "arrow" | "star") {
    if (!currentSlide) return;
    setActiveTool("select");
    const el: Omit<ShapeElement, "id"> = {
      type: "shape",
      x: 30,
      y: 30,
      width: 20,
      height: 15,
      zIndex: 10,
      shapeType,
      fill: "#4fc3f7",
      stroke: "none",
      strokeWidth: 2,
    };
    addElement(currentSlide.id, el);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentSlide) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      addElement(currentSlide.id, {
        type: "image",
        x: 10,
        y: 10,
        width: 80,
        height: 60,
        zIndex: 5,
        src,
        alt: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function updateText(updates: Partial<TextElement>) {
    if (!currentSlide || !selectedElementId) return;
    updateElement(currentSlide.id, selectedElementId, updates as Partial<SlideElement>);
  }

  function updateShape(updates: Partial<ShapeElement>) {
    if (!currentSlide || !selectedElementId) return;
    updateElement(currentSlide.id, selectedElementId, updates as Partial<SlideElement>);
  }

  function handlePrint() {
    window.print();
  }

  const btnCls = (active = false) =>
    `flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
      active
        ? "text-white"
        : "hover:opacity-80"
    }`;

  return (
    <div
      className="flex items-center gap-1 px-3 py-2 border-b flex-wrap no-print"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      {/* Tools */}
      <div className="flex items-center gap-1 pr-2 border-r" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => setActiveTool("select")}
          className={btnCls(activeTool === "select")}
          style={activeTool === "select" ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" } : {}}
          title="Select"
        >
          <MousePointer size={14} />
        </button>
        <button
          onClick={handleAddTextBox}
          className={btnCls()}
          style={{ color: "var(--foreground)" }}
          title="Add Text Box"
        >
          <Type size={14} />
          <span className="hidden sm:inline">Text</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={btnCls()}
          style={{ color: "var(--foreground)" }}
          title="Add Image"
        >
          <ImageIcon size={14} />
          <span className="hidden sm:inline">Image</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {/* Shapes dropdown */}
        <div className="relative group">
          <button className={btnCls()} style={{ color: "var(--foreground)" }} title="Add Shape">
            <Square size={14} />
            <span className="hidden sm:inline">Shape</span>
          </button>
          <div
            className="absolute top-full left-0 mt-1 rounded shadow-lg z-50 hidden group-hover:flex flex-col p-1 gap-1 min-w-[120px]"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            {(["rectangle", "circle", "arrow", "star"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleAddShape(s)}
                className="flex items-center gap-2 px-2 py-1 rounded text-xs hover:opacity-80 capitalize"
                style={{ color: "var(--foreground)" }}
              >
                {s === "rectangle" && <Square size={12} />}
                {s === "circle" && <Circle size={12} />}
                {s === "arrow" && <ArrowRight size={12} />}
                {s === "star" && <Star size={12} />}
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="flex items-center gap-1 px-2 border-r" style={{ borderColor: "var(--border)" }}>
        <Palette size={14} style={{ color: "var(--muted-foreground)" }} />
        <span className="text-xs hidden sm:inline" style={{ color: "var(--muted-foreground)" }}>BG:</span>
        <div className="flex gap-1">
          {BACKGROUND_PRESETS.map((bg) => (
            <button
              key={bg.id}
              title={bg.name}
              onClick={() => currentSlide && updateSlideBackground(currentSlide.id, bg.value)}
              className="w-5 h-5 rounded border-2 transition-all hover:scale-110"
              style={{
                background: bg.value,
                borderColor:
                  currentSlide?.background === bg.value
                    ? "white"
                    : "transparent",
              }}
            />
          ))}
        </div>
      </div>

      {/* Text formatting - shown when text element selected */}
      {selectedText && (
        <div className="flex items-center gap-1 px-2 border-r" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => updateText({ fontWeight: selectedText.fontWeight === "bold" ? "normal" : "bold" })}
            className={btnCls(selectedText.fontWeight === "bold")}
            style={
              selectedText.fontWeight === "bold"
                ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                : { color: "var(--foreground)" }
            }
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => updateText({ fontStyle: selectedText.fontStyle === "italic" ? "normal" : "italic" })}
            className={btnCls(selectedText.fontStyle === "italic")}
            style={
              selectedText.fontStyle === "italic"
                ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                : { color: "var(--foreground)" }
            }
            title="Italic"
          >
            <Italic size={14} />
          </button>
          <select
            value={selectedText.fontSize}
            onChange={(e) => updateText({ fontSize: Number(e.target.value) })}
            className="text-xs px-1 py-0.5 rounded border"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="color"
            value={selectedText.color}
            onChange={(e) => updateText({ color: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border-0"
            title="Text Color"
          />
          <button
            onClick={() => updateText({ textAlign: "left" })}
            className={btnCls(selectedText.textAlign === "left")}
            style={
              selectedText.textAlign === "left"
                ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }
                : { color: "var(--foreground)" }
            }
          >
            <AlignLeft size={14} />
          </button>
          <button
            onClick={() => updateText({ textAlign: "center" })}
            className={btnCls(selectedText.textAlign === "center")}
            style={
              selectedText.textAlign === "center"
                ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }
                : { color: "var(--foreground)" }
            }
          >
            <AlignCenter size={14} />
          </button>
          <button
            onClick={() => updateText({ textAlign: "right" })}
            className={btnCls(selectedText.textAlign === "right")}
            style={
              selectedText.textAlign === "right"
                ? { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }
                : { color: "var(--foreground)" }
            }
          >
            <AlignRight size={14} />
          </button>
        </div>
      )}

      {/* Shape formatting */}
      {selectedShape && (
        <div className="flex items-center gap-1 px-2 border-r" style={{ borderColor: "var(--border)" }}>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Fill:</span>
          <input
            type="color"
            value={selectedShape.fill === "none" ? "#000000" : selectedShape.fill}
            onChange={(e) => updateShape({ fill: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border-0"
            title="Fill Color"
          />
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Border:</span>
          <input
            type="color"
            value={selectedShape.stroke === "none" ? "#000000" : selectedShape.stroke}
            onChange={(e) => updateShape({ stroke: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border-0"
            title="Border Color"
          />
        </div>
      )}

      {/* Arrange */}
      {selectedElementId && currentSlide && (
        <div className="flex items-center gap-1 px-2 border-r" style={{ borderColor: "var(--border)" }}>
          <Layers size={14} style={{ color: "var(--muted-foreground)" }} />
          <button
            onClick={() => bringToFront(currentSlide.id, selectedElementId)}
            className={btnCls()}
            style={{ color: "var(--foreground)" }}
            title="Bring to Front"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => sendToBack(currentSlide.id, selectedElementId)}
            className={btnCls()}
            style={{ color: "var(--foreground)" }}
            title="Send to Back"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTemplates}
          className={btnCls()}
          style={{ color: "var(--foreground)" }}
          title="Templates"
        >
          <LayoutTemplate size={14} />
          <span className="hidden sm:inline">Templates</span>
        </button>
        <button
          onClick={toggleAIPanel}
          className={btnCls(showAIPanel)}
          style={
            showAIPanel
              ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
              : { color: "var(--foreground)" }
          }
          title="AI Assistant"
        >
          <Bot size={14} />
          <span className="hidden sm:inline">AI</span>
        </button>
        <button
          onClick={handlePrint}
          className={btnCls()}
          style={{ color: "var(--foreground)" }}
          title="Export PDF"
        >
          <FileDown size={14} />
          <span className="hidden sm:inline">PDF</span>
        </button>
        <button
          onClick={enterPresenterMode}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium text-white"
          style={{ backgroundColor: "var(--primary)" }}
          title="Present (F5)"
        >
          <Play size={14} />
          <span>Present</span>
        </button>
      </div>
    </div>
  );
}
