/**
 * Basic PlantUML parser — converts PlantUML text into a structure compatible with the diagram renderer.
 * Supports: activity, sequence, class, and simple component diagrams.
 */

import { DiagramNode, DiagramEdge, ParsedDiagram, SequenceMessage } from './mermaid-parser';

function parsePlantUMLActivity(code: string): ParsedDiagram {
  const lines = code.split('\n');
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  let prevId: string | null = null;
  let nodeIdx = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '@startuml' || line === '@enduml' || line.startsWith("'") || line.startsWith('title') || line.startsWith('start') || line.startsWith('stop')) {
      if (line === 'start') {
        const id = `n${nodeIdx++}`;
        nodes.push({ id, label: 'Start', shape: 'circle', x: 0, y: 0, width: 50, height: 50 });
        prevId = id;
      }
      if (line === 'stop') {
        const id = `n${nodeIdx++}`;
        nodes.push({ id, label: 'Stop', shape: 'circle', x: 0, y: 0, width: 50, height: 50 });
        if (prevId) edges.push({ from: prevId, to: id, label: '', style: 'solid', arrowHead: true });
        prevId = id;
      }
      continue;
    }

    // Activity: :text;
    const actMatch = line.match(/^:(.+?);$/);
    if (actMatch) {
      const id = `n${nodeIdx++}`;
      nodes.push({ id, label: actMatch[1], shape: 'round-rect', x: 0, y: 0, width: 140, height: 50 });
      if (prevId) edges.push({ from: prevId, to: id, label: '', style: 'solid', arrowHead: true });
      prevId = id;
      continue;
    }

    // If/else: if (cond) then (yes) / else (no) / endif
    const ifMatch = line.match(/^if\s*\((.+?)\)\s*then\s*\((.+?)\)/);
    if (ifMatch) {
      const id = `n${nodeIdx++}`;
      nodes.push({ id, label: ifMatch[1], shape: 'diamond', x: 0, y: 0, width: 140, height: 60 });
      if (prevId) edges.push({ from: prevId, to: id, label: '', style: 'solid', arrowHead: true });
      prevId = id;
      continue;
    }

    // Arrow with label: --> text
    const arrowMatch = line.match(/^-->\s*(.+)$/);
    if (arrowMatch && prevId) {
      // Just a labeled transition, skip
      continue;
    }
  }

  layoutPlantUMLNodes(nodes, edges);
  return { type: 'flowchart', nodes, edges, direction: 'TB' };
}

function parsePlantUMLSequence(code: string): ParsedDiagram {
  const lines = code.split('\n');
  const participants: string[] = [];
  const sequences: SequenceMessage[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '@startuml' || line === '@enduml' || line.startsWith("'")) continue;

    const pm = line.match(/^(?:participant|actor)\s+"?(\w+)"?(?:\s+as\s+(\w+))?/i);
    if (pm) { participants.push(pm[2] || pm[1]); continue; }

    // Arrow: A -> B : message  or  A --> B : message
    const am = line.match(/^(\w+)\s*(->|-->|<--|<-|->o|o->)\s*(\w+)\s*:\s*(.+)$/);
    if (am) {
      const from = am[1], to = am[3], label = am[4].trim();
      if (!participants.includes(from)) participants.push(from);
      if (!participants.includes(to)) participants.push(to);
      const isDashed = am[2].includes('--');
      sequences.push({ from, to, label, type: isDashed ? 'dashed' : 'solid' });
    }
  }

  const nodes: DiagramNode[] = participants.map((p, i) => ({
    id: p, label: p, shape: 'rect' as const,
    x: 60 + i * 180, y: 40, width: 120, height: 40,
  }));

  return { type: 'sequence', nodes, edges: [], direction: 'TB', sequences };
}

function parsePlantUMLClass(code: string): ParsedDiagram {
  const lines = code.split('\n');
  const nodesMap = new Map<string, DiagramNode>();
  const edges: DiagramEdge[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '@startuml' || line === '@enduml' || line.startsWith("'") || line === '}') continue;

    // class ClassName {
    const cm = line.match(/^(?:class|interface|abstract)\s+(\w+)/);
    if (cm) {
      if (!nodesMap.has(cm[1])) nodesMap.set(cm[1], { id: cm[1], label: cm[1], shape: 'rect', x: 0, y: 0, width: 140, height: 70 });
      continue;
    }

    // Relationship: A --|> B or A --> B
    const rm = line.match(/^(\w+)\s+(--|\.\.|\*--|o--)(>|)\s*(\w+)/);
    if (rm) {
      const from = rm[1], to = rm[4];
      if (!nodesMap.has(from)) nodesMap.set(from, { id: from, label: from, shape: 'rect', x: 0, y: 0, width: 140, height: 70 });
      if (!nodesMap.has(to)) nodesMap.set(to, { id: to, label: to, shape: 'rect', x: 0, y: 0, width: 140, height: 70 });
      edges.push({ from, to, label: '', style: rm[2].includes('..') ? 'dashed' : 'solid', arrowHead: rm[3] === '>' });
    }
  }

  const nodes = Array.from(nodesMap.values());
  layoutPlantUMLNodes(nodes, edges);
  return { type: 'class', nodes, edges, direction: 'TB' };
}

function layoutPlantUMLNodes(nodes: DiagramNode[], edges: DiagramEdge[]) {
  // Simple top-down layout
  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();
  nodes.forEach(n => { adj.set(n.id, []); inDeg.set(n.id, 0); });
  edges.forEach(e => {
    adj.get(e.from)?.push(e.to);
    inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
  });

  const queue: string[] = [];
  const layer = new Map<string, number>();
  nodes.forEach(n => { if ((inDeg.get(n.id) || 0) === 0) queue.push(n.id); });

  let lvl = 0;
  while (queue.length > 0) {
    const current = [...queue];
    queue.length = 0;
    for (const id of current) {
      layer.set(id, lvl);
      for (const child of (adj.get(id) || [])) {
        inDeg.set(child, (inDeg.get(child) || 0) - 1);
        if ((inDeg.get(child) || 0) <= 0) queue.push(child);
      }
    }
    lvl++;
  }

  nodes.forEach(n => { if (!layer.has(n.id)) layer.set(n.id, lvl++); });

  const layers = new Map<number, DiagramNode[]>();
  nodes.forEach(n => {
    const l = layer.get(n.id) || 0;
    if (!layers.has(l)) layers.set(l, []);
    layers.get(l)!.push(n);
  });

  layers.forEach((layerNodes, layerIdx) => {
    layerNodes.forEach((n, posIdx) => {
      n.x = 60 + posIdx * 180;
      n.y = 60 + layerIdx * 120;
    });
  });
}

export function parsePlantUML(code: string): ParsedDiagram {
  const lower = code.toLowerCase();

  if (lower.includes('->') && (lower.includes('participant') || lower.includes('actor') || (lower.match(/->/g)?.length || 0) > 1 && lower.includes(':'))) {
    // Check if it looks like sequence
    const hasSequenceArrows = /\w+\s*-+>+\s*\w+\s*:/m.test(code);
    if (hasSequenceArrows) return parsePlantUMLSequence(code);
  }

  if (lower.includes('class ') || lower.includes('interface ') || lower.includes('abstract ')) {
    return parsePlantUMLClass(code);
  }

  // Default to activity
  return parsePlantUMLActivity(code);
}
