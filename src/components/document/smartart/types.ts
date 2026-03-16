// ---------- SHARED TYPES & CONSTANTS ----------

export interface SmartArtLayout {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface NodeItem {
  id: string;
  text: string;
  children?: NodeItem[];
}

export interface ColorTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
}

export const SMARTART_CATEGORIES = [
  "List", "Process", "Cycle", "Hierarchy",
  "Relationship", "Matrix", "Pyramid", "Picture",
];

export const SMARTART_LAYOUTS: SmartArtLayout[] = [
  // List (10 layouts)
  { id: "basic-list", name: "Basic Block List", category: "List", description: "Horizontal blocks showing non-sequential items" },
  { id: "lined-list", name: "Lined List", category: "List", description: "Items with accent lines" },
  { id: "vertical-block-list", name: "Vertical Block List", category: "List", description: "Stacked vertical blocks" },
  { id: "horizontal-bullet-list", name: "Horizontal Bullet List", category: "List", description: "Horizontal bullets with descriptions" },
  { id: "stacked-list", name: "Stacked List", category: "List", description: "Layered stacked items" },
  { id: "grouped-list", name: "Grouped List", category: "List", description: "Items grouped under headings" },
  { id: "trapezoid-list", name: "Trapezoid List", category: "List", description: "Trapezoid-shaped items" },
  { id: "table-list", name: "Table List", category: "List", description: "Grid-based list layout" },
  { id: "target-list", name: "Target List", category: "List", description: "Items pointing to a target" },
  { id: "tab-list", name: "Tab List", category: "List", description: "Tab-style list layout" },

  // Process (10 layouts)
  { id: "basic-process", name: "Basic Process", category: "Process", description: "Simple left-to-right process steps" },
  { id: "accent-process", name: "Accent Process", category: "Process", description: "Accented process steps" },
  { id: "alternating-flow", name: "Alternating Flow", category: "Process", description: "Zigzag flow between steps" },
  { id: "continuous-block", name: "Continuous Block Process", category: "Process", description: "Connected block process" },
  { id: "chevron-list", name: "Chevron List", category: "Process", description: "Chevron-shaped process" },
  { id: "upward-arrow", name: "Upward Arrow", category: "Process", description: "Upward progression" },
  { id: "repeating-bending", name: "Repeating Bending", category: "Process", description: "Snake-pattern process" },
  { id: "step-down", name: "Step Down Process", category: "Process", description: "Descending steps" },
  { id: "gear-process", name: "Gear Process", category: "Process", description: "Interlocking gear process" },
  { id: "funnel-process", name: "Funnel Process", category: "Process", description: "Funnel narrowing process" },

  // Cycle (10 layouts)
  { id: "basic-cycle", name: "Basic Cycle", category: "Cycle", description: "Simple circular cycle" },
  { id: "text-cycle", name: "Text Cycle", category: "Cycle", description: "Text-focused cycle" },
  { id: "block-cycle", name: "Block Cycle", category: "Cycle", description: "Block-shaped cycle" },
  { id: "nondirectional-cycle", name: "Nondirectional Cycle", category: "Cycle", description: "No-arrow cycle" },
  { id: "continuous-cycle", name: "Continuous Cycle", category: "Cycle", description: "Flowing continuous cycle" },
  { id: "segmented-cycle", name: "Segmented Cycle", category: "Cycle", description: "Segmented pie cycle" },
  { id: "gear-cycle", name: "Gear Cycle", category: "Cycle", description: "Interlocking gears" },
  { id: "radial-cycle", name: "Radial Cycle", category: "Cycle", description: "Center with radial items" },
  { id: "multidirectional-cycle", name: "Multidirectional Cycle", category: "Cycle", description: "Multi-arrow cycle" },
  { id: "diverging-radial", name: "Diverging Radial", category: "Cycle", description: "Center diverging outward" },

  // Hierarchy (10 layouts)
  { id: "org-chart", name: "Organization Chart", category: "Hierarchy", description: "Standard org chart" },
  { id: "hierarchy-tree", name: "Hierarchy Tree", category: "Hierarchy", description: "Tree-style hierarchy" },
  { id: "horizontal-hierarchy", name: "Horizontal Hierarchy", category: "Hierarchy", description: "Left-to-right hierarchy" },
  { id: "labeled-hierarchy", name: "Labeled Hierarchy", category: "Hierarchy", description: "Labeled levels" },
  { id: "table-hierarchy", name: "Table Hierarchy", category: "Hierarchy", description: "Table-style hierarchy" },
  { id: "half-circle-org", name: "Half Circle Org Chart", category: "Hierarchy", description: "Semicircle org chart" },
  { id: "horizontal-org", name: "Horizontal Org Chart", category: "Hierarchy", description: "Horizontal org layout" },
  { id: "bracket-hierarchy", name: "Bracket Hierarchy", category: "Hierarchy", description: "Bracket grouping" },
  { id: "lined-hierarchy", name: "Lined Hierarchy", category: "Hierarchy", description: "Line-connected hierarchy" },
  { id: "circle-hierarchy", name: "Circle Hierarchy", category: "Hierarchy", description: "Nested circles" },

  // Relationship (10 layouts)
  { id: "basic-venn", name: "Basic Venn", category: "Relationship", description: "Overlapping circles" },
  { id: "linear-venn", name: "Linear Venn", category: "Relationship", description: "Horizontal overlapping" },
  { id: "nested-target", name: "Nested Target", category: "Relationship", description: "Concentric rings" },
  { id: "converging-arrows", name: "Converging Arrows", category: "Relationship", description: "Arrows converging" },
  { id: "diverging-arrows", name: "Diverging Arrows", category: "Relationship", description: "Arrows diverging" },
  { id: "balance", name: "Balance", category: "Relationship", description: "Scale balance" },
  { id: "funnel-relationship", name: "Funnel", category: "Relationship", description: "Filtering funnel" },
  { id: "opposing-arrows", name: "Opposing Arrows", category: "Relationship", description: "Opposing directions" },
  { id: "arrow-ribbon", name: "Arrow Ribbon", category: "Relationship", description: "Ribbon arrows" },
  { id: "equation", name: "Equation", category: "Relationship", description: "A + B = C format" },

  // Matrix (8 layouts)
  { id: "basic-matrix", name: "Basic Matrix", category: "Matrix", description: "2x2 grid matrix" },
  { id: "titled-matrix", name: "Titled Matrix", category: "Matrix", description: "Matrix with titles" },
  { id: "grid-matrix", name: "Grid Matrix", category: "Matrix", description: "Multi-cell grid" },
  { id: "l-shaped-matrix", name: "L-Shaped Matrix", category: "Matrix", description: "L-shaped layout" },
  { id: "cycle-matrix", name: "Cycle Matrix", category: "Matrix", description: "Cycle in matrix" },
  { id: "quadrant-matrix", name: "Quadrant Matrix", category: "Matrix", description: "Four quadrants" },
  { id: "swot-matrix", name: "SWOT Matrix", category: "Matrix", description: "SWOT analysis grid" },
  { id: "priority-matrix", name: "Priority Matrix", category: "Matrix", description: "Priority/urgency grid" },

  // Pyramid (8 layouts)
  { id: "basic-pyramid", name: "Basic Pyramid", category: "Pyramid", description: "Simple layered pyramid" },
  { id: "inverted-pyramid", name: "Inverted Pyramid", category: "Pyramid", description: "Upside-down pyramid" },
  { id: "segmented-pyramid", name: "Segmented Pyramid", category: "Pyramid", description: "Segmented sections" },
  { id: "pyramid-list", name: "Pyramid List", category: "Pyramid", description: "Pyramid with side labels" },
  { id: "stacked-pyramid", name: "Stacked Pyramid", category: "Pyramid", description: "3D stacked pyramid" },
  { id: "triangle-cluster", name: "Triangle Cluster", category: "Pyramid", description: "Clustered triangles" },
  { id: "layered-pyramid", name: "Layered Pyramid", category: "Pyramid", description: "Layered horizontal" },
  { id: "funnel-pyramid", name: "Funnel Pyramid", category: "Pyramid", description: "Funnel-style pyramid" },

  // Picture (8 layouts)
  { id: "picture-strips", name: "Picture Strips", category: "Picture", description: "Horizontal picture strips with text" },
  { id: "picture-accent-list", name: "Picture Accent List", category: "Picture", description: "Pictures with accent text" },
  { id: "picture-caption-list", name: "Picture Caption List", category: "Picture", description: "Pictures with captions below" },
  { id: "picture-grid", name: "Picture Grid", category: "Picture", description: "Grid of pictures" },
  { id: "framed-picture", name: "Framed Text Picture", category: "Picture", description: "Framed pictures with text" },
  { id: "circular-picture", name: "Circular Picture Accent", category: "Picture", description: "Circular picture layout" },
  { id: "snapshot-picture", name: "Snapshot Picture List", category: "Picture", description: "Snapshot style pictures" },
  { id: "bubble-picture", name: "Bubble Picture List", category: "Picture", description: "Bubble frames for pictures" },
];

export const COLOR_THEMES: ColorTheme[] = [
  { name: "Blue", primary: "#4472C4", secondary: "#5B9BD5", accent: "#2F5496", bg: "#D6E4F0", text: "#fff" },
  { name: "Green", primary: "#70AD47", secondary: "#A9D18E", accent: "#375623", bg: "#E2EFDA", text: "#fff" },
  { name: "Orange", primary: "#ED7D31", secondary: "#F4B183", accent: "#C55A11", bg: "#FBE5D6", text: "#fff" },
  { name: "Red", primary: "#FF4444", secondary: "#FF8888", accent: "#CC0000", bg: "#FFE0E0", text: "#fff" },
  { name: "Purple", primary: "#7030A0", secondary: "#B97DD0", accent: "#4A1D70", bg: "#E2D1F0", text: "#fff" },
  { name: "Teal", primary: "#00B0F0", secondary: "#9DC3E6", accent: "#005070", bg: "#DEECF9", text: "#fff" },
  { name: "Gold", primary: "#FFC000", secondary: "#FFD966", accent: "#BF9000", bg: "#FFF2CC", text: "#000" },
  { name: "Dark", primary: "#44546A", secondary: "#8497B0", accent: "#222A35", bg: "#D5D8DC", text: "#fff" },
];

export function generateId() {
  return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function escSvg(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
