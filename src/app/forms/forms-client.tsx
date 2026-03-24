"use client";

import { useState, useCallback, useMemo } from "react";
import {
  FileText,
  Plus,
  BarChart3,
  Eye,
  Users,
  Star,
  Clock,
  CheckCircle2,
  TrendingUp,
  Trash2,
  ArrowLeft,
  GripVertical,
  Copy,
  Share2,
  Link,
  QrCode,
  Code,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Edit3,
  Play,
  Globe,
  Lock,
  ListChecks,
  HelpCircle,
  Award,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useFormsStore,
  Form,
  FormQuestion,
  QuestionType,
  FormResponse,
  FormType,
  Audience,
} from "@/store/forms-store";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: "Short Text",
  textarea: "Long Text",
  "multiple-choice": "Multiple Choice",
  checkbox: "Checkboxes",
  dropdown: "Dropdown",
  rating: "Rating (1-5 Stars)",
  date: "Date",
  "file-upload": "File Upload",
  scale: "Scale (1-10)",
  ranking: "Ranking",
};

const FORM_TYPE_LABELS: Record<FormType, string> = {
  form: "Form",
  quiz: "Quiz",
  poll: "Poll",
  survey: "Survey",
};

const CHART_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function FormsClient() {
  const { viewMode, setViewMode, activeFormId, setActiveFormId, forms } =
    useFormsStore();

  const activeForm = forms.find((f) => f.id === activeFormId);

  const goBack = useCallback(() => {
    setViewMode("list");
    setActiveFormId(null);
  }, [setViewMode, setActiveFormId]);

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {viewMode === "list" && <FormGallery />}
      {viewMode === "create" && <CreateFormView onBack={goBack} />}
      {viewMode === "builder" && activeForm && (
        <FormBuilderView form={activeForm} onBack={goBack} />
      )}
      {viewMode === "fill" && activeForm && (
        <FillFormView form={activeForm} onBack={goBack} />
      )}
      {viewMode === "responses" && activeForm && (
        <ResponsesView form={activeForm} onBack={goBack} />
      )}
      {viewMode === "share" && activeForm && (
        <ShareView form={activeForm} onBack={goBack} />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// GALLERY VIEW
// ═════════════════════════════════════════════════════════════════════════════

function FormGallery() {
  const { forms, setViewMode, setActiveFormId, searchQuery, setSearchQuery, deleteForm } =
    useFormsStore();
  const [filterType, setFilterType] = useState<FormType | "all">("all");

  const filtered = useMemo(() => {
    let list = forms;
    if (filterType !== "all") list = list.filter((f) => f.formType === filterType);
    if (searchQuery)
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return list;
  }, [forms, filterType, searchQuery]);

  const openForm = (id: string, mode: "builder" | "fill" | "responses" | "share") => {
    setActiveFormId(id);
    setViewMode(mode);
  };

  const stats = useMemo(() => {
    const totalResponses = forms.reduce((s, f) => s + f.responses.length, 0);
    return {
      total: forms.length,
      responses: totalResponses,
      active: forms.filter((f) => f.status === "active").length,
    };
  }, [forms]);

  return (
    <>
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <h1 className="text-xl font-bold">Forms</h1>
          <p className="text-sm opacity-60">
            Create, manage, and analyze forms, quizzes, polls & surveys
          </p>
        </div>
        <button
          onClick={() => setViewMode("create")}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <Plus size={16} />
          New Form
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
        {[
          { label: "Total Forms", value: stats.total, icon: FileText },
          { label: "Total Responses", value: stats.responses, icon: Users },
          { label: "Active", value: stats.active, icon: TrendingUp },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-lg border p-3"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
          >
            <s.icon size={18} style={{ color: "var(--primary)" }} />
            <div>
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-xs opacity-60">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 border-b px-6 py-3" style={{ borderColor: "var(--border)" }}>
        <div
          className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
        >
          <Search size={14} className="opacity-50" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forms..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X size={14} className="opacity-50" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {(["all", "form", "quiz", "poll", "survey"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filterType === t ? "opacity-100" : "opacity-60 hover:opacity-80"
              )}
              style={
                filterType === t
                  ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                  : { backgroundColor: "var(--sidebar)" }
              }
            >
              {t === "all" ? "All" : FORM_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Form Cards Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText size={40} className="opacity-20" />
            <p className="mt-3 text-sm opacity-50">No forms found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((form) => (
              <div
                key={form.id}
                className="group rounded-xl border p-5 transition-all hover:shadow-lg"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
              >
                {/* Color bar */}
                <div
                  className="mb-3 h-1.5 w-12 rounded-full"
                  style={{ backgroundColor: form.color }}
                />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{form.title}</h3>
                    </div>
                    <p className="mt-1 text-xs opacity-60 line-clamp-2">{form.description}</p>
                  </div>
                </div>
                {/* Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: form.color + "22", color: form.color }}
                  >
                    {FORM_TYPE_LABELS[form.formType]}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] opacity-50">
                    {form.audience === "internal" ? <Lock size={9} /> : <Globe size={9} />}
                    {form.audience === "internal" ? "Internal" : "External"}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] opacity-50">
                    <Users size={9} /> {form.responses.length} responses
                  </span>
                </div>
                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openForm(form.id, "fill")}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ backgroundColor: form.color + "22", color: form.color }}
                  >
                    <Play size={12} />
                    {form.formType === "quiz" ? "Take Quiz" : "Fill Form"}
                  </button>
                  <button
                    onClick={() => openForm(form.id, "builder")}
                    className="rounded-md border px-2 py-1.5 text-xs opacity-60 transition-colors hover:opacity-100"
                    style={{ borderColor: "var(--border)" }}
                    title="Edit"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={() => openForm(form.id, "responses")}
                    className="rounded-md border px-2 py-1.5 text-xs opacity-60 transition-colors hover:opacity-100"
                    style={{ borderColor: "var(--border)" }}
                    title="Responses"
                  >
                    <BarChart3 size={12} />
                  </button>
                  <button
                    onClick={() => openForm(form.id, "share")}
                    className="rounded-md border px-2 py-1.5 text-xs opacity-60 transition-colors hover:opacity-100"
                    style={{ borderColor: "var(--border)" }}
                    title="Share"
                  >
                    <Share2 size={12} />
                  </button>
                  <button
                    onClick={() => deleteForm(form.id)}
                    className="rounded-md border px-2 py-1.5 text-xs opacity-60 transition-colors hover:opacity-100 hover:text-red-400"
                    style={{ borderColor: "var(--border)" }}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CREATE FORM VIEW
// ═════════════════════════════════════════════════════════════════════════════

function CreateFormView({ onBack }: { onBack: () => void }) {
  const { addForm, setActiveFormId, setViewMode } = useFormsStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formType, setFormType] = useState<FormType>("form");
  const [audience, setAudience] = useState<Audience>("internal");

  const colors: Record<FormType, string> = {
    form: "#6366f1",
    quiz: "#f59e0b",
    poll: "#ec4899",
    survey: "#10b981",
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    const id = "form-" + uid();
    const now = new Date().toISOString();
    addForm({
      id,
      title: title.trim(),
      description: description.trim(),
      formType,
      audience,
      questions: [],
      responses: [],
      createdAt: now,
      updatedAt: now,
      status: "draft",
      color: colors[formType],
    });
    setActiveFormId(id);
    setViewMode("builder");
  };

  return (
    <>
      <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
        <button onClick={onBack} className="opacity-60 hover:opacity-100">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">Create New Form</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Form Type Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium">Form Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(["form", "quiz", "poll", "survey"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFormType(t)}
                  className={cn(
                    "rounded-lg border p-3 text-center text-xs font-medium transition-all",
                    formType === t ? "ring-2" : "opacity-60 hover:opacity-80"
                  )}
                  style={{
                    borderColor: formType === t ? colors[t] : "var(--border)",
                    backgroundColor: formType === t ? colors[t] + "15" : "var(--sidebar)",
                    ...(formType === t ? { ["--tw-ring-color" as string]: colors[t] } : {}),
                  }}
                >
                  {FORM_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className="mb-2 block text-sm font-medium">Audience</label>
            <div className="grid grid-cols-2 gap-2">
              {(["internal", "external"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-medium transition-all",
                    audience === a ? "opacity-100 ring-2" : "opacity-60 hover:opacity-80"
                  )}
                  style={{
                    borderColor: audience === a ? "var(--primary)" : "var(--border)",
                    backgroundColor: audience === a ? "var(--primary)" + "15" : "var(--sidebar)",
                  }}
                >
                  {a === "internal" ? <Lock size={14} /> : <Globe size={14} />}
                  {a === "internal" ? "Internal (Employees)" : "External (Public Link)"}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter form title..."
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--sidebar)",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your form..."
              rows={3}
              className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--sidebar)",
              }}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-40"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <Plus size={16} />
            Create & Start Building
          </button>
        </div>
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FORM BUILDER VIEW
// ═════════════════════════════════════════════════════════════════════════════

function FormBuilderView({ form, onBack }: { form: Form; onBack: () => void }) {
  const { updateForm, addQuestion, updateQuestion, removeQuestion, reorderQuestions, setViewMode } =
    useFormsStore();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleAddQuestion = (type: QuestionType) => {
    const q: FormQuestion = {
      id: "q-" + uid(),
      type,
      title: "",
      required: false,
      ...(["multiple-choice", "checkbox", "dropdown"].includes(type)
        ? {
            options: [
              { id: "opt-" + uid(), label: "Option 1" },
              { id: "opt-" + uid(), label: "Option 2" },
            ],
          }
        : {}),
      ...(type === "scale" ? { minScale: 1, maxScale: 10, scaleMinLabel: "Low", scaleMaxLabel: "High" } : {}),
      ...(type === "ranking"
        ? {
            options: [
              { id: "opt-" + uid(), label: "Item 1" },
              { id: "opt-" + uid(), label: "Item 2" },
              { id: "opt-" + uid(), label: "Item 3" },
            ],
          }
        : {}),
      ...(form.formType === "quiz" && type === "multiple-choice" ? { points: 10 } : {}),
    };
    addQuestion(form.id, q);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      reorderQuestions(form.id, dragIdx, idx);
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="opacity-60 hover:opacity-100">
            <ArrowLeft size={18} />
          </button>
          <div>
            <input
              value={form.title}
              onChange={(e) => updateForm(form.id, { title: e.target.value })}
              className="bg-transparent text-lg font-bold outline-none"
              placeholder="Form title..."
            />
            <input
              value={form.description}
              onChange={(e) => updateForm(form.id, { description: e.target.value })}
              className="block bg-transparent text-xs opacity-60 outline-none w-full max-w-md"
              placeholder="Description..."
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("fill")}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
          >
            <Eye size={13} /> Preview
          </button>
          <button
            onClick={() => setViewMode("responses")}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:opacity-80"
            style={{ borderColor: "var(--border)" }}
          >
            <BarChart3 size={13} /> Responses ({form.responses.length})
          </button>
          <button
            onClick={() => setViewMode("share")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-90"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Share2 size={13} /> Share
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Add question panel */}
        <div
          className="w-56 shrink-0 overflow-y-auto border-r p-4"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
        >
          <p className="mb-3 text-xs font-semibold opacity-60 uppercase">Add Question</p>
          <div className="space-y-1">
            {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleAddQuestion(type)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--sidebar-accent)" }}
              >
                <Plus size={12} className="opacity-60" />
                {QUESTION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Questions list */}
        <div className="flex-1 overflow-y-auto p-6">
          {form.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <HelpCircle size={40} />
              <p className="mt-3 text-sm">No questions yet. Add one from the left panel.</p>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-4">
              {form.questions.map((q, idx) => (
                <div
                  key={q.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className="rounded-lg border p-4 transition-all"
                  style={{
                    borderColor: dragIdx === idx ? "var(--primary)" : "var(--border)",
                    backgroundColor: "var(--sidebar)",
                  }}
                >
                  <QuestionEditor
                    question={q}
                    index={idx}
                    isQuiz={form.formType === "quiz"}
                    onUpdate={(updates) => updateQuestion(form.id, q.id, updates)}
                    onRemove={() => removeQuestion(form.id, q.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Question Editor ─────────────────────────────────────────────────────────

function QuestionEditor({
  question,
  index,
  isQuiz,
  onUpdate,
  onRemove,
}: {
  question: FormQuestion;
  index: number;
  isQuiz: boolean;
  onUpdate: (u: Partial<FormQuestion>) => void;
  onRemove: () => void;
}) {
  const addOption = () => {
    const opts = question.options || [];
    onUpdate({
      options: [...opts, { id: "opt-" + uid(), label: `Option ${opts.length + 1}` }],
    });
  };

  const updateOption = (optId: string, label: string) => {
    onUpdate({
      options: (question.options || []).map((o) => (o.id === optId ? { ...o, label } : o)),
    });
  };

  const removeOption = (optId: string) => {
    onUpdate({ options: (question.options || []).filter((o) => o.id !== optId) });
  };

  const toggleCorrect = (optId: string) => {
    onUpdate({
      options: (question.options || []).map((o) =>
        o.id === optId ? { ...o, isCorrect: !o.isCorrect } : { ...o, isCorrect: false }
      ),
    });
  };

  return (
    <div>
      <div className="mb-3 flex items-start gap-2">
        <GripVertical size={16} className="mt-1 shrink-0 cursor-grab opacity-30" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs opacity-40">Q{index + 1}</span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: "var(--sidebar-accent)" }}
            >
              {QUESTION_TYPE_LABELS[question.type]}
            </span>
            {isQuiz && question.type === "multiple-choice" && (
              <input
                type="number"
                value={question.points || 0}
                onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 0 })}
                className="w-16 rounded border bg-transparent px-2 py-0.5 text-[10px]"
                style={{ borderColor: "var(--border)" }}
                placeholder="Points"
              />
            )}
          </div>
          <input
            value={question.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full bg-transparent text-sm font-medium outline-none"
            placeholder="Question title..."
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1 text-[10px] opacity-60">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="accent-[var(--primary)]"
            />
            Required
          </label>
          <button onClick={onRemove} className="opacity-40 hover:opacity-100 hover:text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Options for choice-type questions */}
      {["multiple-choice", "checkbox", "dropdown", "ranking"].includes(question.type) && (
        <div className="ml-6 space-y-2">
          {(question.options || []).map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2">
              {question.type === "multiple-choice" && (
                <div className="h-3.5 w-3.5 shrink-0 rounded-full border" style={{ borderColor: "var(--border)" }} />
              )}
              {question.type === "checkbox" && (
                <div className="h-3.5 w-3.5 shrink-0 rounded border" style={{ borderColor: "var(--border)" }} />
              )}
              {question.type === "ranking" && (
                <span className="text-xs opacity-40 w-4">{i + 1}.</span>
              )}
              <input
                value={opt.label}
                onChange={(e) => updateOption(opt.id, e.target.value)}
                className="flex-1 bg-transparent text-xs outline-none"
              />
              {isQuiz && question.type === "multiple-choice" && (
                <button
                  onClick={() => toggleCorrect(opt.id)}
                  className={cn("text-[10px] rounded px-1.5 py-0.5", opt.isCorrect ? "text-green-400" : "opacity-40")}
                  style={opt.isCorrect ? { backgroundColor: "#10b98122" } : {}}
                >
                  {opt.isCorrect ? "✓ Correct" : "Mark correct"}
                </button>
              )}
              <button onClick={() => removeOption(opt.id)} className="opacity-30 hover:opacity-100">
                <X size={12} />
              </button>
            </div>
          ))}
          <button onClick={addOption} className="text-xs opacity-50 hover:opacity-80">
            + Add option
          </button>
        </div>
      )}

      {/* Scale preview */}
      {question.type === "scale" && (
        <div className="ml-6 flex items-center gap-2 text-xs opacity-60">
          <span>{question.scaleMinLabel || "1"}</span>
          <div className="flex gap-1">
            {Array.from({ length: (question.maxScale || 10) - (question.minScale || 1) + 1 }, (_, i) => (
              <div
                key={i}
                className="flex h-6 w-6 items-center justify-center rounded border text-[10px]"
                style={{ borderColor: "var(--border)" }}
              >
                {(question.minScale || 1) + i}
              </div>
            ))}
          </div>
          <span>{question.scaleMaxLabel || "10"}</span>
        </div>
      )}

      {/* Rating preview */}
      {question.type === "rating" && (
        <div className="ml-6 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={18} className="opacity-30" />
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FILL FORM VIEW
// ═════════════════════════════════════════════════════════════════════════════

function FillFormView({ form, onBack }: { form: Form; onBack: () => void }) {
  const { addResponse } = useFormsStore();
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ earned: number; total: number } | null>(null);

  const setAnswer = (qId: string, val: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const toggleCheckbox = (qId: string, option: string) => {
    const current = (answers[qId] as string[]) || [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setAnswer(qId, next);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    for (const q of form.questions) {
      if (!q.required) continue;
      const a = answers[q.id];
      if (a === undefined || a === "" || (Array.isArray(a) && a.length === 0)) {
        errs[q.id] = "This question is required";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    let quizScore: { earned: number; total: number } | null = null;
    if (form.formType === "quiz") {
      let earned = 0;
      let total = 0;
      for (const q of form.questions) {
        if (q.points && q.options) {
          total += q.points;
          const correct = q.options.find((o) => o.isCorrect);
          if (correct && answers[q.id] === correct.label) {
            earned += q.points;
          }
        }
      }
      quizScore = { earned, total };
      setScore(quizScore);
    }

    addResponse(form.id, {
      id: "resp-" + uid(),
      formId: form.id,
      respondent: "Current User",
      submittedAt: new Date().toISOString(),
      answers,
      ...(quizScore ? { score: quizScore.earned, totalPoints: quizScore.total } : {}),
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <button onClick={onBack} className="opacity-60 hover:opacity-100">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold">{form.title}</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: "#10b98122" }}
          >
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h2 className="mt-6 text-xl font-bold">
            {form.formType === "quiz" ? "Quiz Complete!" : "Response Submitted!"}
          </h2>
          {score && (
            <div className="mt-4 rounded-xl border p-6 text-center" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
              <div className="flex items-center justify-center gap-2">
                <Award size={24} style={{ color: "var(--primary)" }} />
                <span className="text-3xl font-bold">{score.earned}/{score.total}</span>
              </div>
              <p className="mt-2 text-sm opacity-60">
                {Math.round((score.earned / score.total) * 100)}% correct
                {score.earned / score.total >= 0.8 ? " — Great job!" : " — Keep studying!"}
              </p>
              <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--sidebar-accent)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(score.earned / score.total) * 100}%`,
                    backgroundColor: score.earned / score.total >= 0.8 ? "#10b981" : score.earned / score.total >= 0.5 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
            </div>
          )}
          <p className="mt-3 text-sm opacity-60">Thank you for your submission.</p>
          <button
            onClick={onBack}
            className="mt-6 rounded-lg px-6 py-2 text-sm font-medium hover:opacity-90"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Back to Forms
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
        <button onClick={onBack} className="opacity-60 hover:opacity-100">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold">{form.title}</h1>
          <p className="text-xs opacity-60">{form.description}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Form color header */}
          <div className="h-2 rounded-full" style={{ backgroundColor: form.color }} />

          {form.questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-lg border p-5"
              style={{
                borderColor: errors[q.id] ? "#ef4444" : "var(--border)",
                backgroundColor: "var(--sidebar)",
              }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium">
                    {idx + 1}. {q.title || "Untitled Question"}
                  </span>
                  {q.required && <span className="ml-1 text-red-400">*</span>}
                </div>
                {form.formType === "quiz" && q.points && (
                  <span className="text-xs opacity-50">{q.points} pts</span>
                )}
              </div>

              {/* Text */}
              {q.type === "text" && (
                <input
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--border)" }}
                  placeholder="Your answer..."
                />
              )}

              {/* Textarea */}
              {q.type === "textarea" && (
                <textarea
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--border)" }}
                  placeholder="Your answer..."
                />
              )}

              {/* Multiple Choice */}
              {q.type === "multiple-choice" && (
                <div className="space-y-2">
                  {(q.options || []).map((opt) => (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                        answers[q.id] === opt.label ? "border-[var(--primary)]" : ""
                      )}
                      style={{
                        borderColor: answers[q.id] === opt.label ? "var(--primary)" : "var(--border)",
                        backgroundColor: answers[q.id] === opt.label ? "var(--primary)" + "10" : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === opt.label}
                        onChange={() => setAnswer(q.id, opt.label)}
                        className="accent-[var(--primary)]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox */}
              {q.type === "checkbox" && (
                <div className="space-y-2">
                  {(q.options || []).map((opt) => {
                    const checked = ((answers[q.id] as string[]) || []).includes(opt.label);
                    return (
                      <label
                        key={opt.id}
                        className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors"
                        style={{
                          borderColor: checked ? "var(--primary)" : "var(--border)",
                          backgroundColor: checked ? "var(--primary)" + "10" : "transparent",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCheckbox(q.id, opt.label)}
                          className="accent-[var(--primary)]"
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Dropdown */}
              {q.type === "dropdown" && (
                <select
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--border)" }}
                >
                  <option value="">Select an option...</option>
                  {(q.options || []).map((opt) => (
                    <option key={opt.id} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Rating */}
              {q.type === "rating" && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setAnswer(q.id, n)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        fill={(answers[q.id] as number) >= n ? "#f59e0b" : "none"}
                        color={(answers[q.id] as number) >= n ? "#f59e0b" : "var(--foreground)"}
                        className="opacity-60"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Date */}
              {q.type === "date" && (
                <input
                  type="date"
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  className="rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--border)" }}
                />
              )}

              {/* File Upload */}
              {q.type === "file-upload" && (
                <div
                  className="flex flex-col items-center justify-center rounded-md border border-dashed py-8 text-xs opacity-50"
                  style={{ borderColor: "var(--border)" }}
                >
                  <FileText size={24} className="mb-2" />
                  <p>Click to upload or drag and drop</p>
                  <p className="mt-1 text-[10px]">PDF, DOC, PNG, JPG (Max 10MB)</p>
                </div>
              )}

              {/* Scale */}
              {q.type === "scale" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-50">{q.scaleMinLabel || "1"}</span>
                  <div className="flex gap-1">
                    {Array.from(
                      { length: (q.maxScale || 10) - (q.minScale || 1) + 1 },
                      (_, i) => {
                        const val = (q.minScale || 1) + i;
                        return (
                          <button
                            key={val}
                            onClick={() => setAnswer(q.id, val)}
                            className="flex h-8 w-8 items-center justify-center rounded-md border text-xs transition-colors"
                            style={{
                              borderColor: answers[q.id] === val ? "var(--primary)" : "var(--border)",
                              backgroundColor: answers[q.id] === val ? "var(--primary)" : "transparent",
                              color: answers[q.id] === val ? "var(--primary-foreground)" : "inherit",
                            }}
                          >
                            {val}
                          </button>
                        );
                      }
                    )}
                  </div>
                  <span className="text-xs opacity-50">{q.scaleMaxLabel || "10"}</span>
                </div>
              )}

              {/* Ranking */}
              {q.type === "ranking" && (
                <div className="space-y-2">
                  {(q.options || []).map((opt, i) => (
                    <div
                      key={opt.id}
                      className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <span className="text-xs opacity-40 font-mono w-4">{i + 1}</span>
                      <GripVertical size={14} className="opacity-30" />
                      <span>{opt.label}</span>
                    </div>
                  ))}
                  <p className="text-[10px] opacity-40">Drag to reorder (preview only)</p>
                </div>
              )}

              {errors[q.id] && (
                <p className="mt-2 text-xs text-red-400">{errors[q.id]}</p>
              )}
            </div>
          ))}

          {form.questions.length > 0 && (
            <button
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium hover:opacity-90"
              style={{
                backgroundColor: form.color || "var(--primary)",
                color: "#fff",
              }}
            >
              <CheckCircle2 size={16} />
              {form.formType === "quiz" ? "Submit Quiz" : "Submit Response"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// RESPONSES VIEW
// ═════════════════════════════════════════════════════════════════════════════

function ResponsesView({ form, onBack }: { form: Form; onBack: () => void }) {
  const { setViewMode } = useFormsStore();
  const [selectedTab, setSelectedTab] = useState<"summary" | "individual">("summary");

  return (
    <>
      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="opacity-60 hover:opacity-100">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold">{form.title}</h1>
            <p className="text-xs opacity-60">{form.responses.length} responses</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab("summary")}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-medium", selectedTab === "summary" ? "opacity-100" : "opacity-50")}
            style={selectedTab === "summary" ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" } : {}}
          >
            Summary
          </button>
          <button
            onClick={() => setSelectedTab("individual")}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-medium", selectedTab === "individual" ? "opacity-100" : "opacity-50")}
            style={selectedTab === "individual" ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" } : {}}
          >
            Individual
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {form.responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <BarChart3 size={40} />
            <p className="mt-3 text-sm">No responses yet</p>
          </div>
        ) : selectedTab === "summary" ? (
          <ResponseSummary form={form} />
        ) : (
          <IndividualResponses form={form} />
        )}
      </div>
    </>
  );
}

function ResponseSummary({ form }: { form: Form }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
          <div className="text-2xl font-bold">{form.responses.length}</div>
          <div className="text-xs opacity-60">Total Responses</div>
        </div>
        {form.formType === "quiz" && (
          <>
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
              <div className="text-2xl font-bold">
                {form.responses.length > 0
                  ? Math.round(
                      form.responses.reduce((s, r) => s + (r.score || 0), 0) / form.responses.length
                    )
                  : 0}
              </div>
              <div className="text-xs opacity-60">Avg Score</div>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
              <div className="text-2xl font-bold">
                {form.responses.filter((r) => r.score && r.totalPoints && r.score / r.totalPoints >= 0.8).length}
              </div>
              <div className="text-xs opacity-60">Passed (80%+)</div>
            </div>
          </>
        )}
        {form.formType !== "quiz" && (
          <>
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
              <div className="text-2xl font-bold">{form.questions.length}</div>
              <div className="text-xs opacity-60">Questions</div>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
              <div className="text-2xl font-bold">
                {form.responses.length > 0 ? formatDate(form.responses[form.responses.length - 1].submittedAt) : "—"}
              </div>
              <div className="text-xs opacity-60">Last Response</div>
            </div>
          </>
        )}
      </div>

      {/* Per-question charts */}
      {form.questions.map((q) => (
        <QuestionChart key={q.id} question={q} responses={form.responses} />
      ))}
    </div>
  );
}

function QuestionChart({ question, responses }: { question: FormQuestion; responses: FormResponse[] }) {
  const data = useMemo(() => {
    if (["multiple-choice", "dropdown"].includes(question.type)) {
      const counts: Record<string, number> = {};
      for (const r of responses) {
        const ans = r.answers[question.id];
        if (typeof ans === "string" && ans) {
          counts[ans] = (counts[ans] || 0) + 1;
        }
      }
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
    if (question.type === "checkbox") {
      const counts: Record<string, number> = {};
      for (const r of responses) {
        const ans = r.answers[question.id];
        if (Array.isArray(ans)) {
          for (const a of ans) {
            counts[a] = (counts[a] || 0) + 1;
          }
        }
      }
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
    if (question.type === "rating" || question.type === "scale") {
      const counts: Record<string, number> = {};
      for (const r of responses) {
        const ans = r.answers[question.id];
        if (typeof ans === "number") {
          const key = String(ans);
          counts[key] = (counts[key] || 0) + 1;
        }
      }
      return Object.entries(counts)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([name, value]) => ({ name, value }));
    }
    return null;
  }, [question, responses]);

  // Text answers list
  if (["text", "textarea"].includes(question.type)) {
    const textAnswers = responses
      .map((r) => r.answers[question.id])
      .filter((a) => typeof a === "string" && a.trim());
    return (
      <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
        <h3 className="mb-3 text-sm font-semibold">{question.title}</h3>
        {textAnswers.length === 0 ? (
          <p className="text-xs opacity-40">No text responses</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {textAnswers.map((a, i) => (
              <div key={i} className="rounded border px-3 py-2 text-xs" style={{ borderColor: "var(--border)" }}>
                {String(a)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
        <h3 className="mb-3 text-sm font-semibold">{question.title}</h3>
        <p className="text-xs opacity-40">No data to display</p>
      </div>
    );
  }

  const useBar = question.type === "checkbox" || question.type === "scale" || data.length > 5;

  return (
    <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
      <h3 className="mb-4 text-sm font-semibold">{question.title}</h3>
      <div className="flex items-start gap-6">
        <div className="flex-1" style={{ minHeight: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            {useBar ? (
              <BarChart data={data}>
                <XAxis dataKey="name" tick={{ fill: "var(--foreground)", fontSize: 10, opacity: 0.6 }} />
                <YAxis tick={{ fill: "var(--foreground)", fontSize: 10, opacity: 0.6 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--sidebar)",
                    borderColor: "var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <RechartsPie>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            )}
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="space-y-1 shrink-0 min-w-[120px]">
          {data.map((d, idx) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
              />
              <span className="opacity-70 truncate max-w-[100px]">{d.name}</span>
              <span className="ml-auto font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndividualResponses({ form }: { form: Form }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {form.responses.map((r) => (
        <div
          key={r.id}
          className="rounded-lg border"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
        >
          <button
            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
            className="flex w-full items-center justify-between px-5 py-3 text-left"
          >
            <div>
              <span className="text-sm font-medium">{r.respondent}</span>
              <span className="ml-3 text-xs opacity-50">{formatDate(r.submittedAt)}</span>
              {r.score !== undefined && (
                <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "#f59e0b22", color: "#f59e0b" }}>
                  Score: {r.score}/{r.totalPoints}
                </span>
              )}
            </div>
            {expandedId === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedId === r.id && (
            <div className="border-t px-5 py-4 space-y-3" style={{ borderColor: "var(--border)" }}>
              {form.questions.map((q) => (
                <div key={q.id}>
                  <p className="text-xs font-medium opacity-60">{q.title}</p>
                  <p className="mt-0.5 text-sm">
                    {Array.isArray(r.answers[q.id])
                      ? (r.answers[q.id] as string[]).join(", ")
                      : String(r.answers[q.id] ?? "—")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SHARE VIEW
// ═════════════════════════════════════════════════════════════════════════════

function ShareView({ form, onBack }: { form: Form; onBack: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const shareLink = `https://vidyalaya.office/forms/${form.id}`;
  const embedCode = `<iframe src="${shareLink}/embed" width="640" height="800" frameborder="0"></iframe>`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
        <button onClick={onBack} className="opacity-60 hover:opacity-100">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">Share: {form.title}</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Link */}
          <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
            <div className="mb-3 flex items-center gap-2">
              <Link size={16} style={{ color: "var(--primary)" }} />
              <h3 className="text-sm font-semibold">Shareable Link</h3>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareLink}
                className="flex-1 rounded-md border bg-transparent px-3 py-2 text-xs outline-none"
                style={{ borderColor: "var(--border)" }}
              />
              <button
                onClick={() => handleCopy(shareLink, "link")}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-xs font-medium hover:opacity-80"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <Copy size={12} />
                {copied === "link" ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] opacity-50">
              {form.audience === "internal" ? <Lock size={10} /> : <Globe size={10} />}
              {form.audience === "internal"
                ? "Only internal employees can access"
                : "Anyone with the link can fill this form"}
            </div>
          </div>

          {/* QR Code */}
          <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
            <div className="mb-3 flex items-center gap-2">
              <QrCode size={16} style={{ color: "var(--primary)" }} />
              <h3 className="text-sm font-semibold">QR Code</h3>
            </div>
            <div
              className="mx-auto flex h-40 w-40 items-center justify-center rounded-lg border"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
            >
              <div className="text-center">
                <QrCode size={48} className="mx-auto opacity-20" />
                <p className="mt-2 text-[10px] opacity-40">QR Code Preview</p>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] opacity-40">
              Scan to open the form on mobile devices
            </p>
          </div>

          {/* Embed Code */}
          <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
            <div className="mb-3 flex items-center gap-2">
              <Code size={16} style={{ color: "var(--primary)" }} />
              <h3 className="text-sm font-semibold">Embed Code</h3>
            </div>
            <pre
              className="overflow-x-auto rounded-md border p-3 text-xs"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
            >
              {embedCode}
            </pre>
            <button
              onClick={() => handleCopy(embedCode, "embed")}
              className="mt-3 flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium hover:opacity-80"
              style={{ backgroundColor: "var(--sidebar-accent)" }}
            >
              <Copy size={12} />
              {copied === "embed" ? "Copied!" : "Copy Embed Code"}
            </button>
          </div>

          {/* Form details */}
          <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}>
            <h3 className="mb-3 text-sm font-semibold">Form Details</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="opacity-60">Type</span>
                <span className="font-medium">{FORM_TYPE_LABELS[form.formType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Audience</span>
                <span className="font-medium">{form.audience === "internal" ? "Internal" : "External"}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Questions</span>
                <span className="font-medium">{form.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Responses</span>
                <span className="font-medium">{form.responses.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Status</span>
                <span className="font-medium capitalize">{form.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Created</span>
                <span className="font-medium">{formatDate(form.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
