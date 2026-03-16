"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  Database,
  Settings,
  Palette,
  Globe,
  Save,
  RotateCcw,
  Wifi,
  WifiOff,
  Cpu,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  Table,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProviderConfig {
  label: string;
  key: string;
  apiKey: string;
  model: string;
  models: string[] | null; // null = free-text input
  extra?: Record<string, string>;
  status: "idle" | "testing" | "ok" | "error";
}

interface GeneralSettings {
  autoSaveInterval: number;
  fontFamily: string;
  fontSize: string;
  pageSize: string;
  orientation: string;
  locale: string;
  primaryColor: string;
}

interface DbSettings {
  connectionString: string;
  status: "idle" | "testing" | "ok" | "error";
  tables: string[];
}

const TABS = ["AI Providers", "General Settings", "Database Connection"] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, React.ElementType> = {
  "AI Providers": Cpu,
  "General Settings": Settings,
  "Database Connection": Database,
};

/* ------------------------------------------------------------------ */
/*  Default values                                                     */
/* ------------------------------------------------------------------ */

const defaultProviders: ProviderConfig[] = [
  {
    label: "Claude",
    key: "claude",
    apiKey: "",
    model: "claude-sonnet-4-20250514",
    models: ["claude-opus-4-20250514", "claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"],
    status: "idle",
  },
  {
    label: "Perplexity",
    key: "perplexity",
    apiKey: "",
    model: "sonar-pro",
    models: ["sonar-pro", "sonar"],
    status: "idle",
  },
  {
    label: "OpenAI",
    key: "openai",
    apiKey: "",
    model: "gpt-4o",
    models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
    status: "idle",
  },
  {
    label: "OpenRouter",
    key: "openrouter",
    apiKey: "",
    model: "",
    models: null,
    status: "idle",
  },
  {
    label: "Google AI Studio",
    key: "google",
    apiKey: "",
    model: "gemini-pro",
    models: ["gemini-pro", "gemini-ultra"],
    status: "idle",
  },
  {
    label: "Pinecone",
    key: "pinecone",
    apiKey: "",
    model: "",
    models: null,
    extra: { environment: "", indexName: "" },
    status: "idle",
  },
];

const defaultGeneral: GeneralSettings = {
  autoSaveInterval: 30,
  fontFamily: "Inter",
  fontSize: "14px",
  pageSize: "A4",
  orientation: "Portrait",
  locale: "en-US",
  primaryColor: "#6366f1",
};

const FONT_FAMILIES = ["Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Merriweather", "Fira Code", "JetBrains Mono"];
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px"];
const PAGE_SIZES = ["A4", "Letter", "Legal"];
const ORIENTATIONS = ["Portrait", "Landscape"];
const LOCALES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "hi-IN", label: "Hindi" },
  { value: "ta-IN", label: "Tamil" },
  { value: "te-IN", label: "Telugu" },
  { value: "kn-IN", label: "Kannada" },
  { value: "mr-IN", label: "Marathi" },
  { value: "bn-IN", label: "Bengali" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "es-ES", label: "Spanish" },
];
const PINECONE_ENVIRONMENTS = [
  "us-east-1-aws",
  "us-west-2-aws",
  "eu-west-1-aws",
  "us-east4-gcp",
  "us-central1-gcp",
  "asia-southeast1-gcp",
];
const DB_TABLES = ["documents", "versions", "users", "departments", "audit_log"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function StatusDot({ status }: { status: string }) {
  if (status === "ok") return <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />;
  if (status === "error") return <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />;
  if (status === "testing") return <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--primary)" }} />;
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--muted-foreground)", opacity: 0.4 }} />;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("AI Providers");
  const [providers, setProviders] = useState<ProviderConfig[]>(defaultProviders);
  const [general, setGeneral] = useState<GeneralSettings>(defaultGeneral);
  const [db, setDb] = useState<DbSettings>({ connectionString: "", status: "idle", tables: [] });
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  /* Load from localStorage on mount */
  useEffect(() => {
    try {
      const storedProviders = localStorage.getItem("vidyalaya_providers");
      if (storedProviders) {
        const parsed: ProviderConfig[] = JSON.parse(storedProviders);
        setProviders(parsed.map((p) => ({ ...p, status: "idle" })));
      }
      const storedGeneral = localStorage.getItem("vidyalaya_general");
      if (storedGeneral) setGeneral(JSON.parse(storedGeneral));
      const storedDb = localStorage.getItem("vidyalaya_db");
      if (storedDb) {
        const parsed = JSON.parse(storedDb);
        setDb({ ...parsed, status: "idle", tables: [] });
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  /* ---- Providers ---- */

  const updateProvider = useCallback(
    (key: string, patch: Partial<ProviderConfig>) => {
      setProviders((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
    },
    []
  );

  const updateProviderExtra = useCallback(
    (key: string, field: string, value: string) => {
      setProviders((prev) =>
        prev.map((p) =>
          p.key === key ? { ...p, extra: { ...(p.extra || {}), [field]: value } } : p
        )
      );
    },
    []
  );

  const testConnection = useCallback(
    async (key: string) => {
      updateProvider(key, { status: "testing" });
      // Simulate network request
      await new Promise((r) => setTimeout(r, 1500));
      const provider = providers.find((p) => p.key === key);
      if (provider && provider.apiKey.length > 8) {
        updateProvider(key, { status: "ok" });
      } else {
        updateProvider(key, { status: "error" });
      }
    },
    [providers, updateProvider]
  );

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveAll = () => {
    localStorage.setItem("vidyalaya_providers", JSON.stringify(providers));
    localStorage.setItem("vidyalaya_general", JSON.stringify(general));
    localStorage.setItem("vidyalaya_db", JSON.stringify({ connectionString: db.connectionString }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetAll = () => {
    setProviders(defaultProviders);
    setGeneral(defaultGeneral);
    setDb({ connectionString: "", status: "idle", tables: [] });
    localStorage.removeItem("vidyalaya_providers");
    localStorage.removeItem("vidyalaya_general");
    localStorage.removeItem("vidyalaya_db");
  };

  /* ---- General ---- */

  const updateGeneral = <K extends keyof GeneralSettings>(field: K, value: GeneralSettings[K]) => {
    setGeneral((prev) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem("vidyalaya_general", JSON.stringify(next));
      return next;
    });
  };

  /* ---- Database ---- */

  const testDbConnection = async () => {
    setDb((prev) => ({ ...prev, status: "testing", tables: [] }));
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        setDb((prev) => ({ ...prev, status: "ok", tables: DB_TABLES }));
      } else {
        setDb((prev) => ({ ...prev, status: "error", tables: [] }));
      }
    } catch {
      setDb((prev) => ({ ...prev, status: "error", tables: [] }));
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render helpers                                                    */
  /* ---------------------------------------------------------------- */

  const selectClasses =
    "w-full rounded-md border px-3 py-2 text-sm outline-none appearance-none cursor-pointer transition-colors" +
    " focus:ring-2 focus:ring-offset-1";

  const inputClasses =
    "w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors" +
    " focus:ring-2 focus:ring-offset-1";

  const btnPrimary =
    "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors";

  const btnOutline =
    "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80";

  /* ---------------------------------------------------------------- */
  /*  Tab: AI Providers                                                */
  /* ---------------------------------------------------------------- */

  function renderProviders() {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((p) => (
            <div
              key={p.key}
              className="rounded-lg border p-5 transition-shadow hover:shadow-md"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                  {p.label}
                </h3>
                <StatusDot status={p.status} />
              </div>

              {/* API Key */}
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                API Key
              </label>
              <div className="relative mb-3">
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                  <Key className="h-3.5 w-3.5" />
                </div>
                <input
                  type={visibleKeys[p.key] ? "text" : "password"}
                  value={p.apiKey}
                  onChange={(e) => updateProvider(p.key, { apiKey: e.target.value })}
                  placeholder={`Enter ${p.label} API key`}
                  className={inputClasses + " pl-9 pr-9"}
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility(p.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {visibleKeys[p.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Model selector or text input */}
              {p.key !== "pinecone" && (
                <>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Model
                  </label>
                  {p.models ? (
                    <div className="relative mb-3">
                      <select
                        value={p.model}
                        onChange={(e) => updateProvider(p.key, { model: e.target.value })}
                        className={selectClasses}
                        style={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }}
                      >
                        {p.models.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                        style={{ color: "var(--muted-foreground)" }}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={p.model}
                      onChange={(e) => updateProvider(p.key, { model: e.target.value })}
                      placeholder="Enter model name"
                      className={inputClasses + " mb-3"}
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    />
                  )}
                </>
              )}

              {/* Pinecone extras */}
              {p.key === "pinecone" && (
                <>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Environment
                  </label>
                  <div className="relative mb-3">
                    <select
                      value={p.extra?.environment || ""}
                      onChange={(e) => updateProviderExtra(p.key, "environment", e.target.value)}
                      className={selectClasses}
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="">Select environment</option>
                      {PINECONE_ENVIRONMENTS.map((env) => (
                        <option key={env} value={env}>
                          {env}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: "var(--muted-foreground)" }}
                    />
                  </div>

                  <label className="mb-1 block text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Index Name
                  </label>
                  <input
                    type="text"
                    value={p.extra?.indexName || ""}
                    onChange={(e) => updateProviderExtra(p.key, "indexName", e.target.value)}
                    placeholder="Enter index name"
                    className={inputClasses + " mb-3"}
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </>
              )}

              {/* Test connection button */}
              <button
                onClick={() => testConnection(p.key)}
                disabled={p.status === "testing" || !p.apiKey}
                className={btnOutline + " w-full justify-center"}
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  opacity: p.status === "testing" || !p.apiKey ? 0.5 : 1,
                }}
              >
                {p.status === "testing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : p.status === "ok" ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : p.status === "error" ? (
                  <WifiOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Wifi className="h-4 w-4" />
                )}
                {p.status === "testing"
                  ? "Testing..."
                  : p.status === "ok"
                  ? "Connected"
                  : p.status === "error"
                  ? "Failed — Retry"
                  : "Test Connection"}
              </button>
            </div>
          ))}
        </div>

        {/* Save / Reset */}
        <div
          className="flex items-center justify-end gap-3 rounded-lg border p-4"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {saved && (
            <span className="mr-auto flex items-center gap-1.5 text-sm text-green-500">
              <CheckCircle className="h-4 w-4" /> Settings saved
            </span>
          )}
          <button
            onClick={resetAll}
            className={btnOutline}
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={saveAll}
            className={btnPrimary}
            style={{ backgroundColor: "var(--primary)", color: "white" }}
          >
            <Save className="h-4 w-4" />
            Save All
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Tab: General Settings                                            */
  /* ---------------------------------------------------------------- */

  function renderGeneral() {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {/* Auto-save interval */}
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <label className="mb-1 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            <Save className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            Auto-save Interval (seconds)
          </label>
          <input
            type="number"
            min={5}
            max={300}
            value={general.autoSaveInterval}
            onChange={(e) => updateGeneral("autoSaveInterval", Number(e.target.value))}
            className={inputClasses}
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Font family */}
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <label className="mb-1 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            <Settings className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            Default Font Family
          </label>
          <div className="relative">
            <select
              value={general.fontFamily}
              onChange={(e) => updateGeneral("fontFamily", e.target.value)}
              className={selectClasses}
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />
          </div>
        </div>

        {/* Font size */}
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <label className="mb-1 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            <Settings className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            Default Font Size
          </label>
          <div className="relative">
            <select
              value={general.fontSize}
              onChange={(e) => updateGeneral("fontSize", e.target.value)}
              className={selectClasses}
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />
          </div>
        </div>

        {/* Page size */}
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <label className="mb-1 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            <Settings className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            Default Page Size
          </label>
          <div className="relative">
            <select
              value={general.pageSize}
              onChange={(e) => updateGeneral("pageSize", e.target.value)}
              className={selectClasses}
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />
          </div>
        </div>

        {/* Orientation */}
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <label className="mb-1 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            <Settings className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            Default Orientation
          </label>
          <div className="relative">
            <select
              value={general.orientation}
              onChange={(e) => updateGeneral("orientation", e.target.value)}
              className={selectClasses}
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              {ORIENTATIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />
          </div>
        </div>

        {/* Locale */}
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <label className="mb-1 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            <Globe className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            Language / Locale
          </label>
          <div className="relative">
            <select
              value={general.locale}
              onChange={(e) => updateGeneral("locale", e.target.value)}
              className={selectClasses}
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />
          </div>
        </div>

        {/* Primary color */}
        <div
          className="rounded-lg border p-5 md:col-span-2"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <label className="mb-1 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            <Palette className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            Theme Primary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={general.primaryColor}
              onChange={(e) => updateGeneral("primaryColor", e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border-none bg-transparent"
            />
            <input
              type="text"
              value={general.primaryColor}
              onChange={(e) => updateGeneral("primaryColor", e.target.value)}
              placeholder="#6366f1"
              maxLength={7}
              className={inputClasses + " max-w-[140px] font-mono"}
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <div
              className="h-10 flex-1 rounded-md border"
              style={{
                backgroundColor: general.primaryColor,
                borderColor: "var(--border)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Tab: Database Connection                                         */
  /* ---------------------------------------------------------------- */

  function renderDatabase() {
    return (
      <div className="space-y-6">
        {/* Connection string */}
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <label className="mb-1 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            <Database className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            Railway PostgreSQL Connection String
          </label>
          <input
            type="password"
            value={db.connectionString}
            onChange={(e) =>
              setDb((prev) => ({ ...prev, connectionString: e.target.value, status: "idle", tables: [] }))
            }
            placeholder="postgresql://user:password@host:port/database"
            className={inputClasses + " mb-4 font-mono text-xs"}
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />

          <div className="flex items-center gap-4">
            <button
              onClick={testDbConnection}
              disabled={db.status === "testing"}
              className={btnPrimary}
              style={{
                backgroundColor: "var(--primary)",
                color: "white",
                opacity: db.status === "testing" ? 0.6 : 1,
              }}
            >
              {db.status === "testing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Test Connection
            </button>

            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              <StatusDot status={db.status} />
              {db.status === "idle" && "Not tested"}
              {db.status === "testing" && "Testing connection..."}
              {db.status === "ok" && <span className="text-green-500">Connected successfully</span>}
              {db.status === "error" && <span className="text-red-500">Connection failed</span>}
            </div>
          </div>
        </div>

        {/* Migration status */}
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            <AlertCircle className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            Migration Status
          </h3>

          {db.status === "ok" ? (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle className="h-4 w-4" />
              All migrations are up to date
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Connect to the database to view migration status.
            </p>
          )}
        </div>

        {/* Table list */}
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            <Table className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            Database Tables
          </h3>

          {db.status === "ok" && db.tables.length > 0 ? (
            <ul className="space-y-2">
              {db.tables.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-mono"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {db.status === "error"
                ? "Could not retrieve tables. Check your connection string."
                : "Connect to the database to view tables."}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/"
            className="rounded-md p-2 transition-colors hover:opacity-80"
            style={{ color: "var(--muted-foreground)" }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Settings
            </h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Configure AI providers, preferences, and database connections.
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className="mb-6 flex gap-1 rounded-lg border p-1"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {TABS.map((tab) => {
            const Icon = TAB_ICONS[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "white" : "var(--muted-foreground)",
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "AI Providers" && renderProviders()}
        {activeTab === "General Settings" && renderGeneral()}
        {activeTab === "Database Connection" && renderDatabase()}
      </div>
    </div>
  );
}
