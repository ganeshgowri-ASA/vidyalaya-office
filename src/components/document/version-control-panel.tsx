"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GitBranch, Clock, User, ChevronDown, ChevronRight, RotateCcw, Plus, Copy, X } from "lucide-react";

interface DocVersion {
  id: string;
  version: string;
  content: string;
  changeNotes: string;
  createdBy: string;
  createdAt: string;
}

interface VersionControlPanelProps {
  visible: boolean;
  onClose: () => void;
  currentContent: string;
  onRestore: (content: string) => void;
  documentName: string;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function VersionControlPanel({ visible, onClose, currentContent, onRestore, documentName }: VersionControlPanelProps) {
  const [versions, setVersions] = useState<DocVersion[]>([]);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<DocVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);

  const storageKey = `doc-versions-${documentName}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setVersions(JSON.parse(saved));
    } else {
      const initial: DocVersion = {
        id: generateId(),
        version: "1.0",
        content: currentContent,
        changeNotes: "Initial version",
        createdBy: "Current User",
        createdAt: new Date().toISOString(),
      };
      setVersions([initial]);
      localStorage.setItem(storageKey, JSON.stringify([initial]));
    }
  }, [storageKey, currentContent]);

  const saveVersions = useCallback((v: DocVersion[]) => {
    setVersions(v);
    localStorage.setItem(storageKey, JSON.stringify(v));
  }, [storageKey]);

  const getCurrentVersion = () => {
    if (versions.length === 0) return "1.0";
    return versions[0].version;
  };

  const bumpMinor = () => {
    const current = getCurrentVersion();
    const parts = current.split(".");
    return `${parts[0]}.${parseInt(parts[1] || "0") + 1}`;
  };

  const bumpMajor = () => {
    const current = getCurrentVersion();
    const parts = current.split(".");
    return `${parseInt(parts[0]) + 1}.0`;
  };

  const autoSave = useCallback(() => {
    const newVersion: DocVersion = {
      id: generateId(),
      version: bumpMinor(),
      content: currentContent,
      changeNotes: "Auto-saved",
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
    };
    saveVersions([newVersion, ...versions]);
  }, [currentContent, versions, saveVersions]);

  const createMajorVersion = () => {
    const newVersion: DocVersion = {
      id: generateId(),
      version: bumpMajor(),
      content: currentContent,
      changeNotes: changeNotes || "Major version",
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
    };
    saveVersions([newVersion, ...versions]);
    setShowNewVersion(false);
    setChangeNotes("");
  };

  const forkDocument = () => {
    const newVersion: DocVersion = {
      id: generateId(),
      version: `${getCurrentVersion()}-fork`,
      content: currentContent,
      changeNotes: "Forked from " + getCurrentVersion(),
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
    };
    saveVersions([newVersion, ...versions]);
  };

  const restoreVersion = (v: DocVersion) => {
    onRestore(v.content);
    const restored: DocVersion = {
      id: generateId(),
      version: bumpMinor(),
      content: v.content,
      changeNotes: `Restored from v${v.version}`,
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
    };
    saveVersions([restored, ...versions]);
    setSelectedVersion(null);
  };

  if (!visible) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-72 border-l flex flex-col h-full overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-1.5">
          <GitBranch size={14} style={{ color: "var(--primary)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Version Control</span>
        </div>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-[var(--muted)]">
          <X size={14} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* Current version badge */}
      <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
            v{getCurrentVersion()}
          </span>
          <div className="flex gap-1">
            <button onClick={autoSave} className="px-2 py-1 rounded text-[10px] border hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }} title="Save minor version">
              Save
            </button>
            <button onClick={() => setShowNewVersion(true)} className="px-2 py-1 rounded text-[10px] border hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--primary)" }} title="Create major version">
              <Plus size={10} />
            </button>
            <button onClick={forkDocument} className="px-2 py-1 rounded text-[10px] border hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }} title="Fork/Branch">
              <Copy size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* New major version form */}
      {showNewVersion && (
        <div className="px-3 py-2 border-b space-y-2" style={{ borderColor: "var(--border)" }}>
          <textarea
            value={changeNotes}
            onChange={(e) => setChangeNotes(e.target.value)}
            placeholder="Change notes for major version..."
            className="w-full rounded border px-2 py-1.5 text-xs bg-transparent resize-none"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            rows={2}
          />
          <div className="flex gap-1">
            <button onClick={createMajorVersion} className="px-2 py-1 rounded text-[10px] text-white"
              style={{ backgroundColor: "var(--primary)" }}>Create v{bumpMajor()}</button>
            <button onClick={() => setShowNewVersion(false)} className="px-2 py-1 rounded text-[10px]"
              style={{ color: "var(--muted-foreground)" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Compare toggle */}
      <div className="px-3 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
        <label className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          <input type="checkbox" checked={compareMode} onChange={(e) => { setCompareMode(e.target.checked); setCompareA(null); setCompareB(null); }} />
          Compare versions
        </label>
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto">
        {versions.map((v, i) => (
          <div
            key={v.id}
            className={`px-3 py-2 border-b cursor-pointer hover:bg-[var(--muted)] ${selectedVersion?.id === v.id ? "bg-[var(--muted)]" : ""}`}
            style={{ borderColor: "var(--border)" }}
            onClick={() => {
              if (compareMode) {
                if (!compareA) setCompareA(v.id);
                else if (!compareB) setCompareB(v.id);
                else { setCompareA(v.id); setCompareB(null); }
              } else {
                setSelectedVersion(selectedVersion?.id === v.id ? null : v);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {compareMode && (
                  <span className={`w-3 h-3 rounded-full border text-[8px] flex items-center justify-center ${
                    compareA === v.id ? "bg-blue-500 text-white" : compareB === v.id ? "bg-green-500 text-white" : ""
                  }`} style={{ borderColor: "var(--border)" }}>
                    {compareA === v.id ? "A" : compareB === v.id ? "B" : ""}
                  </span>
                )}
                <span className="text-xs font-medium" style={{ color: i === 0 ? "var(--primary)" : "var(--foreground)" }}>
                  v{v.version}
                </span>
              </div>
              {selectedVersion?.id === v.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{v.changeNotes}</div>
            <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              <span className="flex items-center gap-0.5"><User size={9} />{v.createdBy}</span>
              <span className="flex items-center gap-0.5"><Clock size={9} />{formatDate(v.createdAt)}</span>
            </div>

            {selectedVersion?.id === v.id && !compareMode && (
              <div className="mt-2 flex gap-1">
                <button onClick={() => restoreVersion(v)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border hover:bg-[var(--muted)]"
                  style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                  <RotateCcw size={10} /> Restore
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Compare view */}
      {compareMode && compareA && compareB && (
        <div className="border-t p-2" style={{ borderColor: "var(--border)" }}>
          <div className="text-[10px] font-medium mb-1" style={{ color: "var(--foreground)" }}>Comparison</div>
          <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
            <div className="rounded border p-1 text-[9px] overflow-hidden" style={{ borderColor: "#3b82f6", color: "var(--foreground)" }}>
              <div className="font-medium text-blue-400 mb-0.5">Version A</div>
              <div className="truncate" dangerouslySetInnerHTML={{ __html: versions.find((v) => v.id === compareA)?.content?.slice(0, 200) || "Empty" }} />
            </div>
            <div className="rounded border p-1 text-[9px] overflow-hidden" style={{ borderColor: "#22c55e", color: "var(--foreground)" }}>
              <div className="font-medium text-green-400 mb-0.5">Version B</div>
              <div className="truncate" dangerouslySetInnerHTML={{ __html: versions.find((v) => v.id === compareB)?.content?.slice(0, 200) || "Empty" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
