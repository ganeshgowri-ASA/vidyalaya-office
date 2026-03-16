// ---------- DIAGRAM & INFOGRAPHIC TYPES (30 total) ----------
import { escSvg, type NodeItem, type ColorTheme } from "./types";
import React from "react";

export interface DiagramType {
  id: string;
  name: string;
  description: string;
}

export const DIAGRAM_TYPES: DiagramType[] = [
  // Original 10
  { id: "flowchart", name: "Flowchart Builder", description: "Visio-like drag & connect flowchart" },
  { id: "mind-map", name: "Mind Map", description: "Central node with radiating branches" },
  { id: "org-chart-builder", name: "Org Chart Builder", description: "Organization chart with photos" },
  { id: "timeline", name: "Timeline / Roadmap", description: "Horizontal or vertical timeline" },
  { id: "venn-diagram", name: "Venn Diagram", description: "2-5 circle Venn diagram" },
  { id: "swot", name: "SWOT Analysis", description: "Strengths, Weaknesses, Opportunities, Threats" },
  { id: "fishbone", name: "Fishbone / Ishikawa", description: "Cause and effect diagram" },
  { id: "gantt", name: "Gantt Chart", description: "Project timeline Gantt chart" },
  { id: "infographic-bar", name: "Data Infographic (Bar)", description: "Bar chart as infographic" },
  { id: "infographic-pie", name: "Data Infographic (Pie)", description: "Pie chart as infographic" },
  // New 20
  { id: "network-diagram", name: "Network Diagram", description: "LAN/WAN topology layout" },
  { id: "floor-plan", name: "Floor Plan / Seating Chart", description: "Room layout with furniture" },
  { id: "value-stream-map", name: "Value Stream Map", description: "Lean manufacturing value stream" },
  { id: "swimlane", name: "Swimlane Diagram", description: "Cross-functional flowchart with lanes" },
  { id: "decision-tree", name: "Decision Tree", description: "Yes/No branching decision tree" },
  { id: "data-flow", name: "Data Flow Diagram (DFD)", description: "Data processes and stores" },
  { id: "er-diagram", name: "ER Diagram", description: "Entity-Relationship database diagram" },
  { id: "uml-class", name: "UML Class Diagram", description: "Object-oriented class diagram" },
  { id: "sequence-diagram", name: "Sequence Diagram", description: "Message sequence between actors" },
  { id: "wireframe", name: "Wireframe / Mockup", description: "UI wireframe sketch" },
  { id: "circular-flow", name: "Circular Flow Diagram", description: "Economic or system circular flow" },
  { id: "pyramid-diagram", name: "Pyramid Diagram", description: "Layered pyramid visualization" },
  { id: "funnel-chart", name: "Funnel Chart", description: "Sales or conversion funnel" },
  { id: "comparison-infographic", name: "Comparison Infographic", description: "Side-by-side comparison" },
  { id: "statistics-infographic", name: "Statistics Infographic", description: "Numbers and icon statistics" },
  { id: "process-infographic", name: "Process Infographic", description: "Step-by-step visual process" },
  { id: "icon-grid", name: "Icon Grid Infographic", description: "Grid of icons with labels" },
  { id: "percentage-infographic", name: "Percentage / Progress", description: "Progress bars and percentages" },
  { id: "map-infographic", name: "Map Infographic", description: "Geographic data visualization" },
  { id: "photo-collage", name: "Photo Collage Infographic", description: "Photo-based infographic collage" },
];

// Diagram thumbnail for picker
export function DiagramThumbnail({ diagramId, color }: { diagramId: string; color: string }) {
  const c = color;
  const c2 = color + "99";
  const s = 48;

  switch (diagramId) {
    case "flowchart":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="14" y="2" width="20" height="10" rx="5" fill={c}/><polygon points="24,18 34,28 24,38 14,28" fill={c2}/><rect x="14" y="40" width="20" height="6" rx="1" fill={c}/><line x1="24" y1="12" x2="24" y2="18" stroke={c} strokeWidth="1.5"/><line x1="24" y1="38" x2="24" y2="40" stroke={c} strokeWidth="1.5"/></svg>);
    case "mind-map":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="10" ry="6" fill={c}/><ellipse cx="8" cy="10" rx="7" ry="4" fill={c2}/><ellipse cx="40" cy="10" rx="7" ry="4" fill={c2}/><ellipse cx="8" cy="38" rx="7" ry="4" fill={c2}/><ellipse cx="40" cy="38" rx="7" ry="4" fill={c2}/><path d="M16,20 Q12,14 12,12" stroke={c} strokeWidth="1" fill="none"/><path d="M32,20 Q36,14 36,12" stroke={c} strokeWidth="1" fill="none"/><path d="M16,28 Q12,34 12,36" stroke={c} strokeWidth="1" fill="none"/><path d="M32,28 Q36,34 36,36" stroke={c} strokeWidth="1" fill="none"/></svg>);
    case "org-chart-builder":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="17" y="2" width="14" height="10" rx="2" fill={c}/><line x1="24" y1="12" x2="24" y2="16" stroke={c} strokeWidth="1.5"/><line x1="8" y1="16" x2="40" y2="16" stroke={c} strokeWidth="1.5"/><rect x="2" y="18" width="12" height="8" rx="1" fill={c2}/><rect x="18" y="18" width="12" height="8" rx="1" fill={c2}/><rect x="34" y="18" width="12" height="8" rx="1" fill={c2}/></svg>);
    case "timeline":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><line x1="4" y1="24" x2="44" y2="24" stroke={c} strokeWidth="2"/><circle cx="12" cy="24" r="3" fill={c}/><circle cx="24" cy="24" r="3" fill={c}/><circle cx="36" cy="24" r="3" fill={c}/><rect x="6" y="10" width="12" height="8" rx="1" fill={c2}/><rect x="30" y="10" width="12" height="8" rx="1" fill={c2}/><rect x="18" y="30" width="12" height="8" rx="1" fill={c2}/></svg>);
    case "venn-diagram":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="18" cy="22" r="14" fill={c} opacity="0.35"/><circle cx="30" cy="22" r="14" fill={c2} opacity="0.35"/></svg>);
    case "swot":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="20" height="20" rx="2" fill="#70AD47"/><rect x="26" y="2" width="20" height="20" rx="2" fill="#ED7D31"/><rect x="2" y="26" width="20" height="20" rx="2" fill="#4472C4"/><rect x="26" y="26" width="20" height="20" rx="2" fill="#FF4444"/></svg>);
    case "fishbone":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><line x1="4" y1="24" x2="44" y2="24" stroke={c} strokeWidth="2"/><line x1="12" y1="24" x2="20" y2="10" stroke={c2} strokeWidth="1.5"/><line x1="24" y1="24" x2="16" y2="38" stroke={c2} strokeWidth="1.5"/><line x1="32" y1="24" x2="40" y2="10" stroke={c2} strokeWidth="1.5"/><polygon points="44,24 40,20 40,28" fill={c}/></svg>);
    case "gantt":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="10" y="6" width="28" height="6" rx="2" fill={c}/><rect x="16" y="16" width="20" height="6" rx="2" fill={c2}/><rect x="12" y="26" width="30" height="6" rx="2" fill={c} opacity="0.7"/><rect x="20" y="36" width="18" height="6" rx="2" fill={c2}/></svg>);
    case "infographic-bar":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="4" y="6" width="36" height="6" rx="3" fill={c}/><rect x="4" y="16" width="28" height="6" rx="3" fill={c2}/><rect x="4" y="26" width="20" height="6" rx="3" fill={c} opacity="0.7"/><rect x="4" y="36" width="12" height="6" rx="3" fill={c2}/></svg>);
    case "infographic-pie":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><path d="M24,24 L24,6 A18,18 0 0,1 40,30 Z" fill={c}/><path d="M24,24 L40,30 A18,18 0 0,1 12,38 Z" fill={c2}/><path d="M24,24 L12,38 A18,18 0 0,1 24,6 Z" fill={c} opacity="0.5"/></svg>);
    case "network-diagram":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="18" y="2" width="12" height="8" rx="1" fill={c}/><rect x="2" y="20" width="12" height="8" rx="1" fill={c2}/><rect x="34" y="20" width="12" height="8" rx="1" fill={c2}/><rect x="10" y="38" width="12" height="8" rx="1" fill={c2}/><rect x="26" y="38" width="12" height="8" rx="1" fill={c2}/><line x1="24" y1="10" x2="8" y2="20" stroke={c} strokeWidth="1"/><line x1="24" y1="10" x2="40" y2="20" stroke={c} strokeWidth="1"/><line x1="8" y1="28" x2="16" y2="38" stroke={c2} strokeWidth="1"/><line x1="40" y1="28" x2="32" y2="38" stroke={c2} strokeWidth="1"/><line x1="22" y1="38" x2="26" y2="38" stroke={c2} strokeWidth="1"/></svg>);
    case "floor-plan":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="1" fill="none" stroke={c} strokeWidth="2"/><line x1="24" y1="2" x2="24" y2="30" stroke={c} strokeWidth="1.5"/><line x1="2" y1="24" x2="24" y2="24" stroke={c} strokeWidth="1.5"/><rect x="6" y="6" width="8" height="8" rx="1" fill={c2}/><rect x="6" y="28" width="14" height="6" rx="1" fill={c2}/><rect x="28" y="6" width="12" height="20" rx="1" fill={c2}/><rect x="28" y="32" width="6" height="10" rx="1" fill={c2}/><rect x="22" y="40" x2="26" width="4" height="6" fill="none" stroke={c} strokeWidth="1"/></svg>);
    case "value-stream-map":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="4" width="10" height="14" rx="1" fill={c}/><rect x="18" y="4" width="10" height="14" rx="1" fill={c2}/><rect x="34" y="4" width="12" height="14" rx="1" fill={c}/><polygon points="14,11 18,8 18,14" fill={c}/><polygon points="30,11 34,8 34,14" fill={c2}/><line x1="2" y1="24" x2="46" y2="24" stroke={c} strokeWidth="1.5"/><polyline points="4,36 12,28 20,34 28,30 36,36 44,28" fill="none" stroke={c2} strokeWidth="1.5"/></svg>);
    case "swimlane":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="1" fill="none" stroke={c} strokeWidth="1.5"/><line x1="2" y1="16" x2="46" y2="16" stroke={c} strokeWidth="1"/><line x1="2" y1="32" x2="46" y2="32" stroke={c} strokeWidth="1"/><rect x="6" y="6" width="10" height="6" rx="1" fill={c}/><line x1="16" y1="9" x2="22" y2="9" stroke={c} strokeWidth="1"/><rect x="22" y="6" width="10" height="6" rx="1" fill={c2}/><rect x="14" y="20" width="10" height="6" rx="1" fill={c2}/><line x1="24" y1="23" x2="30" y2="23" stroke={c2} strokeWidth="1"/><rect x="30" y="20" width="10" height="6" rx="1" fill={c}/><rect x="8" y="36" width="10" height="6" rx="1" fill={c}/><line x1="18" y1="39" x2="26" y2="39" stroke={c} strokeWidth="1"/><rect x="26" y="36" width="10" height="6" rx="1" fill={c2}/></svg>);
    case "decision-tree":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="24,4 32,14 16,14" fill={c}/><line x1="20" y1="14" x2="10" y2="22" stroke={c} strokeWidth="1.5"/><line x1="28" y1="14" x2="38" y2="22" stroke={c} strokeWidth="1.5"/><rect x="2" y="22" width="16" height="8" rx="2" fill={c2}/><rect x="30" y="22" width="16" height="8" rx="2" fill={c2}/><line x1="6" y1="30" x2="6" y2="36" stroke={c2} strokeWidth="1"/><line x1="14" y1="30" x2="14" y2="36" stroke={c2} strokeWidth="1"/><rect x="2" y="36" width="8" height="6" rx="1" fill={c} opacity="0.6"/><rect x="10" y="36" width="8" height="6" rx="1" fill={c} opacity="0.6"/><line x1="34" y1="30" x2="34" y2="36" stroke={c2} strokeWidth="1"/><line x1="42" y1="30" x2="42" y2="36" stroke={c2} strokeWidth="1"/><rect x="30" y="36" width="8" height="6" rx="1" fill={c} opacity="0.6"/><rect x="40" y="36" width="8" height="6" rx="1" fill={c} opacity="0.6"/></svg>);
    case "data-flow":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="10" r="8" fill={c}/><rect x="2" y="28" width="16" height="14" rx="1" fill={c2}/><rect x="30" y="28" width="16" height="14" rx="1" fill={c2}/><line x1="18" y1="16" x2="10" y2="28" stroke={c} strokeWidth="1.5" markerEnd="url(#a)"/><line x1="30" y1="16" x2="38" y2="28" stroke={c} strokeWidth="1.5"/><line x1="18" y1="35" x2="30" y2="35" stroke={c2} strokeWidth="1.5"/><line x1="2" y1="24" x2="46" y2="24" stroke={c2} strokeWidth="0.5" strokeDasharray="2,2"/></svg>);
    case "er-diagram":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="16" height="18" rx="2" fill={c}/><line x1="2" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1"/><rect x="30" y="2" width="16" height="18" rx="2" fill={c2}/><line x1="30" y1="10" x2="46" y2="10" stroke="white" strokeWidth="1"/><rect x="2" y="28" width="16" height="18" rx="2" fill={c2}/><line x1="2" y1="36" x2="18" y2="36" stroke="white" strokeWidth="1"/><line x1="18" y1="11" x2="30" y2="11" stroke={c} strokeWidth="1.5"/><line x1="10" y1="20" x2="10" y2="28" stroke={c} strokeWidth="1.5"/><polygon points="28,11 30,9 30,13" fill={c}/></svg>);
    case "uml-class":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="12" y="2" width="24" height="20" rx="1" fill="none" stroke={c} strokeWidth="1.5"/><rect x="12" y="2" width="24" height="7" rx="1" fill={c}/><line x1="12" y1="14" x2="36" y2="14" stroke={c} strokeWidth="1"/><rect x="4" y="30" width="18" height="16" rx="1" fill="none" stroke={c2} strokeWidth="1.5"/><rect x="4" y="30" width="18" height="6" rx="1" fill={c2}/><rect x="26" y="30" width="18" height="16" rx="1" fill="none" stroke={c2} strokeWidth="1.5"/><rect x="26" y="30" width="18" height="6" rx="1" fill={c2}/><line x1="24" y1="22" x2="13" y2="30" stroke={c} strokeWidth="1"/><line x1="24" y1="22" x2="35" y2="30" stroke={c} strokeWidth="1"/><polygon points="13,28 11,32 15,32" fill="none" stroke={c} strokeWidth="1"/></svg>);
    case "sequence-diagram":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="12" height="8" rx="1" fill={c}/><rect x="18" y="2" width="12" height="8" rx="1" fill={c}/><rect x="34" y="2" width="12" height="8" rx="1" fill={c}/><line x1="8" y1="10" x2="8" y2="46" stroke={c} strokeWidth="1" strokeDasharray="3,2"/><line x1="24" y1="10" x2="24" y2="46" stroke={c} strokeWidth="1" strokeDasharray="3,2"/><line x1="40" y1="10" x2="40" y2="46" stroke={c} strokeWidth="1" strokeDasharray="3,2"/><line x1="8" y1="16" x2="24" y2="16" stroke={c2} strokeWidth="1.5"/><polygon points="22,14 24,16 22,18" fill={c2}/><line x1="24" y1="24" x2="40" y2="24" stroke={c2} strokeWidth="1.5"/><polygon points="38,22 40,24 38,26" fill={c2}/><line x1="40" y1="32" x2="8" y2="32" stroke={c} strokeWidth="1.5" strokeDasharray="3,2"/><polygon points="10,30 8,32 10,34" fill={c}/></svg>);
    case "wireframe":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="2" fill="none" stroke={c} strokeWidth="1.5"/><rect x="2" y="2" width="44" height="8" rx="2" fill={c}/><rect x="6" y="14" width="8" height="28" rx="1" fill={c2} opacity="0.3"/><rect x="18" y="14" width="24" height="12" rx="1" fill={c2} opacity="0.3"/><rect x="18" y="30" width="10" height="12" rx="1" fill={c2} opacity="0.3"/><rect x="32" y="30" width="10" height="6" rx="1" fill={c2} opacity="0.3"/><rect x="32" y="38" width="10" height="4" rx="1" fill={c}/></svg>);
    case "circular-flow":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="14" y="2" width="20" height="10" rx="2" fill={c}/><rect x="34" y="20" width="14" height="10" rx="2" fill={c2}/><rect x="14" y="38" width="20" height="8" rx="2" fill={c}/><rect x="0" y="20" width="14" height="10" rx="2" fill={c2}/><path d="M34,7 Q42,7 42,20" fill="none" stroke={c} strokeWidth="1.5"/><path d="M41,30 Q41,42 34,42" fill="none" stroke={c2} strokeWidth="1.5"/><path d="M14,42 Q6,42 6,30" fill="none" stroke={c} strokeWidth="1.5"/><path d="M6,20 Q6,7 14,7" fill="none" stroke={c2} strokeWidth="1.5"/><polygon points="42,18 44,20 40,20" fill={c}/><polygon points="34,44 34,40 38,42" fill={c2}/><polygon points="6,32 4,30 8,30" fill={c}/><polygon points="12,7 14,10 14,4" fill={c2}/></svg>);
    case "pyramid-diagram":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="24,4 6,44 42,44" fill={c}/><line x1="14" y1="24" x2="34" y2="24" stroke="white" strokeWidth="1"/><line x1="10" y1="34" x2="38" y2="34" stroke="white" strokeWidth="1"/></svg>);
    case "funnel-chart":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="10" rx="2" fill={c}/><polygon points="6,14 42,14 34,26 14,26" fill={c2}/><polygon points="14,28 34,28 28,40 20,40" fill={c} opacity="0.7"/><rect x="20" y="42" width="8" height="4" rx="1" fill={c2}/></svg>);
    case "comparison-infographic":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="20" height="44" rx="2" fill={c}/><rect x="26" y="2" width="20" height="44" rx="2" fill={c2}/><text x="12" y="14" fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">A</text><text x="36" y="14" fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">B</text><line x1="6" y1="20" x2="18" y2="20" stroke="white" strokeWidth="1"/><line x1="30" y1="20" x2="42" y2="20" stroke="white" strokeWidth="1"/><rect x="6" y="24" width="12" height="4" rx="1" fill="white" opacity="0.3"/><rect x="30" y="24" width="12" height="4" rx="1" fill="white" opacity="0.3"/><rect x="6" y="32" width="8" height="4" rx="1" fill="white" opacity="0.3"/><rect x="30" y="32" width="10" height="4" rx="1" fill="white" opacity="0.3"/></svg>);
    case "statistics-infographic":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><text x="24" y="16" fill={c} fontSize="14" textAnchor="middle" fontWeight="bold">85%</text><rect x="8" y="22" width="32" height="4" rx="2" fill={c2} opacity="0.3"/><rect x="8" y="22" width="27" height="4" rx="2" fill={c}/><circle cx="10" cy="36" r="4" fill={c2}/><rect x="18" y="33" width="20" height="3" rx="1" fill={c2}/><rect x="18" y="38" width="14" height="2" rx="1" fill={c2} opacity="0.5"/></svg>);
    case "process-infographic":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="8" cy="8" r="6" fill={c}/><text x="8" y="11" fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">1</text><rect x="18" y="4" width="28" height="8" rx="1" fill={c2}/><circle cx="8" cy="24" r="6" fill={c}/><text x="8" y="27" fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">2</text><rect x="18" y="20" width="28" height="8" rx="1" fill={c2}/><circle cx="8" cy="40" r="6" fill={c}/><text x="8" y="43" fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">3</text><rect x="18" y="36" width="28" height="8" rx="1" fill={c2}/></svg>);
    case "icon-grid":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="10" cy="10" r="6" fill={c}/><circle cx="24" cy="10" r="6" fill={c2}/><circle cx="38" cy="10" r="6" fill={c}/><circle cx="10" cy="26" r="6" fill={c2}/><circle cx="24" cy="26" r="6" fill={c}/><circle cx="38" cy="26" r="6" fill={c2}/><rect x="4" y="36" width="12" height="3" rx="1" fill={c2}/><rect x="18" y="36" width="12" height="3" rx="1" fill={c2}/><rect x="32" y="36" width="12" height="3" rx="1" fill={c2}/></svg>);
    case "percentage-infographic":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="4" y="6" width="40" height="6" rx="3" fill={c2} opacity="0.3"/><rect x="4" y="6" width="36" height="6" rx="3" fill={c}/><text x="44" y="12" fill={c} fontSize="6" textAnchor="end">90%</text><rect x="4" y="18" width="40" height="6" rx="3" fill={c2} opacity="0.3"/><rect x="4" y="18" width="28" height="6" rx="3" fill={c2}/><text x="36" y="24" fill={c2} fontSize="6" textAnchor="end">70%</text><rect x="4" y="30" width="40" height="6" rx="3" fill={c2} opacity="0.3"/><rect x="4" y="30" width="18" height="6" rx="3" fill={c} opacity="0.7"/><text x="26" y="36" fill={c} fontSize="6" textAnchor="end">45%</text></svg>);
    case "map-infographic":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><path d="M4,14 Q10,8 18,12 Q26,4 34,10 Q40,6 44,12 L44,38 Q40,32 34,36 Q26,30 18,38 Q10,34 4,40 Z" fill={c2} opacity="0.3"/><path d="M16,14 L16,38" stroke={c} strokeWidth="1" strokeDasharray="2,2"/><path d="M32,10 L32,36" stroke={c} strokeWidth="1" strokeDasharray="2,2"/><circle cx="12" cy="20" r="3" fill={c}/><circle cx="28" cy="16" r="3" fill={c}/><circle cx="38" cy="24" r="3" fill={c}/></svg>);
    case "photo-collage":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="26" height="20" rx="2" fill={c2}/><rect x="32" y="2" width="14" height="20" rx="2" fill={c}/><rect x="2" y="26" width="14" height="20" rx="2" fill={c}/><rect x="20" y="26" width="26" height="20" rx="2" fill={c2}/><circle cx="15" cy="12" r="4" fill={c} opacity="0.5"/><circle cx="39" cy="12" r="3" fill="white" opacity="0.3"/><circle cx="9" cy="36" r="3" fill="white" opacity="0.3"/><circle cx="33" cy="36" r="5" fill={c} opacity="0.5"/></svg>);
    default:
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill={c2} opacity="0.3"/><rect x="12" y="12" width="24" height="24" rx="2" fill={c}/></svg>);
  }
}

export function generateDiagramSVG(type: string, nodes: NodeItem[], theme: ColorTheme): string {
  const w = 700, h = 400;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += `<rect fill="#fafafa" width="${w}" height="${h}" rx="8"/>`;
  svg += `<defs><marker id="ah" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${theme.accent}"/></marker></defs>`;

  switch (type) {
    case "flowchart": {
      const shapes = nodes.slice(0, 6);
      shapes.forEach((node, i) => {
        const x = 40 + (i % 3) * 220;
        const y = 60 + Math.floor(i / 3) * 160;
        if (i === 0 || i === shapes.length - 1) {
          svg += `<rect x="${x}" y="${y}" width="160" height="60" rx="30" fill="${theme.accent}"/>`;
        } else if (i % 2 === 1) {
          svg += `<polygon points="${x + 80},${y} ${x + 160},${y + 40} ${x + 80},${y + 80} ${x},${y + 40}" fill="${theme.primary}"/>`;
        } else {
          svg += `<rect x="${x}" y="${y}" width="160" height="60" rx="4" fill="${theme.primary}"/>`;
        }
        svg += `<text x="${x + 80}" y="${y + (i % 2 === 1 ? 44 : 34)}" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
        if (i < shapes.length - 1) {
          const fromX = x + 160;
          const fromY = y + 30;
          const toI = i + 1;
          const toX = 40 + (toI % 3) * 220;
          const toY = 60 + Math.floor(toI / 3) * 160 + 30;
          if (Math.floor(i / 3) === Math.floor(toI / 3)) {
            svg += `<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="${theme.accent}" stroke-width="2" marker-end="url(#ah)"/>`;
          } else {
            svg += `<polyline points="${fromX - 80},${fromY + 30} ${fromX - 80},${toY}" stroke="${theme.accent}" stroke-width="2" fill="none" marker-end="url(#ah)"/>`;
          }
        }
      });
      break;
    }
    case "mind-map": {
      const cx = w / 2, cy = h / 2;
      svg += `<ellipse cx="${cx}" cy="${cy}" rx="80" ry="35" fill="${theme.primary}"/>`;
      svg += `<text x="${cx}" y="${cy + 5}" fill="${theme.text}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(nodes[0]?.text || "Central Idea")}</text>`;
      const branches = nodes.slice(1);
      branches.forEach((node, i) => {
        const angle = (Math.PI * 2 * i) / branches.length - Math.PI / 2;
        const bx = cx + 200 * Math.cos(angle);
        const by = cy + 140 * Math.sin(angle);
        const cp1x = cx + 100 * Math.cos(angle);
        const cp1y = cy + 70 * Math.sin(angle);
        svg += `<path d="M${cx},${cy} Q${cp1x},${cp1y} ${bx},${by}" stroke="${theme.primary}" stroke-width="3" fill="none"/>`;
        svg += `<ellipse cx="${bx}" cy="${by}" rx="65" ry="25" fill="${theme.secondary}"/>`;
        svg += `<text x="${bx}" y="${by + 5}" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      });
      break;
    }
    case "org-chart-builder": {
      const drawOrg = (node: NodeItem, x: number, y: number, spread: number, depth: number) => {
        const nw = 110, nh = 55;
        svg += `<rect x="${x - nw / 2}" y="${y}" width="${nw}" height="${nh}" rx="6" fill="${depth === 0 ? theme.accent : theme.primary}" stroke="${theme.bg}" stroke-width="1"/>`;
        svg += `<circle cx="${x}" cy="${y + 14}" r="8" fill="${theme.bg}" opacity="0.6"/>`;
        svg += `<text x="${x}" y="${y + nh - 10}" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle">${escSvg(node.text)}</text>`;
        if (node.children && node.children.length > 0) {
          const spacing = spread / node.children.length;
          const startX = x - spread / 2 + spacing / 2;
          svg += `<line x1="${x}" y1="${y + nh}" x2="${x}" y2="${y + nh + 15}" stroke="${theme.accent}" stroke-width="1.5"/>`;
          if (node.children.length > 1) {
            svg += `<line x1="${startX}" y1="${y + nh + 15}" x2="${startX + spacing * (node.children.length - 1)}" y2="${y + nh + 15}" stroke="${theme.accent}" stroke-width="1.5"/>`;
          }
          node.children.forEach((child, ci) => {
            const childX = startX + ci * spacing;
            svg += `<line x1="${childX}" y1="${y + nh + 15}" x2="${childX}" y2="${y + nh + 30}" stroke="${theme.accent}" stroke-width="1.5"/>`;
            drawOrg(child, childX, y + nh + 30, spacing, depth + 1);
          });
        }
      };
      if (nodes[0]) drawOrg(nodes[0], w / 2, 20, w - 60, 0);
      break;
    }
    case "timeline": {
      const lineY = h / 2;
      svg += `<line x1="30" y1="${lineY}" x2="${w - 30}" y2="${lineY}" stroke="${theme.primary}" stroke-width="3"/>`;
      nodes.forEach((node, i) => {
        const x = 60 + i * ((w - 120) / Math.max(nodes.length - 1, 1));
        const above = i % 2 === 0;
        const textY = above ? lineY - 50 : lineY + 65;
        svg += `<circle cx="${x}" cy="${lineY}" r="8" fill="${theme.primary}" stroke="${theme.bg}" stroke-width="2"/>`;
        svg += `<line x1="${x}" y1="${lineY + (above ? -8 : 8)}" x2="${x}" y2="${textY + (above ? 15 : -15)}" stroke="${theme.secondary}" stroke-width="1.5"/>`;
        svg += `<rect x="${x - 50}" y="${textY - 12}" width="100" height="30" rx="4" fill="${i % 2 === 0 ? theme.primary : theme.secondary}"/>`;
        svg += `<text x="${x}" y="${textY + 6}" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      });
      break;
    }
    case "venn-diagram": {
      const count = Math.min(Math.max(nodes.length, 2), 5);
      const radius = count <= 3 ? 100 : 80;
      const dist = count <= 3 ? 70 : 55;
      nodes.slice(0, count).forEach((node, i) => {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        const cx = w / 2 + dist * Math.cos(angle);
        const cy = h / 2 + dist * Math.sin(angle);
        svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${theme.primary}" opacity="0.3" stroke="${theme.primary}" stroke-width="2"/>`;
        const labelDist = dist + radius * 0.5;
        const lx = w / 2 + labelDist * Math.cos(angle);
        const ly = h / 2 + labelDist * Math.sin(angle);
        svg += `<text x="${lx}" y="${ly + 4}" fill="${theme.accent}" font-size="13" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      });
      break;
    }
    case "swot": {
      const labels = ["Strengths", "Weaknesses", "Opportunities", "Threats"];
      const colors = [theme.primary, theme.secondary, theme.accent, "#C55A11"];
      for (let i = 0; i < 4; i++) {
        const col = i % 2, row = Math.floor(i / 2);
        const x = 50 + col * 310;
        const y = 30 + row * 180;
        svg += `<rect x="${x}" y="${y}" width="290" height="170" rx="8" fill="${colors[i]}" opacity="0.85"/>`;
        svg += `<text x="${x + 145}" y="${y + 30}" fill="#fff" font-size="15" font-family="Arial" text-anchor="middle" font-weight="bold">${labels[i]}</text>`;
        svg += `<text x="${x + 145}" y="${y + 100}" fill="#fff" font-size="12" font-family="Arial" text-anchor="middle">${escSvg(nodes[i]?.text || "Add items...")}</text>`;
      }
      break;
    }
    case "fishbone": {
      const spineY = h / 2;
      svg += `<line x1="60" y1="${spineY}" x2="${w - 60}" y2="${spineY}" stroke="${theme.primary}" stroke-width="3" marker-end="url(#ah)"/>`;
      svg += `<text x="${w - 50}" y="${spineY - 15}" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="end" font-weight="bold">${escSvg(nodes[0]?.text || "Effect")}</text>`;
      const causes = nodes.slice(1);
      causes.forEach((node, i) => {
        const x = 100 + i * ((w - 200) / Math.max(causes.length, 1));
        const above = i % 2 === 0;
        const endY = above ? spineY - 100 : spineY + 100;
        svg += `<line x1="${x}" y1="${spineY}" x2="${x + 40}" y2="${endY}" stroke="${theme.secondary}" stroke-width="2"/>`;
        svg += `<text x="${x + 40}" y="${endY + (above ? -5 : 15)}" fill="${theme.accent}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      });
      break;
    }
    case "gantt": {
      const barH = 30;
      const startX = 150;
      const chartW = w - startX - 30;
      svg += `<text x="${startX + chartW / 2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Project Gantt Chart</text>`;
      for (let i = 0; i <= 10; i++) {
        const x = startX + (i / 10) * chartW;
        svg += `<line x1="${x}" y1="35" x2="${x}" y2="${h - 10}" stroke="#ddd" stroke-width="0.5"/>`;
        svg += `<text x="${x}" y="48" fill="${theme.accent}" font-size="9" font-family="Arial" text-anchor="middle">W${i + 1}</text>`;
      }
      nodes.forEach((node, i) => {
        const y = 55 + i * (barH + 8);
        const barStart = (i * 0.12) * chartW;
        const barWidth = Math.max(80, (0.3 + (i * 17 % 7) * 0.05) * chartW);
        svg += `<text x="${startX - 10}" y="${y + barH / 2 + 4}" fill="${theme.accent}" font-size="10" font-family="Arial" text-anchor="end">${escSvg(node.text)}</text>`;
        svg += `<rect x="${startX + barStart}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${theme.primary}" opacity="${0.7 + i * 0.05}"/>`;
        svg += `<text x="${startX + barStart + barWidth / 2}" y="${y + barH / 2 + 4}" fill="${theme.text}" font-size="9" font-family="Arial" text-anchor="middle">${Math.round(barWidth / chartW * 100)}%</text>`;
      });
      break;
    }
    case "infographic-bar": {
      svg += `<text x="${w / 2}" y="30" fill="${theme.accent}" font-size="16" font-family="Arial" text-anchor="middle" font-weight="bold">Data Overview</text>`;
      const maxBarW = w - 200;
      nodes.forEach((node, i) => {
        const y = 60 + i * 55;
        const barW = maxBarW * (0.4 + (i * 13 % 7) * 0.08);
        svg += `<text x="20" y="${y + 20}" fill="${theme.accent}" font-size="12" font-family="Arial" font-weight="bold">${escSvg(node.text)}</text>`;
        svg += `<rect x="150" y="${y}" width="${barW}" height="30" rx="15" fill="${theme.primary}" opacity="${0.7 + i * 0.05}"/>`;
        svg += `<text x="${150 + barW - 10}" y="${y + 20}" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="end" font-weight="bold">${Math.round(barW / maxBarW * 100)}%</text>`;
      });
      break;
    }
    case "infographic-pie": {
      const cx = w / 2, cy = h / 2, r = 130;
      let startAngle = -Math.PI / 2;
      const total = nodes.length;
      const sliceColors = [theme.primary, theme.secondary, theme.accent, "#FFC000", "#FF4444", "#70AD47", "#7030A0"];
      nodes.forEach((node, i) => {
        const portion = 1 / total;
        const endAngle = startAngle + portion * 2 * Math.PI;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = portion > 0.5 ? 1 : 0;
        svg += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${sliceColors[i % sliceColors.length]}" stroke="#fff" stroke-width="2"/>`;
        const midAngle = (startAngle + endAngle) / 2;
        const lx = cx + (r + 30) * Math.cos(midAngle);
        const ly = cy + (r + 30) * Math.sin(midAngle);
        svg += `<text x="${lx}" y="${ly + 4}" fill="${theme.accent}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
        startAngle = endAngle;
      });
      break;
    }
    // ===== NEW DIAGRAM TYPES =====
    case "network-diagram": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Network Topology</text>`;
      // Central router/switch
      svg += `<rect x="${w/2-40}" y="60" width="80" height="40" rx="4" fill="${theme.primary}"/>`;
      svg += `<text x="${w/2}" y="85" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle">Router</text>`;
      // Nodes around
      const netNodes = nodes.slice(0, Math.min(nodes.length, 6));
      netNodes.forEach((node, i) => {
        const angle = (Math.PI * 2 * i) / netNodes.length - Math.PI / 2;
        const nx = w / 2 + 200 * Math.cos(angle);
        const ny = 200 + 130 * Math.sin(angle);
        svg += `<line x1="${w/2}" y1="100" x2="${nx}" y2="${ny}" stroke="${theme.secondary}" stroke-width="2" stroke-dasharray="5,3"/>`;
        svg += `<rect x="${nx-50}" y="${ny-20}" width="100" height="40" rx="4" fill="${theme.secondary}"/>`;
        svg += `<text x="${nx}" y="${ny+5}" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle">${escSvg(node.text)}</text>`;
      });
      break;
    }
    case "floor-plan": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Floor Plan</text>`;
      svg += `<rect x="50" y="40" width="${w-100}" height="${h-60}" rx="2" fill="none" stroke="${theme.primary}" stroke-width="3"/>`;
      // Rooms
      svg += `<line x1="${w/2}" y1="40" x2="${w/2}" y2="260" stroke="${theme.primary}" stroke-width="2"/>`;
      svg += `<line x1="50" y1="200" x2="${w/2}" y2="200" stroke="${theme.primary}" stroke-width="2"/>`;
      svg += `<line x1="${w/2}" y1="180" x2="${w-50}" y2="180" stroke="${theme.primary}" stroke-width="2"/>`;
      // Room labels
      const roomLabels = nodes.slice(0, 4);
      const roomPos = [{x: 175, y: 130}, {x: 175, y: 300}, {x: 525, y: 120}, {x: 525, y: 290}];
      roomLabels.forEach((node, i) => {
        const p = roomPos[i];
        if (p) {
          svg += `<rect x="${p.x-50}" y="${p.y-15}" width="100" height="30" rx="4" fill="${theme.bg}"/>`;
          svg += `<text x="${p.x}" y="${p.y+5}" fill="${theme.accent}" font-size="11" font-family="Arial" text-anchor="middle">${escSvg(node.text)}</text>`;
        }
      });
      // Furniture symbols
      svg += `<rect x="80" y="70" width="60" height="40" rx="4" fill="${theme.secondary}" opacity="0.4"/>`;
      svg += `<rect x="400" y="60" width="80" height="50" rx="4" fill="${theme.secondary}" opacity="0.4"/>`;
      // Door openings
      svg += `<rect x="${w/2-20}" y="255" width="40" height="10" fill="#fafafa"/>`;
      svg += `<rect x="${w-70}" y="175" width="10" height="40" fill="#fafafa"/>`;
      break;
    }
    case "value-stream-map": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Value Stream Map</text>`;
      const vsNodes = nodes.slice(0, Math.min(nodes.length, 5));
      const vsW = (w - 100) / vsNodes.length;
      vsNodes.forEach((node, i) => {
        const x = 50 + i * vsW;
        // Process box
        svg += `<rect x="${x}" y="60" width="${vsW-30}" height="80" rx="4" fill="${theme.primary}"/>`;
        svg += `<text x="${x+(vsW-30)/2}" y="105" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
        // Data box below
        svg += `<rect x="${x+10}" y="150" width="${vsW-50}" height="30" rx="2" fill="${theme.bg}"/>`;
        svg += `<text x="${x+(vsW-30)/2}" y="170" fill="${theme.accent}" font-size="9" font-family="Arial" text-anchor="middle">CT: ${(i+1)*2}min</text>`;
        // Arrow
        if (i < vsNodes.length - 1) {
          svg += `<line x1="${x+vsW-30}" y1="100" x2="${x+vsW}" y2="100" stroke="${theme.accent}" stroke-width="2" marker-end="url(#ah)"/>`;
        }
      });
      // Timeline at bottom
      svg += `<line x1="50" y1="220" x2="${w-50}" y2="220" stroke="${theme.secondary}" stroke-width="2"/>`;
      let tx = 50;
      vsNodes.forEach((_, i) => {
        const segW = vsW * 0.6;
        svg += `<rect x="${tx}" y="230" width="${segW}" height="8" rx="2" fill="${theme.primary}" opacity="0.5"/>`;
        if (i < vsNodes.length - 1) {
          svg += `<rect x="${tx+segW}" y="230" width="${vsW*0.3}" height="8" rx="2" fill="${theme.secondary}" opacity="0.3"/>`;
        }
        tx += vsW;
      });
      svg += `<text x="${w/2}" y="260" fill="${theme.accent}" font-size="10" font-family="Arial" text-anchor="middle">Lead Time</text>`;
      break;
    }
    case "swimlane": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Cross-Functional Flowchart</text>`;
      const lanes = Math.min(nodes.length, 4);
      const laneH = (h - 60) / lanes;
      for (let i = 0; i < lanes; i++) {
        const y = 40 + i * laneH;
        svg += `<rect x="20" y="${y}" width="${w-40}" height="${laneH}" fill="${i % 2 === 0 ? theme.bg : '#fafafa'}" stroke="${theme.secondary}" stroke-width="1"/>`;
        svg += `<text x="40" y="${y + laneH/2 + 5}" fill="${theme.accent}" font-size="12" font-family="Arial" font-weight="bold" transform="rotate(-90,40,${y+laneH/2})">${escSvg(nodes[i]?.text || `Lane ${i+1}`)}</text>`;
        // Process boxes in each lane
        const boxX = 100 + i * 140;
        svg += `<rect x="${boxX}" y="${y+laneH/2-18}" width="120" height="36" rx="4" fill="${theme.primary}" opacity="${0.7+i*0.1}"/>`;
        svg += `<text x="${boxX+60}" y="${y+laneH/2+5}" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle">Process ${i+1}</text>`;
        if (i < lanes - 1) {
          svg += `<line x1="${boxX+120}" y1="${y+laneH/2}" x2="${boxX+160}" y2="${y+laneH/2+laneH/3}" stroke="${theme.accent}" stroke-width="1.5" marker-end="url(#ah)"/>`;
        }
      }
      break;
    }
    case "decision-tree": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Decision Tree</text>`;
      // Root decision
      svg += `<polygon points="${w/2},40 ${w/2+70},80 ${w/2},120 ${w/2-70},80" fill="${theme.primary}"/>`;
      svg += `<text x="${w/2}" y="85" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(nodes[0]?.text || "Decision?")}</text>`;
      // Yes branch
      svg += `<line x1="${w/2-70}" y1="80" x2="${w/2-180}" y2="170" stroke="${theme.accent}" stroke-width="2"/>`;
      svg += `<text x="${w/2-130}" y="120" fill="#70AD47" font-size="11" font-family="Arial" font-weight="bold">Yes</text>`;
      svg += `<rect x="${w/2-230}" y="160" width="100" height="50" rx="4" fill="${theme.secondary}"/>`;
      svg += `<text x="${w/2-180}" y="190" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle">${escSvg(nodes[1]?.text || "Option A")}</text>`;
      // No branch
      svg += `<line x1="${w/2+70}" y1="80" x2="${w/2+180}" y2="170" stroke="${theme.accent}" stroke-width="2"/>`;
      svg += `<text x="${w/2+130}" y="120" fill="#FF4444" font-size="11" font-family="Arial" font-weight="bold">No</text>`;
      svg += `<polygon points="${w/2+180},160 ${w/2+240},190 ${w/2+180},220 ${w/2+120},190" fill="${theme.primary}"/>`;
      svg += `<text x="${w/2+180}" y="195" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle">${escSvg(nodes[2]?.text || "Decision 2?")}</text>`;
      // Sub branches
      svg += `<line x1="${w/2+120}" y1="190" x2="${w/2+60}" y2="280" stroke="${theme.secondary}" stroke-width="1.5"/>`;
      svg += `<rect x="${w/2+10}" y="270" width="100" height="40" rx="4" fill="${theme.secondary}"/>`;
      svg += `<text x="${w/2+60}" y="295" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle">Result A</text>`;
      svg += `<line x1="${w/2+240}" y1="190" x2="${w/2+300}" y2="280" stroke="${theme.secondary}" stroke-width="1.5"/>`;
      svg += `<rect x="${w/2+250}" y="270" width="100" height="40" rx="4" fill="${theme.secondary}"/>`;
      svg += `<text x="${w/2+300}" y="295" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle">Result B</text>`;
      break;
    }
    case "data-flow": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Data Flow Diagram</text>`;
      // External entities (rectangles)
      svg += `<rect x="40" y="60" width="120" height="50" rx="0" fill="${theme.secondary}"/>`;
      svg += `<text x="100" y="90" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle">${escSvg(nodes[0]?.text || "Entity 1")}</text>`;
      svg += `<rect x="${w-160}" y="60" width="120" height="50" rx="0" fill="${theme.secondary}"/>`;
      svg += `<text x="${w-100}" y="90" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle">${escSvg(nodes[1]?.text || "Entity 2")}</text>`;
      // Process (circle)
      svg += `<circle cx="${w/2}" cy="200" r="60" fill="${theme.primary}"/>`;
      svg += `<text x="${w/2}" y="205" fill="${theme.text}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(nodes[2]?.text || "Process")}</text>`;
      // Data store
      svg += `<line x1="200" y1="330" x2="500" y2="330" stroke="${theme.accent}" stroke-width="2"/>`;
      svg += `<line x1="200" y1="360" x2="500" y2="360" stroke="${theme.accent}" stroke-width="2"/>`;
      svg += `<text x="350" y="350" fill="${theme.accent}" font-size="11" font-family="Arial" text-anchor="middle">Data Store</text>`;
      // Arrows
      svg += `<line x1="160" y1="85" x2="${w/2-60}" y2="180" stroke="${theme.accent}" stroke-width="2" marker-end="url(#ah)"/>`;
      svg += `<line x1="${w/2+60}" y1="180" x2="${w-160}" y2="85" stroke="${theme.accent}" stroke-width="2" marker-end="url(#ah)"/>`;
      svg += `<line x1="${w/2}" y1="260" x2="${w/2}" y2="330" stroke="${theme.accent}" stroke-width="2" marker-end="url(#ah)"/>`;
      break;
    }
    case "er-diagram": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Entity-Relationship Diagram</text>`;
      const entities = nodes.slice(0, Math.min(nodes.length, 4));
      const ePositions = [{x:120,y:80},{x:w-120,y:80},{x:120,y:280},{x:w-120,y:280}];
      entities.forEach((node, i) => {
        const p = ePositions[i];
        svg += `<rect x="${p.x-70}" y="${p.y-30}" width="140" height="80" rx="2" fill="none" stroke="${theme.primary}" stroke-width="2"/>`;
        svg += `<rect x="${p.x-70}" y="${p.y-30}" width="140" height="26" fill="${theme.primary}"/>`;
        svg += `<text x="${p.x}" y="${p.y-10}" fill="${theme.text}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
        svg += `<text x="${p.x-60}" y="${p.y+14}" fill="${theme.accent}" font-size="9" font-family="Arial">- id: INT (PK)</text>`;
        svg += `<text x="${p.x-60}" y="${p.y+28}" fill="${theme.accent}" font-size="9" font-family="Arial">- name: VARCHAR</text>`;
      });
      // Relationships
      if (entities.length >= 2) {
        svg += `<line x1="${ePositions[0].x+70}" y1="${ePositions[0].y}" x2="${ePositions[1].x-70}" y2="${ePositions[1].y}" stroke="${theme.secondary}" stroke-width="2"/>`;
        svg += `<text x="${w/2}" y="${ePositions[0].y-5}" fill="${theme.accent}" font-size="10" font-family="Arial" text-anchor="middle">1:N</text>`;
      }
      if (entities.length >= 3) {
        svg += `<line x1="${ePositions[0].x}" y1="${ePositions[0].y+50}" x2="${ePositions[2].x}" y2="${ePositions[2].y-30}" stroke="${theme.secondary}" stroke-width="2"/>`;
      }
      if (entities.length >= 4) {
        svg += `<line x1="${ePositions[1].x}" y1="${ePositions[1].y+50}" x2="${ePositions[3].x}" y2="${ePositions[3].y-30}" stroke="${theme.secondary}" stroke-width="2"/>`;
        svg += `<line x1="${ePositions[2].x+70}" y1="${ePositions[2].y}" x2="${ePositions[3].x-70}" y2="${ePositions[3].y}" stroke="${theme.secondary}" stroke-width="2"/>`;
        svg += `<text x="${w/2}" y="${ePositions[2].y-5}" fill="${theme.accent}" font-size="10" font-family="Arial" text-anchor="middle">M:N</text>`;
      }
      break;
    }
    case "uml-class": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">UML Class Diagram</text>`;
      const classes = nodes.slice(0, Math.min(nodes.length, 4));
      const classPos = [{x:w/2,y:50},{x:150,y:230},{x:w/2,y:230},{x:w-150,y:230}];
      classes.forEach((node, i) => {
        const p = classPos[i];
        const cw = 160, ch = 100;
        svg += `<rect x="${p.x-cw/2}" y="${p.y}" width="${cw}" height="${ch}" rx="0" fill="white" stroke="${theme.primary}" stroke-width="2"/>`;
        svg += `<rect x="${p.x-cw/2}" y="${p.y}" width="${cw}" height="28" fill="${theme.primary}"/>`;
        svg += `<text x="${p.x}" y="${p.y+18}" fill="${theme.text}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
        svg += `<line x1="${p.x-cw/2}" y1="${p.y+55}" x2="${p.x+cw/2}" y2="${p.y+55}" stroke="${theme.primary}" stroke-width="1"/>`;
        svg += `<text x="${p.x-cw/2+8}" y="${p.y+46}" fill="${theme.accent}" font-size="9" font-family="Arial">- attr: String</text>`;
        svg += `<text x="${p.x-cw/2+8}" y="${p.y+72}" fill="${theme.accent}" font-size="9" font-family="Arial">+ method(): void</text>`;
      });
      // Inheritance arrows
      if (classes.length >= 2) {
        svg += `<line x1="${classPos[0].x}" y1="${classPos[0].y+100}" x2="${classPos[1].x}" y2="${classPos[1].y}" stroke="${theme.primary}" stroke-width="1.5"/>`;
        svg += `<polygon points="${classPos[1].x-6},${classPos[1].y+6} ${classPos[1].x},${classPos[1].y} ${classPos[1].x+6},${classPos[1].y+6}" fill="white" stroke="${theme.primary}" stroke-width="1.5"/>`;
      }
      if (classes.length >= 3) {
        svg += `<line x1="${classPos[0].x}" y1="${classPos[0].y+100}" x2="${classPos[2].x}" y2="${classPos[2].y}" stroke="${theme.primary}" stroke-width="1.5"/>`;
        svg += `<polygon points="${classPos[2].x-6},${classPos[2].y+6} ${classPos[2].x},${classPos[2].y} ${classPos[2].x+6},${classPos[2].y+6}" fill="white" stroke="${theme.primary}" stroke-width="1.5"/>`;
      }
      if (classes.length >= 4) {
        svg += `<line x1="${classPos[0].x}" y1="${classPos[0].y+100}" x2="${classPos[3].x}" y2="${classPos[3].y}" stroke="${theme.primary}" stroke-width="1.5"/>`;
        svg += `<polygon points="${classPos[3].x-6},${classPos[3].y+6} ${classPos[3].x},${classPos[3].y} ${classPos[3].x+6},${classPos[3].y+6}" fill="white" stroke="${theme.primary}" stroke-width="1.5"/>`;
      }
      break;
    }
    case "sequence-diagram": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Sequence Diagram</text>`;
      const actors = nodes.slice(0, Math.min(nodes.length, 4));
      const spacing = (w - 100) / actors.length;
      actors.forEach((node, i) => {
        const x = 70 + i * spacing;
        svg += `<rect x="${x-40}" y="40" width="80" height="30" rx="4" fill="${theme.primary}"/>`;
        svg += `<text x="${x}" y="60" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle">${escSvg(node.text)}</text>`;
        svg += `<line x1="${x}" y1="70" x2="${x}" y2="360" stroke="${theme.primary}" stroke-width="1" stroke-dasharray="5,3"/>`;
      });
      // Messages
      const msgs = [
        {from:0,to:1,label:"request()",y:100,dash:false},
        {from:1,to:2,label:"validate()",y:140,dash:false},
        {from:2,to:1,label:"result",y:180,dash:true},
        {from:1,to:0,label:"response()",y:220,dash:true},
        {from:0,to:2,label:"getData()",y:270,dash:false},
        {from:2,to:0,label:"data",y:310,dash:true},
      ];
      msgs.forEach(m => {
        if (m.from < actors.length && m.to < actors.length) {
          const x1 = 70 + m.from * spacing;
          const x2 = 70 + m.to * spacing;
          svg += `<line x1="${x1}" y1="${m.y}" x2="${x2}" y2="${m.y}" stroke="${theme.accent}" stroke-width="1.5" ${m.dash ? 'stroke-dasharray="5,3"' : ''} marker-end="url(#ah)"/>`;
          svg += `<text x="${(x1+x2)/2}" y="${m.y-6}" fill="${theme.accent}" font-size="9" font-family="Arial" text-anchor="middle">${m.label}</text>`;
        }
      });
      break;
    }
    case "wireframe": {
      svg += `<rect x="50" y="40" width="${w-100}" height="${h-60}" rx="4" fill="white" stroke="${theme.primary}" stroke-width="2"/>`;
      // Header bar
      svg += `<rect x="50" y="40" width="${w-100}" height="40" rx="4" fill="${theme.primary}"/>`;
      svg += `<text x="80" y="64" fill="${theme.text}" font-size="12" font-family="Arial" font-weight="bold">${escSvg(nodes[0]?.text || "App Title")}</text>`;
      svg += `<rect x="${w-160}" y="50" width="50" height="20" rx="3" fill="${theme.bg}" opacity="0.5"/>`;
      svg += `<rect x="${w-100}" y="50" width="40" height="20" rx="3" fill="${theme.bg}" opacity="0.5"/>`;
      // Sidebar
      svg += `<rect x="50" y="80" width="140" height="${h-100}" fill="${theme.bg}" opacity="0.3"/>`;
      svg += `<rect x="65" y="95" width="110" height="14" rx="2" fill="${theme.secondary}" opacity="0.5"/>`;
      svg += `<rect x="65" y="115" width="110" height="14" rx="2" fill="${theme.secondary}" opacity="0.3"/>`;
      svg += `<rect x="65" y="135" width="110" height="14" rx="2" fill="${theme.secondary}" opacity="0.3"/>`;
      svg += `<rect x="65" y="155" width="110" height="14" rx="2" fill="${theme.secondary}" opacity="0.3"/>`;
      // Content area
      svg += `<rect x="210" y="95" width="370" height="100" rx="4" fill="${theme.bg}" opacity="0.3"/>`;
      svg += `<text x="395" y="150" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle">${escSvg(nodes[1]?.text || "Hero Section")}</text>`;
      // Cards
      svg += `<rect x="210" y="210" width="115" height="80" rx="4" fill="${theme.bg}" opacity="0.3"/>`;
      svg += `<rect x="340" y="210" width="115" height="80" rx="4" fill="${theme.bg}" opacity="0.3"/>`;
      svg += `<rect x="470" y="210" width="115" height="80" rx="4" fill="${theme.bg}" opacity="0.3"/>`;
      // Button
      svg += `<rect x="400" y="310" width="100" height="30" rx="4" fill="${theme.primary}"/>`;
      svg += `<text x="450" y="330" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle">Submit</text>`;
      break;
    }
    case "circular-flow": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Circular Flow</text>`;
      const cfNodes = nodes.slice(0, Math.min(nodes.length, 6));
      const cfR = 140;
      cfNodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / cfNodes.length - Math.PI / 2;
        const nx = w / 2 + cfR * Math.cos(angle);
        const ny = h / 2 + cfR * Math.sin(angle);
        svg += `<rect x="${nx-55}" y="${ny-20}" width="110" height="40" rx="6" fill="${i % 2 === 0 ? theme.primary : theme.secondary}"/>`;
        svg += `<text x="${nx}" y="${ny+5}" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
        // Arrow to next
        const nextAngle = (2 * Math.PI * ((i + 1) % cfNodes.length)) / cfNodes.length - Math.PI / 2;
        const mx = w / 2 + (cfR - 30) * Math.cos((angle + nextAngle) / 2);
        const my = h / 2 + (cfR - 30) * Math.sin((angle + nextAngle) / 2);
        svg += `<polygon points="${mx-4},${my-4} ${mx+4},${my} ${mx-4},${my+4}" fill="${theme.accent}" transform="rotate(${((angle+nextAngle)/2)*180/Math.PI+90},${mx},${my})"/>`;
      });
      break;
    }
    case "pyramid-diagram": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Pyramid</text>`;
      const levels = nodes.length;
      nodes.forEach((node, i) => {
        const topRatio = i / levels;
        const bottomRatio = (i + 1) / levels;
        const topLeft = w / 2 - (w * 0.4) * topRatio;
        const topRight = w / 2 + (w * 0.4) * topRatio;
        const bottomLeft = w / 2 - (w * 0.4) * bottomRatio;
        const bottomRight = w / 2 + (w * 0.4) * bottomRatio;
        const yTop = 40 + i * ((h - 60) / levels);
        const yBottom = 40 + (i + 1) * ((h - 60) / levels);
        svg += `<polygon points="${topLeft},${yTop} ${topRight},${yTop} ${bottomRight},${yBottom} ${bottomLeft},${yBottom}" fill="${theme.primary}" opacity="${1 - i * 0.12}" stroke="white" stroke-width="2"/>`;
        svg += `<text x="${w / 2}" y="${(yTop + yBottom) / 2 + 5}" fill="${theme.text}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      });
      break;
    }
    case "funnel-chart": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Funnel Chart</text>`;
      const funnelNodes = nodes.slice(0, Math.min(nodes.length, 5));
      const fLevels = funnelNodes.length;
      funnelNodes.forEach((node, i) => {
        const topW = (w - 100) * (1 - i * 0.18);
        const botW = (w - 100) * (1 - (i + 1) * 0.18);
        const yTop = 50 + i * ((h - 80) / fLevels);
        const yBot = 50 + (i + 1) * ((h - 80) / fLevels);
        const topLeft = w / 2 - topW / 2;
        const topRight = w / 2 + topW / 2;
        const botLeft = w / 2 - botW / 2;
        const botRight = w / 2 + botW / 2;
        svg += `<polygon points="${topLeft},${yTop} ${topRight},${yTop} ${botRight},${yBot} ${botLeft},${yBot}" fill="${theme.primary}" opacity="${1 - i * 0.15}" stroke="white" stroke-width="2"/>`;
        svg += `<text x="${w/2}" y="${(yTop+yBot)/2+5}" fill="${theme.text}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
        // Value on side
        svg += `<text x="${topRight+15}" y="${(yTop+yBot)/2+5}" fill="${theme.accent}" font-size="10" font-family="Arial">${100 - i * 20}%</text>`;
      });
      break;
    }
    case "comparison-infographic": {
      svg += `<text x="${w/2}" y="30" fill="${theme.accent}" font-size="16" font-family="Arial" text-anchor="middle" font-weight="bold">Comparison</text>`;
      const leftTitle = nodes[0]?.text || "Option A";
      const rightTitle = nodes[1]?.text || "Option B";
      // Left column
      svg += `<rect x="40" y="50" width="${w/2-60}" height="320" rx="8" fill="${theme.primary}" opacity="0.15"/>`;
      svg += `<rect x="40" y="50" width="${w/2-60}" height="50" rx="8" fill="${theme.primary}"/>`;
      svg += `<text x="${w/4+10}" y="82" fill="${theme.text}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(leftTitle)}</text>`;
      // Right column
      svg += `<rect x="${w/2+20}" y="50" width="${w/2-60}" height="320" rx="8" fill="${theme.secondary}" opacity="0.15"/>`;
      svg += `<rect x="${w/2+20}" y="50" width="${w/2-60}" height="50" rx="8" fill="${theme.secondary}"/>`;
      svg += `<text x="${w*3/4-10}" y="82" fill="${theme.text}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(rightTitle)}</text>`;
      // Comparison rows
      const features = ["Feature 1", "Feature 2", "Feature 3", "Feature 4"];
      features.forEach((feat, i) => {
        const fy = 125 + i * 60;
        svg += `<text x="${w/2}" y="${fy}" fill="${theme.accent}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${feat}</text>`;
        svg += `<rect x="80" y="${fy+5}" width="${(w/2-120)*(0.5+i*0.12)}" height="20" rx="10" fill="${theme.primary}" opacity="0.7"/>`;
        svg += `<rect x="${w/2+60}" y="${fy+5}" width="${(w/2-120)*(0.7-i*0.1)}" height="20" rx="10" fill="${theme.secondary}" opacity="0.7"/>`;
      });
      // VS divider
      svg += `<circle cx="${w/2}" cy="200" r="18" fill="${theme.accent}"/>`;
      svg += `<text x="${w/2}" y="205" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">VS</text>`;
      break;
    }
    case "statistics-infographic": {
      svg += `<text x="${w/2}" y="30" fill="${theme.accent}" font-size="16" font-family="Arial" text-anchor="middle" font-weight="bold">Key Statistics</text>`;
      const stats = nodes.slice(0, Math.min(nodes.length, 4));
      const statW = (w - 80) / stats.length;
      stats.forEach((node, i) => {
        const x = 40 + i * statW;
        svg += `<rect x="${x}" y="60" width="${statW-20}" height="300" rx="8" fill="${theme.bg}"/>`;
        // Icon circle
        svg += `<circle cx="${x+statW/2-10}" cy="100" r="30" fill="${theme.primary}" opacity="${0.8+i*0.05}"/>`;
        // Big number
        const num = [85, 42, 1200, 99][i] || (i + 1) * 25;
        svg += `<text x="${x+statW/2-10}" y="170" fill="${theme.primary}" font-size="32" font-family="Arial" text-anchor="middle" font-weight="bold">${num}${i === 0 ? "%" : i === 3 ? "%" : ""}</text>`;
        // Label
        svg += `<text x="${x+statW/2-10}" y="210" fill="${theme.accent}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
        // Progress bar
        svg += `<rect x="${x+20}" y="240" width="${statW-60}" height="8" rx="4" fill="${theme.bg}" stroke="${theme.secondary}" stroke-width="1"/>`;
        svg += `<rect x="${x+20}" y="240" width="${(statW-60)*(0.3+i*0.15)}" height="8" rx="4" fill="${theme.primary}"/>`;
      });
      break;
    }
    case "process-infographic": {
      svg += `<text x="${w/2}" y="30" fill="${theme.accent}" font-size="16" font-family="Arial" text-anchor="middle" font-weight="bold">Process Steps</text>`;
      const steps = nodes.slice(0, Math.min(nodes.length, 6));
      const stepH = (h - 80) / steps.length;
      steps.forEach((node, i) => {
        const y = 50 + i * stepH;
        const isLeft = i % 2 === 0;
        // Step number circle
        const cx = isLeft ? 100 : w - 100;
        svg += `<circle cx="${cx}" cy="${y+stepH/2}" r="25" fill="${theme.primary}"/>`;
        svg += `<text x="${cx}" y="${y+stepH/2+6}" fill="${theme.text}" font-size="16" font-family="Arial" text-anchor="middle" font-weight="bold">${i+1}</text>`;
        // Content box
        const boxX = isLeft ? 150 : 150;
        const boxW = w - 300;
        svg += `<rect x="${boxX}" y="${y+stepH/2-20}" width="${boxW}" height="40" rx="6" fill="${theme.bg}"/>`;
        svg += `<text x="${boxX+boxW/2}" y="${y+stepH/2+5}" fill="${theme.accent}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
        // Connecting line
        if (i < steps.length - 1) {
          svg += `<line x1="${cx}" y1="${y+stepH/2+25}" x2="${i%2===0 ? w-100 : 100}" y2="${y+stepH+stepH/2-25}" stroke="${theme.secondary}" stroke-width="2" stroke-dasharray="5,3"/>`;
        }
      });
      break;
    }
    case "icon-grid": {
      svg += `<text x="${w/2}" y="30" fill="${theme.accent}" font-size="16" font-family="Arial" text-anchor="middle" font-weight="bold">Features</text>`;
      const items = nodes.slice(0, Math.min(nodes.length, 9));
      const cols = Math.min(3, items.length);
      const rows = Math.ceil(items.length / cols);
      const cellW = (w - 100) / cols;
      const cellH = (h - 80) / rows;
      items.forEach((node, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = 50 + col * cellW + cellW / 2;
        const cy = 60 + row * cellH + cellH / 2;
        // Icon circle
        svg += `<circle cx="${cx}" cy="${cy-15}" r="28" fill="${theme.primary}" opacity="${0.7+i*0.03}"/>`;
        // Icon placeholder (simple shapes)
        const shapes = ["M-8,-8 L8,-8 L8,8 L-8,8 Z", "M0,-10 L10,8 L-10,8 Z", "M-8,0 L0,-10 L8,0 L0,10 Z"];
        svg += `<path d="${shapes[i%3]}" transform="translate(${cx},${cy-15})" fill="${theme.text}" opacity="0.8"/>`;
        // Label
        svg += `<text x="${cx}" y="${cy+25}" fill="${theme.accent}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      });
      break;
    }
    case "percentage-infographic": {
      svg += `<text x="${w/2}" y="30" fill="${theme.accent}" font-size="16" font-family="Arial" text-anchor="middle" font-weight="bold">Progress Overview</text>`;
      const pItems = nodes.slice(0, Math.min(nodes.length, 5));
      const pBarH = (h - 80) / pItems.length;
      pItems.forEach((node, i) => {
        const y = 50 + i * pBarH;
        const pct = [92, 78, 65, 45, 30][i] || 50;
        const barW = w - 250;
        svg += `<text x="30" y="${y+pBarH/2+5}" fill="${theme.accent}" font-size="12" font-family="Arial" font-weight="bold">${escSvg(node.text)}</text>`;
        svg += `<rect x="180" y="${y+pBarH/2-10}" width="${barW}" height="20" rx="10" fill="${theme.bg}"/>`;
        svg += `<rect x="180" y="${y+pBarH/2-10}" width="${barW*pct/100}" height="20" rx="10" fill="${theme.primary}" opacity="${0.6+i*0.08}"/>`;
        svg += `<text x="${180+barW+20}" y="${y+pBarH/2+5}" fill="${theme.primary}" font-size="14" font-family="Arial" font-weight="bold">${pct}%</text>`;
      });
      break;
    }
    case "map-infographic": {
      svg += `<text x="${w/2}" y="30" fill="${theme.accent}" font-size="16" font-family="Arial" text-anchor="middle" font-weight="bold">Geographic Data</text>`;
      // Simplified map outline
      svg += `<path d="M100,80 Q150,60 200,90 Q280,50 350,70 Q420,40 550,80 Q600,90 600,140 Q580,200 550,250 Q500,300 400,320 Q300,340 200,300 Q150,270 120,220 Q90,170 100,80 Z" fill="${theme.bg}" stroke="${theme.primary}" stroke-width="2"/>`;
      // Data points
      const mapNodes = nodes.slice(0, Math.min(nodes.length, 5));
      const mapPos = [{x:200,y:120},{x:350,y:100},{x:450,y:150},{x:300,y:220},{x:180,y:250}];
      mapNodes.forEach((node, i) => {
        const p = mapPos[i];
        const size = 12 + (i * 7 % 15);
        svg += `<circle cx="${p.x}" cy="${p.y}" r="${size}" fill="${theme.primary}" opacity="0.6"/>`;
        svg += `<circle cx="${p.x}" cy="${p.y}" r="${size/2}" fill="${theme.primary}"/>`;
        svg += `<text x="${p.x}" y="${p.y+size+14}" fill="${theme.accent}" font-size="10" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      });
      // Legend
      svg += `<rect x="${w-180}" y="${h-80}" width="160" height="60" rx="4" fill="white" stroke="${theme.secondary}" stroke-width="1"/>`;
      svg += `<circle cx="${w-160}" cy="${h-55}" r="6" fill="${theme.primary}"/>`;
      svg += `<text x="${w-145}" y="${h-51}" fill="${theme.accent}" font-size="9" font-family="Arial">Location</text>`;
      svg += `<circle cx="${w-160}" cy="${h-38}" r="10" fill="${theme.primary}" opacity="0.4"/>`;
      svg += `<text x="${w-145}" y="${h-34}" fill="${theme.accent}" font-size="9" font-family="Arial">Data intensity</text>`;
      break;
    }
    case "photo-collage": {
      svg += `<text x="${w/2}" y="25" fill="${theme.accent}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">Photo Collage</text>`;
      const pcNodes = nodes.slice(0, Math.min(nodes.length, 6));
      // Layout: mixed sizes
      const frames = [
        {x:30,y:45,w:300,h:170},{x:340,y:45,w:160,h:80},{x:510,y:45,w:160,h:80},
        {x:340,y:135,w:330,h:80},{x:30,y:225,w:200,h:120},{x:240,y:225,w:220,h:120},{x:470,y:225,w:200,h:120}
      ];
      pcNodes.forEach((node, i) => {
        const f = frames[i % frames.length];
        svg += `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="4" fill="${theme.bg}" stroke="${theme.secondary}" stroke-width="1"/>`;
        svg += `<circle cx="${f.x+f.w/2}" cy="${f.y+f.h/2-8}" r="${Math.min(f.w,f.h)/4}" fill="${theme.secondary}" opacity="0.4"/>`;
        svg += `<text x="${f.x+f.w/2}" y="${f.y+f.h-10}" fill="${theme.accent}" font-size="10" font-family="Arial" text-anchor="middle">${escSvg(node.text)}</text>`;
      });
      break;
    }
  }

  svg += `</svg>`;
  return svg;
}
