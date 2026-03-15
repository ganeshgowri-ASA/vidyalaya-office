"use client";

import React, { useState, useCallback } from "react";
import {
  X, ChevronRight, Plus, Trash2, Palette, Type, Move,
  Network, GitBranch, Circle, Triangle, Diamond,
  BarChart3, PieChart, ArrowRight, Layout,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

// ---------- SMARTART CATEGORIES & LAYOUTS ----------

interface SmartArtLayout {
  id: string;
  name: string;
  category: string;
  description: string;
}

const SMARTART_CATEGORIES = [
  "List", "Process", "Cycle", "Hierarchy",
  "Relationship", "Matrix", "Pyramid", "Picture",
];

const SMARTART_LAYOUTS: SmartArtLayout[] = [
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
  { id: "tab-list", name: "Tab List", category: "List", description: "Tabbed folder list layout" },
  // Process (10 layouts)
  { id: "basic-process", name: "Basic Process", category: "Process", description: "Sequential steps with arrows" },
  { id: "accent-process", name: "Accent Process", category: "Process", description: "Steps with accent colored arrows" },
  { id: "alternating-flow", name: "Alternating Flow", category: "Process", description: "Zig-zag process flow" },
  { id: "continuous-block", name: "Continuous Block", category: "Process", description: "Connected block process" },
  { id: "chevron-list", name: "Chevron List", category: "Process", description: "Chevron arrow process steps" },
  { id: "upward-arrow", name: "Upward Arrow Process", category: "Process", description: "Steps going upward" },
  { id: "repeating-bending", name: "Repeating Bending", category: "Process", description: "Snake-like repeating process" },
  { id: "step-down", name: "Step Down Process", category: "Process", description: "Descending steps" },
  { id: "gear-process", name: "Gear Process", category: "Process", description: "Interlocking gear process" },
  { id: "funnel-process", name: "Funnel Process", category: "Process", description: "Funnel narrowing process" },
  // Cycle (10 layouts)
  { id: "basic-cycle", name: "Basic Cycle", category: "Cycle", description: "Circular cycle with arrows" },
  { id: "text-cycle", name: "Text Cycle", category: "Cycle", description: "Text-focused circular cycle" },
  { id: "block-cycle", name: "Block Cycle", category: "Cycle", description: "Block-style cycle" },
  { id: "nondirectional-cycle", name: "Non-Directional Cycle", category: "Cycle", description: "Cycle without direction" },
  { id: "continuous-cycle", name: "Continuous Cycle", category: "Cycle", description: "Continuous flowing cycle" },
  { id: "segmented-cycle", name: "Segmented Cycle", category: "Cycle", description: "Pie-segmented cycle" },
  { id: "gear-cycle", name: "Gear Cycle", category: "Cycle", description: "Interlocking gear cycle" },
  { id: "radial-cycle", name: "Radial Cycle", category: "Cycle", description: "Center with radiating elements" },
  { id: "multidirectional-cycle", name: "Multi-Directional Cycle", category: "Cycle", description: "Arrows in multiple directions" },
  { id: "diverging-radial", name: "Diverging Radial", category: "Cycle", description: "Center diverging outward" },
  // Hierarchy (10 layouts)
  { id: "org-chart", name: "Organization Chart", category: "Hierarchy", description: "Standard org chart with photo placeholders" },
  { id: "hierarchy-tree", name: "Hierarchy Tree", category: "Hierarchy", description: "Top-down tree hierarchy" },
  { id: "horizontal-hierarchy", name: "Horizontal Hierarchy", category: "Hierarchy", description: "Left-to-right hierarchy" },
  { id: "labeled-hierarchy", name: "Labeled Hierarchy", category: "Hierarchy", description: "Hierarchy with labels" },
  { id: "table-hierarchy", name: "Table Hierarchy", category: "Hierarchy", description: "Table-styled hierarchy" },
  { id: "half-circle-org", name: "Half Circle Org Chart", category: "Hierarchy", description: "Semi-circular org chart" },
  { id: "horizontal-org", name: "Horizontal Org Chart", category: "Hierarchy", description: "Sideways org chart" },
  { id: "bracket-hierarchy", name: "Bracket Hierarchy", category: "Hierarchy", description: "Bracket-connected hierarchy" },
  { id: "lined-hierarchy", name: "Lined Hierarchy", category: "Hierarchy", description: "Line-connected nodes" },
  { id: "circle-hierarchy", name: "Circle Hierarchy", category: "Hierarchy", description: "Nested circle hierarchy" },
  // Relationship (10 layouts)
  { id: "basic-venn", name: "Basic Venn", category: "Relationship", description: "2-circle Venn diagram" },
  { id: "linear-venn", name: "Linear Venn", category: "Relationship", description: "Overlapping linear circles" },
  { id: "nested-target", name: "Nested Target", category: "Relationship", description: "Concentric circles target" },
  { id: "converging-arrows", name: "Converging Arrows", category: "Relationship", description: "Arrows converging to center" },
  { id: "diverging-arrows", name: "Diverging Arrows", category: "Relationship", description: "Arrows diverging from center" },
  { id: "balance", name: "Balance", category: "Relationship", description: "Balanced scale relationship" },
  { id: "funnel-relationship", name: "Funnel", category: "Relationship", description: "Funnel narrowing" },
  { id: "opposing-arrows", name: "Opposing Arrows", category: "Relationship", description: "Two opposing arrows" },
  { id: "arrow-ribbon", name: "Arrow Ribbon", category: "Relationship", description: "Ribbon-style arrows" },
  { id: "equation", name: "Equation", category: "Relationship", description: "A + B = C relationship" },
  // Matrix (8 layouts)
  { id: "basic-matrix", name: "Basic Matrix", category: "Matrix", description: "2x2 matrix grid" },
  { id: "titled-matrix", name: "Titled Matrix", category: "Matrix", description: "Matrix with titles" },
  { id: "grid-matrix", name: "Grid Matrix", category: "Matrix", description: "Detailed grid matrix" },
  { id: "l-shaped-matrix", name: "L-Shaped Matrix", category: "Matrix", description: "L-shaped layout" },
  { id: "cycle-matrix", name: "Cycle Matrix", category: "Matrix", description: "Circular matrix" },
  { id: "quadrant-matrix", name: "Quadrant Matrix", category: "Matrix", description: "Four-quadrant analysis" },
  { id: "swot-matrix", name: "SWOT Analysis", category: "Matrix", description: "Strengths, Weaknesses, Opportunities, Threats" },
  { id: "priority-matrix", name: "Priority Matrix", category: "Matrix", description: "Urgency vs Importance" },
  // Pyramid (8 layouts)
  { id: "basic-pyramid", name: "Basic Pyramid", category: "Pyramid", description: "Standard pyramid" },
  { id: "inverted-pyramid", name: "Inverted Pyramid", category: "Pyramid", description: "Upside-down pyramid" },
  { id: "segmented-pyramid", name: "Segmented Pyramid", category: "Pyramid", description: "Separated segments" },
  { id: "pyramid-list", name: "Pyramid List", category: "Pyramid", description: "Pyramid with side descriptions" },
  { id: "stacked-pyramid", name: "Stacked Pyramid", category: "Pyramid", description: "3D stacked pyramid" },
  { id: "triangle-cluster", name: "Triangle Cluster", category: "Pyramid", description: "Clustered triangles" },
  { id: "layered-pyramid", name: "Layered Pyramid", category: "Pyramid", description: "Layered pyramid with depth" },
  { id: "funnel-pyramid", name: "Funnel Pyramid", category: "Pyramid", description: "Funnel narrowing pyramid" },
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

// ---------- INFOGRAPHIC/DIAGRAM TYPES ----------

const DIAGRAM_TYPES = [
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
];

const COLOR_THEMES = [
  { name: "Blue", primary: "#4472C4", secondary: "#5B9BD5", accent: "#2F5496", bg: "#D6E4F0", text: "#fff" },
  { name: "Green", primary: "#70AD47", secondary: "#A9D18E", accent: "#375623", bg: "#E2EFDA", text: "#fff" },
  { name: "Orange", primary: "#ED7D31", secondary: "#F4B183", accent: "#C55A11", bg: "#FBE5D6", text: "#fff" },
  { name: "Red", primary: "#FF4444", secondary: "#FF8888", accent: "#CC0000", bg: "#FFE0E0", text: "#fff" },
  { name: "Purple", primary: "#7030A0", secondary: "#B97DD0", accent: "#4A1D70", bg: "#E2D1F0", text: "#fff" },
  { name: "Teal", primary: "#00B0F0", secondary: "#9DC3E6", accent: "#005070", bg: "#DEECF9", text: "#fff" },
  { name: "Gold", primary: "#FFC000", secondary: "#FFD966", accent: "#BF9000", bg: "#FFF2CC", text: "#000" },
  { name: "Dark", primary: "#44546A", secondary: "#8497B0", accent: "#222A35", bg: "#D5D8DC", text: "#fff" },
];

interface NodeItem {
  id: string;
  text: string;
  children?: NodeItem[];
}

function generateId() {
  return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ---------- SVG GENERATORS ----------

function generateSmartArtSVG(layout: SmartArtLayout, nodes: NodeItem[], theme: typeof COLOR_THEMES[0]): string {
  const w = 700, h = 400;
  const cat = layout.category;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  svg += `<rect fill="#fafafa" width="${w}" height="${h}" rx="8"/>`;

  if (cat === "List") {
    const itemW = Math.min(150, (w - 40) / nodes.length - 10);
    nodes.forEach((node, i) => {
      const x = 20 + i * (itemW + 10);
      svg += `<rect x="${x}" y="80" width="${itemW}" height="240" rx="8" fill="${i % 2 === 0 ? theme.primary : theme.secondary}"/>`;
      svg += `<text x="${x + itemW / 2}" y="200" fill="${theme.text}" font-size="13" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
    });
  } else if (cat === "Process") {
    const stepW = Math.min(140, (w - 60) / nodes.length - 20);
    nodes.forEach((node, i) => {
      const x = 30 + i * (stepW + 30);
      if (layout.id === "chevron-list") {
        svg += `<polygon points="${x},120 ${x + stepW - 15},120 ${x + stepW},200 ${x + stepW - 15},280 ${x},280 ${x + 15},200" fill="${theme.primary}" opacity="${0.7 + i * 0.1}"/>`;
      } else {
        svg += `<rect x="${x}" y="120" width="${stepW}" height="160" rx="8" fill="${theme.primary}" opacity="${0.7 + i * 0.1}"/>`;
      }
      svg += `<text x="${x + stepW / 2}" y="206" fill="${theme.text}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      if (i < nodes.length - 1) {
        svg += `<polygon points="${x + stepW + 5},190 ${x + stepW + 20},200 ${x + stepW + 5},210" fill="${theme.accent}"/>`;
      }
    });
  } else if (cat === "Cycle") {
    const cx = w / 2, cy = h / 2, r = 140;
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      const nx = cx + r * Math.cos(angle);
      const ny = cy + r * Math.sin(angle);
      svg += `<circle cx="${nx}" cy="${ny}" r="45" fill="${i % 2 === 0 ? theme.primary : theme.secondary}"/>`;
      svg += `<text x="${nx}" y="${ny + 4}" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      // Arrow to next
      const nextAngle = (2 * Math.PI * ((i + 1) % nodes.length)) / nodes.length - Math.PI / 2;
      const mx = cx + (r - 50) * Math.cos((angle + nextAngle) / 2);
      const my = cy + (r - 50) * Math.sin((angle + nextAngle) / 2);
      svg += `<circle cx="${mx}" cy="${my}" r="4" fill="${theme.accent}"/>`;
    });
  } else if (cat === "Hierarchy") {
    // Tree layout
    const drawHierNode = (node: NodeItem, x: number, y: number, levelW: number, depth: number) => {
      const nw = 100, nh = 40;
      const fill = depth === 0 ? theme.accent : depth === 1 ? theme.primary : theme.secondary;
      if (layout.id === "org-chart") {
        // Photo placeholder
        svg += `<rect x="${x - nw / 2}" y="${y}" width="${nw}" height="${nh + 20}" rx="6" fill="${fill}"/>`;
        svg += `<circle cx="${x}" cy="${y + 15}" r="10" fill="${theme.bg}"/>`;
        svg += `<text x="${x}" y="${y + nh + 10}" fill="${theme.text}" font-size="10" font-family="Arial" text-anchor="middle">${escSvg(node.text)}</text>`;
      } else {
        svg += `<rect x="${x - nw / 2}" y="${y}" width="${nw}" height="${nh}" rx="6" fill="${fill}"/>`;
        svg += `<text x="${x}" y="${y + nh / 2 + 4}" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      }
      if (node.children && node.children.length > 0) {
        const childSpacing = levelW / node.children.length;
        const startX = x - levelW / 2 + childSpacing / 2;
        node.children.forEach((child, ci) => {
          const cx2 = startX + ci * childSpacing;
          const cy2 = y + (layout.id === "org-chart" ? 80 : 60);
          svg += `<line x1="${x}" y1="${y + (layout.id === "org-chart" ? nh + 20 : nh)}" x2="${cx2}" y2="${cy2}" stroke="${theme.accent}" stroke-width="2"/>`;
          drawHierNode(child, cx2, cy2, childSpacing, depth + 1);
        });
      }
    };
    if (nodes.length > 0) drawHierNode(nodes[0], w / 2, 30, w - 80, 0);
  } else if (cat === "Relationship") {
    if (layout.id.includes("venn")) {
      const count = Math.min(nodes.length, 5);
      const offsets = count <= 2 ? [{ x: -60, y: 0 }, { x: 60, y: 0 }] :
        count === 3 ? [{ x: -60, y: -30 }, { x: 60, y: -30 }, { x: 0, y: 50 }] :
        [{ x: -70, y: -40 }, { x: 70, y: -40 }, { x: -70, y: 40 }, { x: 70, y: 40 }];
      nodes.slice(0, count).forEach((node, i) => {
        const off = offsets[i] || { x: 0, y: 0 };
        svg += `<circle cx="${w / 2 + off.x}" cy="${h / 2 + off.y}" r="90" fill="${theme.primary}" opacity="0.35"/>`;
        svg += `<text x="${w / 2 + off.x}" y="${h / 2 + off.y + 4}" fill="${theme.accent}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
      });
    } else {
      // Generic relationship with center
      svg += `<circle cx="${w / 2}" cy="${h / 2}" r="50" fill="${theme.primary}"/>`;
      svg += `<text x="${w / 2}" y="${h / 2 + 4}" fill="${theme.text}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(nodes[0]?.text || "Center")}</text>`;
      nodes.slice(1).forEach((node, i) => {
        const angle = (2 * Math.PI * i) / (nodes.length - 1) - Math.PI / 2;
        const nx = w / 2 + 150 * Math.cos(angle);
        const ny = h / 2 + 130 * Math.sin(angle);
        svg += `<line x1="${w / 2}" y1="${h / 2}" x2="${nx}" y2="${ny}" stroke="${theme.accent}" stroke-width="2" marker-end="url(#arrowhead)"/>`;
        svg += `<rect x="${nx - 50}" y="${ny - 20}" width="100" height="40" rx="6" fill="${theme.secondary}"/>`;
        svg += `<text x="${nx}" y="${ny + 4}" fill="${theme.text}" font-size="11" font-family="Arial" text-anchor="middle">${escSvg(node.text)}</text>`;
      });
      svg += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${theme.accent}"/></marker></defs>`;
    }
  } else if (cat === "Matrix") {
    // 2x2 matrix
    const items = nodes.slice(0, 4);
    const mw = 280, mh = 160;
    const sx = (w - mw * 2 - 20) / 2;
    items.forEach((node, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = sx + col * (mw + 10);
      const y = 40 + row * (mh + 10);
      const fills = [theme.primary, theme.secondary, theme.accent, theme.primary];
      svg += `<rect x="${x}" y="${y}" width="${mw}" height="${mh}" rx="8" fill="${fills[i]}" opacity="0.85"/>`;
      svg += `<text x="${x + mw / 2}" y="${y + mh / 2 + 5}" fill="${theme.text}" font-size="14" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
    });
  } else if (cat === "Pyramid") {
    const levels = nodes.length;
    nodes.forEach((node, i) => {
      const topRatio = i / levels;
      const bottomRatio = (i + 1) / levels;
      const topLeft = w / 2 - (w * 0.4) * topRatio;
      const topRight = w / 2 + (w * 0.4) * topRatio;
      const bottomLeft = w / 2 - (w * 0.4) * bottomRatio;
      const bottomRight = w / 2 + (w * 0.4) * bottomRatio;
      const yTop = 20 + i * ((h - 40) / levels);
      const yBottom = 20 + (i + 1) * ((h - 40) / levels);
      svg += `<polygon points="${topLeft},${yTop} ${topRight},${yTop} ${bottomRight},${yBottom} ${bottomLeft},${yBottom}" fill="${theme.primary}" opacity="${1 - i * 0.12}"/>`;
      svg += `<text x="${w / 2}" y="${(yTop + yBottom) / 2 + 4}" fill="${theme.text}" font-size="12" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
    });
  } else if (cat === "Picture") {
    const itemW = Math.min(140, (w - 40) / nodes.length - 10);
    nodes.forEach((node, i) => {
      const x = 20 + i * (itemW + 10);
      svg += `<rect x="${x}" y="60" width="${itemW}" height="${itemW}" rx="8" fill="${theme.bg}" stroke="${theme.primary}" stroke-width="2"/>`;
      svg += `<circle cx="${x + itemW / 2}" cy="${60 + itemW / 2 - 10}" r="25" fill="${theme.secondary}"/>`;
      svg += `<text x="${x + itemW / 2}" y="${60 + itemW / 2 - 6}" fill="${theme.text}" font-size="9" font-family="Arial" text-anchor="middle">Photo</text>`;
      svg += `<text x="${x + itemW / 2}" y="${60 + itemW + 20}" fill="${theme.accent}" font-size="11" font-family="Arial" text-anchor="middle" font-weight="bold">${escSvg(node.text)}</text>`;
    });
  }

  svg += `</svg>`;
  return svg;
}

function generateDiagramSVG(type: string, nodes: NodeItem[], theme: typeof COLOR_THEMES[0]): string {
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
      // Time axis
      for (let i = 0; i <= 10; i++) {
        const x = startX + (i / 10) * chartW;
        svg += `<line x1="${x}" y1="35" x2="${x}" y2="${h - 10}" stroke="#ddd" stroke-width="0.5"/>`;
        svg += `<text x="${x}" y="48" fill="${theme.accent}" font-size="9" font-family="Arial" text-anchor="middle">W${i + 1}</text>`;
      }
      nodes.forEach((node, i) => {
        const y = 55 + i * (barH + 8);
        const barStart = (i * 0.12) * chartW;
        const barWidth = Math.max(80, (0.3 + Math.random() * 0.3) * chartW);
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
        const barW = maxBarW * (0.4 + Math.random() * 0.6);
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
  }

  svg += `</svg>`;
  return svg;
}

function escSvg(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ---------- MAIN MODAL ----------

export function SmartArtInfographicsModal() {
  const { showSmartArtModal, setShowSmartArtModal } = useDocumentStore();
  const [activeCategory, setActiveCategory] = useState("List");
  const [activeTab, setActiveTab] = useState<"smartart" | "diagrams">("smartart");
  const [selectedLayout, setSelectedLayout] = useState<SmartArtLayout | null>(null);
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState(COLOR_THEMES[0]);
  const [nodes, setNodes] = useState<NodeItem[]>([
    { id: generateId(), text: "Item 1", children: [{ id: generateId(), text: "Sub 1" }, { id: generateId(), text: "Sub 2" }] },
    { id: generateId(), text: "Item 2" },
    { id: generateId(), text: "Item 3" },
  ]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const addNode = useCallback(() => {
    setNodes(prev => [...prev, { id: generateId(), text: `Item ${prev.length + 1}` }]);
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  }, []);

  const updateNodeText = useCallback((id: string, text: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  }, []);

  const addChild = useCallback((parentId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === parentId) {
        const children = n.children || [];
        return { ...n, children: [...children, { id: generateId(), text: `Sub ${children.length + 1}` }] };
      }
      return n;
    }));
  }, []);

  const removeChild = useCallback((parentId: string, childId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === parentId && n.children) {
        return { ...n, children: n.children.filter(c => c.id !== childId) };
      }
      return n;
    }));
  }, []);

  const updateChildText = useCallback((parentId: string, childId: string, text: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === parentId && n.children) {
        return { ...n, children: n.children.map(c => c.id === childId ? { ...c, text } : c) };
      }
      return n;
    }));
  }, []);

  const insertIntoDocument = useCallback(() => {
    let svgStr: string;
    if (activeTab === "smartart" && selectedLayout) {
      svgStr = generateSmartArtSVG(selectedLayout, nodes, colorTheme);
    } else if (activeTab === "diagrams" && selectedDiagram) {
      svgStr = generateDiagramSVG(selectedDiagram, nodes, colorTheme);
    } else {
      return;
    }

    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    editor.focus();

    const b64 = btoa(unescape(encodeURIComponent(svgStr)));
    const imgTag = `<div class="smartart-container" style="margin:16px 0;text-align:center;" contenteditable="false"><img src="data:image/svg+xml;base64,${b64}" style="max-width:100%;height:auto;cursor:pointer;" data-smartart="true" /></div><p></p>`;
    document.execCommand("insertHTML", false, imgTag);
    setShowSmartArtModal(false);
  }, [activeTab, selectedLayout, selectedDiagram, nodes, colorTheme, setShowSmartArtModal]);

  if (!showSmartArtModal) return null;

  const filteredLayouts = SMARTART_LAYOUTS.filter(l => l.category === activeCategory);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setShowSmartArtModal(false)}>
      <div className="bg-white rounded-xl shadow-2xl flex flex-col" style={{ width: 900, height: 620, backgroundColor: "var(--card)" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>SmartArt & Infographics</h2>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 text-[11px] rounded-md font-medium ${activeTab === "smartart" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
              style={activeTab !== "smartart" ? { color: "var(--foreground)" } : undefined}
              onClick={() => setActiveTab("smartart")}>
              SmartArt
            </button>
            <button
              className={`px-3 py-1 text-[11px] rounded-md font-medium ${activeTab === "diagrams" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
              style={activeTab !== "diagrams" ? { color: "var(--foreground)" } : undefined}
              onClick={() => setActiveTab("diagrams")}>
              Diagrams & Infographics
            </button>
            <button onClick={() => setShowSmartArtModal(false)} className="p-1 rounded hover:bg-gray-100">
              <X size={16} style={{ color: "var(--foreground)" }} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - categories/types */}
          <div className="w-48 border-r overflow-y-auto flex-shrink-0 p-2" style={{ borderColor: "var(--border)" }}>
            {activeTab === "smartart" ? (
              <>
                <div className="text-[10px] font-medium px-2 py-1 mb-1" style={{ color: "var(--muted-foreground)" }}>Categories</div>
                {SMARTART_CATEGORIES.map(cat => (
                  <button key={cat}
                    className={`w-full text-left text-[11px] px-3 py-1.5 rounded mb-0.5 ${activeCategory === cat ? "bg-blue-50 font-medium" : "hover:bg-gray-50"}`}
                    style={{ color: activeCategory === cat ? "#2563EB" : "var(--foreground)" }}
                    onClick={() => { setActiveCategory(cat); setSelectedLayout(null); }}>
                    {cat} ({SMARTART_LAYOUTS.filter(l => l.category === cat).length})
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="text-[10px] font-medium px-2 py-1 mb-1" style={{ color: "var(--muted-foreground)" }}>Diagram Types</div>
                {DIAGRAM_TYPES.map(dt => (
                  <button key={dt.id}
                    className={`w-full text-left text-[11px] px-3 py-2 rounded mb-0.5 ${selectedDiagram === dt.id ? "bg-blue-50 font-medium" : "hover:bg-gray-50"}`}
                    style={{ color: selectedDiagram === dt.id ? "#2563EB" : "var(--foreground)" }}
                    onClick={() => setSelectedDiagram(dt.id)}>
                    <div className="font-medium">{dt.name}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{dt.description}</div>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Middle panel - layout selection (SmartArt) or preview */}
          {activeTab === "smartart" ? (
            <div className="w-56 border-r overflow-y-auto p-2" style={{ borderColor: "var(--border)" }}>
              <div className="text-[10px] font-medium px-2 py-1 mb-1" style={{ color: "var(--muted-foreground)" }}>
                {activeCategory} Layouts ({filteredLayouts.length})
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {filteredLayouts.map(layout => (
                  <button key={layout.id}
                    className={`p-1.5 rounded border text-center cursor-pointer ${selectedLayout?.id === layout.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                    style={{ borderColor: "var(--border)" }}
                    onClick={() => setSelectedLayout(layout)}>
                    <div className="w-full h-12 rounded bg-gray-100 flex items-center justify-center mb-1">
                      <Network size={16} style={{ color: colorTheme.primary }} />
                    </div>
                    <span className="text-[8px] block truncate" style={{ color: "var(--foreground)" }}>{layout.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Right panel - node editor + preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Preview */}
            <div className="flex-1 overflow-auto p-3 bg-gray-50" style={{ minHeight: 200 }}>
              {(activeTab === "smartart" && selectedLayout) || (activeTab === "diagrams" && selectedDiagram) ? (
                <div className="flex items-center justify-center h-full" dangerouslySetInnerHTML={{
                  __html: activeTab === "smartart" && selectedLayout
                    ? generateSmartArtSVG(selectedLayout, nodes, colorTheme)
                    : selectedDiagram
                    ? generateDiagramSVG(selectedDiagram, nodes, colorTheme)
                    : ""
                }} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Select a {activeTab === "smartart" ? "layout" : "diagram type"} to preview
                </div>
              )}
            </div>

            {/* Node editor */}
            <div className="border-t p-3 overflow-y-auto" style={{ borderColor: "var(--border)", maxHeight: 200 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium" style={{ color: "var(--foreground)" }}>Edit Content</span>
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <button className="flex items-center gap-1 px-2 py-1 text-[10px] rounded border hover:bg-gray-50"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      onClick={() => setShowColorPicker(!showColorPicker)}>
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colorTheme.primary }} />
                      Theme
                    </button>
                    {showColorPicker && (
                      <div className="absolute right-0 top-full mt-1 z-50 rounded border p-2 shadow-lg w-36"
                        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                        {COLOR_THEMES.map(ct => (
                          <button key={ct.name} className="flex items-center gap-2 w-full px-2 py-1 text-[10px] rounded hover:bg-gray-50"
                            style={{ color: "var(--foreground)" }}
                            onClick={() => { setColorTheme(ct); setShowColorPicker(false); }}>
                            <div className="flex gap-0.5">
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ct.primary }} />
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ct.secondary }} />
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ct.accent }} />
                            </div>
                            {ct.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={addNode} className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-blue-600 text-white hover:bg-blue-700">
                    <Plus size={10} /> Add
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {nodes.map((node, i) => (
                  <div key={node.id}>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] w-4 text-center" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
                      <input
                        type="text"
                        value={node.text}
                        onChange={e => updateNodeText(node.id, e.target.value)}
                        className="flex-1 text-[11px] border rounded px-2 py-1"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
                      />
                      <button onClick={() => addChild(node.id)} className="p-1 rounded hover:bg-gray-100" title="Add child">
                        <Plus size={12} style={{ color: "var(--primary)" }} />
                      </button>
                      {nodes.length > 1 && (
                        <button onClick={() => removeNode(node.id)} className="p-1 rounded hover:bg-red-50" title="Remove">
                          <Trash2 size={12} style={{ color: "#EF4444" }} />
                        </button>
                      )}
                    </div>
                    {node.children && node.children.map(child => (
                      <div key={child.id} className="flex items-center gap-1 ml-6 mt-0.5">
                        <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>└</span>
                        <input
                          type="text"
                          value={child.text}
                          onChange={e => updateChildText(node.id, child.id, e.target.value)}
                          className="flex-1 text-[10px] border rounded px-2 py-0.5"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
                        />
                        <button onClick={() => removeChild(node.id, child.id)} className="p-0.5 rounded hover:bg-red-50">
                          <Trash2 size={10} style={{ color: "#EF4444" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button className="px-4 py-1.5 text-[11px] rounded-md border hover:bg-gray-50"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            onClick={() => setShowSmartArtModal(false)}>
            Cancel
          </button>
          <button
            className="px-4 py-1.5 text-[11px] rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={activeTab === "smartart" ? !selectedLayout : !selectedDiagram}
            onClick={insertIntoDocument}>
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
