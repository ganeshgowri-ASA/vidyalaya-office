"use client";

import React, { useState } from "react";
import {
  X, FolderOpen, FileText, Plus, ChevronRight, ChevronDown,
  Calendar, Users, CheckCircle2, Clock, AlertCircle,
  BarChart3, Wind, Zap, Shield, ClipboardList, Wrench,
  Loader2, Search, Star, StarOff,
} from "lucide-react";
import { setEditorContent } from "./editor-area";

interface ProjectTemplate {
  id: string;
  name: string;
  category: "engineering" | "quality" | "energy" | "general";
  icon: React.ReactNode;
  description: string;
  sections: string[];
  content: string;
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "iec-test-report",
    name: "IEC Test Report",
    category: "engineering",
    icon: <BarChart3 size={16} />,
    description: "IEC 61400-12-1 compliant power performance test report with standard sections.",
    sections: ["Executive Summary", "Test Setup", "Instrumentation", "Data Analysis", "Results", "Uncertainty Analysis", "Conclusions"],
    content: `<h1 style="text-align:center;font-size:22px;">IEC 61400-12-1 Power Performance Test Report</h1>
<p style="text-align:center;font-size:12px;color:#666;">Document No: RPT-PPT-2026-001 | Rev: A | Date: {{DATE}}</p>
<hr/>
<h2>1. Executive Summary</h2>
<p>This report presents the results of the power performance test conducted in accordance with IEC 61400-12-1:2017. The test was performed on [Turbine Model] at [Site Name] between [Start Date] and [End Date].</p>
<h2>2. Test Setup</h2>
<h3>2.1 Site Description</h3>
<p>Location: [Latitude, Longitude]<br/>Elevation: [m above sea level]<br/>Terrain Category: [IEC Terrain Category]</p>
<h3>2.2 Turbine Specifications</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ddd;padding:6px;text-align:left;font-size:11px;">Parameter</th><th style="border:1px solid #ddd;padding:6px;text-align:left;font-size:11px;">Value</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Rated Power</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[kW]</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Rotor Diameter</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[m]</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Hub Height</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[m]</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Cut-in Wind Speed</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[m/s]</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Rated Wind Speed</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[m/s]</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Cut-out Wind Speed</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[m/s]</td></tr>
</tbody></table>
<h2>3. Instrumentation</h2>
<p>All instruments were calibrated according to IEC requirements. Meteorological mast located at [distance] m from turbine, [direction] of prevailing wind.</p>
<h2>4. Data Analysis</h2>
<h3>4.1 Method of Bins</h3>
<p>Data was processed using the method of bins with 0.5 m/s bin widths. A total of [N] 10-minute data records were collected, of which [M] passed all data quality filters.</p>
<h2>5. Results</h2>
<h3>5.1 Measured Power Curve</h3>
<p>[Insert power curve chart]</p>
<h3>5.2 Annual Energy Production</h3>
<p>AEP calculated using Rayleigh distribution at reference wind speeds:</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Annual Mean Wind Speed (m/s)</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">AEP (MWh)</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">6.0</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[value]</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">7.0</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[value]</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">8.0</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[value]</td></tr>
</tbody></table>
<h2>6. Uncertainty Analysis</h2>
<p>Uncertainty analysis performed according to IEC 61400-12-1 Annex D. Combined standard uncertainty in measured power at rated wind speed: [±X%].</p>
<h2>7. Conclusions</h2>
<p>The measured power curve [meets/does not meet] the warranted power curve within the specified uncertainty bounds.</p>`,
  },
  {
    id: "fmea",
    name: "FMEA Analysis",
    category: "quality",
    icon: <Shield size={16} />,
    description: "Failure Mode and Effects Analysis worksheet with RPN scoring.",
    sections: ["Scope", "Team", "Process Flow", "FMEA Worksheet", "Action Plan", "Verification"],
    content: `<h1 style="text-align:center;font-size:22px;">Failure Mode and Effects Analysis (FMEA)</h1>
<p style="text-align:center;font-size:12px;color:#666;">Document No: FMEA-2026-001 | Rev: A | Date: {{DATE}}</p>
<hr/>
<h2>1. Scope & Objective</h2>
<p>This FMEA covers the [System/Process Name]. The objective is to identify potential failure modes, assess their effects and causes, and prioritize corrective actions based on Risk Priority Number (RPN).</p>
<h2>2. FMEA Team</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Name</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Role</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Department</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[Name]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Lead Engineer</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Engineering</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[Name]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Quality Manager</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Quality</td></tr>
</tbody></table>
<h2>3. FMEA Worksheet</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:10px;">
<thead><tr style="background:#f0f0f0;">
<th style="border:1px solid #ddd;padding:4px;">Item/Function</th>
<th style="border:1px solid #ddd;padding:4px;">Potential Failure Mode</th>
<th style="border:1px solid #ddd;padding:4px;">Potential Effect</th>
<th style="border:1px solid #ddd;padding:4px;">SEV</th>
<th style="border:1px solid #ddd;padding:4px;">Potential Cause</th>
<th style="border:1px solid #ddd;padding:4px;">OCC</th>
<th style="border:1px solid #ddd;padding:4px;">Current Controls</th>
<th style="border:1px solid #ddd;padding:4px;">DET</th>
<th style="border:1px solid #ddd;padding:4px;">RPN</th>
<th style="border:1px solid #ddd;padding:4px;">Recommended Action</th>
</tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:4px;">[Function]</td><td style="border:1px solid #ddd;padding:4px;">[Mode]</td><td style="border:1px solid #ddd;padding:4px;">[Effect]</td><td style="border:1px solid #ddd;padding:4px;">[1-10]</td><td style="border:1px solid #ddd;padding:4px;">[Cause]</td><td style="border:1px solid #ddd;padding:4px;">[1-10]</td><td style="border:1px solid #ddd;padding:4px;">[Control]</td><td style="border:1px solid #ddd;padding:4px;">[1-10]</td><td style="border:1px solid #ddd;padding:4px;">[RPN]</td><td style="border:1px solid #ddd;padding:4px;">[Action]</td></tr>
</tbody></table>
<h2>4. Risk Matrix</h2>
<p><strong>RPN Thresholds:</strong> Low (&lt;50) | Medium (50-100) | High (100-200) | Critical (&gt;200)</p>
<h2>5. Action Plan</h2>
<p>[Document recommended corrective and preventive actions with responsible parties and target dates]</p>
<h2>6. Verification & Sign-off</h2>
<p>Prepared by: _______________ Date: ___________<br/>Reviewed by: _______________ Date: ___________<br/>Approved by: _______________ Date: ___________</p>`,
  },
  {
    id: "energy-yield",
    name: "Energy Yield Assessment",
    category: "energy",
    icon: <Zap size={16} />,
    description: "Pre-construction energy yield assessment with loss categories.",
    sections: ["Project Overview", "Wind Resource", "Turbine Selection", "Losses", "Energy Production", "Uncertainty", "Financial Summary"],
    content: `<h1 style="text-align:center;font-size:22px;">Energy Yield Assessment Report</h1>
<p style="text-align:center;font-size:12px;color:#666;">Project: [Project Name] | Report No: EYA-2026-001 | Date: {{DATE}}</p>
<hr/>
<h2>1. Project Overview</h2>
<p>Site: [Site Name]<br/>Country: [Country]<br/>Number of Turbines: [N]<br/>Total Installed Capacity: [MW]<br/>Expected Commissioning: [Date]</p>
<h2>2. Wind Resource Assessment</h2>
<h3>2.1 Measurement Campaign</h3>
<p>Met mast height: [m] | Duration: [months] | Data recovery: [%]</p>
<h3>2.2 Long-term Correction</h3>
<p>Reference dataset: [ERA5/MERRA-2] | Correlation period: [years] | Method: [MCP method]</p>
<h3>2.3 Hub Height Wind Speed</h3>
<p>Long-term mean wind speed at hub height: [X.X] m/s<br/>Weibull parameters: k = [X.XX], A = [X.X] m/s</p>
<h2>3. Energy Production Estimate</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Loss Category</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Loss (%)</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Gross AEP (before losses)</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;font-weight:bold;">[GWh]</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Wake losses</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[X.X]%</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Availability losses</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[X.X]%</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Electrical losses</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[X.X]%</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Turbine performance</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[X.X]%</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Environmental (icing, degradation)</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[X.X]%</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Curtailment (noise, grid, environmental)</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[X.X]%</td></tr>
<tr style="background:#e8f5e9;"><td style="border:1px solid #ddd;padding:6px;font-size:11px;font-weight:bold;">Net AEP (P50)</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;font-weight:bold;">[GWh]</td></tr>
</tbody></table>
<h2>4. Uncertainty Analysis</h2>
<p>Combined uncertainty (1 standard deviation): [X.X]%</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Exceedance Level</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">AEP (GWh)</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Capacity Factor (%)</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">P50</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[value]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[value]</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">P75</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[value]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[value]</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">P90</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[value]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[value]</td></tr>
</tbody></table>
<h2>5. Conclusions</h2>
<p>The [Project Name] wind farm is expected to produce [X] GWh/yr at P50, with a capacity factor of [X]%. The project meets bankability requirements at P90 levels.</p>`,
  },
  {
    id: "design-review",
    name: "Design Review Checklist",
    category: "engineering",
    icon: <ClipboardList size={16} />,
    description: "Structured design review with gate criteria and sign-off.",
    sections: ["Design Inputs", "Requirements Traceability", "Analysis Results", "Risk Assessment", "Action Items", "Sign-off"],
    content: `<h1 style="text-align:center;font-size:22px;">Design Review Report</h1>
<p style="text-align:center;font-size:12px;color:#666;">Project: [Project Name] | Gate: [CDR/PDR/FDR] | Date: {{DATE}}</p>
<hr/>
<h2>1. Design Inputs</h2>
<p>This design review covers [Component/System] at the [Conceptual/Preliminary/Final] design stage.</p>
<h2>2. Requirements Verification</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Req ID</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Description</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Status</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Evidence</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">REQ-001</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[Requirement]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[Pass/Fail/Open]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[Reference]</td></tr>
</tbody></table>
<h2>3. Action Items</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ddd;padding:6px;font-size:11px;">No.</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Action</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Owner</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Due Date</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Status</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">1</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[Action]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[Name]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[Date]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Open</td></tr>
</tbody></table>
<h2>4. Gate Decision</h2>
<p>[ ] Approved — Proceed to next phase<br/>[ ] Conditionally Approved — Proceed with action item completion<br/>[ ] Not Approved — Requires redesign</p>
<h2>5. Sign-off</h2>
<p>Review Chair: _______________ Date: ___________<br/>Lead Engineer: _______________ Date: ___________<br/>Quality Rep: _______________ Date: ___________</p>`,
  },
  {
    id: "maintenance-plan",
    name: "Maintenance & Service Plan",
    category: "engineering",
    icon: <Wrench size={16} />,
    description: "Preventive and corrective maintenance schedule template.",
    sections: ["Asset Register", "PM Schedule", "Spare Parts", "Safety Procedures", "KPIs"],
    content: `<h1 style="text-align:center;font-size:22px;">Operations & Maintenance Plan</h1>
<p style="text-align:center;font-size:12px;color:#666;">Site: [Site Name] | Plan Period: [Year] | Date: {{DATE}}</p>
<hr/>
<h2>1. Asset Overview</h2>
<p>Number of Turbines: [N]<br/>Turbine Model: [Model]<br/>Total Capacity: [MW]<br/>Warranty Status: [In Warranty/Post-Warranty]</p>
<h2>2. Preventive Maintenance Schedule</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Task</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Frequency</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Duration (hrs)</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Personnel</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">6-Month Service</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Bi-annual</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">8</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">2 technicians</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Annual Service</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">Annual</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">16</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">3 technicians</td></tr>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">5-Year Major</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">5-year</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">40</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">4 technicians</td></tr>
</tbody></table>
<h2>3. KPI Targets</h2>
<p>Availability Target: ≥97%<br/>Mean Time to Repair (MTTR): ≤24 hours<br/>Safety Incident Rate: 0</p>`,
  },
  {
    id: "wind-resource",
    name: "Wind Resource Assessment",
    category: "energy",
    icon: <Wind size={16} />,
    description: "Wind measurement campaign summary and long-term assessment.",
    sections: ["Measurement Campaign", "Data Quality", "Vertical Profile", "Long-term Correlation", "Wind Rose", "Conclusions"],
    content: `<h1 style="text-align:center;font-size:22px;">Wind Resource Assessment</h1>
<p style="text-align:center;font-size:12px;color:#666;">Site: [Site Name] | Report No: WRA-2026-001 | Date: {{DATE}}</p>
<hr/>
<h2>1. Measurement Campaign Summary</h2>
<p>Mast ID: [ID]<br/>Location: [Lat, Lon]<br/>Mast Height: [m]<br/>Measurement Period: [Start] to [End]<br/>Data Recovery Rate: [%]</p>
<h2>2. Wind Speed Summary</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Height (m)</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Mean Speed (m/s)</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Weibull k</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Weibull A (m/s)</th><th style="border:1px solid #ddd;padding:6px;font-size:11px;">Energy Density (W/m²)</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[H1]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[val]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[val]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[val]</td><td style="border:1px solid #ddd;padding:6px;font-size:11px;">[val]</td></tr>
</tbody></table>
<h2>3. Long-term Estimate</h2>
<p>Reference data: [ERA5/MERRA-2]<br/>Correlation R²: [value]<br/>Long-term mean wind speed at hub height: [X.X] m/s</p>
<h2>4. Conclusions</h2>
<p>The site presents [good/moderate/marginal] wind resource characteristics suitable for [turbine class].</p>`,
  },
];

export function ProjectManager({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!visible) return null;

  const categories = [
    { key: "all", label: "All Templates" },
    { key: "engineering", label: "Engineering" },
    { key: "quality", label: "Quality" },
    { key: "energy", label: "Energy" },
  ];

  const filtered = PROJECT_TEMPLATES.filter((t) => {
    if (selectedCategory !== "all" && t.category !== selectedCategory) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleApply = (template: ProjectTemplate) => {
    const content = template.content.replace(/\{\{DATE\}\}/g, new Date().toLocaleDateString());
    setEditorContent(content);
    onClose();
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative w-full max-w-4xl mx-4 rounded-xl border shadow-2xl flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <FolderOpen size={20} style={{ color: "var(--primary)" }} />
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Project Manager</h2>
              <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Engineering & professional document templates</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-[var(--muted)]">
            <X size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full rounded-md border pl-8 pr-3 py-1.5 text-xs outline-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className="px-3 py-1.5 rounded-md text-[10px] font-medium transition-colors"
                style={{
                  backgroundColor: selectedCategory === cat.key ? "var(--primary)" : "var(--muted)",
                  color: selectedCategory === cat.key ? "var(--primary-foreground)" : "var(--muted-foreground)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((template) => (
              <div
                key={template.id}
                className="rounded-lg border p-4 transition-all hover:shadow-md hover:border-[var(--primary)] group"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--primary)" }}>{template.icon}</span>
                    <h3 className="text-sm font-semibold group-hover:text-[var(--primary)]" style={{ color: "var(--foreground)" }}>
                      {template.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className="p-1 rounded hover:bg-[var(--muted)]"
                    >
                      {favorites.includes(template.id) ? (
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      ) : (
                        <StarOff size={13} style={{ color: "var(--muted-foreground)" }} />
                      )}
                    </button>
                    <span className="text-[9px] px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                      {template.category}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] mb-3 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {template.description}
                </p>

                {/* Sections preview */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.sections.slice(0, 4).map((s) => (
                    <span key={s} className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                      {s}
                    </span>
                  ))}
                  {template.sections.length > 4 && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                      +{template.sections.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApply(template)}
                    className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                    className="rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    Preview
                  </button>
                </div>

                {expandedId === template.id && (
                  <div className="mt-3 pt-3 border-t max-h-40 overflow-y-auto" style={{ borderColor: "var(--border)" }}>
                    <div className="text-[10px] leading-relaxed" style={{ color: "var(--foreground)" }} dangerouslySetInnerHTML={{ __html: template.content.replace(/\{\{DATE\}\}/g, new Date().toLocaleDateString()).slice(0, 800) + "..." }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
