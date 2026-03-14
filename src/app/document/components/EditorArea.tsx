"use client";

import { useEffect, forwardRef } from "react";

interface PageDimensions {
  width: number;
  height: number;
}

const PAGE_SIZES: Record<string, PageDimensions> = {
  a4: { width: 794, height: 1123 },
  a3: { width: 1123, height: 1587 },
  a5: { width: 559, height: 794 },
  letter: { width: 816, height: 1056 },
  legal: { width: 816, height: 1344 },
};

interface MarginValues {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const MARGINS: Record<string, MarginValues> = {
  normal: { top: 96, right: 96, bottom: 96, left: 96 },
  narrow: { top: 48, right: 48, bottom: 48, left: 48 },
  moderate: { top: 72, right: 54, bottom: 72, left: 54 },
  wide: { top: 96, right: 144, bottom: 96, left: 144 },
};

interface EditorAreaProps {
  pageSize: string;
  margins: string;
  columns: number;
  lineSpacing: string;
  zoom: number;
  spellCheck: boolean;
  onInput: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

const EditorArea = forwardRef<HTMLDivElement, EditorAreaProps>(function EditorArea(
  { pageSize, margins, columns, lineSpacing, zoom, spellCheck, onInput, onKeyDown },
  ref
) {
  const page = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
  const margin = MARGINS[margins] || MARGINS.normal;

  useEffect(() => {
    // Initialize with some default content if empty
    const divRef = ref as React.RefObject<HTMLDivElement>;
    if (divRef?.current && !divRef.current.innerHTML.trim()) {
      divRef.current.innerHTML =
        '<p style="font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.15;">Start typing your document here...</p>';
    }
  }, [ref]);

  const contentStyle: React.CSSProperties = {
    fontFamily: "Calibri, sans-serif",
    fontSize: "11pt",
    lineHeight: lineSpacing,
    columnCount: columns > 1 ? columns : undefined,
    columnGap: columns > 1 ? "2em" : undefined,
    minHeight: `${page.height - margin.top - margin.bottom}px`,
    outline: "none",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    color: "#000000",
  };

  return (
    <div
      className="flex-1 overflow-auto"
      style={{
        backgroundColor: "#e8e8e8",
        padding: "32px 24px",
      }}
    >
      {/* Zoom wrapper */}
      <div
        style={{
          zoom: `${zoom}%`,
          transformOrigin: "top center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Page */}
        <div
          className="relative shadow-lg"
          style={{
            width: `${page.width}px`,
            minHeight: `${page.height}px`,
            backgroundColor: "#ffffff",
            paddingTop: `${margin.top}px`,
            paddingRight: `${margin.right}px`,
            paddingBottom: `${margin.bottom}px`,
            paddingLeft: `${margin.left}px`,
            boxSizing: "border-box",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {/* Content editable */}
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            spellCheck={spellCheck}
            onInput={onInput}
            onKeyDown={onKeyDown}
            style={contentStyle}
            data-editor="true"
            className="document-editor-content"
          />
        </div>
      </div>

      {/* Editor styles */}
      <style>{`
        .document-editor-content:focus {
          outline: none;
        }
        .document-editor-content p {
          margin: 0 0 0.5em 0;
        }
        .document-editor-content h1 {
          font-size: 24pt;
          font-weight: bold;
          margin: 0.67em 0;
          color: #000;
        }
        .document-editor-content h2 {
          font-size: 18pt;
          font-weight: bold;
          margin: 0.75em 0;
          color: #000;
        }
        .document-editor-content h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0.83em 0;
          color: #000;
        }
        .document-editor-content ul,
        .document-editor-content ol {
          padding-left: 2em;
          margin: 0.5em 0;
        }
        .document-editor-content li {
          margin-bottom: 0.25em;
        }
        .document-editor-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .document-editor-content td,
        .document-editor-content th {
          border: 1px solid #ccc;
          padding: 8px;
          min-width: 40px;
        }
        .document-editor-content th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .document-editor-content blockquote {
          border-left: 4px solid #ccc;
          padding-left: 16px;
          margin: 1em 0;
          color: #555;
          font-style: italic;
        }
        .document-editor-content pre {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 12px;
          font-family: 'Courier New', monospace;
          font-size: 10pt;
          overflow-x: auto;
          margin: 1em 0;
        }
        .document-editor-content code {
          font-family: 'Courier New', monospace;
          background-color: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 0.9em;
        }
        .document-editor-content hr {
          border: none;
          border-top: 1px solid #ccc;
          margin: 1.5em 0;
        }
        .document-editor-content a {
          color: #0d6efd;
          text-decoration: underline;
        }
        .document-editor-content .callout-box {
          background-color: #f0f7ff;
          border: 1px solid #b8d9f7;
          border-left: 4px solid #0d6efd;
          border-radius: 4px;
          padding: 12px 16px;
          margin: 1em 0;
        }
        .document-editor-content figure {
          margin: 1.5em auto;
          text-align: center;
        }
        .document-editor-content figcaption {
          font-size: 0.85em;
          color: #666;
          margin-top: 4px;
          font-style: italic;
        }
        [data-editor]:empty:before {
          content: 'Start typing your document...';
          color: #999;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
});

export default EditorArea;
