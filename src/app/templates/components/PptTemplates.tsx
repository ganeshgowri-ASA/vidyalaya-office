"use client";

import { useRouter } from "next/navigation";
import { Presentation } from "lucide-react";

const templates = [
  { name: "Business Proposal", desc: "Partnership or investment proposal with key metrics and value proposition", gradient: "from-blue-500 to-indigo-600" },
  { name: "Training Session", desc: "Training workshop deck with agenda, exercises, and takeaways", gradient: "from-green-500 to-teal-600" },
  { name: "Weekly Meeting Update", desc: "Team status update with progress, blockers, and action items", gradient: "from-amber-500 to-orange-600" },
  { name: "Financial Quarterly PPT", desc: "Quarterly financial performance with charts and forecasts", gradient: "from-purple-500 to-pink-600" },
  { name: "Product Launch", desc: "New product announcement with features, pricing, and go-to-market plan", gradient: "from-red-500 to-rose-600" },
];

export default function PptTemplates() {
  const router = useRouter();

  const handleUse = (name: string) => {
    localStorage.setItem("vidyalaya-template-hint", name);
    router.push("/presentation");
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <div
          key={t.name}
          className="group rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:border-[var(--primary)]"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Slide Preview */}
          <div className={`h-32 bg-gradient-to-br ${t.gradient} flex items-center justify-center relative`}>
            <Presentation size={36} className="text-white/40" />
            <div className="absolute bottom-2 left-2 flex gap-1">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-6 h-4 rounded-sm bg-white/20 border border-white/30" />
              ))}
            </div>
            <span className="absolute top-2 right-2 rounded px-1.5 py-0.5 text-[10px] font-medium bg-white/20 text-white">
              .pptx
            </span>
          </div>
          {/* Content */}
          <div className="p-3 space-y-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--card-foreground)" }}>{t.name}</h3>
            <p className="text-xs line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{t.desc}</p>
            <button
              onClick={() => handleUse(t.name)}
              className="w-full mt-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Use Template
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
