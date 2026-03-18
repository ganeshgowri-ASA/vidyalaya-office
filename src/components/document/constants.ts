export const FONTS = [
  "Arial",
  "Times New Roman",
  "Calibri",
  "Cambria",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Garamond",
  "Palatino Linotype",
  "Book Antiqua",
  "Courier New",
  "Lucida Console",
  "Comic Sans MS",
  "Impact",
  "Century Gothic",
  "Segoe UI",
  "Helvetica",
  "Bookman Old Style",
  "Lucida Sans Unicode",
  "Arial Black",
  "Franklin Gothic Medium",
  "Gill Sans",
  "Rockwell",
  "Consolas",
  "Monaco",
  "Didot",
  "Futura",
  "Optima",
  "Perpetua",
  "Baskerville",
  "Copperplate",
  "Brush Script MT",
  "Candara",
  "Constantia",
  "Corbel",
  "Bell MT",
  "Berlin Sans FB",
  "Bernard MT",
  "Bodoni MT",
  "Calisto MT",
  "Castellar",
  "Centaur",
  "Colonna MT",
  "Cooper Black",
  "Engravers MT",
  "Eras ITC",
  "Felix Titling",
  "Footlight MT",
  "Forte",
  "Gloucester MT",
  "Goudy Old Style",
  "Haettenschweiler",
  "Harlow Solid Italic",
  "High Tower Text",
];

export const FONT_SIZES = [
  "8", "9", "10", "10.5", "11", "12", "14", "16", "18",
  "20", "22", "24", "26", "28", "32", "36", "40", "44",
  "48", "54", "60", "66", "72", "80", "88", "96",
];

export const TEXT_COLORS = [
  // Row 1: Theme colors
  "#000000", "#44546A", "#4472C4", "#ED7D31", "#A5A5A5",
  "#FFC000", "#5B9BD5", "#70AD47", "#7030A0", "#FF0000",
  // Row 2: Lighter
  "#262626", "#374151", "#2563EB", "#D97706", "#6B7280",
  "#EAB308", "#3B82F6", "#22C55E", "#8B5CF6", "#EF4444",
  // Row 3: Standard colors
  "#C00000", "#FF0000", "#FFC000", "#FFFF00", "#92D050",
  "#00B050", "#00B0F0", "#0070C0", "#002060", "#7030A0",
  // Row 4: Lighter tints
  "#F2DCDB", "#DDD9C3", "#DCE6F1", "#DEF0D8", "#E5DFEC",
  "#FDE9D9", "#DAEEF3", "#E4DFEC", "#F2F2F2", "#D9E2F3",
];

export const HIGHLIGHT_COLORS = [
  "#FFFF00", "#00FF00", "#00FFFF", "#FF00FF",
  "#FF0000", "#0000FF", "#FFA500", "#FFB6C1",
  "#FFD700", "#7CFC00", "#20B2AA", "#FF69B4",
  "#DDA0DD", "#87CEEB", "#F0E68C",
];

export const PAGE_SIZES = {
  a4: { width: "210mm", height: "297mm", label: "A4 (210 x 297 mm)" },
  letter: { width: "8.5in", height: "11in", label: "Letter (8.5 x 11 in)" },
  legal: { width: "8.5in", height: "14in", label: "Legal (8.5 x 14 in)" },
  a5: { width: "148mm", height: "210mm", label: "A5 (148 x 210 mm)" },
  b5: { width: "176mm", height: "250mm", label: "B5 (176 x 250 mm)" },
};

export const MARGIN_PRESETS = {
  normal: { top: "1in", right: "1in", bottom: "1in", left: "1in", label: "Normal" },
  narrow: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in", label: "Narrow" },
  moderate: { top: "1in", right: "0.75in", bottom: "1in", left: "0.75in", label: "Moderate" },
  wide: { top: "1in", right: "2in", bottom: "1in", left: "2in", label: "Wide" },
  mirrored: { top: "1in", right: "1in", bottom: "1in", left: "1.25in", label: "Mirrored" },
};

export const UNDERLINE_STYLES = [
  { label: "Single", value: "underline" },
  { label: "Double", value: "double" },
  { label: "Wavy", value: "wavy" },
  { label: "Dotted", value: "dotted" },
  { label: "Dashed", value: "dashed" },
];

export const BULLET_STYLES = [
  { label: "Disc", char: "disc" },
  { label: "Circle", char: "circle" },
  { label: "Square", char: "square" },
  { label: "Dash", char: "dash" },
  { label: "Arrow", char: "arrow" },
  { label: "Check", char: "check" },
];

export const NUMBER_STYLES = [
  { label: "1, 2, 3", type: "decimal" },
  { label: "a, b, c", type: "lower-alpha" },
  { label: "A, B, C", type: "upper-alpha" },
  { label: "i, ii, iii", type: "lower-roman" },
  { label: "I, II, III", type: "upper-roman" },
];

export const LINE_SPACING_OPTIONS = [
  { value: "1", label: "1.0" },
  { value: "1.15", label: "1.15" },
  { value: "1.5", label: "1.5" },
  { value: "2", label: "2.0" },
  { value: "2.5", label: "2.5" },
  { value: "3", label: "3.0" },
];

export const BORDER_OPTIONS = [
  { label: "Bottom Border", sides: ["bottom"] },
  { label: "Top Border", sides: ["top"] },
  { label: "Left Border", sides: ["left"] },
  { label: "Right Border", sides: ["right"] },
  { label: "No Border", sides: [] },
  { label: "All Borders", sides: ["top", "right", "bottom", "left"] },
  { label: "Outside Borders", sides: ["top", "right", "bottom", "left"] },
  { label: "Inside Borders", sides: ["top", "right", "bottom", "left"] },
];

export const DOCUMENT_STYLES = [
  { name: "Normal", tag: "p", fontSize: "11pt", fontWeight: "normal", lineHeight: "1.15", color: "#000", marginBottom: "8px", fontFamily: "Calibri" },
  { name: "No Spacing", tag: "p", fontSize: "11pt", fontWeight: "normal", lineHeight: "1", color: "#000", marginBottom: "0", fontFamily: "Calibri" },
  { name: "Heading 1", tag: "h1", fontSize: "20pt", fontWeight: "bold", lineHeight: "1.2", color: "#2F5496", marginBottom: "12px", fontFamily: "Calibri Light" },
  { name: "Heading 2", tag: "h2", fontSize: "16pt", fontWeight: "bold", lineHeight: "1.2", color: "#2F5496", marginBottom: "10px", fontFamily: "Calibri Light" },
  { name: "Heading 3", tag: "h3", fontSize: "14pt", fontWeight: "bold", lineHeight: "1.2", color: "#1F3763", marginBottom: "8px", fontFamily: "Calibri Light" },
  { name: "Heading 4", tag: "h4", fontSize: "12pt", fontWeight: "bold", lineHeight: "1.2", color: "#2F5496", marginBottom: "8px", fontFamily: "Calibri Light" },
  { name: "Heading 5", tag: "h5", fontSize: "11pt", fontWeight: "bold", lineHeight: "1.2", color: "#404040", marginBottom: "6px", fontFamily: "Calibri" },
  { name: "Heading 6", tag: "h6", fontSize: "10pt", fontWeight: "bold", lineHeight: "1.2", color: "#7f7f7f", marginBottom: "6px", fontFamily: "Calibri", fontStyle: "italic" },
  { name: "Title", tag: "h1", fontSize: "28pt", fontWeight: "normal", lineHeight: "1.2", color: "#000", marginBottom: "16px", fontFamily: "Calibri Light" },
  { name: "Subtitle", tag: "h2", fontSize: "14pt", fontWeight: "normal", lineHeight: "1.2", color: "#5A5A5A", marginBottom: "12px", fontFamily: "Calibri" },
  { name: "Emphasis", tag: "p", fontSize: "11pt", fontWeight: "normal", lineHeight: "1.15", color: "#404040", marginBottom: "8px", fontFamily: "Calibri", fontStyle: "italic" },
  { name: "Strong", tag: "p", fontSize: "11pt", fontWeight: "bold", lineHeight: "1.15", color: "#000", marginBottom: "8px", fontFamily: "Calibri" },
  { name: "Quote", tag: "blockquote", fontSize: "11pt", fontWeight: "normal", lineHeight: "1.15", color: "#404040", marginBottom: "8px", fontFamily: "Calibri", fontStyle: "italic", borderLeft: "4px solid #5B9BD5" },
  { name: "Intense Quote", tag: "blockquote", fontSize: "11pt", fontWeight: "bold", lineHeight: "1.15", color: "#4472C4", marginBottom: "8px", fontFamily: "Calibri", fontStyle: "italic", borderLeft: "4px solid #4472C4", borderTop: "1px solid #4472C4", borderBottom: "1px solid #4472C4" },
  { name: "List Paragraph", tag: "p", fontSize: "11pt", fontWeight: "normal", lineHeight: "1.15", color: "#000", marginBottom: "8px", fontFamily: "Calibri", marginLeft: "36px" },
];

export const SHAPES_GALLERY = [
  // Lines
  { name: "Line", category: "Lines", svg: "M2,12 L22,12" },
  { name: "Arrow", category: "Lines", svg: "M2,12 L18,12 M14,8 L18,12 L14,16" },
  { name: "Double Arrow", category: "Lines", svg: "M6,12 L18,12 M6,8 L2,12 L6,16 M18,8 L22,12 L18,16" },
  // Rectangles
  { name: "Rectangle", category: "Rectangles", svg: "rect" },
  { name: "Rounded Rectangle", category: "Rectangles", svg: "roundrect" },
  { name: "Snip Rectangle", category: "Rectangles", svg: "sniprect" },
  // Basic Shapes
  { name: "Oval", category: "Basic Shapes", svg: "ellipse" },
  { name: "Triangle", category: "Basic Shapes", svg: "M12,2 L22,22 L2,22 Z" },
  { name: "Diamond", category: "Basic Shapes", svg: "M12,2 L22,12 L12,22 L2,12 Z" },
  { name: "Pentagon", category: "Basic Shapes", svg: "pentagon" },
  { name: "Hexagon", category: "Basic Shapes", svg: "hexagon" },
  { name: "Octagon", category: "Basic Shapes", svg: "octagon" },
  { name: "Cross", category: "Basic Shapes", svg: "cross" },
  { name: "Heart", category: "Basic Shapes", svg: "heart" },
  { name: "Star 5-Point", category: "Basic Shapes", svg: "star5" },
  { name: "Star 6-Point", category: "Basic Shapes", svg: "star6" },
  // Block Arrows
  { name: "Right Arrow", category: "Block Arrows", svg: "rightarrow" },
  { name: "Left Arrow", category: "Block Arrows", svg: "leftarrow" },
  { name: "Up Arrow", category: "Block Arrows", svg: "uparrow" },
  { name: "Down Arrow", category: "Block Arrows", svg: "downarrow" },
  { name: "Left-Right Arrow", category: "Block Arrows", svg: "lrarrow" },
  { name: "U-Turn Arrow", category: "Block Arrows", svg: "uturn" },
  // Flowchart
  { name: "Process", category: "Flowchart", svg: "rect" },
  { name: "Decision", category: "Flowchart", svg: "M12,2 L22,12 L12,22 L2,12 Z" },
  { name: "Terminator", category: "Flowchart", svg: "roundrect" },
  { name: "Data", category: "Flowchart", svg: "parallelogram" },
  { name: "Document", category: "Flowchart", svg: "document" },
  { name: "Predefined Process", category: "Flowchart", svg: "predef" },
  { name: "Manual Input", category: "Flowchart", svg: "manualinput" },
  { name: "Preparation", category: "Flowchart", svg: "hexagon" },
  // Stars & Banners
  { name: "4-Point Star", category: "Stars & Banners", svg: "star4" },
  { name: "5-Point Star", category: "Stars & Banners", svg: "star5" },
  { name: "8-Point Star", category: "Stars & Banners", svg: "star8" },
  { name: "Explosion 1", category: "Stars & Banners", svg: "explosion1" },
  { name: "Explosion 2", category: "Stars & Banners", svg: "explosion2" },
  { name: "Horizontal Scroll", category: "Stars & Banners", svg: "hscroll" },
  { name: "Vertical Scroll", category: "Stars & Banners", svg: "vscroll" },
  { name: "Wave", category: "Stars & Banners", svg: "wave" },
  // Callouts
  { name: "Rectangular Callout", category: "Callouts", svg: "rectcallout" },
  { name: "Rounded Callout", category: "Callouts", svg: "roundcallout" },
  { name: "Oval Callout", category: "Callouts", svg: "ovalcallout" },
  { name: "Cloud Callout", category: "Callouts", svg: "cloudcallout" },
  { name: "Line Callout 1", category: "Callouts", svg: "linecallout1" },
  { name: "Line Callout 2", category: "Callouts", svg: "linecallout2" },
];

export const SMARTART_TYPES = [
  { name: "Basic List", category: "List", icon: "list" },
  { name: "Vertical List", category: "List", icon: "listv" },
  { name: "Basic Process", category: "Process", icon: "process" },
  { name: "Step Process", category: "Process", icon: "steps" },
  { name: "Basic Cycle", category: "Cycle", icon: "cycle" },
  { name: "Hierarchy", category: "Hierarchy", icon: "hierarchy" },
  { name: "Org Chart", category: "Hierarchy", icon: "orgchart" },
  { name: "Relationship", category: "Relationship", icon: "relationship" },
  { name: "Venn", category: "Relationship", icon: "venn" },
  { name: "Basic Matrix", category: "Matrix", icon: "matrix" },
  { name: "Basic Pyramid", category: "Pyramid", icon: "pyramid" },
];

export const CHART_TYPES = [
  { name: "Column", icon: "column" },
  { name: "Line", icon: "line" },
  { name: "Pie", icon: "pie" },
  { name: "Bar", icon: "bar" },
  { name: "Area", icon: "area" },
  { name: "Scatter", icon: "scatter" },
  { name: "Map", icon: "map" },
  { name: "Stock", icon: "stock" },
  { name: "Surface", icon: "surface" },
  { name: "Radar", icon: "radar" },
  { name: "Treemap", icon: "treemap" },
  { name: "Sunburst", icon: "sunburst" },
  { name: "Histogram", icon: "histogram" },
  { name: "Box & Whisker", icon: "boxwhisker" },
  { name: "Waterfall", icon: "waterfall" },
  { name: "Funnel", icon: "funnel" },
  { name: "Combo", icon: "combo" },
];

export const WORDART_STYLES = [
  { label: "Fill - Blue", style: "font-size:36px;font-weight:bold;color:#4472C4;" },
  { label: "Fill - Orange", style: "font-size:36px;font-weight:bold;color:#ED7D31;" },
  { label: "Fill - Gray", style: "font-size:36px;font-weight:bold;color:#A5A5A5;" },
  { label: "Fill - Gold", style: "font-size:36px;font-weight:bold;color:#FFC000;" },
  { label: "Fill - Green", style: "font-size:36px;font-weight:bold;color:#70AD47;" },
  { label: "Shadow", style: "font-size:36px;font-weight:bold;color:#4472C4;text-shadow:3px 3px 6px rgba(0,0,0,0.3);" },
  { label: "Outline", style: "font-size:36px;font-weight:bold;color:transparent;-webkit-text-stroke:2px #E64A19;" },
  { label: "Glow", style: "font-size:36px;font-weight:bold;color:#F9A825;text-shadow:0 0 10px #F9A825,0 0 20px #F9A825;" },
  { label: "Gradient Blue", style: "font-size:36px;font-weight:bold;background:linear-gradient(45deg,#4472C4,#00B0F0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;" },
  { label: "3D Effect", style: "font-size:36px;font-weight:bold;color:#2E7D32;text-shadow:1px 1px 0 #1B5E20,2px 2px 0 #1B5E20,3px 3px 0 #1B5E20;" },
  { label: "Neon", style: "font-size:36px;font-weight:bold;color:#fff;text-shadow:0 0 5px #00f,0 0 10px #00f,0 0 20px #00f;" },
  { label: "Reflection", style: "font-size:36px;font-weight:bold;color:#4472C4;-webkit-box-reflect:below 2px linear-gradient(transparent,rgba(0,0,0,0.2));" },
  { label: "Emboss", style: "font-size:36px;font-weight:bold;color:#888;text-shadow:-1px -1px 0 #fff,1px 1px 0 #333;" },
  { label: "Engrave", style: "font-size:36px;font-weight:bold;color:#666;text-shadow:1px 1px 0 #fff,-1px -1px 0 #333;" },
  { label: "Double Shadow", style: "font-size:36px;font-weight:bold;color:#ED7D31;text-shadow:2px 2px 0 #C55A11,4px 4px 0 rgba(0,0,0,0.2);" },
];

export const SPECIAL_CHARACTERS = [
  // Common
  "©", "®", "™", "°", "±", "×", "÷", "√",
  "∞", "≠", "≤", "≥", "≈", "≡", "∑", "∏",
  // Arrows
  "←", "→", "↑", "↓", "↔", "↕", "⇐", "⇒",
  "⇑", "⇓", "⇔", "↗", "↘", "↙", "↖", "↺",
  // Math
  "∀", "∃", "∅", "∈", "∉", "∋", "∂", "∇",
  "∫", "∬", "∮", "∴", "∵", "⊂", "⊃", "⊆",
  // Greek
  "α", "β", "γ", "δ", "ε", "ζ", "η", "θ",
  "ι", "κ", "λ", "μ", "ν", "ξ", "π", "ρ",
  "σ", "τ", "υ", "φ", "χ", "ψ", "ω", "Ω",
  // Currency & misc
  "€", "£", "¥", "¢", "§", "¶", "†", "‡",
  "•", "…", "—", "–", "«", "»", "¿", "¡",
  "µ", "¤", "¦", "ƒ", "‰", "‹", "›", "◊",
];

export const THEMES = [
  { name: "Office", primary: "#4472C4", secondary: "#ED7D31", accent: "#A5A5A5" },
  { name: "Office Dark", primary: "#2F5496", secondary: "#C55A11", accent: "#636363" },
  { name: "Blue", primary: "#4472C4", secondary: "#5B9BD5", accent: "#264478" },
  { name: "Green", primary: "#70AD47", secondary: "#A9D18E", accent: "#375623" },
  { name: "Orange", primary: "#ED7D31", secondary: "#F4B183", accent: "#843C0C" },
  { name: "Red", primary: "#FF0000", secondary: "#FF6666", accent: "#990000" },
  { name: "Purple", primary: "#7030A0", secondary: "#B97DD0", accent: "#3B0060" },
  { name: "Cyan", primary: "#00B0F0", secondary: "#9DC3E6", accent: "#005070" },
  { name: "Grayscale", primary: "#44546A", secondary: "#8497B0", accent: "#222A35" },
  { name: "Facet", primary: "#B6A479", secondary: "#D2CB96", accent: "#675C2F" },
  { name: "Integral", primary: "#1F4E79", secondary: "#4FA2C7", accent: "#0D3451" },
  { name: "Retrospect", primary: "#C44601", secondary: "#E68A33", accent: "#6B2500" },
];

export const COVER_PAGE_DESIGNS = [
  { name: "Austin", color: "#4472C4" },
  { name: "Banded", color: "#ED7D31" },
  { name: "Facet", color: "#70AD47" },
  { name: "Grid", color: "#7030A0" },
  { name: "Ion", color: "#00B0F0" },
  { name: "Sideline", color: "#44546A" },
];

export const CITATION_STYLES = [
  "APA 7th Edition",
  "MLA 9th Edition",
  "Chicago 17th Edition",
  "IEEE",
  "Harvard",
];

export const HEADER_GALLERY = [
  { name: "Blank", content: "" },
  { name: "Austin", content: "center" },
  { name: "Banded", content: "left-right" },
];

export const FOOTER_GALLERY = [
  { name: "Blank", content: "" },
  { name: "Austin", content: "center" },
  { name: "Banded", content: "left-right" },
];
