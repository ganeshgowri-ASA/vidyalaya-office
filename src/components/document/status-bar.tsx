"use client";

import React from "react";
import { useDocumentStore } from "@/store/document-store";
import { PAGE_SIZES } from "./constants";

export function StatusBar() {
  const { wordCount, charCount, pageSize, currentFont, currentFontSize, zoom, lastSaved } = useDocumentStore();

  return (
    <div
      className="no-print flex items-center justify-between border-t px-4 py-1.5 text-[11px] flex-shrink-0"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        color: "var(--muted-foreground)",
      }}
    >
      <div className="flex items-center gap-4">
        <span>Words: {wordCount.toLocaleString()}</span>
        <span>Characters: {charCount.toLocaleString()}</span>
        <span>Page: {PAGE_SIZES[pageSize].label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>{currentFont} {currentFontSize}pt</span>
        <span>Zoom: {zoom}%</span>
        {lastSaved && <span>Saved: {lastSaved}</span>}
      </div>
    </div>
  );
}
