'use client';
import { create } from 'zustand';

export interface TemplateShape {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  label: string;
  opacity: number;
  rotation: number;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  tags: string[];
  thumbnail: string;
  shapes: TemplateShape[];
  rating: number;
  ratingCount: number;
  isFavorite: boolean;
  isCustom: boolean;
  createdAt: string;
  author: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
  subcategories: string[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'flowchart', name: 'Flowcharts', icon: 'GitBranch', count: 8, color: '#3b82f6', subcategories: ['Basic', 'Cross-Functional', 'Swimlane', 'Decision', 'Process'] },
  { id: 'network', name: 'Network Diagrams', icon: 'Network', count: 7, color: '#06b6d4', subcategories: ['LAN', 'WAN', 'Topology', 'Infrastructure'] },
  { id: 'uml', name: 'UML Diagrams', icon: 'Box', count: 8, color: '#8b5cf6', subcategories: ['Class', 'Sequence', 'Use Case', 'Activity', 'State', 'Component'] },
  { id: 'floorplan', name: 'Floor Plans', icon: 'Home', count: 6, color: '#f59e0b', subcategories: ['Office', 'Residential', 'Commercial', 'Warehouse'] },
  { id: 'orgchart', name: 'Org Charts', icon: 'Users', count: 7, color: '#10b981', subcategories: ['Corporate', 'Flat', 'Matrix', 'Department'] },
  { id: 'mindmap', name: 'Mind Maps', icon: 'Brain', count: 7, color: '#ec4899', subcategories: ['Brainstorm', 'Planning', 'Study', 'Strategy'] },
  { id: 'bpmn', name: 'BPMN', icon: 'Workflow', count: 6, color: '#f97316', subcategories: ['Process', 'Collaboration', 'Choreography'] },
  { id: 'erdiagram', name: 'ER Diagrams', icon: 'Database', count: 7, color: '#14b8a6', subcategories: ['Relational', 'Conceptual', 'Logical', 'Physical'] },
  { id: 'wireframe', name: 'Wireframes', icon: 'Smartphone', count: 7, color: '#6366f1', subcategories: ['Mobile', 'Desktop', 'Tablet', 'Dashboard'] },
  { id: 'infographic', name: 'Infographics', icon: 'BarChart3', count: 7, color: '#e11d48', subcategories: ['Statistical', 'Timeline', 'Comparison', 'Process'] },
  { id: 'gantt', name: 'Gantt Charts', icon: 'GanttChart', count: 6, color: '#0ea5e9', subcategories: ['Project', 'Sprint', 'Roadmap'] },
  { id: 'valuestream', name: 'Value Stream Maps', icon: 'ArrowRightLeft', count: 5, color: '#84cc16', subcategories: ['Current State', 'Future State', 'Lean'] },
  { id: 'venn', name: 'Venn Diagrams', icon: 'Circle', count: 5, color: '#a855f7', subcategories: ['2-Set', '3-Set', '4-Set'] },
  { id: 'swimlane', name: 'Swimlane Diagrams', icon: 'Rows3', count: 5, color: '#0891b2', subcategories: ['Horizontal', 'Vertical', 'Process'] },
  { id: 'dataflow', name: 'Data Flow Diagrams', icon: 'ArrowDownUp', count: 5, color: '#7c3aed', subcategories: ['Context', 'Level 0', 'Level 1'] },
  { id: 'processmap', name: 'Process Maps', icon: 'Map', count: 6, color: '#059669', subcategories: ['As-Is', 'To-Be', 'Value Chain'] },
  { id: 'sequence', name: 'Sequence Diagrams', icon: 'ListOrdered', count: 5, color: '#dc2626', subcategories: ['Simple', 'Complex', 'Async'] },
  { id: 'statemachine', name: 'State Machines', icon: 'ToggleRight', count: 5, color: '#ca8a04', subcategories: ['FSM', 'Statechart', 'Protocol'] },
  { id: 'architecture', name: 'Architecture Diagrams', icon: 'Building2', count: 7, color: '#2563eb', subcategories: ['System', 'Software', 'Enterprise', 'Cloud'] },
  { id: 'cloud', name: 'Cloud Architecture', icon: 'Cloud', count: 7, color: '#0284c7', subcategories: ['AWS', 'Azure', 'GCP', 'Multi-Cloud'] },
  { id: 'microservices', name: 'Microservices', icon: 'Boxes', count: 5, color: '#9333ea', subcategories: ['Architecture', 'Communication', 'Deployment'] },
  { id: 'database', name: 'Database Schemas', icon: 'HardDrive', count: 6, color: '#16a34a', subcategories: ['SQL', 'NoSQL', 'Graph', 'Migration'] },
  { id: 'sitemap', name: 'Sitemaps', icon: 'Globe', count: 5, color: '#ea580c', subcategories: ['Website', 'App', 'Navigation'] },
  { id: 'userflow', name: 'User Flow Diagrams', icon: 'MousePointerClick', count: 6, color: '#d946ef', subcategories: ['Onboarding', 'Checkout', 'Registration', 'Navigation'] },
  { id: 'kanban', name: 'Kanban Boards', icon: 'Columns3', count: 5, color: '#0d9488', subcategories: ['Simple', 'Scrum', 'Portfolio'] },
  { id: 'roadmap', name: 'Roadmaps', icon: 'Route', count: 6, color: '#4f46e5', subcategories: ['Product', 'Technology', 'Strategic'] },
  { id: 'decisiontree', name: 'Decision Trees', icon: 'TreeDeciduous', count: 5, color: '#65a30d', subcategories: ['Binary', 'Multi-way', 'Analysis'] },
  { id: 'fishbone', name: 'Fishbone / Ishikawa', icon: 'Fish', count: 5, color: '#be185d', subcategories: ['Manufacturing', 'Service', '6M'] },
  { id: 'swot', name: 'SWOT Analysis', icon: 'Grid2X2', count: 5, color: '#b45309', subcategories: ['Business', 'Product', 'Personal'] },
  { id: 'businesscanvas', name: 'Business Model Canvas', icon: 'LayoutPanelTop', count: 5, color: '#7e22ce', subcategories: ['Lean', 'Standard', 'Social'] },
  { id: 'customerjourney', name: 'Customer Journey Maps', icon: 'Footprints', count: 5, color: '#0369a1', subcategories: ['B2C', 'B2B', 'Service'] },
  { id: 'serviceblueprint', name: 'Service Blueprints', icon: 'Layers', count: 5, color: '#4338ca', subcategories: ['Digital', 'Physical', 'Hybrid'] },
  { id: 'c4model', name: 'C4 Model', icon: 'SquareStack', count: 5, color: '#0e7490', subcategories: ['Context', 'Container', 'Component', 'Code'] },
  { id: 'threat', name: 'Threat Models', icon: 'ShieldAlert', count: 5, color: '#dc2626', subcategories: ['STRIDE', 'DREAD', 'Attack Tree'] },
  { id: 'rack', name: 'Rack Diagrams', icon: 'Server', count: 5, color: '#475569', subcategories: ['Standard', 'Data Center', 'Networking'] },
  { id: 'electrical', name: 'Electrical Diagrams', icon: 'Zap', count: 5, color: '#eab308', subcategories: ['Circuit', 'Wiring', 'Schematic'] },
  { id: 'pid', name: 'P&ID Diagrams', icon: 'Pipette', count: 5, color: '#64748b', subcategories: ['Process', 'Instrumentation', 'Control'] },
  { id: 'seating', name: 'Seating Charts', icon: 'Armchair', count: 5, color: '#f472b6', subcategories: ['Wedding', 'Conference', 'Classroom'] },
  { id: 'evacuation', name: 'Evacuation Plans', icon: 'DoorOpen', count: 5, color: '#ef4444', subcategories: ['Office', 'Building', 'School'] },
  { id: 'officelayout', name: 'Office Layouts', icon: 'Building', count: 5, color: '#78716c', subcategories: ['Open Plan', 'Cubicle', 'Hybrid'] },
  { id: 'salesfunnel', name: 'Sales Funnels', icon: 'Filter', count: 5, color: '#f59e0b', subcategories: ['B2B', 'B2C', 'SaaS'] },
  { id: 'timeline', name: 'Timelines', icon: 'Clock', count: 6, color: '#8b5cf6', subcategories: ['Project', 'Historical', 'Product'] },
  { id: 'conceptmap', name: 'Concept Maps', icon: 'Waypoints', count: 5, color: '#06b6d4', subcategories: ['Educational', 'Research', 'Planning'] },
  { id: 'raci', name: 'RACI Charts', icon: 'ClipboardList', count: 5, color: '#059669', subcategories: ['Project', 'Process', 'Team'] },
  { id: 'riskmatrix', name: 'Risk Matrix', icon: 'AlertTriangle', count: 5, color: '#dc2626', subcategories: ['5x5', '3x3', 'Heat Map'] },
  { id: 'pareto', name: 'Pareto Charts', icon: 'BarChart', count: 5, color: '#0ea5e9', subcategories: ['Quality', 'Defects', 'Causes'] },
  { id: 'kubernetes', name: 'Kubernetes Diagrams', icon: 'Container', count: 5, color: '#326ce5', subcategories: ['Cluster', 'Pod', 'Service'] },
  { id: 'api', name: 'API Diagrams', icon: 'Plug', count: 5, color: '#10b981', subcategories: ['REST', 'GraphQL', 'Integration'] },
  { id: 'wardley', name: 'Wardley Maps', icon: 'Compass', count: 5, color: '#6d28d9', subcategories: ['Strategy', 'Market', 'Technology'] },
  { id: 'stakeholder', name: 'Stakeholder Maps', icon: 'UsersRound', count: 5, color: '#ea580c', subcategories: ['Influence', 'Interest', 'Power'] },
  { id: 'featuremap', name: 'Feature Maps', icon: 'LayoutList', count: 5, color: '#84cc16', subcategories: ['Product', 'Release', 'Story'] },
  { id: 'sprintboard', name: 'Sprint Boards', icon: 'Zap', count: 5, color: '#f97316', subcategories: ['Scrum', 'Kanban', 'Hybrid'] },
  { id: 'storymap', name: 'Story Maps', icon: 'BookOpen', count: 5, color: '#14b8a6', subcategories: ['User', 'Product', 'Agile'] },
  { id: 'familytree', name: 'Family Trees', icon: 'TreePine', count: 5, color: '#65a30d', subcategories: ['Genealogy', 'Descendant', 'Ancestor'] },
  { id: 'landscape', name: 'Landscape Design', icon: 'Flower2', count: 5, color: '#22c55e', subcategories: ['Garden', 'Park', 'Residential'] },
  { id: 'eventplanning', name: 'Event Planning', icon: 'PartyPopper', count: 5, color: '#e11d48', subcategories: ['Conference', 'Wedding', 'Corporate'] },
  { id: 'matrix', name: 'Matrix Diagrams', icon: 'Grid3X3', count: 5, color: '#7c3aed', subcategories: ['L-Shaped', 'T-Shaped', 'Y-Shaped'] },
  { id: 'comparison', name: 'Comparison Charts', icon: 'Scale', count: 5, color: '#0891b2', subcategories: ['Feature', 'Product', 'Pros/Cons'] },
  { id: 'circuitboard', name: 'Circuit Boards', icon: 'Cpu', count: 5, color: '#15803d', subcategories: ['PCB', 'Logic', 'IC'] },
  { id: 'pipeline', name: 'CI/CD Pipelines', icon: 'GitPullRequest', count: 5, color: '#7c3aed', subcategories: ['Build', 'Deploy', 'Test'] },
  { id: 'designsystem', name: 'Design Systems', icon: 'Palette', count: 5, color: '#ec4899', subcategories: ['Components', 'Tokens', 'Guidelines'] },
  { id: 'systemcontext', name: 'System Context', icon: 'Radar', count: 5, color: '#2563eb', subcategories: ['Overview', 'Integration', 'Boundary'] },
  { id: 'entityrelation', name: 'Entity Relations', icon: 'Link', count: 5, color: '#059669', subcategories: ['Chen', 'Crow\'s Foot', 'IDEF1X'] },
  { id: 'networktopoogy', name: 'Network Topology', icon: 'Wifi', count: 5, color: '#0284c7', subcategories: ['Star', 'Ring', 'Mesh', 'Bus'] },
  { id: 'sdlc', name: 'SDLC Diagrams', icon: 'RefreshCcw', count: 5, color: '#6366f1', subcategories: ['Waterfall', 'Agile', 'Spiral'] },
  { id: 'kpiDashboard', name: 'KPI Dashboards', icon: 'Gauge', count: 5, color: '#f59e0b', subcategories: ['Executive', 'Operational', 'Strategic'] },
  { id: 'supplychain', name: 'Supply Chain', icon: 'Truck', count: 5, color: '#78716c', subcategories: ['Logistics', 'Procurement', 'Distribution'] },
  { id: 'marketingfunnel', name: 'Marketing Funnels', icon: 'Megaphone', count: 5, color: '#e11d48', subcategories: ['AIDA', 'Content', 'Social'] },
  { id: 'affinitydiagram', name: 'Affinity Diagrams', icon: 'Sticky', count: 5, color: '#ca8a04', subcategories: ['KJ Method', 'Brainstorm', 'Research'] },
  { id: 'controlflow', name: 'Control Flow', icon: 'Repeat', count: 5, color: '#dc2626', subcategories: ['Program', 'Process', 'Algorithm'] },
];

function generateTemplatesForCategory(cat: TemplateCategory): DiagramTemplate[] {
  const templates: DiagramTemplate[] = [];
  const baseShapes = getShapesForCategory(cat.id);

  cat.subcategories.forEach((sub, idx) => {
    templates.push({
      id: `${cat.id}-${sub.toLowerCase().replace(/[^a-z0-9]/g, '-')}-1`,
      name: `${sub} ${cat.name.replace(/s$/, '')}`,
      category: cat.id,
      subcategory: sub,
      description: `Professional ${sub.toLowerCase()} ${cat.name.toLowerCase()} template ready to customize`,
      tags: [cat.name.toLowerCase(), sub.toLowerCase(), 'professional', 'template'],
      thumbnail: cat.name.substring(0, 2).toUpperCase(),
      shapes: offsetShapes(baseShapes, idx * 20),
      rating: 4.0 + Math.round(Math.random() * 10) / 10,
      ratingCount: 10 + Math.floor(Math.random() * 90),
      isFavorite: false,
      isCustom: false,
      createdAt: '2026-01-15',
      author: 'Vidyalaya',
    });
  });

  // Add extra named templates
  const extras = getExtraTemplates(cat);
  templates.push(...extras);

  return templates;
}

function offsetShapes(shapes: TemplateShape[], offset: number): TemplateShape[] {
  return shapes.map(s => ({ ...s, y: s.y + offset }));
}

function getShapesForCategory(catId: string): TemplateShape[] {
  const baseShape: TemplateShape = {
    type: 'rect', x: 200, y: 100, width: 140, height: 70,
    fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2,
    label: 'Start', opacity: 1, rotation: 0,
  };

  switch (catId) {
    case 'flowchart':
      return [
        { ...baseShape, label: 'Start', fill: '#22c55e', stroke: '#15803d' },
        { ...baseShape, x: 200, y: 200, label: 'Process', fill: '#3b82f6', stroke: '#1e40af' },
        { ...baseShape, x: 200, y: 300, type: 'diamond', label: 'Decision?', fill: '#f59e0b', stroke: '#d97706' },
        { ...baseShape, x: 200, y: 420, label: 'End', fill: '#ef4444', stroke: '#dc2626' },
      ];
    case 'orgchart':
      return [
        { ...baseShape, x: 250, y: 50, label: 'CEO', fill: '#8b5cf6', stroke: '#7c3aed' },
        { ...baseShape, x: 100, y: 170, label: 'VP Eng', fill: '#3b82f6', stroke: '#1e40af' },
        { ...baseShape, x: 400, y: 170, label: 'VP Sales', fill: '#3b82f6', stroke: '#1e40af' },
        { ...baseShape, x: 50, y: 290, width: 110, label: 'Dev Lead', fill: '#06b6d4', stroke: '#0891b2' },
        { ...baseShape, x: 180, y: 290, width: 110, label: 'QA Lead', fill: '#06b6d4', stroke: '#0891b2' },
      ];
    case 'erdiagram':
      return [
        { ...baseShape, x: 80, y: 100, label: 'Users', fill: '#14b8a6', stroke: '#0d9488' },
        { ...baseShape, x: 320, y: 100, label: 'Orders', fill: '#f97316', stroke: '#ea580c' },
        { ...baseShape, x: 80, y: 260, label: 'Products', fill: '#8b5cf6', stroke: '#7c3aed' },
        { ...baseShape, x: 320, y: 260, label: 'Categories', fill: '#ec4899', stroke: '#db2777' },
      ];
    case 'mindmap':
      return [
        { ...baseShape, x: 220, y: 180, type: 'ellipse', label: 'Central Idea', fill: '#ec4899', stroke: '#db2777', width: 160, height: 80 },
        { ...baseShape, x: 50, y: 60, type: 'ellipse', label: 'Branch 1', fill: '#3b82f6', stroke: '#1e40af', width: 120, height: 50 },
        { ...baseShape, x: 420, y: 60, type: 'ellipse', label: 'Branch 2', fill: '#10b981', stroke: '#059669', width: 120, height: 50 },
        { ...baseShape, x: 50, y: 310, type: 'ellipse', label: 'Branch 3', fill: '#f59e0b', stroke: '#d97706', width: 120, height: 50 },
        { ...baseShape, x: 420, y: 310, type: 'ellipse', label: 'Branch 4', fill: '#8b5cf6', stroke: '#7c3aed', width: 120, height: 50 },
      ];
    case 'wireframe':
      return [
        { ...baseShape, x: 80, y: 30, width: 400, height: 50, label: 'Header / Nav', fill: '#4b5563', stroke: '#374151' },
        { ...baseShape, x: 80, y: 100, width: 120, height: 300, label: 'Sidebar', fill: '#6b7280', stroke: '#4b5563' },
        { ...baseShape, x: 220, y: 100, width: 260, height: 180, label: 'Content Area', fill: '#9ca3af', stroke: '#6b7280' },
        { ...baseShape, x: 220, y: 300, width: 260, height: 100, label: 'Footer', fill: '#4b5563', stroke: '#374151' },
      ];
    default:
      return [
        { ...baseShape, label: 'Node A' },
        { ...baseShape, x: 400, y: 100, label: 'Node B', fill: '#10b981', stroke: '#059669' },
        { ...baseShape, x: 200, y: 250, label: 'Node C', fill: '#f59e0b', stroke: '#d97706' },
        { ...baseShape, x: 400, y: 250, label: 'Node D', fill: '#ef4444', stroke: '#dc2626' },
      ];
  }
}

function getExtraTemplates(cat: TemplateCategory): DiagramTemplate[] {
  const extras: DiagramTemplate[] = [];
  const extraNames = getExtraNamesForCategory(cat.id);

  extraNames.forEach((name, idx) => {
    extras.push({
      id: `${cat.id}-extra-${idx + 1}`,
      name,
      category: cat.id,
      subcategory: cat.subcategories[idx % cat.subcategories.length],
      description: `${name} - a professionally designed template for ${cat.name.toLowerCase()}`,
      tags: [cat.name.toLowerCase(), name.toLowerCase().split(' ')[0], 'diagram', 'professional'],
      thumbnail: name.substring(0, 2).toUpperCase(),
      shapes: getShapesForCategory(cat.id),
      rating: 3.8 + Math.round(Math.random() * 12) / 10,
      ratingCount: 5 + Math.floor(Math.random() * 50),
      isFavorite: false,
      isCustom: false,
      createdAt: '2026-02-01',
      author: 'Vidyalaya',
    });
  });

  return extras;
}

function getExtraNamesForCategory(catId: string): string[] {
  const map: Record<string, string[]> = {
    flowchart: ['Software Development Flow', 'Customer Support Process', 'Hiring Pipeline'],
    network: ['Enterprise Network Layout', 'Home Office Network', 'DMZ Architecture'],
    uml: ['E-Commerce Class Diagram', 'Login Sequence Diagram'],
    floorplan: ['Co-Working Space Layout', 'Restaurant Floor Plan'],
    orgchart: ['Startup Org Chart', 'Hospital Organization'],
    mindmap: ['Product Planning Map', 'Study Notes Map'],
    bpmn: ['Order Fulfillment Process', 'Employee Onboarding BPMN', 'Invoice Approval'],
    erdiagram: ['E-Commerce Database', 'Social Media Schema', 'Hospital DB'],
    wireframe: ['E-Commerce Product Page', 'Dashboard Wireframe', 'Mobile App Screen'],
    infographic: ['Annual Report Infographic', 'Survey Results Visual'],
    gantt: ['Software Release Plan', 'Marketing Campaign Timeline', 'Construction Schedule'],
    valuestream: ['Manufacturing Value Stream', 'Software Delivery Pipeline'],
    venn: ['Market Overlap Analysis', 'Skills Comparison'],
    swimlane: ['Cross-Department Workflow', 'Approval Process Swimlane'],
    dataflow: ['Payment Processing DFD', 'Inventory Management DFD'],
    processmap: ['Lean Manufacturing Map', 'Customer Onboarding Steps'],
    sequence: ['API Call Sequence', 'Authentication Flow'],
    statemachine: ['Order Status Machine', 'UI Component States'],
    architecture: ['Monolith to Microservices', 'Event-Driven Architecture', 'Hexagonal Architecture'],
    cloud: ['Serverless Architecture', 'Multi-Region Setup', 'Hybrid Cloud Design'],
    microservices: ['Service Mesh Pattern', 'Saga Pattern Diagram'],
    database: ['Multi-Tenant Schema', 'Time-Series Schema'],
    sitemap: ['Corporate Website Map', 'SaaS App Navigation'],
    userflow: ['Checkout User Flow', 'Onboarding User Flow'],
    kanban: ['Development Kanban', 'Personal Task Board'],
    roadmap: ['Quarterly Product Roadmap', 'Tech Debt Roadmap'],
    decisiontree: ['Troubleshooting Tree', 'Investment Decision Tree'],
    fishbone: ['Quality Issue Analysis', 'Project Delay Analysis'],
    swot: ['Startup SWOT', 'Market Entry SWOT'],
    businesscanvas: ['SaaS Business Model', 'Marketplace Canvas'],
    customerjourney: ['SaaS Onboarding Journey', 'Retail Customer Journey'],
    serviceblueprint: ['Support Service Blueprint', 'E-Commerce Blueprint'],
    c4model: ['Microservice C4 Context', 'Monolith C4 Container'],
    threat: ['Web App Threat Model', 'API Threat Model'],
    rack: ['Server Room Layout', 'Network Rack Plan'],
    electrical: ['Home Wiring Diagram', 'Industrial Circuit'],
    pid: ['Chemical Process P&ID', 'Water Treatment P&ID'],
    seating: ['Banquet Hall Seating', 'Conference Room Setup'],
    evacuation: ['School Evacuation Plan', 'Factory Emergency Plan'],
    officelayout: ['Modern Open Office', 'Remote-First Office'],
    salesfunnel: ['SaaS Sales Funnel', 'E-Commerce Conversion Funnel'],
    timeline: ['Product Launch Timeline', 'Company History'],
    conceptmap: ['Science Concept Map', 'Business Strategy Map'],
    raci: ['Project RACI Chart', 'Team Responsibility Matrix'],
    riskmatrix: ['IT Risk Assessment', 'Project Risk Heat Map'],
    pareto: ['Bug Analysis Pareto', 'Customer Complaints Pareto'],
    kubernetes: ['K8s Cluster Overview', 'Helm Chart Architecture'],
    api: ['REST API Architecture', 'API Gateway Design'],
    wardley: ['Cloud Migration Wardley', 'Product Strategy Map'],
    stakeholder: ['Project Stakeholder Map', 'Product Influence Map'],
    featuremap: ['Q1 Feature Roadmap', 'MVP Feature Map'],
    sprintboard: ['Two-Week Sprint Board', 'Release Sprint Plan'],
    storymap: ['Product Story Map', 'Customer Story Map'],
    familytree: ['Three Generation Tree', 'Extended Family Chart'],
    landscape: ['Backyard Garden Plan', 'Community Park Layout'],
    eventplanning: ['Tech Conference Layout', 'Company Retreat Plan'],
    matrix: ['Responsibility Matrix', 'Decision Matrix'],
    comparison: ['Product Feature Comparison', 'Vendor Comparison Chart'],
    circuitboard: ['Arduino Circuit Layout', 'Raspberry Pi GPIO'],
    pipeline: ['GitHub Actions Pipeline', 'Jenkins CI/CD Flow'],
    designsystem: ['Component Library Map', 'Token Structure'],
    systemcontext: ['Banking System Context', 'E-Commerce Context'],
    entityrelation: ['University ER Diagram', 'Inventory ER Model'],
    networktopoogy: ['Campus Network Topology', 'Data Center Topology'],
    sdlc: ['Agile Sprint Cycle', 'DevOps Pipeline Flow'],
    kpiDashboard: ['Sales KPI Dashboard', 'Engineering Metrics'],
    supplychain: ['Global Supply Chain', 'Last-Mile Delivery'],
    marketingfunnel: ['Content Marketing Funnel', 'Social Media Funnel'],
    affinitydiagram: ['UX Research Affinity', 'Feature Prioritization'],
    controlflow: ['Algorithm Control Flow', 'Error Handling Flow'],
  };
  return map[catId] || ['Custom Template 1', 'Custom Template 2'];
}

// Generate all templates
const ALL_TEMPLATES: DiagramTemplate[] = TEMPLATE_CATEGORIES.flatMap(generateTemplatesForCategory);

interface TemplateGalleryState {
  templates: DiagramTemplate[];
  customTemplates: DiagramTemplate[];
  searchQuery: string;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'rating' | 'date' | 'popular';
  previewTemplate: DiagramTemplate | null;
  showSaveModal: boolean;
  favoriteIds: string[];

  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string | null) => void;
  setSelectedSubcategory: (s: string | null) => void;
  setViewMode: (v: 'grid' | 'list') => void;
  setSortBy: (s: 'name' | 'rating' | 'date' | 'popular') => void;
  setPreviewTemplate: (t: DiagramTemplate | null) => void;
  setShowSaveModal: (v: boolean) => void;
  toggleFavorite: (id: string) => void;
  rateTemplate: (id: string, rating: number) => void;
  saveCustomTemplate: (t: Omit<DiagramTemplate, 'id' | 'createdAt' | 'isCustom' | 'rating' | 'ratingCount' | 'isFavorite' | 'author'>) => void;
  deleteCustomTemplate: (id: string) => void;
  getFilteredTemplates: () => DiagramTemplate[];
}

export const useTemplateGalleryStore = create<TemplateGalleryState>((set, get) => ({
  templates: ALL_TEMPLATES,
  customTemplates: [],
  searchQuery: '',
  selectedCategory: null,
  selectedSubcategory: null,
  viewMode: 'grid',
  sortBy: 'popular',
  previewTemplate: null,
  showSaveModal: false,
  favoriteIds: [],

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategory: (c) => set({ selectedCategory: c, selectedSubcategory: null }),
  setSelectedSubcategory: (s) => set({ selectedSubcategory: s }),
  setViewMode: (v) => set({ viewMode: v }),
  setSortBy: (s) => set({ sortBy: s }),
  setPreviewTemplate: (t) => set({ previewTemplate: t }),
  setShowSaveModal: (v) => set({ showSaveModal: v }),

  toggleFavorite: (id) => set((state) => {
    const favs = state.favoriteIds.includes(id)
      ? state.favoriteIds.filter(f => f !== id)
      : [...state.favoriteIds, id];
    return { favoriteIds: favs };
  }),

  rateTemplate: (id, rating) => set((state) => ({
    templates: state.templates.map(t =>
      t.id === id
        ? { ...t, rating: Math.round(((t.rating * t.ratingCount + rating) / (t.ratingCount + 1)) * 10) / 10, ratingCount: t.ratingCount + 1 }
        : t
    ),
  })),

  saveCustomTemplate: (t) => set((state) => ({
    customTemplates: [...state.customTemplates, {
      ...t,
      id: `custom-${Date.now()}`,
      isCustom: true,
      rating: 0,
      ratingCount: 0,
      isFavorite: false,
      author: 'You',
      createdAt: new Date().toISOString().split('T')[0],
    }],
  })),

  deleteCustomTemplate: (id) => set((state) => ({
    customTemplates: state.customTemplates.filter(t => t.id !== id),
  })),

  getFilteredTemplates: () => {
    const state = get();
    const all = [...state.templates, ...state.customTemplates];
    let filtered = all;

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q)) ||
        t.category.toLowerCase().includes(q)
      );
    }

    if (state.selectedCategory) {
      if (state.selectedCategory === 'favorites') {
        filtered = filtered.filter(t => state.favoriteIds.includes(t.id));
      } else if (state.selectedCategory === 'custom') {
        filtered = filtered.filter(t => t.isCustom);
      } else {
        filtered = filtered.filter(t => t.category === state.selectedCategory);
      }
    }

    if (state.selectedSubcategory) {
      filtered = filtered.filter(t => t.subcategory === state.selectedSubcategory);
    }

    switch (state.sortBy) {
      case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'date': filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case 'popular': filtered.sort((a, b) => b.ratingCount - a.ratingCount); break;
    }

    return filtered;
  },
}));
