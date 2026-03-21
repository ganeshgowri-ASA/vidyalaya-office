"use client";

import React, { useState } from "react";
import {
  X, Settings, Sliders, Brain, BookOpen, ChevronRight,
  Monitor, Type, Ruler, Grid3X3, Save, Eye, Moon, Sun,
  Globe, Key, Sparkles, Database, Link2, FileText,
  Hash, Quote, BookMarked,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

type SettingsSection = "editor" | "ai-apis" | "citations";

export function EditorSettingsPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("editor");
  const {
    currentFont, setCurrentFont,
    currentFontSize, setCurrentFontSize,
    lineSpacing, setLineSpacing,
    autoSaveEnabled, setAutoSaveEnabled,
    autoSaveInterval, setAutoSaveInterval,
    spellCheckEnabled, setSpellCheckEnabled,
    autoCorrectEnabled, setAutoCorrectEnabled,
    showLineNumbers, toggleLineNumbers,
    showRuler, toggleRuler,
    showGridlines, toggleGridlines,
    citationStyle, setCitationStyle,
  } = useDocumentStore();

  const [aiProvider, setAiProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [aiModel, setAiModel] = useState("claude-sonnet-4-6");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [pineconeKey, setPineconeKey] = useState("");
  const [embeddingModel, setEmbeddingModel] = useState("text-embedding-3-small");

  if (!visible) return null;

  const sections: { key: SettingsSection; label: string; icon: React.ReactNode }[] = [
    { key: "editor", label: "Editor", icon: <Monitor size={14} /> },
    { key: "ai-apis", label: "AI & APIs", icon: <Brain size={14} /> },
    { key: "citations", label: "Citations", icon: <BookOpen size={14} /> },
  ];

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="relative w-8 h-4 rounded-full transition-colors"
      style={{ backgroundColor: enabled ? "var(--primary)" : "var(--muted)" }}
    >
      <span
        className="absolute top-0.5 w-3 h-3 rounded-full transition-transform"
        style={{
          backgroundColor: enabled ? "var(--primary-foreground)" : "var(--muted-foreground)",
          left: enabled ? 17 : 2,
        }}
      />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative w-full max-w-2xl mx-4 rounded-xl border shadow-2xl flex overflow-hidden"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          maxHeight: "80vh",
        }}
      >
        {/* Sidebar */}
        <div className="w-48 border-r flex-shrink-0" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
          <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <Settings size={14} style={{ color: "var(--primary)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Settings</span>
            </div>
          </div>
          <div className="p-2 space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors"
                style={{
                  backgroundColor: activeSection === s.key ? "var(--muted)" : "transparent",
                  color: activeSection === s.key ? "var(--foreground)" : "var(--muted-foreground)",
                }}
              >
                {s.icon}
                {s.label}
                <ChevronRight size={12} className="ml-auto" style={{ opacity: activeSection === s.key ? 1 : 0 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {sections.find((s) => s.key === activeSection)?.label} Settings
            </h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-[var(--muted)]">
              <X size={16} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Editor Section */}
            {activeSection === "editor" && (
              <>
                <SettingsGroup title="Typography" icon={<Type size={13} />}>
                  <SettingsRow label="Default Font">
                    <select
                      value={currentFont}
                      onChange={(e) => setCurrentFont(e.target.value)}
                      className="rounded border px-2 py-1 text-xs outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      {["Calibri", "Arial", "Times New Roman", "Georgia", "Verdana", "Courier New", "Roboto"].map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </SettingsRow>
                  <SettingsRow label="Default Size">
                    <select
                      value={currentFontSize}
                      onChange={(e) => setCurrentFontSize(e.target.value)}
                      className="rounded border px-2 py-1 text-xs outline-none w-16"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      {["8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "36"].map((s) => (
                        <option key={s} value={s}>{s}pt</option>
                      ))}
                    </select>
                  </SettingsRow>
                  <SettingsRow label="Line Spacing">
                    <select
                      value={lineSpacing}
                      onChange={(e) => setLineSpacing(e.target.value as typeof lineSpacing)}
                      className="rounded border px-2 py-1 text-xs outline-none w-16"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      {["1", "1.15", "1.5", "2", "2.5", "3"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </SettingsRow>
                </SettingsGroup>

                <SettingsGroup title="Display" icon={<Eye size={13} />}>
                  <SettingsRow label="Show Ruler">
                    <Toggle enabled={showRuler} onChange={toggleRuler} />
                  </SettingsRow>
                  <SettingsRow label="Show Gridlines">
                    <Toggle enabled={showGridlines} onChange={toggleGridlines} />
                  </SettingsRow>
                  <SettingsRow label="Line Numbers">
                    <Toggle enabled={showLineNumbers} onChange={toggleLineNumbers} />
                  </SettingsRow>
                </SettingsGroup>

                <SettingsGroup title="Saving" icon={<Save size={13} />}>
                  <SettingsRow label="Auto-save">
                    <Toggle enabled={autoSaveEnabled} onChange={() => setAutoSaveEnabled(!autoSaveEnabled)} />
                  </SettingsRow>
                  <SettingsRow label="Auto-save Interval">
                    <select
                      value={autoSaveInterval}
                      onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                      className="rounded border px-2 py-1 text-xs outline-none w-20"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      <option value={5000}>5s</option>
                      <option value={15000}>15s</option>
                      <option value={30000}>30s</option>
                      <option value={60000}>1min</option>
                      <option value={300000}>5min</option>
                    </select>
                  </SettingsRow>
                </SettingsGroup>

                <SettingsGroup title="Proofing" icon={<BookMarked size={13} />}>
                  <SettingsRow label="Spell Check">
                    <Toggle enabled={spellCheckEnabled} onChange={() => setSpellCheckEnabled(!spellCheckEnabled)} />
                  </SettingsRow>
                  <SettingsRow label="Auto-correct">
                    <Toggle enabled={autoCorrectEnabled} onChange={() => setAutoCorrectEnabled(!autoCorrectEnabled)} />
                  </SettingsRow>
                </SettingsGroup>
              </>
            )}

            {/* AI & APIs Section */}
            {activeSection === "ai-apis" && (
              <>
                <SettingsGroup title="AI Provider" icon={<Sparkles size={13} />}>
                  <SettingsRow label="Provider">
                    <select
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value)}
                      className="rounded border px-2 py-1 text-xs outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="openai">OpenAI (GPT)</option>
                      <option value="google">Google (Gemini)</option>
                    </select>
                  </SettingsRow>
                  <SettingsRow label="API Key">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="rounded border px-2 py-1 text-xs outline-none w-48"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  </SettingsRow>
                  <SettingsRow label="Model">
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="rounded border px-2 py-1 text-xs outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                      <option value="claude-opus-4-6">Claude Opus 4.6</option>
                      <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    </select>
                  </SettingsRow>
                  <SettingsRow label="Temperature">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-[10px] w-6" style={{ color: "var(--foreground)" }}>{temperature}</span>
                    </div>
                  </SettingsRow>
                  <SettingsRow label="Max Tokens">
                    <select
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      className="rounded border px-2 py-1 text-xs outline-none w-20"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      <option value={1024}>1K</option>
                      <option value={2048}>2K</option>
                      <option value={4096}>4K</option>
                      <option value={8192}>8K</option>
                      <option value={16384}>16K</option>
                    </select>
                  </SettingsRow>
                </SettingsGroup>

                <SettingsGroup title="Vector Database (RAG)" icon={<Database size={13} />}>
                  <SettingsRow label="Pinecone API Key">
                    <input
                      type="password"
                      value={pineconeKey}
                      onChange={(e) => setPineconeKey(e.target.value)}
                      placeholder="pc-..."
                      className="rounded border px-2 py-1 text-xs outline-none w-48"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                  </SettingsRow>
                  <SettingsRow label="Embedding Model">
                    <select
                      value={embeddingModel}
                      onChange={(e) => setEmbeddingModel(e.target.value)}
                      className="rounded border px-2 py-1 text-xs outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      <option value="text-embedding-3-small">text-embedding-3-small</option>
                      <option value="text-embedding-3-large">text-embedding-3-large</option>
                      <option value="voyage-3">Voyage 3</option>
                    </select>
                  </SettingsRow>
                </SettingsGroup>
              </>
            )}

            {/* Citations Section */}
            {activeSection === "citations" && (
              <>
                <SettingsGroup title="Citation Style" icon={<Quote size={13} />}>
                  <SettingsRow label="Default Style">
                    <select
                      value={citationStyle}
                      onChange={(e) => setCitationStyle(e.target.value as typeof citationStyle)}
                      className="rounded border px-2 py-1 text-xs outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      <option value="APA">APA 7th Edition</option>
                      <option value="MLA">MLA 9th Edition</option>
                      <option value="Chicago">Chicago 17th</option>
                      <option value="IEEE">IEEE</option>
                      <option value="Harvard">Harvard</option>
                    </select>
                  </SettingsRow>
                </SettingsGroup>

                <SettingsGroup title="Reference Management" icon={<BookOpen size={13} />}>
                  <SettingsRow label="Auto-number Citations">
                    <Toggle enabled={true} onChange={() => {}} />
                  </SettingsRow>
                  <SettingsRow label="Bibliography Position">
                    <select
                      className="rounded border px-2 py-1 text-xs outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      defaultValue="end"
                    >
                      <option value="end">End of Document</option>
                      <option value="section">End of Section</option>
                      <option value="manual">Manual Placement</option>
                    </select>
                  </SettingsRow>
                  <SettingsRow label="Include DOI Links">
                    <Toggle enabled={true} onChange={() => {}} />
                  </SettingsRow>
                  <SettingsRow label="Include Access Date for URLs">
                    <Toggle enabled={true} onChange={() => {}} />
                  </SettingsRow>
                </SettingsGroup>

                <SettingsGroup title="Import Sources" icon={<Link2 size={13} />}>
                  <div className="space-y-1">
                    {["Zotero", "Mendeley", "EndNote", "BibTeX"].map((source) => (
                      <button
                        key={source}
                        className="w-full flex items-center gap-2 rounded border px-3 py-2 text-xs hover:bg-[var(--muted)] transition-colors"
                        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      >
                        <FileText size={12} />
                        Connect to {source}
                      </button>
                    ))}
                  </div>
                </SettingsGroup>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsGroup({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: "var(--primary)" }}>{icon}</span>
        <h3 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{title}</h3>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      {children}
    </div>
  );
}
