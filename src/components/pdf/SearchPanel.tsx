"use client";

import React, { useState } from "react";
import { Search, X, ChevronUp, ChevronDown, Replace } from "lucide-react";
import { btnStyle, inputStyle } from "./types";

interface SearchPanelProps {
  onSearch: (query: string, options: { caseSensitive: boolean; wholeWord: boolean }) => void;
  onReplace: (searchText: string, replaceText: string, replaceAll: boolean) => void;
  onClose: () => void;
  resultCount: number;
  currentResult: number;
  onNextResult: () => void;
  onPrevResult: () => void;
}

export default function SearchPanel({
  onSearch,
  onReplace,
  onClose,
  resultCount,
  currentResult,
  onNextResult,
  onPrevResult,
}: SearchPanelProps) {
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  const handleSearch = () => {
    if (searchText.trim()) {
      onSearch(searchText, { caseSensitive, wholeWord });
    }
  };

  return (
    <div
      className="flex flex-col gap-2 p-3"
      style={{
        backgroundColor: "var(--card)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Search row */}
      <div className="flex items-center gap-2">
        <Search size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          placeholder="Find in document..."
          style={{ ...inputStyle, flex: 1 }}
          autoFocus
        />
        <button style={{ ...btnStyle, padding: "4px 8px" }} onClick={handleSearch} title="Search">
          <Search size={14} />
        </button>
        <button style={{ ...btnStyle, padding: "4px 8px" }} onClick={onPrevResult} disabled={resultCount === 0} title="Previous">
          <ChevronUp size={14} />
        </button>
        <button style={{ ...btnStyle, padding: "4px 8px" }} onClick={onNextResult} disabled={resultCount === 0} title="Next">
          <ChevronDown size={14} />
        </button>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", minWidth: 60, textAlign: "center" }}>
          {resultCount > 0 ? `${currentResult + 1} of ${resultCount}` : "No results"}
        </span>
        <button
          style={{ ...btnStyle, padding: "4px 8px" }}
          onClick={() => setShowReplace(!showReplace)}
          title="Find & Replace"
        >
          <Replace size={14} />
        </button>
        <button
          style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}
          onClick={onClose}
        >
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Options */}
      <div className="flex items-center gap-4 pl-6">
        <label className="flex items-center gap-1 cursor-pointer" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          Case Sensitive
        </label>
        <label className="flex items-center gap-1 cursor-pointer" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} />
          Whole Word
        </label>
      </div>

      {/* Replace row */}
      {showReplace && (
        <div className="flex items-center gap-2 pl-6">
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace with..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            style={{ ...btnStyle, fontSize: 11, padding: "4px 10px" }}
            onClick={() => onReplace(searchText, replaceText, false)}
            disabled={resultCount === 0}
          >
            Replace
          </button>
          <button
            style={{ ...btnStyle, fontSize: 11, padding: "4px 10px" }}
            onClick={() => onReplace(searchText, replaceText, true)}
            disabled={resultCount === 0}
          >
            Replace All
          </button>
        </div>
      )}
    </div>
  );
}
