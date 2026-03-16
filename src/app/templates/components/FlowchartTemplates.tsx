"use client";

const templates = [
  {
    name: "Process Flow",
    desc: "Step-by-step process visualization with decision points and actions",
    svg: (
      <svg viewBox="0 0 120 60" className="w-full h-full">
        <rect x="5" y="22" width="24" height="16" rx="3" fill="#3b82f6" opacity="0.7" />
        <line x1="29" y1="30" x2="42" y2="30" stroke="#3b82f6" strokeWidth="1.5" />
        <polygon points="48,30 42,26 42,34" fill="#3b82f6" opacity="0.7" transform="rotate(0,48,30)" />
        <rect x="48" y="22" width="24" height="16" rx="3" fill="#10b981" opacity="0.7" />
        <line x1="72" y1="30" x2="85" y2="30" stroke="#10b981" strokeWidth="1.5" />
        <rect x="91" y="22" width="24" height="16" rx="3" fill="#f59e0b" opacity="0.7" />
      </svg>
    ),
  },
  {
    name: "Org Chart",
    desc: "Hierarchical organization structure with reporting lines",
    svg: (
      <svg viewBox="0 0 120 60" className="w-full h-full">
        <rect x="43" y="4" width="34" height="14" rx="3" fill="#6366f1" opacity="0.7" />
        <line x1="60" y1="18" x2="60" y2="24" stroke="#6366f1" strokeWidth="1.5" />
        <line x1="25" y1="24" x2="95" y2="24" stroke="#6366f1" strokeWidth="1.5" />
        <line x1="25" y1="24" x2="25" y2="30" stroke="#6366f1" strokeWidth="1.5" />
        <line x1="60" y1="24" x2="60" y2="30" stroke="#6366f1" strokeWidth="1.5" />
        <line x1="95" y1="24" x2="95" y2="30" stroke="#6366f1" strokeWidth="1.5" />
        <rect x="10" y="30" width="30" height="12" rx="2" fill="#8b5cf6" opacity="0.6" />
        <rect x="45" y="30" width="30" height="12" rx="2" fill="#8b5cf6" opacity="0.6" />
        <rect x="80" y="30" width="30" height="12" rx="2" fill="#8b5cf6" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "Decision Tree",
    desc: "Binary decision diagram with yes/no branching paths",
    svg: (
      <svg viewBox="0 0 120 60" className="w-full h-full">
        <polygon points="60,4 80,20 60,36 40,20" fill="#f59e0b" opacity="0.7" />
        <line x1="40" y1="20" x2="20" y2="40" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="80" y1="20" x2="100" y2="40" stroke="#10b981" strokeWidth="1.5" />
        <rect x="5" y="40" width="28" height="14" rx="3" fill="#ef4444" opacity="0.6" />
        <rect x="87" y="40" width="28" height="14" rx="3" fill="#10b981" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "Swimlane",
    desc: "Cross-functional process flow with department responsibility lanes",
    svg: (
      <svg viewBox="0 0 120 60" className="w-full h-full">
        <line x1="0" y1="20" x2="120" y2="20" stroke="#6b7280" strokeWidth="0.5" strokeDasharray="3" />
        <line x1="0" y1="40" x2="120" y2="40" stroke="#6b7280" strokeWidth="0.5" strokeDasharray="3" />
        <rect x="10" y="6" width="22" height="10" rx="2" fill="#3b82f6" opacity="0.7" />
        <rect x="45" y="25" width="22" height="10" rx="2" fill="#10b981" opacity="0.7" />
        <rect x="80" y="45" width="22" height="10" rx="2" fill="#f59e0b" opacity="0.7" />
        <line x1="32" y1="11" x2="45" y2="30" stroke="#6b7280" strokeWidth="1" />
        <line x1="67" y1="30" x2="80" y2="50" stroke="#6b7280" strokeWidth="1" />
      </svg>
    ),
  },
  {
    name: "Fishbone",
    desc: "Cause-and-effect (Ishikawa) diagram for root cause analysis",
    svg: (
      <svg viewBox="0 0 120 60" className="w-full h-full">
        <line x1="10" y1="30" x2="110" y2="30" stroke="#6366f1" strokeWidth="2" />
        <polygon points="110,30 104,26 104,34" fill="#6366f1" />
        <line x1="30" y1="10" x2="45" y2="30" stroke="#ef4444" strokeWidth="1" />
        <line x1="50" y1="10" x2="65" y2="30" stroke="#f59e0b" strokeWidth="1" />
        <line x1="70" y1="50" x2="85" y2="30" stroke="#10b981" strokeWidth="1" />
        <line x1="40" y1="50" x2="55" y2="30" stroke="#3b82f6" strokeWidth="1" />
      </svg>
    ),
  },
  {
    name: "Mind Map",
    desc: "Radial brainstorming diagram with central topic and branches",
    svg: (
      <svg viewBox="0 0 120 60" className="w-full h-full">
        <circle cx="60" cy="30" r="10" fill="#6366f1" opacity="0.7" />
        <line x1="60" y1="20" x2="60" y2="6" stroke="#ef4444" strokeWidth="1" />
        <circle cx="60" cy="4" r="4" fill="#ef4444" opacity="0.6" />
        <line x1="70" y1="30" x2="90" y2="18" stroke="#10b981" strokeWidth="1" />
        <circle cx="92" cy="16" r="4" fill="#10b981" opacity="0.6" />
        <line x1="70" y1="30" x2="90" y2="42" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="92" cy="44" r="4" fill="#f59e0b" opacity="0.6" />
        <line x1="50" y1="30" x2="28" y2="18" stroke="#3b82f6" strokeWidth="1" />
        <circle cx="26" cy="16" r="4" fill="#3b82f6" opacity="0.6" />
        <line x1="50" y1="30" x2="28" y2="42" stroke="#8b5cf6" strokeWidth="1" />
        <circle cx="26" cy="44" r="4" fill="#8b5cf6" opacity="0.6" />
      </svg>
    ),
  },
];

export default function FlowchartTemplates() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <div
          key={t.name}
          className="group rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:border-[var(--primary)]"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* SVG Preview */}
          <div className="h-28 p-4 flex items-center justify-center" style={{ backgroundColor: "var(--secondary)" }}>
            {t.svg}
          </div>
          {/* Content */}
          <div className="p-3 space-y-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>{t.name}</h3>
            <p className="text-xs line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{t.desc}</p>
            <button
              className="w-full mt-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors opacity-60 cursor-not-allowed"
              style={{ backgroundColor: "var(--primary)" }}
              title="Flowchart editor coming soon"
              disabled
            >
              Coming Soon
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
