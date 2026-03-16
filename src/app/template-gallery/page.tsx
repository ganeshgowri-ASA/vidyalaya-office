"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Table2,
  Presentation,
  FileDown,
  Grid3X3,
  List,
  Eye,
  X,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface GalleryTemplate {
  id: string;
  name: string;
  category: "word" | "excel" | "ppt" | "pdf";
  subcategory: string;
  description: string;
  thumbnail: string;
}

const categoryConfig = {
  word: { label: "Document", icon: FileText, color: "#3b82f6", href: "/document" },
  excel: { label: "Spreadsheet", icon: Table2, color: "#16a34a", href: "/spreadsheet" },
  ppt: { label: "Presentation", icon: Presentation, color: "#f59e0b", href: "/presentation" },
  pdf: { label: "PDF", icon: FileDown, color: "#dc2626", href: "/pdf" },
};

const subcategories = [
  "All",
  "Business",
  "Education",
  "Finance",
  "Marketing",
  "Personal",
  "Reports",
  "Creative",
];

const templates: GalleryTemplate[] = [
  { id: "t1", name: "Business Report", category: "word", subcategory: "Business", description: "Professional quarterly/annual business report with charts and analysis sections", thumbnail: "BR" },
  { id: "t2", name: "Meeting Minutes", category: "word", subcategory: "Business", description: "Structured template for recording meeting discussions and action items", thumbnail: "MM" },
  { id: "t3", name: "Resume / CV", category: "word", subcategory: "Personal", description: "Clean, modern CV template with sections for experience, skills, and education", thumbnail: "CV" },
  { id: "t4", name: "Research Paper", category: "word", subcategory: "Education", description: "Academic paper template with abstract, methodology, and bibliography sections", thumbnail: "RP" },
  { id: "t5", name: "Newsletter", category: "word", subcategory: "Marketing", description: "Engaging newsletter layout with header, articles, and call-to-action sections", thumbnail: "NL" },
  { id: "t6", name: "Invoice", category: "excel", subcategory: "Finance", description: "Professional invoice with automatic calculations, tax, and payment terms", thumbnail: "IN" },
  { id: "t7", name: "Budget Tracker", category: "excel", subcategory: "Finance", description: "Monthly/annual budget planner with income, expenses, and savings tracking", thumbnail: "BT" },
  { id: "t8", name: "Project Timeline", category: "excel", subcategory: "Business", description: "Gantt-style project tracker with milestones, dependencies, and resource allocation", thumbnail: "PT" },
  { id: "t9", name: "Grade Book", category: "excel", subcategory: "Education", description: "Student grade tracking with weighted categories and GPA calculations", thumbnail: "GB" },
  { id: "t10", name: "Sales Dashboard", category: "excel", subcategory: "Business", description: "Interactive sales tracking with KPIs, charts, and regional breakdowns", thumbnail: "SD" },
  { id: "t11", name: "Pitch Deck", category: "ppt", subcategory: "Business", description: "Investor-ready presentation with problem, solution, market, and financials slides", thumbnail: "PD" },
  { id: "t12", name: "Training Course", category: "ppt", subcategory: "Education", description: "Interactive training presentation with quizzes, exercises, and key takeaways", thumbnail: "TC" },
  { id: "t13", name: "Product Launch", category: "ppt", subcategory: "Marketing", description: "Launch event presentation with product features, demos, and pricing slides", thumbnail: "PL" },
  { id: "t14", name: "Portfolio", category: "ppt", subcategory: "Creative", description: "Creative portfolio showcasing projects with image galleries and case studies", thumbnail: "PF" },
  { id: "t15", name: "Status Report", category: "ppt", subcategory: "Business", description: "Weekly/monthly status update with metrics, blockers, and next steps", thumbnail: "SR" },
  { id: "t16", name: "Contract Template", category: "pdf", subcategory: "Business", description: "Standard contract with terms, conditions, signature fields, and legal clauses", thumbnail: "CT" },
  { id: "t17", name: "Certificate", category: "pdf", subcategory: "Education", description: "Award/completion certificate with customizable name, date, and signature", thumbnail: "CE" },
  { id: "t18", name: "Brochure", category: "pdf", subcategory: "Marketing", description: "Tri-fold brochure template with sections for services, about, and contact", thumbnail: "BR" },
  { id: "t19", name: "Expense Report", category: "pdf", subcategory: "Finance", description: "Itemized expense report with categories, receipts, and approval workflow", thumbnail: "ER" },
  { id: "t20", name: "Lesson Plan", category: "word", subcategory: "Education", description: "Structured lesson plan with objectives, activities, assessments, and materials", thumbnail: "LP" },
];

export default function TemplateGalleryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewTemplate, setPreviewTemplate] = useState<GalleryTemplate | null>(null);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (subcategoryFilter !== "All" && t.subcategory !== subcategoryFilter) return false;
      return true;
    });
  }, [search, categoryFilter, subcategoryFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Template Gallery</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Start from a professionally designed template across all document types
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="flex flex-1 items-center gap-3 rounded-xl border px-4 py-2.5"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <Search size={16} style={{ color: "var(--muted-foreground)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: "var(--muted-foreground)" }}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-0.5" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setViewMode("grid")}
            className="rounded-md p-1.5"
            style={{ backgroundColor: viewMode === "grid" ? "var(--accent)" : "transparent", color: viewMode === "grid" ? "var(--accent-foreground)" : "var(--muted-foreground)" }}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className="rounded-md p-1.5"
            style={{ backgroundColor: viewMode === "list" ? "var(--accent)" : "transparent", color: viewMode === "list" ? "var(--accent-foreground)" : "var(--muted-foreground)" }}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter("all")}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            backgroundColor: categoryFilter === "all" ? "var(--primary)" : "var(--card)",
            color: categoryFilter === "all" ? "var(--primary-foreground)" : "var(--muted-foreground)",
            borderWidth: 1,
            borderColor: "var(--border)",
          }}
        >
          All Types
        </button>
        {(Object.entries(categoryConfig) as [string, typeof categoryConfig.word][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: categoryFilter === key ? `${cfg.color}20` : "var(--card)",
                color: categoryFilter === key ? cfg.color : "var(--muted-foreground)",
                borderWidth: 1,
                borderColor: categoryFilter === key ? cfg.color : "var(--border)",
              }}
            >
              <Icon size={14} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Subcategory pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {subcategories.map((sub) => (
          <button
            key={sub}
            onClick={() => setSubcategoryFilter(sub)}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            style={{
              backgroundColor: subcategoryFilter === sub ? "var(--accent)" : "transparent",
              color: subcategoryFilter === sub ? "var(--accent-foreground)" : "var(--muted-foreground)",
            }}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{filtered.length} templates</p>

      {/* Templates */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <Grid3X3 size={40} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>No templates found</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => {
            const cfg = categoryConfig[t.category];
            const Icon = cfg.icon;
            return (
              <div
                key={t.id}
                className="group rounded-xl border overflow-hidden transition-all hover:scale-[1.01]"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                {/* Thumbnail */}
                <div
                  className="flex h-32 items-center justify-center relative"
                  style={{ backgroundColor: `${cfg.color}10` }}
                >
                  <div className="text-3xl font-bold opacity-20" style={{ color: cfg.color }}>{t.thumbnail}</div>
                  <Icon size={28} className="absolute bottom-3 right-3 opacity-30" style={{ color: cfg.color }} />
                  {/* Hover actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                    <button
                      onClick={() => setPreviewTemplate(t)}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                    >
                      <Eye size={12} /> Preview
                    </button>
                    <Link
                      href={`${cfg.href}?template=${encodeURIComponent(t.id)}`}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: cfg.color }}
                    >
                      <Plus size={12} /> Use
                    </Link>
                  </div>
                </div>
                <div className="p-3 cursor-pointer" onClick={() => router.push(`${cfg.href}?template=${encodeURIComponent(t.id)}`)}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--card-foreground)" }}>{t.name}</p>
                    <span className="shrink-0 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{t.description}</p>
                  <p className="text-xs mt-2 font-medium" style={{ color: cfg.color }}>{t.subcategory}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border divide-y" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          {filtered.map((t) => {
            const cfg = categoryConfig[t.category];
            const Icon = cfg.icon;
            return (
              <div key={t.id} className="flex items-center gap-4 px-4 py-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${cfg.color}15` }}>
                  <Icon size={20} style={{ color: cfg.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--card-foreground)" }}>{t.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{t.description}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: cfg.color }}>{t.subcategory}</span>
                <button
                  onClick={() => setPreviewTemplate(t)}
                  className="shrink-0 rounded-lg p-1.5 hover:opacity-80"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Eye size={14} />
                </button>
                <Link href={`${cfg.href}?template=${encodeURIComponent(t.id)}`} className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: cfg.color, color: "white" }}>
                  Use
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPreviewTemplate(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            {(() => {
              const cfg = categoryConfig[previewTemplate.category];
              const Icon = cfg.icon;
              return (
                <>
                  <div className="flex h-48 items-center justify-center" style={{ backgroundColor: `${cfg.color}10` }}>
                    <Icon size={48} style={{ color: cfg.color }} />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: "var(--card-foreground)" }}>{previewTemplate.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{previewTemplate.description}</p>
                    <p className="text-xs mt-2" style={{ color: cfg.color }}>{previewTemplate.subcategory}</p>
                    <div className="flex gap-2 mt-6">
                      <button onClick={() => setPreviewTemplate(null)} className="flex-1 rounded-lg py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Close</button>
                      <Link href={`${cfg.href}?template=${encodeURIComponent(previewTemplate.id)}`} className="flex-1 rounded-lg py-2 text-sm font-medium text-center text-white" style={{ backgroundColor: cfg.color }}>
                        Use Template
                      </Link>
                    </div>
                  </div>
                  <button onClick={() => setPreviewTemplate(null)} className="absolute top-3 right-3 rounded-full p-1" style={{ color: "var(--muted-foreground)" }}>
                    <X size={18} />
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
