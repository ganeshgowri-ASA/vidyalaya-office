"use client";
import { useEffect, useRef } from "react";
import {
  usePresentationStore,
  Slide,
  TextElement,
  ShapeElement,
  ImageElement,
} from "@/store/presentation-store";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Monitor,
} from "lucide-react";

function PresenterSlide({ slide }: { slide: Slide }) {
  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: slide.background }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: slide.accentColor,
        }}
      />
      {/* Elements */}
      {[...slide.elements]
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((el) => {
          if (el.type === "text") {
            const textEl = el as TextElement;
            return (
              <div
                key={el.id}
                style={{
                  position: "absolute",
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}%`,
                  height: `${el.height}%`,
                  fontSize: `${textEl.fontSize / 9.6}vw`,
                  fontWeight: textEl.fontWeight,
                  fontStyle: textEl.fontStyle,
                  color: textEl.color,
                  textAlign: textEl.textAlign,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflow: "hidden",
                  zIndex: el.zIndex,
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                {textEl.content || ""}
              </div>
            );
          }
          if (el.type === "shape") {
            const shapeEl = el as ShapeElement;
            const fill = shapeEl.fill === "none" ? "transparent" : shapeEl.fill;
            const isCircle = shapeEl.shapeType === "circle";
            return (
              <div
                key={el.id}
                style={{
                  position: "absolute",
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}%`,
                  height: `${el.height}%`,
                  backgroundColor: fill,
                  border:
                    shapeEl.stroke === "none"
                      ? "none"
                      : `${shapeEl.strokeWidth}px solid ${shapeEl.stroke}`,
                  borderRadius: isCircle ? "50%" : 0,
                  zIndex: el.zIndex,
                }}
              />
            );
          }
          if (el.type === "image") {
            const imgEl = el as ImageElement;
            return (
              <img
                key={el.id}
                src={imgEl.src}
                alt={imgEl.alt}
                style={{
                  position: "absolute",
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}%`,
                  height: `${el.height}%`,
                  objectFit: "cover",
                  zIndex: el.zIndex,
                }}
              />
            );
          }
          return null;
        })}
    </div>
  );
}

export default function PresenterMode() {
  const {
    slides,
    presenterSlideIndex,
    presenterBlackScreen,
    exitPresenterMode,
    nextPresenterSlide,
    prevPresenterSlide,
    togglePresenterBlackScreen,
  } = usePresentationStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[presenterSlideIndex];
  const nextSlide = slides[presenterSlideIndex + 1];

  // Fullscreen
  useEffect(() => {
    const el = containerRef.current;
    if (el && document.fullscreenEnabled) {
      el.requestFullscreen().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        nextPresenterSlide();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prevPresenterSlide();
      } else if (e.key === "Escape") {
        exitPresenterMode();
      } else if (e.key === "b" || e.key === "B") {
        togglePresenterBlackScreen();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextPresenterSlide, prevPresenterSlide, exitPresenterMode, togglePresenterBlackScreen]);

  if (!currentSlide) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ backgroundColor: "#000" }}
    >
      {/* Black screen */}
      {presenterBlackScreen ? (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <p className="text-white text-opacity-30 text-sm">Press B to resume</p>
        </div>
      ) : (
        <>
          {/* Main slide - full screen */}
          <div className="flex-1 relative">
            <div className="w-full h-full">
              <PresenterSlide slide={currentSlide} />
            </div>

            {/* Controls overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 opacity-0 hover:opacity-100 transition-opacity"
              style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}
            >
              <button
                onClick={prevPresenterSlide}
                disabled={presenterSlideIndex === 0}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white disabled:opacity-30"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex items-center gap-4">
                <span className="text-white text-sm font-medium">
                  {presenterSlideIndex + 1} / {slides.length}
                </span>
                <button
                  onClick={togglePresenterBlackScreen}
                  className="px-3 py-1 rounded bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs"
                  title="Black screen (B)"
                >
                  Black (B)
                </button>
                {nextSlide && (
                  <div className="flex items-center gap-2 text-white text-xs opacity-70">
                    <Monitor size={12} />
                    <span>Next: {presenterSlideIndex + 2}</span>
                  </div>
                )}
                <button
                  onClick={exitPresenterMode}
                  className="p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                  title="Exit (Esc)"
                >
                  <X size={16} />
                </button>
              </div>

              <button
                onClick={nextPresenterSlide}
                disabled={presenterSlideIndex === slides.length - 1}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white disabled:opacity-30"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Speaker notes overlay (bottom) */}
            {currentSlide.notes && (
              <div
                className="absolute bottom-16 left-0 right-0 mx-6 rounded-lg px-4 py-2 text-sm opacity-0 hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "rgba(0,0,0,0.75)", color: "#e0e0e0" }}
              >
                <p className="text-xs font-semibold text-yellow-300 mb-1">Speaker Notes:</p>
                <p style={{ whiteSpace: "pre-wrap" }}>{currentSlide.notes}</p>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          <div
            className="flex items-center gap-2 px-4 py-2 overflow-x-auto"
            style={{ backgroundColor: "rgba(0,0,0,0.8)", height: 70, flexShrink: 0 }}
          >
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => {
                  usePresentationStore.getState().setCurrentSlide(idx);
                  usePresentationStore.getState().enterPresenterMode();
                }}
                className="flex-shrink-0 rounded overflow-hidden border-2 transition-all"
                style={{
                  width: 80,
                  height: 45,
                  borderColor: idx === presenterSlideIndex ? "#4fc3f7" : "transparent",
                  background: slide.background,
                }}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Keyboard hints */}
      <div
        className="absolute top-3 right-4 text-xs opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: "white" }}
      >
        ← → Navigate  •  B Black screen  •  Esc Exit
      </div>
    </div>
  );
}
