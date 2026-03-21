"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Check,
  AlertCircle,
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  Plus,
  LayoutTemplate,
  Loader2,
  Edit3,
  Zap,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRAGStore } from "@/store/rag-store";
import type { ExtractionTemplate, TemplateField } from "@/types/rag";

function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence === 0) return null;
  const color = confidence > 0.8 ? "#22c55e" : confidence > 0.5 ? "#f59e0b" : "#ef4444";
  const label = confidence > 0.8 ? "High" : confidence > 0.5 ? "Medium" : "Low";
  return (
    <span
      className="rounded-full px-1.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: color + "20", color }}
    >
      {label} ({Math.round(confidence * 100)}%)
    </span>
  );
}

function FieldRow({
  field,
  templateId,
  onEdit,
}: {
  field: TemplateField;
  templateId: string;
  onEdit: (fieldId: string) => void;
}) {
  const { updateTemplateField, documents } = useRAGStore();
  const sourceDoc = field.documentId ? documents.find((d) => d.id === field.documentId) : null;

  return (
    <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{field.label}</span>
          <ConfidenceBadge confidence={field.confidence} />
        </div>
        <button
          className="rounded p-1 hover:opacity-80 transition-opacity"
          onClick={() => onEdit(field.id)}
        >
          <Edit3 size={12} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {field.value ? (
        <div className="rounded px-3 py-2 text-sm" style={{ backgroundColor: "var(--accent)", color: "var(--foreground)" }}>
          {field.value}
        </div>
      ) : (
        <div className="rounded px-3 py-2 text-sm italic" style={{ backgroundColor: "var(--accent)", color: "var(--muted-foreground)" }}>
          Not extracted yet
        </div>
      )}

      {field.source && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <FileText size={10} />
          <span>Source: {sourceDoc?.name ?? field.source}</span>
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  isActive,
  onClick,
}: {
  template: ExtractionTemplate;
  isActive: boolean;
  onClick: () => void;
}) {
  const filledCount = template.fields.filter((f) => f.value).length;
  const totalCount = template.fields.length;
  const progress = totalCount > 0 ? (filledCount / totalCount) * 100 : 0;

  return (
    <button
      className={cn("w-full rounded-lg border p-3 text-left transition-all", isActive ? "ring-1" : "")}
      style={{
        borderColor: isActive ? "var(--primary)" : "var(--border)",
        backgroundColor: isActive ? "var(--primary)" + "08" : "transparent",
        outlineColor: "var(--primary)",
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <LayoutTemplate size={14} style={{ color: "var(--primary)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{template.name}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded px-1.5 py-0.5 text-xs" style={{ backgroundColor: "var(--accent)", color: "var(--muted-foreground)" }}>
          {template.category}
        </span>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {filledCount}/{totalCount} fields
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--accent)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: "var(--primary)" }}
        />
      </div>
    </button>
  );
}

export function TemplateFillPanel() {
  const {
    templates,
    activeTemplateId,
    setActiveTemplateId,
    selectedDocumentIds,
    documents,
    updateTemplateField,
  } = useRAGStore();

  const [isExtracting, setIsExtracting] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const activeTemplate = templates.find((t) => t.id === activeTemplateId);
  const selectedDocs = documents.filter((d) => selectedDocumentIds.includes(d.id));

  const handleAutoFill = () => {
    if (!activeTemplate || selectedDocs.length === 0) return;
    setIsExtracting(true);

    // Simulate AI extraction with staggered field updates
    const fields = activeTemplate.fields;
    fields.forEach((field, i) => {
      setTimeout(() => {
        const doc = selectedDocs[Math.floor(Math.random() * selectedDocs.length)];
        const mockValues: Record<string, string> = {
          invoice_number: "INV-2026-0347",
          vendor_name: "Acme Corporation",
          total_amount: "$42,350.00",
          due_date: "April 15, 2026",
          line_items: "Platform License ($28,000), Support Plan ($9,350), Setup Fee ($5,000)",
          parties: "Vidyalaya Inc. and Acme Corporation",
          effective_date: "March 1, 2026",
          term_length: "24 months",
          payment_terms: "Net 30, quarterly invoicing",
          termination_clause: "Either party may terminate with 90 days written notice",
          meeting_date: "March 15, 2026",
          attendees: "J. Smith (CEO), R. Patel (CTO), M. Chen (CFO), S. Williams (VP Eng)",
          key_decisions: "Approved $15M AI initiative budget; New product launch set for Q3",
          action_items: "CTO to present architecture plan by April 1; CFO to finalize vendor contracts",
          next_meeting: "April 12, 2026 at 10:00 AM",
        };

        updateTemplateField(
          activeTemplate.id,
          field.id,
          mockValues[field.key] ?? `Extracted value for ${field.label}`,
          doc.name,
          0.7 + Math.random() * 0.3,
          doc.id
        );

        if (i === fields.length - 1) {
          setIsExtracting(false);
        }
      }, 500 + i * 600);
    });
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={16} style={{ color: "var(--primary)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            AI Template Auto-Fill
          </h2>
        </div>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Extract structured data from documents using AI and auto-fill templates.
        </p>
      </div>

      {/* Template selection */}
      <div className="border-b px-4 py-3 space-y-2" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Select Template</p>
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            isActive={activeTemplateId === t.id}
            onClick={() => setActiveTemplateId(t.id)}
          />
        ))}
      </div>

      {/* Active template fields */}
      {activeTemplate ? (
        <>
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{activeTemplate.name}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {activeTemplate.fields.filter((f) => f.value).length} of {activeTemplate.fields.length} fields filled
                </p>
              </div>
              <button
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                onClick={handleAutoFill}
                disabled={isExtracting || selectedDocs.length === 0}
              >
                {isExtracting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Auto-Fill from Docs
                  </>
                )}
              </button>
            </div>
            {selectedDocs.length === 0 && (
              <p className="mt-2 text-xs rounded px-2 py-1" style={{ backgroundColor: "var(--accent)", color: "#f59e0b" }}>
                <AlertCircle size={10} className="inline mr-1" />
                Select documents from the library to extract data from
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTemplate.fields.map((field) => (
              <FieldRow
                key={field.id}
                field={field}
                templateId={activeTemplate.id}
                onEdit={setEditingFieldId}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="border-t px-4 py-3 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <button
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <Copy size={12} />
              Copy All
            </button>
            <button
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <Download size={12} />
              Export JSON
            </button>
            <button
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <Eye size={12} />
              Preview
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <LayoutTemplate size={40} className="mb-3 opacity-20" />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Select a template to begin extraction
          </p>
        </div>
      )}
    </div>
  );
}
