"use client";
import { useState, useRef } from "react";
import { Plus, Trash2, Copy, ChevronDown } from "lucide-react";
import { usePresentationStore, Slide, Layout } from "@/store/presentation-store";

const LAYOUTS: { value: Layout; label: string }[] = [
  { value: "title", label: "Title Slide" },
  { value: "content", label: "Content" },
  { value: "two-column", label: "Two Column" },
  { value: "blank", label: "Blank" },
  { value: "image", label: "Image" },
  { value: "comparison", label: "Comparison" },
];

function SlideThumbnail({ slide, index }: { slide: Slide; index: number }) {
  const W = 160;
  const H = 90;
  const scaleX = W / 960;
  const scaleY = H / 540;

  return (
    <div
      style={{
        width: W,
        height: H,
        background: slide.background,
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: slide.accentColor,
        }}
      />
      {/* Elements */}
      {slide.elements.map((el) => {
        if (el.type === "text") {
          return (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
                fontSize: el.fontSize * scaleX,
                fontWeight: el.fontWeight,
                fontStyle: el.fontStyle,
                color: el.color,
                textAlign: el.textAlign,
                overflow: "hidden",
                whiteSpace: "pre-wrap",
                lineHeight: 1.2,
                display: "flex",
                alignItems: "flex-start",
                wordBreak: "break-word",
              }}
            >
              {el.content || el.placeholder || ""}
            </div>
          );
        }
        if (el.type === "shape") {
          const isCircle = el.shapeType === "circle";
          return (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
                backgroundColor: el.fill === "none" ? "transparent" : el.fill,
                border: el.stroke === "none" ? "none" : `${el.strokeWidth * scaleX}px solid ${el.stroke}`,
                borderRadius: isCircle ? "50%" : 0,
              }}
            />
          );
        }
        if (el.type === "image") {
          return (
            <img
              key={el.id}
              src={el.src}
              alt={el.alt}
              style={{
                position: "absolute",
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
                objectFit: "cover",
              }}
            />
          );
        }
        return null;
      })}
      {/* Slide number */}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          fontSize: 7,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        {index + 1}
      </div>
    </div>
  );
}

export default function SlidePanel() {
  const {
    slides,
    currentSlideIndex,
    setCurrentSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlides,
  } = usePresentationStore();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    slideId: string;
    slideIndex: number;
  } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function handleContextMenu(
    e: React.MouseEvent,
    slideId: string,
    slideIndex: number
  ) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, slideId, slideIndex });
  }

  function closeContextMenu() {
    setContextMenu(null);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(toIndex: number) {
    if (dragIndex !== null && dragIndex !== toIndex) {
      reorderSlides(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div
      className="flex flex-col w-48 border-r flex-shrink-0 no-print"
      style={{
        backgroundColor: "var(--sidebar)",
        borderColor: "var(--border)",
      }}
      onClick={closeContextMenu}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--muted-foreground)" }}
        >
          Slides ({slides.length})
        </span>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAddMenu((v) => !v);
            }}
            className="flex items-center gap-0.5 px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: "var(--primary)" }}
            title="Add Slide"
          >
            <Plus size={12} />
            <ChevronDown size={10} />
          </button>
          {showAddMenu && (
            <div
              className="absolute top-full right-0 mt-1 rounded shadow-lg z-50 flex flex-col p-1 min-w-[130px]"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              {LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => {
                    addSlide(l.value);
                    setShowAddMenu(false);
                  }}
                  className="text-left px-2 py-1.5 rounded text-xs hover:opacity-80"
                  style={{ color: "var(--foreground)" }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            onContextMenu={(e) => handleContextMenu(e, slide.id, index)}
            onClick={() => setCurrentSlide(index)}
            className="cursor-pointer rounded transition-all"
            style={{
              outline:
                currentSlideIndex === index
                  ? `2px solid var(--primary)`
                  : dragOverIndex === index
                  ? `2px dashed var(--primary)`
                  : "2px solid transparent",
              opacity: dragIndex === index ? 0.4 : 1,
            }}
          >
            <SlideThumbnail slide={slide} index={index} />
          </div>
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed rounded shadow-lg z-[100] flex flex-col p-1 min-w-[140px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              duplicateSlide(contextMenu.slideId);
              closeContextMenu();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs hover:opacity-80"
            style={{ color: "var(--foreground)" }}
          >
            <Copy size={12} /> Duplicate
          </button>
          <button
            onClick={() => {
              deleteSlide(contextMenu.slideId);
              closeContextMenu();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs hover:opacity-80"
            style={{ color: "#ef4444" }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
