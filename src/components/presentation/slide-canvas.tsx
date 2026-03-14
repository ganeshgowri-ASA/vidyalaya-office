"use client";
import { useRef, useEffect, useCallback, useState } from "react";
import {
  usePresentationStore,
  Slide,
  SlideElement,
  TextElement,
  ShapeElement,
  ImageElement,
} from "@/store/presentation-store";
import { Trash2 } from "lucide-react";

const CANVAS_W = 960;
const CANVAS_H = 540;

function renderShapeSVG(el: ShapeElement, w: number, h: number) {
  const fill = el.fill === "none" ? "transparent" : el.fill;
  const stroke = el.stroke === "none" ? "none" : el.stroke;
  const sw = el.strokeWidth;

  if (el.shapeType === "rectangle") {
    return (
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <rect
          x={sw / 2}
          y={sw / 2}
          width={w - sw}
          height={h - sw}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  }
  if (el.shapeType === "circle") {
    const rx = (w - sw) / 2;
    const ry = (h - sw) / 2;
    return (
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <ellipse
          cx={w / 2}
          cy={h / 2}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  }
  if (el.shapeType === "arrow") {
    const hy = h / 2;
    const ax = w * 0.65;
    return (
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <polygon
          points={`0,${hy - h * 0.2} ${ax},${hy - h * 0.2} ${ax},${hy - h * 0.4} ${w},${hy} ${ax},${hy + h * 0.4} ${ax},${hy + h * 0.2} 0,${hy + h * 0.2}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  }
  if (el.shapeType === "star") {
    const cx = w / 2;
    const cy = h / 2;
    const outerR = Math.min(w, h) / 2 - sw;
    const innerR = outerR * 0.4;
    const points: string[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return (
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <polygon
          points={points.join(" ")}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  }
  return null;
}

interface ElementBoxProps {
  el: SlideElement;
  scale: number;
  slideId: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function ElementBox({ el, scale, slideId, isSelected, onSelect }: ElementBoxProps) {
  const { updateElement, deleteElement } = usePresentationStore();
  const textRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const pxLeft = (el.x / 100) * CANVAS_W * scale;
  const pxTop = (el.y / 100) * CANVAS_H * scale;
  const pxW = (el.width / 100) * CANVAS_W * scale;
  const pxH = (el.height / 100) * CANVAS_H * scale;

  // Sync content to contentEditable
  useEffect(() => {
    if (el.type === "text" && textRef.current && !isEditing) {
      const textEl = el as TextElement;
      if (textRef.current.innerText !== textEl.content) {
        textRef.current.innerText = textEl.content;
      }
    }
  }, [el, isEditing]);

  function handleTextInput() {
    if (!textRef.current) return;
    updateElement(slideId, el.id, { content: textRef.current.innerText } as Partial<SlideElement>);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsEditing(false);
      textRef.current?.blur();
    }
    if (e.key === "Delete" && !isEditing) {
      deleteElement(slideId, el.id);
    }
  }

  function handleCanvasKeyDown(e: React.KeyboardEvent) {
    if ((e.key === "Delete" || e.key === "Backspace") && isSelected && !isEditing) {
      e.stopPropagation();
      deleteElement(slideId, el.id);
    }
  }

  return (
    <div
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(el.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (el.type === "text") {
          setIsEditing(true);
          textRef.current?.focus();
          // Move cursor to end
          const range = document.createRange();
          const sel = window.getSelection();
          if (textRef.current && sel) {
            range.selectNodeContents(textRef.current);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }}
      onKeyDown={handleCanvasKeyDown}
      style={{
        position: "absolute",
        left: pxLeft,
        top: pxTop,
        width: pxW,
        height: pxH,
        zIndex: el.zIndex,
        outline: isSelected ? "2px solid #4fc3f7" : "none",
        cursor: isEditing ? "text" : "move",
        boxSizing: "border-box",
      }}
    >
      {el.type === "text" && (() => {
        const textEl = el as TextElement;
        const showPlaceholder = !textEl.content && !isEditing;
        return (
          <div
            ref={textRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onInput={handleTextInput}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              height: "100%",
              fontSize: textEl.fontSize * scale,
              fontWeight: textEl.fontWeight,
              fontStyle: textEl.fontStyle,
              color: showPlaceholder ? "rgba(255,255,255,0.4)" : textEl.color,
              textAlign: textEl.textAlign,
              outline: "none",
              overflow: "hidden",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              cursor: isEditing ? "text" : "inherit",
              userSelect: isEditing ? "text" : "none",
            }}
            data-placeholder={textEl.placeholder}
          >
            {showPlaceholder ? textEl.placeholder ?? "" : undefined}
          </div>
        );
      })()}

      {el.type === "shape" && (() => {
        const shapeEl = el as ShapeElement;
        return renderShapeSVG(shapeEl, pxW, pxH);
      })()}

      {el.type === "image" && (() => {
        const imgEl = el as ImageElement;
        return (
          <img
            src={imgEl.src}
            alt={imgEl.alt}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        );
      })()}

      {/* Delete handle when selected */}
      {isSelected && !isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteElement(slideId, el.id);
          }}
          className="absolute -top-3 -right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#ef4444", color: "white", zIndex: 100 }}
        >
          <Trash2 size={10} />
        </button>
      )}
    </div>
  );
}

export default function SlideCanvas() {
  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    setSelectedElement,
    deleteElement,
  } = usePresentationStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const currentSlide: Slide | undefined = slides[currentSlideIndex];

  // Calculate scale to fit canvas in container
  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const containerW = containerRef.current.clientWidth - 48;
    const containerH = containerRef.current.clientHeight - 48;
    const scaleX = containerW / CANVAS_W;
    const scaleY = containerH / CANVAS_H;
    setScale(Math.min(scaleX, scaleY, 1));
  }, []);

  useEffect(() => {
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  // Keyboard delete handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        selectedElementId &&
        currentSlide &&
        (e.key === "Delete" || e.key === "Backspace") &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target as HTMLElement).isContentEditable
      ) {
        deleteElement(currentSlide.id, selectedElementId);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, currentSlide, deleteElement]);

  if (!currentSlide) {
    return (
      <div className="flex-1 flex items-center justify-center" ref={containerRef}>
        <p style={{ color: "var(--muted-foreground)" }}>No slide selected</p>
      </div>
    );
  }

  const canvasW = CANVAS_W * scale;
  const canvasH = CANVAS_H * scale;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
      onClick={() => setSelectedElement(null)}
    >
      {/* Canvas */}
      <div
        className="relative shadow-2xl select-none"
        style={{
          width: canvasW,
          height: canvasH,
          background: currentSlide.background,
          overflow: "hidden",
          flexShrink: 0,
        }}
        onClick={() => setSelectedElement(null)}
      >
        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: Math.max(3, 6 * scale),
            backgroundColor: currentSlide.accentColor,
            zIndex: 20,
          }}
        />

        {/* Slide number overlay */}
        <div
          style={{
            position: "absolute",
            bottom: Math.max(10, 16 * scale),
            right: Math.max(12, 20 * scale),
            fontSize: Math.max(9, 13 * scale),
            color: "rgba(255,255,255,0.5)",
            zIndex: 21,
            pointerEvents: "none",
          }}
        >
          {currentSlideIndex + 1} / {slides.length}
        </div>

        {/* Elements */}
        {[...currentSlide.elements]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => (
            <ElementBox
              key={el.id}
              el={el}
              scale={scale}
              slideId={currentSlide.id}
              isSelected={selectedElementId === el.id}
              onSelect={setSelectedElement}
            />
          ))}
      </div>
    </div>
  );
}
