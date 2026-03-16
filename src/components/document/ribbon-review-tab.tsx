"use client";

import React, { useState } from "react";
import {
  SpellCheck, BookOpen, Hash, MessageCircle, GitBranch,
  Check, X, ChevronLeft, ChevronRight, Eye, Lock,
  Users, FileText, ChevronDown, Shield, Diff,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { ToolbarButton, ToolbarSeparator, ToolbarDropdown } from "./toolbar-button";

export function ReviewTab() {
  const {
    trackChanges, toggleTrackChanges,
    showComments, toggleComments,
    comments, addComment,
  } = useDocumentStore();

  const [markupDisplay, setMarkupDisplay] = useState("all");
  const [showWordCount, setShowWordCount] = useState(false);

  return (
    <>
      {/* ===== PROOFING GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<SpellCheck size={14} />} label="Spelling" title="Spelling & Grammar" onClick={() => {
            const editor = document.getElementById("doc-editor");
            if (editor) {
              // Trigger browser spell check
              editor.setAttribute("spellcheck", "true");
              alert("Spell check is enabled. Misspelled words will be underlined in red.");
            }
          }} />
          <ToolbarButton icon={<BookOpen size={14} />} label="Thesaurus" title="Thesaurus" onClick={() => {
            const sel = window.getSelection();
            const word = sel?.toString() || prompt("Enter a word to look up:");
            if (word) {
              window.open(`https://www.thesaurus.com/browse/${encodeURIComponent(word)}`, "_blank");
            }
          }} />
          <div className="relative">
            <ToolbarButton icon={<Hash size={14} />} label="Word Count" title="Word Count" onClick={() => setShowWordCount(!showWordCount)} />
            {showWordCount && (
              <WordCountDialog onClose={() => setShowWordCount(false)} />
            )}
          </div>
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Proofing</span>
      </div>

      {/* ===== COMMENTS GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<MessageCircle size={14} />} label="New" title="New Comment" onClick={() => {
            const text = prompt("Enter comment:");
            if (text) {
              addComment({
                id: Date.now().toString(),
                author: "User",
                text,
                timestamp: new Date().toLocaleString(),
                resolved: false,
                replies: [],
              });
              if (!showComments) toggleComments();
            }
          }} />
          <ToolbarButton icon={<X size={14} />} label="Delete" title="Delete Comment" onClick={() => {
            const store = useDocumentStore.getState();
            if (store.comments.length > 0) {
              store.deleteComment(store.comments[store.comments.length - 1].id);
            }
          }} />
          <ToolbarButton icon={<ChevronLeft size={14} />} title="Previous Comment" onClick={() => {}} />
          <ToolbarButton icon={<ChevronRight size={14} />} title="Next Comment" onClick={() => {}} />
          <ToolbarButton icon={<Eye size={14} />} label="Show" title="Show Comments" active={showComments} onClick={toggleComments} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Comments</span>
      </div>

      {/* ===== TRACKING GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<GitBranch size={14} />} label="Track Changes" title="Track Changes" active={trackChanges} onClick={toggleTrackChanges} />
          <ToolbarDropdown
            value={markupDisplay}
            options={[
              { value: "all", label: "All Markup" },
              { value: "simple", label: "Simple Markup" },
              { value: "none", label: "No Markup" },
              { value: "original", label: "Original" },
            ]}
            onChange={setMarkupDisplay}
            title="Display for Review"
            className="w-[110px]"
          />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Tracking</span>
      </div>

      {/* ===== CHANGES GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Check size={14} />} label="Accept" title="Accept Change" onClick={() => {
            const editor = document.getElementById("doc-editor");
            if (editor) {
              const insertions = editor.querySelectorAll("ins, .track-insert");
              insertions.forEach((ins) => {
                const parent = ins.parentNode;
                while (ins.firstChild) parent?.insertBefore(ins.firstChild, ins);
                parent?.removeChild(ins);
              });
            }
          }} />
          <ToolbarButton icon={<X size={14} />} label="Reject" title="Reject Change" onClick={() => {
            const editor = document.getElementById("doc-editor");
            if (editor) {
              const deletions = editor.querySelectorAll("del, .track-delete");
              deletions.forEach((del) => del.remove());
            }
          }} />
          <ToolbarButton icon={<ChevronLeft size={14} />} title="Previous Change" onClick={() => {}} />
          <ToolbarButton icon={<ChevronRight size={14} />} title="Next Change" onClick={() => {}} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Changes</span>
      </div>

      {/* ===== COMPARE GROUP ===== */}
      <div className="flex flex-col items-center border-r pr-2 mr-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Diff size={14} />} label="Compare" title="Compare Documents" onClick={() => {
            alert("Compare Documents: Select two documents to compare their differences.");
          }} />
          <ToolbarButton icon={<FileText size={14} />} label="Combine" title="Combine Documents" onClick={() => {
            alert("Combine Documents: Merge revisions from multiple authors.");
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Compare</span>
      </div>

      {/* ===== PROTECT GROUP ===== */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={<Shield size={14} />} label="Restrict Editing" title="Restrict Editing" onClick={() => {
            alert("Restrict Editing: Set document protection to prevent unauthorized changes.");
          }} />
          <ToolbarButton icon={<Lock size={14} />} label="Block Authors" title="Block Authors" onClick={() => {
            alert("Block Authors: Prevent specific users from editing sections.");
          }} />
        </div>
        <span className="text-[8px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Protect</span>
      </div>
    </>
  );
}

function WordCountDialog({ onClose }: { onClose: () => void }) {
  const { wordCount, charCount, lineCount, paragraphCount } = useDocumentStore();
  const paragraphs = paragraphCount || (typeof document !== "undefined" ? document.getElementById("doc-editor")?.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li").length || 0 : 0);

  return (
    <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border p-4 shadow-lg w-64"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>Word Count</span>
        <button className="text-xs hover:bg-[var(--muted)] rounded px-1" onClick={onClose}
          style={{ color: "var(--muted-foreground)" }}>✕</button>
      </div>
      <table className="w-full text-xs">
        <tbody>
          {[
            ["Pages", Math.max(1, Math.ceil(wordCount / 300))],
            ["Words", wordCount.toLocaleString()],
            ["Characters (no spaces)", charCount.toLocaleString()],
            ["Characters (with spaces)", (charCount + wordCount - 1 > 0 ? charCount + wordCount - 1 : 0).toLocaleString()],
            ["Paragraphs", paragraphs],
            ["Lines", lineCount.toLocaleString()],
          ].map(([label, value]) => (
            <tr key={String(label)}>
              <td className="py-1" style={{ color: "var(--muted-foreground)" }}>{label}</td>
              <td className="py-1 text-right font-medium" style={{ color: "var(--foreground)" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
