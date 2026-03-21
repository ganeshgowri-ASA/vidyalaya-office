/**
 * Auto-Layout Algorithms for the Graphics & Flowchart Editor
 * Supports: Tree (top-down, left-right, radial), Hierarchical, Force-directed, Circular
 */

import { Shape } from '@/store/graphics-store';

export type LayoutDirection = 'top-down' | 'left-right' | 'bottom-up' | 'right-left';

export interface LayoutOptions {
  horizontalSpacing: number;
  verticalSpacing: number;
  direction: LayoutDirection;
  centerOnCanvas: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

const DEFAULT_OPTIONS: LayoutOptions = {
  horizontalSpacing: 60,
  verticalSpacing: 80,
  direction: 'top-down',
  centerOnCanvas: true,
  canvasWidth: 1920,
  canvasHeight: 1080,
};

interface LayoutNode {
  id: string;
  shape: Shape;
  children: LayoutNode[];
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeWidth: number;
  subtreeHeight: number;
}

function buildTreeFromShapes(shapes: Shape[]): LayoutNode[] {
  // Build a simple tree: first shape is root, rest are children distributed evenly
  // For a real implementation, connectors would define parent-child relationships
  // Here we infer a tree by proximity / index order
  const nodes: LayoutNode[] = shapes.map(s => ({
    id: s.id,
    shape: s,
    children: [],
    x: s.x,
    y: s.y,
    width: s.width,
    height: s.height,
    subtreeWidth: s.width,
    subtreeHeight: s.height,
  }));

  if (nodes.length <= 1) return nodes;

  // Build a balanced tree: first node is root, distribute rest as children
  const root = nodes[0];
  const remaining = nodes.slice(1);

  // Create a balanced tree with max branching factor based on count
  const branchFactor = Math.min(remaining.length, Math.max(2, Math.ceil(Math.sqrt(remaining.length))));

  function assignChildren(parent: LayoutNode, pool: LayoutNode[], maxDepth: number): void {
    if (pool.length === 0 || maxDepth <= 0) return;
    const childCount = Math.min(branchFactor, pool.length);
    const children = pool.splice(0, childCount);
    parent.children = children;
    for (const child of children) {
      assignChildren(child, pool, maxDepth - 1);
    }
  }

  assignChildren(root, [...remaining], 10);
  return [root];
}

function measureSubtree(
  node: LayoutNode,
  hSpacing: number,
  vSpacing: number,
  isHorizontal: boolean,
): void {
  if (node.children.length === 0) {
    node.subtreeWidth = node.width;
    node.subtreeHeight = node.height;
    return;
  }

  for (const child of node.children) {
    measureSubtree(child, hSpacing, vSpacing, isHorizontal);
  }

  if (isHorizontal) {
    node.subtreeHeight = node.children.reduce((sum, c) => sum + c.subtreeHeight, 0) +
      (node.children.length - 1) * vSpacing;
    node.subtreeWidth = node.width + hSpacing +
      Math.max(...node.children.map(c => c.subtreeWidth));
  } else {
    node.subtreeWidth = node.children.reduce((sum, c) => sum + c.subtreeWidth, 0) +
      (node.children.length - 1) * hSpacing;
    node.subtreeHeight = node.height + vSpacing +
      Math.max(...node.children.map(c => c.subtreeHeight));
  }
}

function layoutTreeNode(
  node: LayoutNode,
  startX: number,
  startY: number,
  hSpacing: number,
  vSpacing: number,
  direction: LayoutDirection,
): void {
  const isHorizontal = direction === 'left-right' || direction === 'right-left';
  const isReverse = direction === 'bottom-up' || direction === 'right-left';

  if (isHorizontal) {
    // Center node vertically within its subtree
    node.x = startX;
    node.y = startY + (node.subtreeHeight - node.height) / 2;

    let childY = startY;
    const childX = isReverse
      ? startX - hSpacing - Math.max(0, ...node.children.map(c => c.subtreeWidth))
      : startX + node.width + hSpacing;

    for (const child of node.children) {
      layoutTreeNode(child, childX, childY, hSpacing, vSpacing, direction);
      childY += child.subtreeHeight + vSpacing;
    }
  } else {
    // Center node horizontally within its subtree
    node.x = startX + (node.subtreeWidth - node.width) / 2;
    node.y = startY;

    let childX = startX;
    const childY = isReverse
      ? startY - vSpacing - Math.max(0, ...node.children.map(c => c.subtreeHeight))
      : startY + node.height + vSpacing;

    for (const child of node.children) {
      layoutTreeNode(child, childX, childY, hSpacing, vSpacing, direction);
      childX += child.subtreeWidth + hSpacing;
    }
  }
}

function collectPositions(node: LayoutNode, result: Map<string, { x: number; y: number }>): void {
  result.set(node.id, { x: node.x, y: node.y });
  for (const child of node.children) {
    collectPositions(child, result);
  }
}

function centerPositions(
  positions: Map<string, { x: number; y: number }>,
  shapes: Shape[],
  opts: LayoutOptions,
): Map<string, { x: number; y: number }> {
  if (!opts.centerOnCanvas || positions.size === 0) return positions;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  shapes.forEach(shape => {
    const pos = positions.get(shape.id);
    if (!pos) return;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + shape.width);
    maxY = Math.max(maxY, pos.y + shape.height);
  });

  const layoutW = maxX - minX;
  const layoutH = maxY - minY;
  const offsetX = (opts.canvasWidth - layoutW) / 2 - minX;
  const offsetY = (opts.canvasHeight - layoutH) / 2 - minY;

  const centered = new Map<string, { x: number; y: number }>();
  shapes.forEach(shape => {
    const pos = positions.get(shape.id);
    if (!pos) return;
    centered.set(shape.id, { x: pos.x + offsetX, y: pos.y + offsetY });
  });
  return centered;
}

/**
 * Tree Layout - arranges nodes in a hierarchical tree structure
 */
export function treeLayout(
  shapes: Shape[],
  options: Partial<LayoutOptions> = {},
): Shape[] {
  if (shapes.length === 0) return shapes;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { horizontalSpacing, verticalSpacing, direction } = opts;
  const isHorizontal = direction === 'left-right' || direction === 'right-left';

  const roots = buildTreeFromShapes(shapes);
  for (const root of roots) {
    measureSubtree(root, horizontalSpacing, verticalSpacing, isHorizontal);
  }

  let startX = 100, startY = 100;
  if (direction === 'bottom-up') {
    startY = opts.canvasHeight - 100;
  } else if (direction === 'right-left') {
    startX = opts.canvasWidth - 100;
  }

  for (const root of roots) {
    layoutTreeNode(root, startX, startY, horizontalSpacing, verticalSpacing, direction);
  }

  const positions = new Map<string, { x: number; y: number }>();
  for (const root of roots) {
    collectPositions(root, positions);
  }

  const centered = centerPositions(positions, shapes, opts);

  return shapes.map(s => {
    const pos = centered.get(s.id);
    if (!pos) return s;
    return { ...s, x: Math.round(pos.x), y: Math.round(pos.y) } as Shape;
  });
}

/**
 * Hierarchical Layout - specifically for org charts with equal spacing per level
 */
export function hierarchicalLayout(
  shapes: Shape[],
  options: Partial<LayoutOptions> = {},
): Shape[] {
  if (shapes.length === 0) return shapes;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { horizontalSpacing, verticalSpacing, direction } = opts;
  const isHorizontal = direction === 'left-right' || direction === 'right-left';

  // Build levels: root at level 0, then distribute evenly across levels
  const levels: Shape[][] = [];
  const remaining = [...shapes];

  // Level 0: 1 node (root)
  // Level 1: up to 3 nodes (direct reports)
  // Level 2+: remaining nodes split evenly
  levels.push([remaining.shift()!]);

  if (remaining.length > 0) {
    const l1Count = Math.min(remaining.length, Math.max(2, Math.ceil(remaining.length / 3)));
    levels.push(remaining.splice(0, l1Count));
  }

  while (remaining.length > 0) {
    const prevLevelCount = levels[levels.length - 1].length;
    const thisCount = Math.min(remaining.length, prevLevelCount * 2);
    levels.push(remaining.splice(0, thisCount));
  }

  const positions = new Map<string, { x: number; y: number }>();

  for (let lvl = 0; lvl < levels.length; lvl++) {
    const levelShapes = levels[lvl];
    const count = levelShapes.length;

    for (let i = 0; i < count; i++) {
      const shape = levelShapes[i];
      let x: number, y: number;

      if (isHorizontal) {
        const maxH = Math.max(...levelShapes.map(s => s.height));
        const totalHeight = count * maxH + (count - 1) * verticalSpacing;
        const startY = -totalHeight / 2;
        x = lvl * (shape.width + horizontalSpacing);
        y = startY + i * (maxH + verticalSpacing);
      } else {
        const maxW = Math.max(...levelShapes.map(s => s.width));
        const totalWidth = count * maxW + (count - 1) * horizontalSpacing;
        const startX = -totalWidth / 2;
        x = startX + i * (maxW + horizontalSpacing);
        y = lvl * (shape.height + verticalSpacing);
      }

      positions.set(shape.id, { x, y });
    }
  }

  const centered = centerPositions(positions, shapes, opts);

  return shapes.map(s => {
    const pos = centered.get(s.id);
    if (!pos) return s;
    return { ...s, x: Math.round(pos.x), y: Math.round(pos.y) } as Shape;
  });
}

/**
 * Force-Directed Layout - simulates physical forces for natural-looking network diagrams
 */
export function forceDirectedLayout(
  shapes: Shape[],
  options: Partial<LayoutOptions> = {},
): Shape[] {
  if (shapes.length <= 1) return shapes;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const n = shapes.length;

  // Initialize positions
  const pos: { x: number; y: number }[] = shapes.map((_, i) => {
    const angle = (2 * Math.PI * i) / n;
    const radius = Math.min(opts.canvasWidth, opts.canvasHeight) * 0.3;
    return {
      x: opts.canvasWidth / 2 + radius * Math.cos(angle),
      y: opts.canvasHeight / 2 + radius * Math.sin(angle),
    };
  });

  const vel: { x: number; y: number }[] = shapes.map(() => ({ x: 0, y: 0 }));

  const idealDist = opts.horizontalSpacing + Math.max(...shapes.map(s => Math.max(s.width, s.height)));
  const repulsionStrength = idealDist * idealDist * 2;
  const attractionStrength = 0.01;
  const damping = 0.85;
  const iterations = 150;
  const centerGravity = 0.002;
  const cx = opts.canvasWidth / 2;
  const cy = opts.canvasHeight / 2;

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 1 - iter / iterations; // cooling

    // Repulsive forces (all pairs)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const force = (repulsionStrength / (dist * dist)) * temp;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        vel[i].x += fx;
        vel[i].y += fy;
        vel[j].x -= fx;
        vel[j].y -= fy;
      }
    }

    // Attractive forces (sequential neighbors as a simple edge model)
    for (let i = 0; i < n - 1; i++) {
      const j = i + 1;
      const dx = pos[j].x - pos[i].x;
      const dy = pos[j].y - pos[i].y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const force = (dist - idealDist) * attractionStrength * temp;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      vel[i].x += fx;
      vel[i].y += fy;
      vel[j].x -= fx;
      vel[j].y -= fy;
    }

    // Center gravity
    for (let i = 0; i < n; i++) {
      vel[i].x += (cx - pos[i].x) * centerGravity;
      vel[i].y += (cy - pos[i].y) * centerGravity;
    }

    // Apply velocities with damping
    for (let i = 0; i < n; i++) {
      vel[i].x *= damping;
      vel[i].y *= damping;
      pos[i].x += vel[i].x;
      pos[i].y += vel[i].y;
    }
  }

  // Build positions map and center
  const positions = new Map<string, { x: number; y: number }>();
  shapes.forEach((s, i) => {
    positions.set(s.id, { x: pos[i].x - s.width / 2, y: pos[i].y - s.height / 2 });
  });

  const centered = centerPositions(positions, shapes, opts);

  return shapes.map(s => {
    const p = centered.get(s.id);
    if (!p) return s;
    return { ...s, x: Math.round(p.x), y: Math.round(p.y) } as Shape;
  });
}

/**
 * Circular Layout - arranges all nodes in a circle
 */
export function circularLayout(
  shapes: Shape[],
  options: Partial<LayoutOptions> = {},
): Shape[] {
  if (shapes.length === 0) return shapes;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const n = shapes.length;

  if (n === 1) {
    const s = shapes[0];
    return [{
      ...s,
      x: Math.round((opts.canvasWidth - s.width) / 2),
      y: Math.round((opts.canvasHeight - s.height) / 2),
    } as Shape];
  }

  // Calculate radius based on number of shapes and their sizes
  const avgSize = shapes.reduce((sum, s) => sum + Math.max(s.width, s.height), 0) / n;
  const circumference = n * (avgSize + opts.horizontalSpacing);
  const radius = Math.max(circumference / (2 * Math.PI), 150);

  const positions = new Map<string, { x: number; y: number }>();

  shapes.forEach((s, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2; // Start from top
    const x = radius * Math.cos(angle) - s.width / 2;
    const y = radius * Math.sin(angle) - s.height / 2;
    positions.set(s.id, { x, y });
  });

  const centered = centerPositions(positions, shapes, opts);

  return shapes.map(s => {
    const p = centered.get(s.id);
    if (!p) return s;
    return { ...s, x: Math.round(p.x), y: Math.round(p.y) } as Shape;
  });
}

/**
 * Radial Tree Layout - root at center, children radiating outward in concentric circles
 */
export function radialTreeLayout(
  shapes: Shape[],
  options: Partial<LayoutOptions> = {},
): Shape[] {
  if (shapes.length === 0) return shapes;

  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (shapes.length === 1) {
    const s = shapes[0];
    return [{
      ...s,
      x: Math.round((opts.canvasWidth - s.width) / 2),
      y: Math.round((opts.canvasHeight - s.height) / 2),
    } as Shape];
  }

  // Build levels from tree structure
  const roots = buildTreeFromShapes(shapes);
  const levels: LayoutNode[][] = [];

  function collectLevels(nodes: LayoutNode[], level: number): void {
    if (nodes.length === 0) return;
    if (!levels[level]) levels[level] = [];
    levels[level].push(...nodes);
    for (const node of nodes) {
      collectLevels(node.children, level + 1);
    }
  }

  collectLevels(roots, 0);

  const ringSpacing = opts.verticalSpacing + Math.max(...shapes.map(s => Math.max(s.width, s.height)));
  const positions = new Map<string, { x: number; y: number }>();

  for (let lvl = 0; lvl < levels.length; lvl++) {
    const nodes = levels[lvl];
    if (lvl === 0) {
      // Root at center
      for (const node of nodes) {
        positions.set(node.id, { x: -node.width / 2, y: -node.height / 2 });
      }
    } else {
      const radius = lvl * ringSpacing;
      const count = nodes.length;
      nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        positions.set(node.id, {
          x: radius * Math.cos(angle) - node.width / 2,
          y: radius * Math.sin(angle) - node.height / 2,
        });
      });
    }
  }

  const centered = centerPositions(positions, shapes, opts);

  return shapes.map(s => {
    const p = centered.get(s.id);
    if (!p) return s;
    return { ...s, x: Math.round(p.x), y: Math.round(p.y) } as Shape;
  });
}

/**
 * Grid Layout - simple grid arrangement (used as a fallback / auto-arrange)
 */
export function gridLayout(
  shapes: Shape[],
  options: Partial<LayoutOptions> = {},
): Shape[] {
  if (shapes.length === 0) return shapes;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cols = Math.max(1, Math.ceil(Math.sqrt(shapes.length)));
  const maxW = Math.max(...shapes.map(s => s.width));
  const maxH = Math.max(...shapes.map(s => s.height));
  const cellW = maxW + opts.horizontalSpacing;
  const cellH = maxH + opts.verticalSpacing;

  const positions = new Map<string, { x: number; y: number }>();

  shapes.forEach((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.set(s.id, {
      x: col * cellW + (maxW - s.width) / 2,
      y: row * cellH + (maxH - s.height) / 2,
    });
  });

  const centered = centerPositions(positions, shapes, opts);

  return shapes.map(s => {
    const p = centered.get(s.id);
    if (!p) return s;
    return { ...s, x: Math.round(p.x), y: Math.round(p.y) } as Shape;
  });
}

export type LayoutAlgorithm =
  | 'tree'
  | 'hierarchical'
  | 'force-directed'
  | 'circular'
  | 'radial-tree'
  | 'grid';

export function applyLayout(
  algorithm: LayoutAlgorithm,
  shapes: Shape[],
  options: Partial<LayoutOptions> = {},
): Shape[] {
  switch (algorithm) {
    case 'tree': return treeLayout(shapes, options);
    case 'hierarchical': return hierarchicalLayout(shapes, options);
    case 'force-directed': return forceDirectedLayout(shapes, options);
    case 'circular': return circularLayout(shapes, options);
    case 'radial-tree': return radialTreeLayout(shapes, options);
    case 'grid': return gridLayout(shapes, options);
    default: return shapes;
  }
}
