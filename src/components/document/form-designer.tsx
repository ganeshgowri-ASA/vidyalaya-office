"use client";

import React, { useState, useCallback } from "react";
import {
  Type, AlignLeft, ChevronDown, Circle, CheckSquare, Calendar,
  Hash, Upload, PenTool, Star, ToggleLeft, Palette, Sliders,
  Columns, LayoutList, Table2, LayoutDashboard, Wand2, Eye, Download,
  Trash2, Plus, GripVertical, Settings, Copy, FileText, Loader2,
  X, MoveUp, MoveDown, Save, FolderOpen, Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FieldType = "text" | "textarea" | "dropdown" | "radio" | "checkbox" | "date" | "number" | "file" | "signature" | "rating" | "toggle" | "color" | "slider";
type FormLayout = "single" | "two-column" | "tabs" | "sections";

interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternLabel?: string;
}

interface ConditionalLogic {
  enabled: boolean;
  dependsOn: string;
  operator: "equals" | "not_equals" | "contains" | "greater" | "less";
  value: string;
}

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  options: string[];
  validation: ValidationRule;
  conditional: ConditionalLogic;
  section: string;
  width: "full" | "half";
  value: string;
}

interface FormTemplate {
  name: string;
  description: string;
  icon: React.ReactNode;
  fields: Omit<FormField, "id">[];
}

type DesignerView = "design" | "preview" | "data" | "settings";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Text Input", icon: <Type size={14} /> },
  { type: "textarea", label: "Textarea", icon: <AlignLeft size={14} /> },
  { type: "dropdown", label: "Dropdown", icon: <ChevronDown size={14} /> },
  { type: "radio", label: "Radio Buttons", icon: <Circle size={14} /> },
  { type: "checkbox", label: "Checkboxes", icon: <CheckSquare size={14} /> },
  { type: "date", label: "Date Picker", icon: <Calendar size={14} /> },
  { type: "number", label: "Number Input", icon: <Hash size={14} /> },
  { type: "file", label: "File Upload", icon: <Upload size={14} /> },
  { type: "signature", label: "Signature Pad", icon: <PenTool size={14} /> },
  { type: "rating", label: "Rating / Stars", icon: <Star size={14} /> },
  { type: "toggle", label: "Toggle Switch", icon: <ToggleLeft size={14} /> },
  { type: "color", label: "Color Picker", icon: <Palette size={14} /> },
  { type: "slider", label: "Slider / Range", icon: <Sliders size={14} /> },
];

const VALIDATION_PATTERNS = [
  { label: "Email", value: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
  { label: "Phone", value: "^[\\+]?[0-9\\-\\s\\(\\)]{7,15}$" },
  { label: "URL", value: "^https?://.+" },
  { label: "Zip Code", value: "^\\d{5}(-\\d{4})?$" },
];

function makeField(type: FieldType, label: string, extra: Partial<FormField> = {}): Omit<FormField, "id"> {
  return {
    type, label, placeholder: "", options: type === "dropdown" || type === "radio" || type === "checkbox" ? ["Option 1", "Option 2", "Option 3"] : [],
    validation: { required: false }, conditional: { enabled: false, dependsOn: "", operator: "equals", value: "" },
    section: "Main", width: "full", value: "", ...extra,
  };
}

const FORM_TEMPLATES: FormTemplate[] = [
  {
    name: "Contact Form", description: "Simple contact form with name, email, and message", icon: <FileText size={16} />,
    fields: [
      makeField("text", "Full Name", { placeholder: "Enter your name", validation: { required: true } }),
      makeField("text", "Email", { placeholder: "email@example.com", validation: { required: true, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", patternLabel: "Email" } }),
      makeField("text", "Phone", { placeholder: "+1 (555) 000-0000", width: "half" }),
      makeField("dropdown", "Subject", { options: ["General Inquiry", "Support", "Feedback", "Partnership"], width: "half" }),
      makeField("textarea", "Message", { placeholder: "Type your message...", validation: { required: true, minLength: 10 } }),
    ],
  },
  {
    name: "Survey", description: "Customer satisfaction survey", icon: <Star size={16} />,
    fields: [
      makeField("rating", "Overall Satisfaction", { validation: { required: true } }),
      makeField("radio", "How did you find us?", { options: ["Search Engine", "Social Media", "Friend Referral", "Advertisement"] }),
      makeField("dropdown", "Age Group", { options: ["18-24", "25-34", "35-44", "45-54", "55+"] }),
      makeField("checkbox", "What features do you value?", { options: ["Quality", "Price", "Customer Service", "Speed", "Innovation"] }),
      makeField("textarea", "Additional Comments", { placeholder: "Any other feedback..." }),
      makeField("toggle", "Subscribe to newsletter"),
    ],
  },
  {
    name: "Registration", description: "Event or account registration", icon: <FileText size={16} />,
    fields: [
      makeField("text", "First Name", { validation: { required: true }, width: "half" }),
      makeField("text", "Last Name", { validation: { required: true }, width: "half" }),
      makeField("text", "Email", { validation: { required: true, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", patternLabel: "Email" } }),
      makeField("text", "Organization", { width: "half" }),
      makeField("dropdown", "Role", { options: ["Student", "Professional", "Academic", "Other"], width: "half" }),
      makeField("date", "Date of Birth"),
      makeField("checkbox", "Areas of Interest", { options: ["Technology", "Science", "Arts", "Business", "Health"] }),
      makeField("toggle", "Accept Terms & Conditions", { validation: { required: true } }),
    ],
  },
  {
    name: "Feedback", description: "Product or service feedback", icon: <Star size={16} />,
    fields: [
      makeField("text", "Your Name", { width: "half" }),
      makeField("text", "Email", { width: "half" }),
      makeField("rating", "Product Rating", { validation: { required: true } }),
      makeField("radio", "Would you recommend us?", { options: ["Definitely", "Probably", "Not sure", "No"] }),
      makeField("textarea", "What did you like?", { placeholder: "Tell us what you enjoyed..." }),
      makeField("textarea", "What can we improve?", { placeholder: "Suggestions for improvement..." }),
    ],
  },
  {
    name: "Order Form", description: "Simple product order form", icon: <FileText size={16} />,
    fields: [
      makeField("text", "Customer Name", { validation: { required: true } }),
      makeField("text", "Email", { validation: { required: true } }),
      makeField("text", "Shipping Address", { validation: { required: true } }),
      makeField("dropdown", "Product", { options: ["Basic Plan", "Pro Plan", "Enterprise Plan"] }),
      makeField("number", "Quantity", { validation: { required: true, min: 1, max: 100 } }),
      makeField("text", "Coupon Code", { placeholder: "Optional" }),
      makeField("toggle", "Gift Wrap"),
      makeField("textarea", "Special Instructions"),
    ],
  },
  {
    name: "Application", description: "Job or program application", icon: <FileText size={16} />,
    fields: [
      makeField("text", "Full Name", { validation: { required: true } }),
      makeField("text", "Email", { validation: { required: true } }),
      makeField("text", "Phone", { width: "half" }),
      makeField("text", "LinkedIn URL", { width: "half" }),
      makeField("dropdown", "Position", { options: ["Software Engineer", "Designer", "Product Manager", "Data Analyst"] }),
      makeField("dropdown", "Experience", { options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"] }),
      makeField("textarea", "Cover Letter", { validation: { required: true, minLength: 50 } }),
      makeField("file", "Resume Upload", { validation: { required: true } }),
      makeField("toggle", "Available for relocation"),
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  AI Form Generation                                                 */
/* ------------------------------------------------------------------ */

function generateFormFromPrompt(prompt: string): FormField[] {
  const p = prompt.toLowerCase();
  let fields: Omit<FormField, "id">[] = [];

  if (p.includes("contact")) {
    fields = FORM_TEMPLATES[0].fields;
  } else if (p.includes("survey") || p.includes("satisfaction")) {
    fields = FORM_TEMPLATES[1].fields;
  } else if (p.includes("regist")) {
    fields = FORM_TEMPLATES[2].fields;
  } else if (p.includes("feedback")) {
    fields = FORM_TEMPLATES[3].fields;
  } else if (p.includes("order") || p.includes("purchase")) {
    fields = FORM_TEMPLATES[4].fields;
  } else if (p.includes("appli") || p.includes("job") || p.includes("hiring")) {
    fields = FORM_TEMPLATES[5].fields;
  } else {
    // Generate generic form from keywords
    fields = [makeField("text", "Name", { validation: { required: true } })];
    if (p.includes("email") || p.includes("contact")) fields.push(makeField("text", "Email", { validation: { required: true, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", patternLabel: "Email" } }));
    if (p.includes("phone") || p.includes("call")) fields.push(makeField("text", "Phone Number"));
    if (p.includes("date") || p.includes("when")) fields.push(makeField("date", "Date"));
    if (p.includes("rate") || p.includes("rating") || p.includes("score")) fields.push(makeField("rating", "Rating"));
    if (p.includes("comment") || p.includes("message") || p.includes("note")) fields.push(makeField("textarea", "Comments"));
    if (p.includes("file") || p.includes("upload") || p.includes("attach")) fields.push(makeField("file", "File Upload"));
    if (p.includes("agree") || p.includes("terms") || p.includes("consent")) fields.push(makeField("toggle", "I agree to the terms"));
    if (fields.length <= 1) {
      fields.push(makeField("text", "Email"), makeField("textarea", "Details", { placeholder: "Provide details..." }));
    }
  }

  return fields.map((f, i) => ({ ...f, id: `field-${Date.now()}-${i}` }));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface FormDesignerProps {
  onEmbedInDocument?: (html: string) => void;
}

export function FormDesigner({ onEmbedInDocument }: FormDesignerProps) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [view, setView] = useState<DesignerView>("design");
  const [layout, setLayout] = useState<FormLayout>("single");
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const addField = useCallback((type: FieldType) => {
    const field: FormField = {
      id: `field-${Date.now()}`,
      type, label: `${FIELD_TYPES.find(f => f.type === type)?.label || "Field"}`, placeholder: "",
      options: type === "dropdown" || type === "radio" || type === "checkbox" ? ["Option 1", "Option 2", "Option 3"] : [],
      validation: { required: false },
      conditional: { enabled: false, dependsOn: "", operator: "equals", value: "" },
      section: "Main", width: "full", value: "",
    };
    setFields(prev => [...prev, field]);
    setSelectedFieldId(field.id);
  }, []);

  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const removeField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  }, [selectedFieldId]);

  const moveField = useCallback((id: string, dir: -1 | 1) => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx < 0 || (dir === -1 && idx === 0) || (dir === 1 && idx === prev.length - 1)) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
      return arr;
    });
  }, []);

  const duplicateField = useCallback((id: string) => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx < 0) return prev;
      const clone = { ...prev[idx], id: `field-${Date.now()}`, label: prev[idx].label + " (copy)" };
      const arr = [...prev];
      arr.splice(idx + 1, 0, clone);
      return arr;
    });
  }, []);

  const handleAIGenerate = useCallback(() => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setTimeout(() => {
      const generated = generateFormFromPrompt(aiPrompt);
      setFields(generated);
      setAiGenerating(false);
      setView("design");
    }, 1000);
  }, [aiPrompt]);

  const loadTemplate = useCallback((tpl: FormTemplate) => {
    setFields(tpl.fields.map((f, i) => ({ ...f, id: `field-${Date.now()}-${i}` })));
    setFormTitle(tpl.name);
    setView("design");
  }, []);

  const handleSubmitPreview = useCallback(() => {
    const data: Record<string, string> = {};
    fields.forEach(f => { data[f.label] = f.value || "(empty)"; });
    setResponses(prev => [...prev, data]);
    setFields(prev => prev.map(f => ({ ...f, value: "" })));
  }, [fields]);

  const exportResponses = useCallback((format: "csv" | "json") => {
    if (responses.length === 0) return;
    let content: string;
    let mimeType: string;
    let ext: string;
    if (format === "json") {
      content = JSON.stringify(responses, null, 2);
      mimeType = "application/json";
      ext = "json";
    } else {
      const headers = Object.keys(responses[0]);
      const rows = responses.map(r => headers.map(h => `"${(r[h] || "").replace(/"/g, '""')}"`).join(","));
      content = headers.join(",") + "\n" + rows.join("\n");
      mimeType = "text/csv";
      ext = "csv";
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${formTitle.replace(/\s+/g, "_")}_responses.${ext}`; a.click();
    URL.revokeObjectURL(url);
  }, [responses, formTitle]);

  const embedForm = useCallback(() => {
    if (!onEmbedInDocument) return;
    let html = `<div style="border:1px solid #ddd;border-radius:8px;padding:20px;margin:16px 0;background:#fafafa;"><h3 style="margin:0 0 16px 0;">${formTitle}</h3>`;
    fields.forEach(f => {
      html += `<div style="margin-bottom:12px;"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">${f.label}${f.validation.required ? ' <span style="color:red;">*</span>' : ""}</label>`;
      switch (f.type) {
        case "text": case "date": case "number": case "color":
          html += `<input type="${f.type}" placeholder="${f.placeholder}" style="width:100%;padding:6px 10px;border:1px solid #ccc;border-radius:4px;" />`; break;
        case "textarea":
          html += `<textarea placeholder="${f.placeholder}" style="width:100%;padding:6px 10px;border:1px solid #ccc;border-radius:4px;min-height:60px;"></textarea>`; break;
        case "dropdown":
          html += `<select style="width:100%;padding:6px 10px;border:1px solid #ccc;border-radius:4px;">${f.options.map(o => `<option>${o}</option>`).join("")}</select>`; break;
        case "radio":
          f.options.forEach(o => { html += `<label style="display:block;margin:2px 0;"><input type="radio" name="${f.id}" /> ${o}</label>`; }); break;
        case "checkbox":
          f.options.forEach(o => { html += `<label style="display:block;margin:2px 0;"><input type="checkbox" /> ${o}</label>`; }); break;
        default:
          html += `<input type="text" placeholder="${f.placeholder || f.type}" style="width:100%;padding:6px 10px;border:1px solid #ccc;border-radius:4px;" />`;
      }
      html += "</div>";
    });
    html += `<button style="background:#3182ce;color:white;padding:8px 20px;border:none;border-radius:4px;cursor:pointer;">Submit</button></div>`;
    onEmbedInDocument(html);
  }, [fields, formTitle, onEmbedInDocument]);

  /* ---- Drag & drop handlers ---- */
  const handleDragStart = useCallback((id: string) => { setDraggingId(id); }, []);
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index); }, []);
  const handleDrop = useCallback((targetIndex: number) => {
    if (!draggingId) return;
    setFields(prev => {
      const sourceIdx = prev.findIndex(f => f.id === draggingId);
      if (sourceIdx < 0) return prev;
      const arr = [...prev];
      const [moved] = arr.splice(sourceIdx, 1);
      arr.splice(targetIndex, 0, moved);
      return arr;
    });
    setDraggingId(null);
    setDragOverIndex(null);
  }, [draggingId]);

  /* ---- Render field preview ---- */
  const renderFieldPreview = (field: FormField, isPreview: boolean) => {
    const baseInputStyle: React.CSSProperties = { width: "100%", padding: "6px 10px", borderRadius: "4px", fontSize: "13px", background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", outline: "none" };
    switch (field.type) {
      case "text": return <input type="text" placeholder={field.placeholder || "Enter text..."} value={isPreview ? field.value : ""} onChange={isPreview ? (e) => updateField(field.id, { value: e.target.value }) : undefined} readOnly={!isPreview} style={baseInputStyle} />;
      case "textarea": return <textarea placeholder={field.placeholder || "Enter text..."} value={isPreview ? field.value : ""} onChange={isPreview ? (e) => updateField(field.id, { value: e.target.value }) : undefined} readOnly={!isPreview} style={{ ...baseInputStyle, minHeight: "60px", resize: "vertical" }} />;
      case "dropdown": return <select value={isPreview ? field.value : ""} onChange={isPreview ? (e) => updateField(field.id, { value: e.target.value }) : undefined} style={baseInputStyle}><option value="">Select...</option>{field.options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
      case "radio": return <div className="space-y-1">{field.options.map(o => <label key={o} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--foreground)" }}><input type="radio" name={`radio-${field.id}`} value={o} checked={isPreview ? field.value === o : false} onChange={isPreview ? () => updateField(field.id, { value: o }) : undefined} /> {o}</label>)}</div>;
      case "checkbox": return <div className="space-y-1">{field.options.map(o => <label key={o} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--foreground)" }}><input type="checkbox" /> {o}</label>)}</div>;
      case "date": return <input type="date" value={isPreview ? field.value : ""} onChange={isPreview ? (e) => updateField(field.id, { value: e.target.value }) : undefined} style={baseInputStyle} />;
      case "number": return <input type="number" placeholder="0" value={isPreview ? field.value : ""} onChange={isPreview ? (e) => updateField(field.id, { value: e.target.value }) : undefined} style={baseInputStyle} min={field.validation.min} max={field.validation.max} />;
      case "file": return <div className="flex items-center gap-2 p-3 rounded border-dashed" style={{ border: "2px dashed var(--border)" }}><Upload size={16} style={{ color: "var(--muted-foreground)" }} /><span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Click or drag to upload</span></div>;
      case "signature": return <div className="h-20 rounded flex items-center justify-center" style={{ border: "1px solid var(--border)", background: "var(--background)" }}><PenTool size={16} style={{ color: "var(--muted-foreground)" }} /><span className="text-xs ml-2" style={{ color: "var(--muted-foreground)" }}>Sign here</span></div>;
      case "rating": return <div className="flex gap-1">{[1,2,3,4,5].map(n => <button key={n} onClick={isPreview ? () => updateField(field.id, { value: String(n) }) : undefined} className="transition-colors"><Star size={20} fill={parseInt(field.value || "0") >= n ? "#f59e0b" : "none"} style={{ color: parseInt(field.value || "0") >= n ? "#f59e0b" : "var(--muted-foreground)" }} /></button>)}</div>;
      case "toggle": return <label className="flex items-center gap-2 cursor-pointer"><div className="relative w-10 h-5 rounded-full transition-colors" style={{ background: field.value === "true" ? "var(--primary)" : "var(--muted)" }}><div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: field.value === "true" ? "22px" : "2px" }} /></div><input type="checkbox" className="sr-only" checked={field.value === "true"} onChange={isPreview ? (e) => updateField(field.id, { value: String(e.target.checked) }) : undefined} /></label>;
      case "color": return <input type="color" value={field.value || "#3182ce"} onChange={isPreview ? (e) => updateField(field.id, { value: e.target.value }) : undefined} style={{ width: "48px", height: "32px", border: "none", cursor: "pointer" }} />;
      case "slider": return <div className="flex items-center gap-3"><input type="range" min={field.validation.min || 0} max={field.validation.max || 100} value={field.value || "50"} onChange={isPreview ? (e) => updateField(field.id, { value: e.target.value }) : undefined} className="flex-1" /><span className="text-xs w-8 text-right" style={{ color: "var(--foreground)" }}>{field.value || "50"}</span></div>;
      default: return null;
    }
  };

  const viewItems: { key: DesignerView; label: string; icon: React.ReactNode }[] = [
    { key: "design", label: "Design", icon: <LayoutList size={13} /> },
    { key: "preview", label: "Preview", icon: <Eye size={13} /> },
    { key: "data", label: "Responses", icon: <FileText size={13} /> },
    { key: "settings", label: "Settings", icon: <Settings size={13} /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          {viewItems.map(v => (
            <button key={v.key} onClick={() => setView(v.key)} className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded transition-colors"
              style={{ background: view === v.key ? "var(--card)" : "transparent", color: view === v.key ? "var(--foreground)" : "var(--muted-foreground)", border: view === v.key ? "1px solid var(--border)" : "1px solid transparent" }}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {onEmbedInDocument && fields.length > 0 && (
            <button onClick={embedForm} className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded" style={{ background: "var(--primary)", color: "#fff" }}>
              <FileText size={11} /> Embed in Doc
            </button>
          )}
        </div>
      </div>

      {/* ======== DESIGN VIEW ======== */}
      {view === "design" && (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Field palette + AI */}
          <div className="w-56 flex-shrink-0 overflow-y-auto p-2" style={{ borderRight: "1px solid var(--border)", background: "var(--background)" }}>
            {/* AI Form Generation */}
            <div className="mb-3 p-2 rounded-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-1 mb-2"><Wand2 size={12} style={{ color: "var(--primary)" }} /><span className="text-[10px] font-semibold" style={{ color: "var(--foreground)" }}>AI Form Builder</span></div>
              <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Describe your form..." className="w-full text-[11px] p-1.5 rounded resize-none outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", height: "48px" }} />
              <button onClick={handleAIGenerate} disabled={aiGenerating || !aiPrompt.trim()} className="w-full mt-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-medium rounded disabled:opacity-50" style={{ background: "var(--primary)", color: "#fff" }}>
                {aiGenerating ? <><Loader2 size={10} className="animate-spin" /> Generating...</> : <><Zap size={10} /> Generate</>}
              </button>
            </div>

            {/* Templates */}
            <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 px-1" style={{ color: "var(--muted-foreground)" }}>Templates</div>
            <div className="mb-3 space-y-1">
              {FORM_TEMPLATES.map(tpl => (
                <button key={tpl.name} onClick={() => loadTemplate(tpl)} className="w-full text-left text-[11px] px-2 py-1.5 rounded flex items-center gap-1.5 transition-colors hover:bg-[var(--muted)]" style={{ color: "var(--foreground)" }}>
                  {tpl.icon}<span className="truncate">{tpl.name}</span>
                </button>
              ))}
            </div>

            {/* Field types */}
            <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 px-1" style={{ color: "var(--muted-foreground)" }}>Add Field</div>
            {FIELD_TYPES.map(ft => (
              <button key={ft.type} onClick={() => addField(ft.type)} className="w-full text-left text-[11px] px-2 py-1.5 rounded flex items-center gap-1.5 transition-colors hover:bg-[var(--muted)]" style={{ color: "var(--foreground)" }}>
                {ft.icon}<span>{ft.label}</span><Plus size={10} className="ml-auto" style={{ color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>

          {/* Center: Form canvas */}
          <div className="flex-1 overflow-y-auto p-4">
            <input value={formTitle} onChange={e => setFormTitle(e.target.value)} className="text-lg font-bold mb-4 bg-transparent outline-none border-b border-transparent hover:border-[var(--border)] focus:border-[var(--primary)] px-1 w-full" style={{ color: "var(--foreground)" }} />
            {fields.length === 0 && (
              <div className="text-center py-12 rounded-lg" style={{ border: "2px dashed var(--border)", color: "var(--muted-foreground)" }}>
                <LayoutList size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Drag fields from the left or use AI to generate a form</p>
              </div>
            )}
            <div className={layout === "two-column" ? "grid grid-cols-2 gap-3" : "space-y-2"}>
              {fields.map((field, idx) => (
                <div key={field.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${field.width === "half" && layout === "single" ? "w-1/2" : "w-full"}`}
                  style={{ background: selectedFieldId === field.id ? "var(--accent)" : "var(--card)", border: `1px solid ${selectedFieldId === field.id ? "var(--primary)" : dragOverIndex === idx ? "var(--primary)" : "var(--border)"}` }}
                  onClick={() => setSelectedFieldId(field.id)}
                  draggable onDragStart={() => handleDragStart(field.id)} onDragOver={e => handleDragOver(e, idx)} onDrop={() => handleDrop(idx)} onDragEnd={() => { setDraggingId(null); setDragOverIndex(null); }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <GripVertical size={12} style={{ color: "var(--muted-foreground)", cursor: "grab" }} />
                      <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{field.label}</span>
                      {field.validation.required && <span className="text-red-500 text-xs">*</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); moveField(field.id, -1); }} className="p-0.5 rounded hover:bg-[var(--muted)]"><MoveUp size={10} style={{ color: "var(--muted-foreground)" }} /></button>
                      <button onClick={e => { e.stopPropagation(); moveField(field.id, 1); }} className="p-0.5 rounded hover:bg-[var(--muted)]"><MoveDown size={10} style={{ color: "var(--muted-foreground)" }} /></button>
                      <button onClick={e => { e.stopPropagation(); duplicateField(field.id); }} className="p-0.5 rounded hover:bg-[var(--muted)]"><Copy size={10} style={{ color: "var(--muted-foreground)" }} /></button>
                      <button onClick={e => { e.stopPropagation(); removeField(field.id); }} className="p-0.5 rounded hover:bg-[var(--muted)]"><Trash2 size={10} style={{ color: "#f87171" }} /></button>
                    </div>
                  </div>
                  {renderFieldPreview(field, false)}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Properties panel */}
          {selectedField && (
            <div className="w-64 flex-shrink-0 overflow-y-auto p-3" style={{ borderLeft: "1px solid var(--border)", background: "var(--background)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Properties</span>
                <button onClick={() => setSelectedFieldId(null)} className="p-0.5 rounded hover:bg-[var(--muted)]"><X size={12} style={{ color: "var(--muted-foreground)" }} /></button>
              </div>
              {/* Label */}
              <label className="text-[10px] font-semibold block mb-1" style={{ color: "var(--muted-foreground)" }}>Label</label>
              <input value={selectedField.label} onChange={e => updateField(selectedField.id, { label: e.target.value })} className="w-full text-xs px-2 py-1 rounded border outline-none mb-2 bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
              {/* Placeholder */}
              <label className="text-[10px] font-semibold block mb-1" style={{ color: "var(--muted-foreground)" }}>Placeholder</label>
              <input value={selectedField.placeholder} onChange={e => updateField(selectedField.id, { placeholder: e.target.value })} className="w-full text-xs px-2 py-1 rounded border outline-none mb-2 bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
              {/* Width */}
              <label className="text-[10px] font-semibold block mb-1" style={{ color: "var(--muted-foreground)" }}>Width</label>
              <select value={selectedField.width} onChange={e => updateField(selectedField.id, { width: e.target.value as "full" | "half" })} className="w-full text-xs px-2 py-1 rounded border outline-none mb-2 bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <option value="full">Full Width</option><option value="half">Half Width</option>
              </select>
              {/* Options */}
              {(selectedField.type === "dropdown" || selectedField.type === "radio" || selectedField.type === "checkbox") && (
                <>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: "var(--muted-foreground)" }}>Options</label>
                  {selectedField.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-1 mb-1">
                      <input value={opt} onChange={e => { const newOpts = [...selectedField.options]; newOpts[oi] = e.target.value; updateField(selectedField.id, { options: newOpts }); }}
                        className="flex-1 text-xs px-2 py-0.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                      <button onClick={() => { const newOpts = selectedField.options.filter((_, i) => i !== oi); updateField(selectedField.id, { options: newOpts }); }} className="p-0.5"><X size={10} style={{ color: "#f87171" }} /></button>
                    </div>
                  ))}
                  <button onClick={() => updateField(selectedField.id, { options: [...selectedField.options, `Option ${selectedField.options.length + 1}`] })} className="text-[10px] px-2 py-0.5 rounded mt-1 mb-2" style={{ background: "var(--muted)", color: "var(--foreground)" }}>+ Add Option</button>
                </>
              )}
              {/* Validation */}
              <div className="text-[10px] font-semibold mb-1 mt-2" style={{ color: "var(--muted-foreground)" }}>Validation</div>
              <label className="flex items-center gap-2 text-xs mb-1 cursor-pointer" style={{ color: "var(--foreground)" }}>
                <input type="checkbox" checked={selectedField.validation.required} onChange={e => updateField(selectedField.id, { validation: { ...selectedField.validation, required: e.target.checked } })} /> Required
              </label>
              {(selectedField.type === "text" || selectedField.type === "textarea") && (
                <div className="flex gap-2 mb-1">
                  <div><label className="text-[10px] block" style={{ color: "var(--muted-foreground)" }}>Min Len</label><input type="number" value={selectedField.validation.minLength || ""} onChange={e => updateField(selectedField.id, { validation: { ...selectedField.validation, minLength: parseInt(e.target.value) || undefined } })} className="w-16 text-xs px-1 py-0.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} /></div>
                  <div><label className="text-[10px] block" style={{ color: "var(--muted-foreground)" }}>Max Len</label><input type="number" value={selectedField.validation.maxLength || ""} onChange={e => updateField(selectedField.id, { validation: { ...selectedField.validation, maxLength: parseInt(e.target.value) || undefined } })} className="w-16 text-xs px-1 py-0.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} /></div>
                </div>
              )}
              {selectedField.type === "text" && (
                <>
                  <label className="text-[10px] block mb-1" style={{ color: "var(--muted-foreground)" }}>Pattern</label>
                  <select value={selectedField.validation.patternLabel || ""} onChange={e => {
                    const pat = VALIDATION_PATTERNS.find(p => p.label === e.target.value);
                    updateField(selectedField.id, { validation: { ...selectedField.validation, pattern: pat?.value, patternLabel: pat?.label } });
                  }} className="w-full text-xs px-2 py-1 rounded border outline-none mb-2 bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <option value="">None</option>
                    {VALIDATION_PATTERNS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                  </select>
                </>
              )}
              {(selectedField.type === "number" || selectedField.type === "slider") && (
                <div className="flex gap-2 mb-1">
                  <div><label className="text-[10px] block" style={{ color: "var(--muted-foreground)" }}>Min</label><input type="number" value={selectedField.validation.min ?? ""} onChange={e => updateField(selectedField.id, { validation: { ...selectedField.validation, min: parseInt(e.target.value) || undefined } })} className="w-16 text-xs px-1 py-0.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} /></div>
                  <div><label className="text-[10px] block" style={{ color: "var(--muted-foreground)" }}>Max</label><input type="number" value={selectedField.validation.max ?? ""} onChange={e => updateField(selectedField.id, { validation: { ...selectedField.validation, max: parseInt(e.target.value) || undefined } })} className="w-16 text-xs px-1 py-0.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} /></div>
                </div>
              )}
              {/* Conditional Logic */}
              <div className="text-[10px] font-semibold mb-1 mt-2" style={{ color: "var(--muted-foreground)" }}>Conditional Logic</div>
              <label className="flex items-center gap-2 text-xs mb-1 cursor-pointer" style={{ color: "var(--foreground)" }}>
                <input type="checkbox" checked={selectedField.conditional.enabled} onChange={e => updateField(selectedField.id, { conditional: { ...selectedField.conditional, enabled: e.target.checked } })} /> Show/hide based on another field
              </label>
              {selectedField.conditional.enabled && (
                <>
                  <select value={selectedField.conditional.dependsOn} onChange={e => updateField(selectedField.id, { conditional: { ...selectedField.conditional, dependsOn: e.target.value } })} className="w-full text-xs px-2 py-1 rounded border outline-none mb-1 bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <option value="">Select field...</option>
                    {fields.filter(f => f.id !== selectedField.id).map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                  <select value={selectedField.conditional.operator} onChange={e => updateField(selectedField.id, { conditional: { ...selectedField.conditional, operator: e.target.value as ConditionalLogic["operator"] } })} className="w-full text-xs px-2 py-1 rounded border outline-none mb-1 bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <option value="equals">Equals</option><option value="not_equals">Not Equals</option><option value="contains">Contains</option><option value="greater">Greater Than</option><option value="less">Less Than</option>
                  </select>
                  <input value={selectedField.conditional.value} onChange={e => updateField(selectedField.id, { conditional: { ...selectedField.conditional, value: e.target.value } })} placeholder="Value..." className="w-full text-xs px-2 py-1 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======== PREVIEW VIEW ======== */}
      {view === "preview" && (
        <div className="flex-1 overflow-y-auto flex justify-center p-6">
          <div className="w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>{formTitle}</h2>
            {fields.length === 0 && <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No fields added. Switch to Design view.</p>}
            <div className="space-y-4">
              {fields.map(field => (
                <div key={field.id}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>
                    {field.label} {field.validation.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderFieldPreview(field, true)}
                </div>
              ))}
            </div>
            {fields.length > 0 && (
              <button onClick={handleSubmitPreview} className="mt-6 px-6 py-2 text-sm font-medium rounded-lg" style={{ background: "var(--primary)", color: "#fff" }}>Submit</button>
            )}
          </div>
        </div>
      )}

      {/* ======== DATA VIEW ======== */}
      {view === "data" && (
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Responses ({responses.length})</span>
            {responses.length > 0 && (
              <div className="flex gap-2">
                <button onClick={() => exportResponses("csv")} className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}><Download size={11} /> CSV</button>
                <button onClick={() => exportResponses("json")} className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}><Download size={11} /> JSON</button>
              </div>
            )}
          </div>
          {responses.length === 0 ? (
            <div className="text-xs text-center py-8 rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>No responses yet. Use Preview to submit test data.</div>
          ) : (
            <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr style={{ background: "var(--muted)" }}>{Object.keys(responses[0]).map(h => <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap" style={{ color: "var(--foreground)" }}>{h}</th>)}</tr></thead>
                  <tbody>{responses.map((r, i) => <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>{Object.values(r).map((v, j) => <td key={j} className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--foreground)" }}>{v}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======== SETTINGS VIEW ======== */}
      {view === "settings" && (
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>Form Title</label>
              <input value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full text-sm px-3 py-1.5 rounded border outline-none bg-transparent" style={{ borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>Layout</label>
              <div className="flex gap-2">
                {([["single", "Single Column", <Columns key="s" size={14} />], ["two-column", "Two Column", <Columns key="t" size={14} />], ["tabs", "Tabs", <Table2 key="tb" size={14} />], ["sections", "Sections", <LayoutDashboard key="sc" size={14} />]] as const).map(([key, label, icon]) => (
                  <button key={key} onClick={() => setLayout(key)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border" style={{ borderColor: layout === key ? "var(--primary)" : "var(--border)", color: layout === key ? "var(--primary)" : "var(--foreground)", background: layout === key ? "var(--accent)" : "transparent" }}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>Total Fields: {fields.length}</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
