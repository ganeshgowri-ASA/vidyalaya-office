/**
 * Lightweight Mermaid parser — converts Mermaid text into renderable node/edge structures.
 * Supports: flowchart (graph), sequence, class, state, ER, gantt diagrams.
 * No external dependencies.
 */

export interface DiagramNode {
  id: string;
  label: string;
  shape: 'rect' | 'diamond' | 'round-rect' | 'circle' | 'stadium' | 'cylinder' | 'hexagon' | 'parallelogram' | 'actor' | 'entity';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label: string;
  style: 'solid' | 'dashed' | 'dotted' | 'thick';
  arrowHead: boolean;
}

export interface ParsedDiagram {
  type: 'flowchart' | 'sequence' | 'class' | 'state' | 'er' | 'gantt' | 'unknown';
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  title?: string;
  direction: 'TB' | 'LR' | 'BT' | 'RL';
  sequences?: SequenceMessage[];
  ganttTasks?: GanttTask[];
}

export interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  type: 'solid' | 'dashed';
}

export interface GanttTask {
  name: string;
  section: string;
  startCol: number;
  duration: number;
  status: 'done' | 'active' | 'crit' | 'default';
}

function detectDiagramType(code: string): ParsedDiagram['type'] {
  const first = code.trim().split('\n')[0].trim().toLowerCase();
  if (/^(graph|flowchart)\b/.test(first)) return 'flowchart';
  if (/^sequencediagram/i.test(first.replace(/\s+/g, ''))) return 'sequence';
  if (/^classdiagram/i.test(first.replace(/\s+/g, ''))) return 'class';
  if (/^statediagram/i.test(first.replace(/\s+/g, ''))) return 'state';
  if (/^erdiagram/i.test(first.replace(/\s+/g, ''))) return 'er';
  if (/^gantt/i.test(first)) return 'gantt';
  return 'unknown';
}

function detectDirection(firstLine: string): ParsedDiagram['direction'] {
  const m = firstLine.match(/\b(TB|BT|LR|RL|TD)\b/i);
  if (m) {
    const d = m[1].toUpperCase();
    if (d === 'TD') return 'TB';
    return d as ParsedDiagram['direction'];
  }
  return 'TB';
}

function parseNodeDef(token: string): { id: string; label: string; shape: DiagramNode['shape'] } {
  // Stadium: id([label])
  let m = token.match(/^(\w+)\(\[(.+?)\]\)$/);
  if (m) return { id: m[1], label: m[2], shape: 'stadium' };
  // Circle: id((label))
  m = token.match(/^(\w+)\(\((.+?)\)\)$/);
  if (m) return { id: m[1], label: m[2], shape: 'circle' };
  // Cylinder: id[(label)]
  m = token.match(/^(\w+)\[\((.+?)\)\]$/);
  if (m) return { id: m[1], label: m[2], shape: 'cylinder' };
  // Diamond / rhombus: id{label}
  m = token.match(/^(\w+)\{(.+?)\}$/);
  if (m) return { id: m[1], label: m[2], shape: 'diamond' };
  // Hexagon: id{{label}}
  m = token.match(/^(\w+)\{\{(.+?)\}\}$/);
  if (m) return { id: m[1], label: m[2], shape: 'hexagon' };
  // Parallelogram: id[/label/]
  m = token.match(/^(\w+)\[\/(.+?)\/\]$/);
  if (m) return { id: m[1], label: m[2], shape: 'parallelogram' };
  // Round rect: id(label)
  m = token.match(/^(\w+)\((.+?)\)$/);
  if (m) return { id: m[1], label: m[2], shape: 'round-rect' };
  // Rect: id[label]
  m = token.match(/^(\w+)\[(.+?)\]$/);
  if (m) return { id: m[1], label: m[2], shape: 'rect' };
  // Plain id
  return { id: token.trim(), label: token.trim(), shape: 'rect' };
}

function parseEdge(edgePart: string): { label: string; style: DiagramEdge['style']; arrowHead: boolean } {
  let label = '';
  let style: DiagramEdge['style'] = 'solid';
  let arrowHead = true;

  // Extract label from |label| within arrow
  const lm = edgePart.match(/\|(.+?)\|/);
  if (lm) label = lm[1];

  // Extract label from --text-->
  const lm2 = edgePart.match(/--\s*(.+?)\s*-->/);
  if (lm2 && !label) label = lm2[1];

  if (/==>|==/.test(edgePart)) style = 'thick';
  else if (/-.->|-\.-/.test(edgePart)) style = 'dashed';
  else if (/~~~/.test(edgePart)) { style = 'dotted'; arrowHead = false; }
  else if (/---/.test(edgePart)) arrowHead = false;

  return { label, style, arrowHead };
}

function parseFlowchart(code: string): ParsedDiagram {
  const lines = code.trim().split('\n');
  const firstLine = lines[0];
  const direction = detectDirection(firstLine);
  const nodesMap = new Map<string, DiagramNode>();
  const edges: DiagramEdge[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%%') || line.startsWith('style') || line.startsWith('class') || line.startsWith('subgraph') || line === 'end') continue;

    // Try to split on arrow patterns
    const arrowPattern = /\s*(-->|==>|-.->|---|-\.-|~~~|--\s*.+?\s*-->|==\s*.+?\s*==>)\s*/;
    const parts = line.split(arrowPattern);

    if (parts.length >= 3) {
      // Process pairs
      for (let p = 0; p < parts.length - 2; p += 2) {
        const leftToken = parts[p].trim();
        const edgeToken = parts[p + 1];
        const rightToken = parts[p + 2].trim();

        if (!leftToken || !rightToken) continue;

        // Also check for |label| in edge token
        const leftDef = parseNodeDef(leftToken);
        const rightDef = parseNodeDef(rightToken);
        const edgeDef = parseEdge(edgeToken);

        // Check for |label| on left or right side
        const leftLabelMatch = leftToken.match(/\|(.+?)\|/);
        const rightLabelMatch = rightToken.match(/\|(.+?)\|/);
        if (rightLabelMatch && !edgeDef.label) {
          edgeDef.label = rightLabelMatch[1];
        }

        if (!nodesMap.has(leftDef.id)) nodesMap.set(leftDef.id, { ...leftDef, x: 0, y: 0, width: 140, height: 60 });
        if (!nodesMap.has(rightDef.id)) nodesMap.set(rightDef.id, { ...rightDef, x: 0, y: 0, width: 140, height: 60 });

        // Update label if this definition has a better one
        const existL = nodesMap.get(leftDef.id)!;
        if (leftDef.label !== leftDef.id) { existL.label = leftDef.label; existL.shape = leftDef.shape; }
        const existR = nodesMap.get(rightDef.id)!;
        if (rightDef.label !== rightDef.id) { existR.label = rightDef.label; existR.shape = rightDef.shape; }

        edges.push({ from: leftDef.id, to: rightDef.id, ...edgeDef });
      }
    } else {
      // Standalone node definition
      const def = parseNodeDef(line);
      if (def.id && !nodesMap.has(def.id)) {
        nodesMap.set(def.id, { ...def, x: 0, y: 0, width: 140, height: 60 });
      }
    }
  }

  const nodes = Array.from(nodesMap.values());
  layoutNodes(nodes, edges, direction);
  return { type: 'flowchart', nodes, edges, direction };
}

function parseSequence(code: string): ParsedDiagram {
  const lines = code.trim().split('\n');
  const participants: string[] = [];
  const sequences: SequenceMessage[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%%')) continue;

    // participant
    const pm = line.match(/^participant\s+(.+?)(?:\s+as\s+(.+))?$/i);
    if (pm) { participants.push(pm[2] || pm[1]); continue; }

    // actor
    const am = line.match(/^actor\s+(.+?)(?:\s+as\s+(.+))?$/i);
    if (am) { participants.push(am[2] || am[1]); continue; }

    // message arrows
    const mm = line.match(/^(.+?)\s*(-->>|--\)|-->|->>|->|-\))\s*(.+?):\s*(.+)$/);
    if (mm) {
      const from = mm[1].trim();
      const to = mm[3].trim();
      if (!participants.includes(from)) participants.push(from);
      if (!participants.includes(to)) participants.push(to);
      const isDashed = mm[2].includes('--');
      sequences.push({ from, to, label: mm[4].trim(), type: isDashed ? 'dashed' : 'solid' });
    }
  }

  // Create nodes for participants
  const nodes: DiagramNode[] = participants.map((p, i) => ({
    id: p, label: p, shape: 'rect' as const,
    x: 60 + i * 180, y: 40, width: 120, height: 40,
  }));

  return { type: 'sequence', nodes, edges: [], direction: 'TB', sequences };
}

function parseClassDiagram(code: string): ParsedDiagram {
  const lines = code.trim().split('\n');
  const nodesMap = new Map<string, DiagramNode>();
  const edges: DiagramEdge[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%%') || line.startsWith('note')) continue;

    // class definition: class ClassName
    const cm = line.match(/^class\s+(\w+)/);
    if (cm) {
      if (!nodesMap.has(cm[1])) nodesMap.set(cm[1], { id: cm[1], label: cm[1], shape: 'rect', x: 0, y: 0, width: 140, height: 70 });
      continue;
    }

    // Relationship: A --|> B or A --> B or A ..> B etc.
    const rm = line.match(/^(\w+)\s+(--|\.\.|\*--|o--|--)([>|*o]?)\s*(\w+)/);
    if (rm) {
      const from = rm[1], to = rm[4];
      if (!nodesMap.has(from)) nodesMap.set(from, { id: from, label: from, shape: 'rect', x: 0, y: 0, width: 140, height: 70 });
      if (!nodesMap.has(to)) nodesMap.set(to, { id: to, label: to, shape: 'rect', x: 0, y: 0, width: 140, height: 70 });
      const style = rm[2].includes('..') ? 'dashed' : 'solid';
      edges.push({ from, to, label: '', style, arrowHead: rm[3] === '>' });
      continue;
    }

    // members: ClassName : +method() or just lines under class block
    const mm = line.match(/^(\w+)\s*:\s*(.+)/);
    if (mm && nodesMap.has(mm[1])) {
      const n = nodesMap.get(mm[1])!;
      n.label = n.label.includes('\n') ? n.label + '\n' + mm[2] : n.label + '\n' + mm[2];
    }
  }

  const nodes = Array.from(nodesMap.values());
  layoutNodes(nodes, edges, 'TB');
  return { type: 'class', nodes, edges, direction: 'TB' };
}

function parseStateDiagram(code: string): ParsedDiagram {
  const lines = code.trim().split('\n');
  const nodesMap = new Map<string, DiagramNode>();
  const edges: DiagramEdge[] = [];

  // Add start state
  nodesMap.set('[*]', { id: '[*]', label: '', shape: 'circle', x: 0, y: 0, width: 30, height: 30 });

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%%') || line.startsWith('state') || line === '{' || line === '}' || line.startsWith('note')) continue;

    const tm = line.match(/^(.+?)\s*-->\s*(.+?)(?:\s*:\s*(.+))?$/);
    if (tm) {
      const from = tm[1].trim(), to = tm[2].trim(), label = tm[3]?.trim() || '';
      if (!nodesMap.has(from)) nodesMap.set(from, { id: from, label: from === '[*]' ? '' : from, shape: from === '[*]' ? 'circle' : 'round-rect', x: 0, y: 0, width: from === '[*]' ? 30 : 140, height: from === '[*]' ? 30 : 50 });
      if (!nodesMap.has(to)) nodesMap.set(to, { id: to, label: to === '[*]' ? '' : to, shape: to === '[*]' ? 'circle' : 'round-rect', x: 0, y: 0, width: to === '[*]' ? 30 : 140, height: to === '[*]' ? 30 : 50 });
      edges.push({ from, to, label, style: 'solid', arrowHead: true });
    }
  }

  const nodes = Array.from(nodesMap.values());
  layoutNodes(nodes, edges, 'TB');
  return { type: 'state', nodes, edges, direction: 'TB' };
}

function parseERDiagram(code: string): ParsedDiagram {
  const lines = code.trim().split('\n');
  const nodesMap = new Map<string, DiagramNode>();
  const edges: DiagramEdge[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%%')) continue;

    // Relationship: ENTITY ||--o{ ENTITY : label
    const rm = line.match(/^(\w[\w\s-]*?)\s+(\|[|o}{\s]*--[|o}{\s]*)\s+(\w[\w\s-]*?)\s*:\s*(.+)$/);
    if (rm) {
      const from = rm[1].trim(), to = rm[3].trim(), label = rm[4].trim();
      if (!nodesMap.has(from)) nodesMap.set(from, { id: from, label: from, shape: 'entity', x: 0, y: 0, width: 140, height: 60 });
      if (!nodesMap.has(to)) nodesMap.set(to, { id: to, label: to, shape: 'entity', x: 0, y: 0, width: 140, height: 60 });
      edges.push({ from, to, label, style: 'solid', arrowHead: false });
      continue;
    }

    // Entity block start: ENTITY {
    const em = line.match(/^(\w+)\s*\{$/);
    if (em) {
      if (!nodesMap.has(em[1])) nodesMap.set(em[1], { id: em[1], label: em[1], shape: 'entity', x: 0, y: 0, width: 140, height: 60 });
    }
  }

  const nodes = Array.from(nodesMap.values());
  layoutNodes(nodes, edges, 'LR');
  return { type: 'er', nodes, edges, direction: 'LR' };
}

function parseGantt(code: string): ParsedDiagram {
  const lines = code.trim().split('\n');
  let title = '';
  let currentSection = '';
  const tasks: GanttTask[] = [];
  let colIndex = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%%')) continue;

    const tm = line.match(/^title\s+(.+)/i);
    if (tm) { title = tm[1]; continue; }

    if (line.match(/^dateFormat/i) || line.match(/^axisFormat/i) || line.match(/^todayMarker/i) || line.match(/^excludes/i)) continue;

    const sm = line.match(/^section\s+(.+)/i);
    if (sm) { currentSection = sm[1]; continue; }

    // Task: name :status, id, startDate, duration or after
    const taskMatch = line.match(/^(.+?)\s*:(.*)$/);
    if (taskMatch) {
      const name = taskMatch[1].trim();
      const parts = taskMatch[2].split(',').map(p => p.trim());
      let status: GanttTask['status'] = 'default';
      if (parts.some(p => p === 'done')) status = 'done';
      else if (parts.some(p => p === 'active')) status = 'active';
      else if (parts.some(p => p === 'crit')) status = 'crit';

      tasks.push({ name, section: currentSection, startCol: colIndex, duration: 3, status });
      colIndex++;
    }
  }

  return { type: 'gantt', nodes: [], edges: [], direction: 'LR', title, ganttTasks: tasks };
}

function layoutNodes(nodes: DiagramNode[], edges: DiagramEdge[], direction: ParsedDiagram['direction']) {
  if (nodes.length === 0) return;

  // Build adjacency for topological sort
  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();
  nodes.forEach(n => { adj.set(n.id, []); inDeg.set(n.id, 0); });
  edges.forEach(e => {
    adj.get(e.from)?.push(e.to);
    inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
  });

  // BFS topological sort to assign layers
  const queue: string[] = [];
  const layer = new Map<string, number>();
  nodes.forEach(n => { if ((inDeg.get(n.id) || 0) === 0) queue.push(n.id); });

  let lvl = 0;
  while (queue.length > 0) {
    const nextQueue: string[] = [];
    const current = [...queue];
    queue.length = 0;
    for (const id of current) {
      layer.set(id, lvl);
      for (const child of (adj.get(id) || [])) {
        inDeg.set(child, (inDeg.get(child) || 0) - 1);
        if ((inDeg.get(child) || 0) <= 0) nextQueue.push(child);
      }
    }
    queue.push(...nextQueue);
    lvl++;
  }

  // Assign positions to any nodes not reached
  nodes.forEach(n => { if (!layer.has(n.id)) layer.set(n.id, lvl++); });

  // Group by layer
  const layers = new Map<number, DiagramNode[]>();
  nodes.forEach(n => {
    const l = layer.get(n.id) || 0;
    if (!layers.has(l)) layers.set(l, []);
    layers.get(l)!.push(n);
  });

  const hGap = 180;
  const vGap = 120;
  const isHorizontal = direction === 'LR' || direction === 'RL';

  layers.forEach((layerNodes, layerIdx) => {
    layerNodes.forEach((n, posIdx) => {
      const offset = (posIdx - (layerNodes.length - 1) / 2);
      if (isHorizontal) {
        n.x = 60 + layerIdx * hGap;
        n.y = 60 + (layerNodes.length > 1 ? posIdx : 0) * vGap + offset * 0;
        // Center vertically
        n.y = 60 + posIdx * vGap;
      } else {
        n.x = 60 + posIdx * hGap;
        n.y = 60 + layerIdx * vGap;
      }
    });
  });
}

export function parseMermaid(code: string): ParsedDiagram {
  const type = detectDiagramType(code);
  switch (type) {
    case 'flowchart': return parseFlowchart(code);
    case 'sequence': return parseSequence(code);
    case 'class': return parseClassDiagram(code);
    case 'state': return parseStateDiagram(code);
    case 'er': return parseERDiagram(code);
    case 'gantt': return parseGantt(code);
    default:
      // Try parsing as flowchart anyway
      try { return parseFlowchart(code); } catch { /* empty */ }
      return { type: 'unknown', nodes: [], edges: [], direction: 'TB' };
  }
}

export function generateMermaidFromPrompt(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes('login') || p.includes('auth') || p.includes('sign in')) {
    return `flowchart TD
    Start([Start]) --> Input[Enter Credentials]
    Input --> Validate{Valid?}
    Validate -->|Yes| Dashboard[Dashboard]
    Validate -->|No| Error[Show Error]
    Error --> Input
    Dashboard --> End([End])`;
  }

  if (p.includes('org') || p.includes('organization') || p.includes('team')) {
    return `flowchart TD
    CEO[CEO] --> CTO[CTO]
    CEO --> CFO[CFO]
    CEO --> COO[COO]
    CTO --> Dev[Dev Team]
    CTO --> QA[QA Team]
    CFO --> Finance[Finance]
    COO --> Ops[Operations]
    COO --> HR[HR]`;
  }

  if (p.includes('order') || p.includes('purchase') || p.includes('checkout') || p.includes('ecommerce')) {
    return `flowchart TD
    Browse([Browse Products]) --> Cart[Add to Cart]
    Cart --> Checkout[Checkout]
    Checkout --> Payment{Payment OK?}
    Payment -->|Yes| Confirm[Order Confirmed]
    Payment -->|No| Retry[Retry Payment]
    Retry --> Checkout
    Confirm --> Ship[Ship Order]
    Ship --> Deliver([Delivered])`;
  }

  if (p.includes('api') || p.includes('request') || p.includes('rest') || p.includes('endpoint')) {
    return `sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant DB
    Client->>API: HTTP Request
    API->>Auth: Validate Token
    Auth-->>API: Token Valid
    API->>DB: Query Data
    DB-->>API: Results
    API-->>Client: JSON Response`;
  }

  if (p.includes('database') || p.includes('schema') || p.includes('table')) {
    return `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "ordered in"
    USER {
        int id
        string name
        string email
    }
    ORDER {
        int id
        date created
        string status
    }`;
  }

  if (p.includes('state') || p.includes('status') || p.includes('lifecycle')) {
    return `stateDiagram-v2
    [*] --> Draft
    Draft --> Review : Submit
    Review --> Approved : Approve
    Review --> Draft : Reject
    Approved --> Published : Publish
    Published --> Archived : Archive
    Archived --> [*]`;
  }

  if (p.includes('class') || p.includes('inheritance') || p.includes('oop')) {
    return `classDiagram
    class Animal
    Animal : +String name
    Animal : +int age
    Animal : +makeSound()
    class Dog
    Dog : +fetch()
    class Cat
    Cat : +purr()
    Animal <|-- Dog
    Animal <|-- Cat`;
  }

  // Default: simple flowchart from the prompt
  const words = prompt.split(/\s+/).filter(w => w.length > 3).slice(0, 6);
  if (words.length < 2) {
    return `flowchart TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Action A]
    C -->|No| E[Action B]
    D --> F([End])
    E --> F`;
  }

  const lines = ['flowchart TD'];
  const ids = words.map((_, i) => String.fromCharCode(65 + i));
  words.forEach((w, i) => {
    const label = w.charAt(0).toUpperCase() + w.slice(1);
    if (i === 0) lines.push(`    ${ids[i]}([${label}])`);
    else lines.push(`    ${ids[i]}[${label}]`);
    if (i > 0) lines.push(`    ${ids[i - 1]} --> ${ids[i]}`);
  });
  return lines.join('\n');
}
