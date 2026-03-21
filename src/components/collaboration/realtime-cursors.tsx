"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useRealtimeStore } from "@/store/realtime-store";
import { useAuthStore } from "@/store/auth-store";

export function RealtimeCursors() {
  const { isGuest } = useAuthStore();
  const { cursors, isSimulating, updateCursor, startSimulation, stopSimulation } =
    useRealtimeStore();
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(Date.now());

  const animate = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    if (delta > 0) {
      const state = useRealtimeStore.getState();
      state.cursors.forEach((cursor) => {
        // Simulate gentle cursor drift
        const speed = 0.02;
        const newX =
          cursor.x + Math.sin(now * 0.001 + cursor.userId.length) * speed * delta;
        const newY =
          cursor.y + Math.cos(now * 0.0015 + cursor.userId.length * 2) * speed * delta;

        // Keep within reasonable bounds
        const clampedX = Math.max(100, Math.min(800, newX));
        const clampedY = Math.max(80, Math.min(600, newY));

        // Toggle typing state occasionally
        const isTyping =
          Math.sin(now * 0.0005 + cursor.userId.length * 3) > 0.3;

        updateCursor({
          ...cursor,
          x: clampedX,
          y: clampedY,
          isTyping,
          lastUpdated: now,
        });
      });
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [updateCursor]);

  useEffect(() => {
    if (isGuest) return;

    startSimulation();
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      stopSimulation();
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isGuest, animate, startSimulation, stopSimulation]);

  if (isGuest || !isSimulating) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-150 ease-out"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-1px, -1px)",
          }}
        >
          {/* Cursor SVG */}
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
            className="drop-shadow-md"
          >
            <path
              d="M0 0L16 12L8 12L4 20L0 0Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>

          {/* Name label */}
          <div
            className="mt-0.5 ml-3 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-white whitespace-nowrap shadow-md"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
            {cursor.isTyping && (
              <span className="flex gap-px ml-1">
                <span
                  className="inline-block h-1 w-1 rounded-full bg-white/80 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="inline-block h-1 w-1 rounded-full bg-white/80 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="inline-block h-1 w-1 rounded-full bg-white/80 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
