'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  GitBranch,
  ArrowRightCircle,
  RefreshCw,
  Network,
  Circle,
  Diamond,
  Layers,
  Share2,
  Workflow,
  Server,
} from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

type SmartArtType = 'org-chart' | 'process-flow' | 'cycle' | 'hierarchy' | 'venn'
  | 'mind-map' | 'timeline' | 'swot' | 'fishbone' | 'gantt'
  | 'pyramid' | 'matrix' | 'flowchart' | 'funnel' | 'radial'
  | 'list-blocks' | 'picture-list' | 'infographic-bar' | 'infographic-pie'
  | 'process-detailed' | 'org-chart-detailed' | 'decision-tree'
  | 'swimlane' | 'data-flow' | 'network-topology' | 'bpmn';

interface SmartArtOption {
  type: SmartArtType;
  label: string;
  icon: React.ReactNode;
  description: string;
  category: string;
}

interface TextOverlay {
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
}

const SMARTART_CATEGORIES = ['List', 'Process', 'Cycle', 'Hierarchy', 'Relationship', 'Matrix', 'Pyramid', 'Picture', 'Diagrams', 'Infographics', 'Flowcharts', 'Network'];

const SMART_ART_OPTIONS: SmartArtOption[] = [
  // List
  { type: 'list-blocks', label: 'Block List', icon: <Network size={20} />, description: 'Horizontal block list', category: 'List' },
  { type: 'picture-list', label: 'Picture List', icon: <Circle size={20} />, description: 'Pictures with descriptions', category: 'Picture' },
  // Process
  { type: 'process-flow', label: 'Basic Process', icon: <ArrowRightCircle size={20} />, description: 'Sequential steps with arrows', category: 'Process' },
  { type: 'funnel', label: 'Funnel', icon: <GitBranch size={20} />, description: 'Funnel narrowing process', category: 'Process' },
  // Cycle
  { type: 'cycle', label: 'Basic Cycle', icon: <RefreshCw size={20} />, description: 'Circular process or lifecycle', category: 'Cycle' },
  { type: 'radial', label: 'Radial Cycle', icon: <Circle size={20} />, description: 'Center with radiating elements', category: 'Cycle' },
  // Hierarchy
  { type: 'hierarchy', label: 'Hierarchy Tree', icon: <GitBranch size={20} />, description: 'Top-down tree structure', category: 'Hierarchy' },
  { type: 'org-chart', label: 'Org Chart', icon: <Network size={20} />, description: 'Organization chart with photos', category: 'Hierarchy' },
  { type: 'org-chart-detailed', label: 'Detailed Org Chart', icon: <Layers size={20} />, description: 'Org chart with photos, titles, departments', category: 'Hierarchy' },
  // Relationship
  { type: 'venn', label: 'Venn Diagram', icon: <Circle size={20} />, description: '2-5 overlapping circles', category: 'Relationship' },
  // Matrix
  { type: 'matrix', label: 'Matrix / SWOT', icon: <Network size={20} />, description: '2x2 matrix grid', category: 'Matrix' },
  { type: 'swot', label: 'SWOT Analysis', icon: <Network size={20} />, description: 'Strengths, Weaknesses, Opportunities, Threats', category: 'Matrix' },
  // Pyramid
  { type: 'pyramid', label: 'Pyramid', icon: <GitBranch size={20} />, description: 'Layered pyramid', category: 'Pyramid' },
  // Diagrams
  { type: 'mind-map', label: 'Mind Map', icon: <Network size={20} />, description: 'Central node with branches', category: 'Diagrams' },
  { type: 'timeline', label: 'Timeline', icon: <ArrowRightCircle size={20} />, description: 'Horizontal timeline with events', category: 'Diagrams' },
  { type: 'fishbone', label: 'Fishbone / Ishikawa', icon: <GitBranch size={20} />, description: 'Cause and effect diagram', category: 'Diagrams' },
  { type: 'gantt', label: 'Gantt Chart', icon: <Network size={20} />, description: 'Project schedule Gantt chart', category: 'Diagrams' },
  // Infographics
  { type: 'infographic-bar', label: 'Bar Infographic', icon: <Network size={20} />, description: 'Data visualization bar style', category: 'Infographics' },
  { type: 'infographic-pie', label: 'Pie Infographic', icon: <Circle size={20} />, description: 'Data visualization pie style', category: 'Infographics' },
  // Flowcharts
  { type: 'flowchart', label: 'Flowchart', icon: <Network size={20} />, description: 'Visio-like flowchart with decisions', category: 'Flowcharts' },
  { type: 'process-detailed', label: 'Detailed Process', icon: <Workflow size={20} />, description: 'Process flow with sub-steps', category: 'Flowcharts' },
  { type: 'decision-tree', label: 'Decision Tree', icon: <Diamond size={20} />, description: 'Yes/No branching decisions', category: 'Flowcharts' },
  { type: 'swimlane', label: 'Swimlane Diagram', icon: <Layers size={20} />, description: 'Horizontal lanes with process steps', category: 'Flowcharts' },
  { type: 'bpmn', label: 'BPMN Diagram', icon: <Share2 size={20} />, description: 'Business process with events & gateways', category: 'Flowcharts' },
  // Network
  { type: 'data-flow', label: 'Data Flow Diagram', icon: <Share2 size={20} />, description: 'DFD with stores, processes, entities', category: 'Network' },
  { type: 'network-topology', label: 'Network Topology', icon: <Server size={20} />, description: 'Star/ring/mesh network diagram', category: 'Network' },
];

interface NodeData {
  id: string;
  label: string;
}

function esc(t: string) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function getTextOverlays(type: SmartArtType, nodes: NodeData[], containerW: number, containerH: number): TextOverlay[] {
  const overlays: TextOverlay[] = [];
  const svgW = 600, svgH = 350;
  const scaleX = containerW / svgW;
  const scaleY = containerH / svgH;

  const mapX = (x: number) => x * scaleX;
  const mapY = (y: number) => y * scaleY;
  const mapW = (w: number) => w * scaleX;
  const mapH = (h: number) => h * scaleY;

  switch (type) {
    case 'org-chart': {
      overlays.push({ nodeId: nodes[0]?.id || '1', x: mapX(225), y: mapY(38), width: mapW(150), height: mapH(28), fontSize: 13 * scaleY, color: 'white' });
      for (let i = 0; i < 3; i++) {
        const cx = 100 + i * 200;
        if (nodes[i + 1]) overlays.push({ nodeId: nodes[i + 1].id, x: mapX(cx - 75), y: mapY(158), width: mapW(150), height: mapH(24), fontSize: 11 * scaleY, color: 'white' });
      }
      break;
    }
    case 'process-flow': {
      const steps = nodes.length > 0 ? nodes : [{ id: '1', label: 'Step 1' }, { id: '2', label: 'Step 2' }, { id: '3', label: 'Step 3' }, { id: '4', label: 'Step 4' }];
      const n = Math.min(steps.length, 5), sw = 100, gap = 25;
      const totalW = n * sw + (n - 1) * gap, sx = (svgW - totalW) / 2;
      for (let i = 0; i < n; i++) {
        const x = sx + i * (sw + gap);
        overlays.push({ nodeId: steps[i].id, x: mapX(x), y: mapY(85), width: mapW(sw), height: mapH(30), fontSize: 12 * scaleY, color: 'white' });
      }
      break;
    }
    case 'flowchart': {
      const items = nodes.length > 0 ? nodes : [{ id: '1', label: 'Start' }, { id: '2', label: 'Process' }, { id: '3', label: 'Decision?' }, { id: '4', label: 'End' }];
      for (let i = 0; i < Math.min(items.length, 6); i++) {
        const x = 80 + (i % 3) * 200, y = 40 + Math.floor(i / 3) * 150;
        overlays.push({ nodeId: items[i].id, x: mapX(x - 60), y: mapY(y + 10), width: mapW(120), height: mapH(30), fontSize: 11 * scaleY, color: 'white' });
      }
      break;
    }
    case 'cycle': {
      const items = nodes.length > 0 ? nodes : [{ id: '1', label: 'Plan' }, { id: '2', label: 'Do' }, { id: '3', label: 'Check' }, { id: '4', label: 'Act' }];
      const count = Math.min(items.length, 6), cx = 300, cy = 175, r = 120;
      for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        const ix = cx + r * Math.cos(angle), iy = cy + r * Math.sin(angle);
        overlays.push({ nodeId: items[i].id, x: mapX(ix - 35), y: mapY(iy - 8), width: mapW(70), height: mapH(20), fontSize: 10 * scaleY, color: 'white' });
      }
      break;
    }
    case 'radial': {
      overlays.push({ nodeId: nodes[0]?.id || '1', x: mapX(250), y: mapY(162), width: mapW(100), height: mapH(22), fontSize: 12 * scaleY, color: 'white' });
      nodes.slice(1).forEach((nd, i) => {
        const angle = (2 * Math.PI * i) / (nodes.length - 1) - Math.PI / 2;
        const nx = 300 + 130 * Math.cos(angle), ny = 175 + 110 * Math.sin(angle);
        overlays.push({ nodeId: nd.id, x: mapX(nx - 30), y: mapY(ny - 8), width: mapW(60), height: mapH(20), fontSize: 10 * scaleY, color: 'white' });
      });
      break;
    }
    case 'hierarchy': {
      overlays.push({ nodeId: nodes[0]?.id || '1', x: mapX(225), y: mapY(32), width: mapW(150), height: mapH(28), fontSize: 14 * scaleY, color: 'white' });
      for (let i = 0; i < 2; i++) {
        const cx = 150 + i * 300;
        if (nodes[i + 1]) overlays.push({ nodeId: nodes[i + 1].id, x: mapX(cx - 75), y: mapY(142), width: mapW(150), height: mapH(24), fontSize: 12 * scaleY, color: 'white' });
      }
      break;
    }
    case 'venn': {
      const count = Math.min(Math.max(nodes.length, 2), 5);
      const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7'];
      const dist = count <= 3 ? 70 : 55, radius = count <= 3 ? 100 : 80;
      for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        const lx = svgW / 2 + (dist + radius * 0.5) * Math.cos(angle);
        const ly = svgH / 2 + (dist + radius * 0.5) * Math.sin(angle);
        overlays.push({ nodeId: nodes[i]?.id || String(i), x: mapX(lx - 40), y: mapY(ly - 8), width: mapW(80), height: mapH(20), fontSize: 12 * scaleY, color: colors[i % 5] });
      }
      break;
    }
    case 'mind-map': {
      overlays.push({ nodeId: nodes[0]?.id || '1', x: mapX(svgW / 2 - 80), y: mapY(svgH / 2 - 8), width: mapW(160), height: mapH(22), fontSize: 13 * scaleY, color: 'white' });
      nodes.slice(1).forEach((nd, i) => {
        const angle = (Math.PI * 2 * i) / (nodes.length - 1) - Math.PI / 2;
        const bx = svgW / 2 + 180 * Math.cos(angle), by = svgH / 2 + 120 * Math.sin(angle);
        overlays.push({ nodeId: nd.id, x: mapX(bx - 60), y: mapY(by - 8), width: mapW(120), height: mapH(20), fontSize: 10 * scaleY, color: 'white' });
      });
      break;
    }
    case 'timeline': {
      nodes.forEach((nd, i) => {
        const x = 60 + i * ((svgW - 120) / Math.max(nodes.length - 1, 1));
        const above = i % 2 === 0;
        const ty = above ? svgH / 2 - 50 : svgH / 2 + 60;
        overlays.push({ nodeId: nd.id, x: mapX(x - 45), y: mapY(ty - 8), width: mapW(90), height: mapH(20), fontSize: 10 * scaleY, color: 'white' });
      });
      break;
    }
    case 'swot': {
      for (let i = 0; i < 4; i++) {
        const col = i % 2, row = Math.floor(i / 2);
        const x = 20 + col * 290, y = 10 + row * 170;
        if (nodes[i]) overlays.push({ nodeId: nodes[i].id, x: mapX(x + 30), y: mapY(y + 70), width: mapW(210), height: mapH(40), fontSize: 11 * scaleY, color: 'white' });
      }
      break;
    }
    case 'matrix': {
      nodes.slice(0, 4).forEach((nd, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = 30 + col * 280, y = 15 + row * 165;
        overlays.push({ nodeId: nd.id, x: mapX(x + 20), y: mapY(y + 62), width: mapW(220), height: mapH(30), fontSize: 13 * scaleY, color: 'white' });
      });
      break;
    }
    case 'pyramid': {
      const levels = nodes.length;
      nodes.forEach((nd, i) => {
        const yT = 15 + i * ((svgH - 30) / levels), yB = 15 + (i + 1) * ((svgH - 30) / levels);
        overlays.push({ nodeId: nd.id, x: mapX(svgW / 2 - 60), y: mapY((yT + yB) / 2 - 8), width: mapW(120), height: mapH(20), fontSize: 12 * scaleY, color: 'white' });
      });
      break;
    }
    case 'fishbone': {
      overlays.push({ nodeId: nodes[0]?.id || '1', x: mapX(svgW - 120), y: mapY(svgH / 2 - 28), width: mapW(80), height: mapH(18), fontSize: 13 * scaleY, color: '#2563eb' });
      nodes.slice(1).forEach((nd, i) => {
        const x = 90 + i * ((svgW - 180) / Math.max(nodes.length - 1, 1));
        const above = i % 2 === 0, endY = above ? svgH / 2 - 90 : svgH / 2 + 90;
        overlays.push({ nodeId: nd.id, x: mapX(x), y: mapY(endY + (above ? -18 : 2)), width: mapW(80), height: mapH(18), fontSize: 10 * scaleY, color: '#2563eb' });
      });
      break;
    }
    case 'gantt': {
      nodes.forEach((nd, i) => {
        const y = 50 + i * 35;
        overlays.push({ nodeId: nd.id, x: mapX(10), y: mapY(y + 4), width: mapW(100), height: mapH(20), fontSize: 9 * scaleY, color: '#2563eb' });
      });
      break;
    }
    case 'funnel': {
      nodes.forEach((nd, i) => {
        const yT = 20 + i * ((svgH - 40) / nodes.length), yB = 20 + (i + 1) * ((svgH - 40) / nodes.length);
        overlays.push({ nodeId: nd.id, x: mapX(svgW / 2 - 60), y: mapY((yT + yB) / 2 - 8), width: mapW(120), height: mapH(20), fontSize: 12 * scaleY, color: 'white' });
      });
      break;
    }
    case 'list-blocks': {
      const bw = Math.min(130, (svgW - 40) / nodes.length - 8);
      nodes.forEach((nd, i) => {
        const x = 20 + i * (bw + 8);
        overlays.push({ nodeId: nd.id, x: mapX(x), y: mapY(165), width: mapW(bw), height: mapH(24), fontSize: 12 * scaleY, color: 'white' });
      });
      break;
    }
    case 'picture-list': {
      const bw = Math.min(130, (svgW - 40) / nodes.length - 8);
      nodes.forEach((nd, i) => {
        const x = 20 + i * (bw + 8);
        overlays.push({ nodeId: nd.id, x: mapX(x), y: mapY(50 + bw + 2), width: mapW(bw), height: mapH(18), fontSize: 10 * scaleY, color: '#2563eb' });
      });
      break;
    }
    case 'infographic-bar': {
      nodes.forEach((nd, i) => {
        const y = 45 + i * 50;
        overlays.push({ nodeId: nd.id, x: mapX(5), y: mapY(y + 4), width: mapW(130), height: mapH(22), fontSize: 11 * scaleY, color: '#2563eb' });
      });
      break;
    }
    case 'infographic-pie': {
      const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
      let startAngle = -Math.PI / 2;
      nodes.forEach((nd, i) => {
        const portion = 1 / nodes.length, endAngle = startAngle + portion * 2 * Math.PI;
        const mid = (startAngle + endAngle) / 2;
        const cx = svgW / 2, cy = svgH / 2, r = 120;
        const tx = cx + (r + 25) * Math.cos(mid), ty = cy + (r + 25) * Math.sin(mid);
        overlays.push({ nodeId: nd.id, x: mapX(tx - 35), y: mapY(ty - 6), width: mapW(70), height: mapH(16), fontSize: 10 * scaleY, color: colors[i % 6] });
        startAngle = endAngle;
      });
      break;
    }
    case 'process-detailed': {
      const steps = nodes.length > 0 ? nodes : [{ id: '1', label: 'Phase 1' }, { id: '2', label: 'Phase 2' }, { id: '3', label: 'Phase 3' }];
      const n = Math.min(steps.length, 4), sw = 120, gap = 20;
      const totalW = n * sw + (n - 1) * gap, sx = (svgW - totalW) / 2;
      for (let i = 0; i < n; i++) {
        const x = sx + i * (sw + gap);
        overlays.push({ nodeId: steps[i].id, x: mapX(x + 5), y: mapY(50), width: mapW(sw - 10), height: mapH(22), fontSize: 11 * scaleY, color: 'white' });
      }
      break;
    }
    case 'org-chart-detailed': {
      overlays.push({ nodeId: nodes[0]?.id || '1', x: mapX(210), y: mapY(20), width: mapW(180), height: mapH(22), fontSize: 12 * scaleY, color: 'white' });
      for (let i = 1; i <= 3; i++) {
        const cx = 100 + (i - 1) * 200;
        if (nodes[i]) overlays.push({ nodeId: nodes[i].id, x: mapX(cx - 75), y: mapY(138), width: mapW(150), height: mapH(20), fontSize: 10 * scaleY, color: 'white' });
      }
      break;
    }
    case 'decision-tree': {
      const items = nodes.length > 0 ? nodes : [{ id: '1', label: 'Start' }, { id: '2', label: 'Yes Path' }, { id: '3', label: 'No Path' }];
      overlays.push({ nodeId: items[0]?.id || '1', x: mapX(230), y: mapY(22), width: mapW(140), height: mapH(24), fontSize: 12 * scaleY, color: 'white' });
      if (items[1]) overlays.push({ nodeId: items[1].id, x: mapX(60), y: mapY(195), width: mapW(140), height: mapH(24), fontSize: 11 * scaleY, color: 'white' });
      if (items[2]) overlays.push({ nodeId: items[2].id, x: mapX(400), y: mapY(195), width: mapW(140), height: mapH(24), fontSize: 11 * scaleY, color: 'white' });
      for (let i = 3; i < Math.min(items.length, 7); i++) {
        const col = (i - 3) % 4;
        const x = 40 + col * 140;
        overlays.push({ nodeId: items[i].id, x: mapX(x), y: mapY(285), width: mapW(120), height: mapH(20), fontSize: 10 * scaleY, color: 'white' });
      }
      break;
    }
    case 'swimlane': {
      nodes.forEach((nd, i) => {
        const laneH = (svgH - 40) / Math.max(nodes.length, 1);
        const y = 40 + i * laneH;
        overlays.push({ nodeId: nd.id, x: mapX(5), y: mapY(y + laneH / 2 - 8), width: mapW(70), height: mapH(18), fontSize: 9 * scaleY, color: '#1e3a5f' });
      });
      break;
    }
    case 'data-flow': {
      overlays.push({ nodeId: nodes[0]?.id || '1', x: mapX(245), y: mapY(15), width: mapW(110), height: mapH(20), fontSize: 11 * scaleY, color: 'white' });
      if (nodes[1]) overlays.push({ nodeId: nodes[1].id, x: mapX(245), y: mapY(148), width: mapW(110), height: mapH(20), fontSize: 11 * scaleY, color: 'white' });
      if (nodes[2]) overlays.push({ nodeId: nodes[2].id, x: mapX(20), y: mapY(148), width: mapW(110), height: mapH(20), fontSize: 10 * scaleY, color: '#1e3a5f' });
      if (nodes[3]) overlays.push({ nodeId: nodes[3].id, x: mapX(470), y: mapY(148), width: mapW(110), height: mapH(20), fontSize: 10 * scaleY, color: '#1e3a5f' });
      for (let i = 4; i < nodes.length; i++) {
        overlays.push({ nodeId: nodes[i].id, x: mapX(200 + (i - 4) * 120), y: mapY(280), width: mapW(100), height: mapH(18), fontSize: 9 * scaleY, color: '#2563eb' });
      }
      break;
    }
    case 'network-topology': {
      overlays.push({ nodeId: nodes[0]?.id || '1', x: mapX(260), y: mapY(162), width: mapW(80), height: mapH(20), fontSize: 11 * scaleY, color: 'white' });
      nodes.slice(1).forEach((nd, i) => {
        const angle = (2 * Math.PI * i) / (nodes.length - 1) - Math.PI / 2;
        const nx = 300 + 130 * Math.cos(angle), ny = 175 + 110 * Math.sin(angle);
        overlays.push({ nodeId: nd.id, x: mapX(nx - 35), y: mapY(ny - 8), width: mapW(70), height: mapH(18), fontSize: 9 * scaleY, color: 'white' });
      });
      break;
    }
    case 'bpmn': {
      const items = nodes.length > 0 ? nodes : [{ id: '1', label: 'Start Event' }, { id: '2', label: 'Task 1' }, { id: '3', label: 'Gateway' }, { id: '4', label: 'End Event' }];
      for (let i = 0; i < Math.min(items.length, 6); i++) {
        const x = 50 + i * 100;
        overlays.push({ nodeId: items[i].id, x: mapX(x - 30), y: mapY(200), width: mapW(80), height: mapH(18), fontSize: 9 * scaleY, color: '#2563eb' });
      }
      break;
    }
    default:
      break;
  }
  return overlays;
}

function getDefaultNodes(type: SmartArtType): NodeData[] {
  switch (type) {
    case 'org-chart':
      return [{ id: '1', label: 'CEO' }, { id: '2', label: 'Manager A' }, { id: '3', label: 'Manager B' }, { id: '4', label: 'Manager C' }];
    case 'process-flow':
      return [{ id: '1', label: 'Step 1' }, { id: '2', label: 'Step 2' }, { id: '3', label: 'Step 3' }, { id: '4', label: 'Step 4' }];
    case 'cycle':
      return [{ id: '1', label: 'Plan' }, { id: '2', label: 'Do' }, { id: '3', label: 'Check' }, { id: '4', label: 'Act' }];
    case 'hierarchy':
      return [{ id: '1', label: 'Root' }, { id: '2', label: 'Branch A' }, { id: '3', label: 'Branch B' }];
    case 'venn':
      return [{ id: '1', label: 'Set A' }, { id: '2', label: 'Set B' }, { id: '3', label: 'Set C' }];
    case 'mind-map':
      return [{ id: '1', label: 'Central Idea' }, { id: '2', label: 'Topic 1' }, { id: '3', label: 'Topic 2' }, { id: '4', label: 'Topic 3' }];
    case 'timeline':
      return [{ id: '1', label: 'Q1' }, { id: '2', label: 'Q2' }, { id: '3', label: 'Q3' }, { id: '4', label: 'Q4' }];
    case 'swot':
      return [{ id: '1', label: 'Strengths' }, { id: '2', label: 'Weaknesses' }, { id: '3', label: 'Opportunities' }, { id: '4', label: 'Threats' }];
    case 'matrix':
      return [{ id: '1', label: 'Quadrant 1' }, { id: '2', label: 'Quadrant 2' }, { id: '3', label: 'Quadrant 3' }, { id: '4', label: 'Quadrant 4' }];
    case 'pyramid':
      return [{ id: '1', label: 'Top' }, { id: '2', label: 'Middle' }, { id: '3', label: 'Base' }];
    case 'fishbone':
      return [{ id: '1', label: 'Effect' }, { id: '2', label: 'Cause 1' }, { id: '3', label: 'Cause 2' }, { id: '4', label: 'Cause 3' }];
    case 'gantt':
      return [{ id: '1', label: 'Task 1' }, { id: '2', label: 'Task 2' }, { id: '3', label: 'Task 3' }, { id: '4', label: 'Task 4' }];
    case 'funnel':
      return [{ id: '1', label: 'Awareness' }, { id: '2', label: 'Interest' }, { id: '3', label: 'Decision' }, { id: '4', label: 'Action' }];
    case 'radial':
      return [{ id: '1', label: 'Center' }, { id: '2', label: 'Spoke 1' }, { id: '3', label: 'Spoke 2' }, { id: '4', label: 'Spoke 3' }];
    case 'list-blocks':
      return [{ id: '1', label: 'Block 1' }, { id: '2', label: 'Block 2' }, { id: '3', label: 'Block 3' }];
    case 'picture-list':
      return [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }, { id: '3', label: 'Item 3' }];
    case 'infographic-bar':
      return [{ id: '1', label: 'Category A' }, { id: '2', label: 'Category B' }, { id: '3', label: 'Category C' }];
    case 'infographic-pie':
      return [{ id: '1', label: 'Slice A' }, { id: '2', label: 'Slice B' }, { id: '3', label: 'Slice C' }];
    case 'flowchart':
      return [{ id: '1', label: 'Start' }, { id: '2', label: 'Process' }, { id: '3', label: 'Decision?' }, { id: '4', label: 'End' }];
    case 'process-detailed':
      return [{ id: '1', label: 'Phase 1: Plan' }, { id: '2', label: 'Phase 2: Design' }, { id: '3', label: 'Phase 3: Build' }, { id: '4', label: 'Phase 4: Test' }];
    case 'org-chart-detailed':
      return [{ id: '1', label: 'CEO - John Smith' }, { id: '2', label: 'VP Engineering' }, { id: '3', label: 'VP Marketing' }, { id: '4', label: 'VP Sales' }];
    case 'decision-tree':
      return [{ id: '1', label: 'Decision Point' }, { id: '2', label: 'Yes: Proceed' }, { id: '3', label: 'No: Reconsider' }, { id: '4', label: 'Outcome A' }, { id: '5', label: 'Outcome B' }];
    case 'swimlane':
      return [{ id: '1', label: 'Marketing' }, { id: '2', label: 'Engineering' }, { id: '3', label: 'QA' }];
    case 'data-flow':
      return [{ id: '1', label: 'User Input' }, { id: '2', label: 'Process Data' }, { id: '3', label: 'Database' }, { id: '4', label: 'External API' }, { id: '5', label: 'Output Report' }];
    case 'network-topology':
      return [{ id: '1', label: 'Server' }, { id: '2', label: 'Client 1' }, { id: '3', label: 'Client 2' }, { id: '4', label: 'Client 3' }, { id: '5', label: 'Router' }];
    case 'bpmn':
      return [{ id: '1', label: 'Start Event' }, { id: '2', label: 'Review Task' }, { id: '3', label: 'Approve?' }, { id: '4', label: 'Process Order' }, { id: '5', label: 'End Event' }];
    default:
      return [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }, { id: '3', label: 'Item 3' }];
  }
}

function generateSmartArtSVG(type: SmartArtType, nodes: NodeData[]): string {
  const w = 600, h = 350;
  const p = '#3b82f6', s = '#60a5fa', a = '#2563eb', bg = '#dbeafe';

  switch (type) {
    case 'org-chart': {
      const top = esc(nodes[0]?.label || 'CEO');
      const childLabels = [nodes[1]?.label || 'Manager A', nodes[2]?.label || 'Manager B', nodes[3]?.label || 'Manager C'].map(esc);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
        <rect x="225" y="20" width="150" height="50" rx="8" fill="${p}"/>
        <circle cx="300" cy="32" r="8" fill="${bg}" opacity="0.5"/>
        <text x="300" y="56" text-anchor="middle" fill="white" font-size="13" font-weight="bold">${top}</text>
        <line x1="300" y1="70" x2="300" y2="110" stroke="#94a3b8" stroke-width="2"/>
        <line x1="100" y1="110" x2="500" y2="110" stroke="#94a3b8" stroke-width="2"/>
        ${childLabels.map((label, i) => {
          const cx = 100 + i * 200;
          return `<line x1="${cx}" y1="110" x2="${cx}" y2="140" stroke="#94a3b8" stroke-width="2"/>
          <rect x="${cx - 75}" y="140" width="150" height="50" rx="8" fill="${s}"/>
          <circle cx="${cx}" cy="152" r="6" fill="${bg}" opacity="0.5"/>
          <text x="${cx}" y="174" text-anchor="middle" fill="white" font-size="11">${label}</text>
          <line x1="${cx}" y1="190" x2="${cx}" y2="220" stroke="#94a3b8" stroke-width="1.5"/>
          <rect x="${cx - 55}" y="220" width="110" height="35" rx="6" fill="#93c5fd"/>
          <text x="${cx}" y="242" text-anchor="middle" fill="#1e3a5f" font-size="10">Team ${i + 1}</text>`;
        }).join('')}
      </svg>`;
    }
    case 'process-flow': {
      const steps = nodes.length > 0 ? nodes : [{id:'1',label:'Step 1'},{id:'2',label:'Step 2'},{id:'3',label:'Step 3'},{id:'4',label:'Step 4'}];
      const n = Math.min(steps.length, 5), sw = 100, gap = 25;
      const totalW = n * sw + (n - 1) * gap, sx = (w - totalW) / 2;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 200">
        ${steps.slice(0, n).map((st, i) => {
          const x = sx + i * (sw + gap);
          const arrow = i < n - 1 ? `<polygon points="${x+sw+3},100 ${x+sw+gap-3},90 ${x+sw+gap-3},110" fill="${p}"/>` : '';
          return `<rect x="${x}" y="60" width="${sw}" height="80" rx="10" fill="${p}" opacity="${0.7+i*0.08}"/>
          <text x="${x+sw/2}" y="105" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${esc(st.label)}</text>${arrow}`;
        }).join('')}
      </svg>`;
    }
    case 'flowchart': {
      const items = nodes.length > 0 ? nodes : [{id:'1',label:'Start'},{id:'2',label:'Process'},{id:'3',label:'Decision?'},{id:'4',label:'End'}];
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
        <defs><marker id="arrowF" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${a}"/></marker></defs>
        ${items.slice(0, 6).map((nd, i) => {
          const x = 80 + (i % 3) * 200, y = 40 + Math.floor(i / 3) * 150;
          const isEnd = i === 0 || i === items.length - 1;
          const isDec = i % 3 === 2 && i > 0;
          let shape = '';
          if (isEnd) shape = `<rect x="${x-60}" y="${y}" width="120" height="50" rx="25" fill="${a}"/>`;
          else if (isDec) shape = `<polygon points="${x},${y-5} ${x+65},${y+25} ${x},${y+55} ${x-65},${y+25}" fill="${p}"/>`;
          else shape = `<rect x="${x-60}" y="${y}" width="120" height="50" rx="4" fill="${p}"/>`;
          const ty = isDec ? y + 29 : y + 29;
          shape += `<text x="${x}" y="${ty}" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${esc(nd.label)}</text>`;
          if (i < items.length - 1 && i % 3 < 2) shape += `<line x1="${x+60}" y1="${y+25}" x2="${x+140}" y2="${y+25}" stroke="${a}" stroke-width="2" marker-end="url(#arrowF)"/>`;
          return shape;
        }).join('')}
      </svg>`;
    }
    case 'cycle': {
      const items = nodes.length > 0 ? nodes : [{id:'1',label:'Plan'},{id:'2',label:'Do'},{id:'3',label:'Check'},{id:'4',label:'Act'}];
      const count = Math.min(items.length, 6), cx = 300, cy = 175, r = 120;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
        <circle cx="${cx}" cy="${cy}" r="40" fill="${p}" opacity="0.15"/>
        <text x="${cx}" y="${cy+5}" text-anchor="middle" fill="${p}" font-size="11" font-weight="bold">Cycle</text>
        ${items.slice(0, count).map((item, i) => {
          const angle = (2*Math.PI*i)/count - Math.PI/2;
          const ix = cx + r*Math.cos(angle), iy = cy + r*Math.sin(angle);
          return `<circle cx="${ix}" cy="${iy}" r="35" fill="${p}" stroke="${a}" stroke-width="2"/>
          <text x="${ix}" y="${iy+4}" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${esc(item.label)}</text>`;
        }).join('')}
      </svg>`;
    }
    case 'radial': {
      const cx = 300, cy = 175;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
        <circle cx="${cx}" cy="${cy}" r="50" fill="${p}"/>
        <text x="${cx}" y="${cy+5}" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${esc(nodes[0]?.label || 'Center')}</text>
        ${nodes.slice(1).map((nd, i) => {
          const angle = (2*Math.PI*i)/(nodes.length-1) - Math.PI/2;
          const nx = cx + 130*Math.cos(angle), ny = cy + 110*Math.sin(angle);
          return `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${s}" stroke-width="2"/>
          <circle cx="${nx}" cy="${ny}" r="30" fill="${s}"/>
          <text x="${nx}" y="${ny+4}" text-anchor="middle" fill="white" font-size="10">${esc(nd.label)}</text>`;
        }).join('')}
      </svg>`;
    }
    case 'hierarchy': {
      const root = esc(nodes[0]?.label || 'Root');
      const level1 = [nodes[1]?.label || 'Branch A', nodes[2]?.label || 'Branch B'].map(esc);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
        <rect x="225" y="20" width="150" height="50" rx="8" fill="#7c3aed"/>
        <text x="300" y="50" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${root}</text>
        <line x1="300" y1="70" x2="300" y2="100" stroke="#94a3b8" stroke-width="2"/>
        <line x1="150" y1="100" x2="450" y2="100" stroke="#94a3b8" stroke-width="2"/>
        ${level1.map((label, i) => {
          const cx = 150 + i * 300;
          return `<line x1="${cx}" y1="100" x2="${cx}" y2="130" stroke="#94a3b8" stroke-width="2"/>
          <rect x="${cx-75}" y="130" width="150" height="45" rx="8" fill="#8b5cf6"/>
          <text x="${cx}" y="157" text-anchor="middle" fill="white" font-size="12">${label}</text>
          <line x1="${cx-50}" y1="175" x2="${cx-50}" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
          <line x1="${cx+50}" y1="175" x2="${cx+50}" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
          <rect x="${cx-95}" y="210" width="90" height="35" rx="6" fill="#a78bfa"/>
          <text x="${cx-50}" y="232" text-anchor="middle" fill="white" font-size="10">Item ${i*2+1}</text>
          <rect x="${cx+5}" y="210" width="90" height="35" rx="6" fill="#a78bfa"/>
          <text x="${cx+50}" y="232" text-anchor="middle" fill="white" font-size="10">Item ${i*2+2}</text>`;
        }).join('')}
      </svg>`;
    }
    case 'venn': {
      const count = Math.min(Math.max(nodes.length, 2), 5);
      const labels = nodes.map(n => esc(n.label));
      const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7'];
      const dist = count <= 3 ? 70 : 55, radius = count <= 3 ? 100 : 80;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
        ${nodes.slice(0, count).map((_, i) => {
          const angle = (2*Math.PI*i)/count - Math.PI/2;
          const cx = w/2 + dist*Math.cos(angle), cy = h/2 + dist*Math.sin(angle);
          const lx = w/2 + (dist + radius*0.5)*Math.cos(angle);
          const ly = h/2 + (dist + radius*0.5)*Math.sin(angle);
          return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${colors[i%5]}" opacity="0.3" stroke="${colors[i%5]}" stroke-width="2"/>
          <text x="${lx}" y="${ly+4}" text-anchor="middle" fill="${colors[i%5]}" font-size="12" font-weight="bold">${labels[i] || 'Set '+(i+1)}</text>`;
        }).join('')}
      </svg>`;
    }
    case 'mind-map': {
      const cx = w/2, cy = h/2;
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<ellipse cx="${cx}" cy="${cy}" rx="80" ry="30" fill="${p}"/>`;
      svg += `<text x="${cx}" y="${cy+5}" text-anchor="middle" fill="white" font-size="13" font-weight="bold">${esc(nodes[0]?.label || 'Central Idea')}</text>`;
      nodes.slice(1).forEach((nd, i) => {
        const angle = (Math.PI*2*i)/(nodes.length-1) - Math.PI/2;
        const bx = cx + 180*Math.cos(angle), by = cy + 120*Math.sin(angle);
        svg += `<path d="M${cx},${cy} Q${cx+90*Math.cos(angle)},${cy+60*Math.sin(angle)} ${bx},${by}" stroke="${p}" stroke-width="3" fill="none"/>`;
        svg += `<ellipse cx="${bx}" cy="${by}" rx="60" ry="22" fill="${s}"/>`;
        svg += `<text x="${bx}" y="${by+4}" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${esc(nd.label)}</text>`;
      });
      return svg + '</svg>';
    }
    case 'timeline': {
      const lineY = h/2;
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<line x1="30" y1="${lineY}" x2="${w-30}" y2="${lineY}" stroke="${p}" stroke-width="3"/>`;
      nodes.forEach((nd, i) => {
        const x = 60 + i * ((w-120)/Math.max(nodes.length-1, 1));
        const above = i % 2 === 0;
        const ty = above ? lineY - 50 : lineY + 60;
        svg += `<circle cx="${x}" cy="${lineY}" r="8" fill="${p}" stroke="${bg}" stroke-width="2"/>`;
        svg += `<line x1="${x}" y1="${lineY+(above?-8:8)}" x2="${x}" y2="${ty+(above?12:-12)}" stroke="${s}" stroke-width="1.5"/>`;
        svg += `<rect x="${x-45}" y="${ty-12}" width="90" height="28" rx="4" fill="${above?p:s}"/>`;
        svg += `<text x="${x}" y="${ty+5}" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${esc(nd.label)}</text>`;
      });
      return svg + '</svg>';
    }
    case 'swot': {
      const labels = ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'];
      const fills = [p, '#ef4444', '#22c55e', '#f59e0b'];
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      for (let i = 0; i < 4; i++) {
        const col = i%2, row = Math.floor(i/2);
        const x = 20 + col*290, y = 10 + row*170;
        svg += `<rect x="${x}" y="${y}" width="270" height="160" rx="8" fill="${fills[i]}" opacity="0.85"/>`;
        svg += `<text x="${x+135}" y="${y+30}" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${labels[i]}</text>`;
        svg += `<text x="${x+135}" y="${y+95}" text-anchor="middle" fill="white" font-size="11">${esc(nodes[i]?.label || 'Add items...')}</text>`;
      }
      return svg + '</svg>';
    }
    case 'matrix': {
      const fills = [p, s, a, '#7c3aed'];
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      nodes.slice(0, 4).forEach((nd, i) => {
        const col = i%2, row = Math.floor(i/2);
        const x = 30 + col*280, y = 15 + row*165;
        svg += `<rect x="${x}" y="${y}" width="260" height="155" rx="8" fill="${fills[i]}" opacity="0.85"/>`;
        svg += `<text x="${x+130}" y="${y+82}" text-anchor="middle" fill="white" font-size="13" font-weight="bold">${esc(nd.label)}</text>`;
      });
      return svg + '</svg>';
    }
    case 'pyramid': {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      const levels = nodes.length;
      nodes.forEach((nd, i) => {
        const tR = i/levels, bR = (i+1)/levels;
        const tL = w/2 - w*0.38*tR, tRi = w/2 + w*0.38*tR;
        const bL = w/2 - w*0.38*bR, bRi = w/2 + w*0.38*bR;
        const yT = 15 + i*((h-30)/levels), yB = 15 + (i+1)*((h-30)/levels);
        svg += `<polygon points="${tL},${yT} ${tRi},${yT} ${bRi},${yB} ${bL},${yB}" fill="${p}" opacity="${1-i*0.12}"/>`;
        svg += `<text x="${w/2}" y="${(yT+yB)/2+4}" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${esc(nd.label)}</text>`;
      });
      return svg + '</svg>';
    }
    case 'fishbone': {
      const spineY = h/2;
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="ahFB" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${a}"/></marker></defs>`;
      svg += `<line x1="50" y1="${spineY}" x2="${w-50}" y2="${spineY}" stroke="${p}" stroke-width="3" marker-end="url(#ahFB)"/>`;
      svg += `<text x="${w-40}" y="${spineY-12}" text-anchor="end" fill="${a}" font-size="13" font-weight="bold">${esc(nodes[0]?.label || 'Effect')}</text>`;
      nodes.slice(1).forEach((nd, i) => {
        const x = 90 + i*((w-180)/Math.max(nodes.length-1,1));
        const above = i%2===0, endY = above ? spineY-90 : spineY+90;
        svg += `<line x1="${x}" y1="${spineY}" x2="${x+30}" y2="${endY}" stroke="${s}" stroke-width="2"/>`;
        svg += `<text x="${x+30}" y="${endY+(above?-5:15)}" text-anchor="middle" fill="${a}" font-size="10" font-weight="bold">${esc(nd.label)}</text>`;
      });
      return svg + '</svg>';
    }
    case 'gantt': {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      const startX = 120, chartW = w - startX - 20;
      svg += `<text x="${startX+chartW/2}" y="22" fill="${a}" font-size="13" text-anchor="middle" font-weight="bold">Gantt Chart</text>`;
      for (let i = 0; i <= 8; i++) {
        const x = startX + (i/8)*chartW;
        svg += `<line x1="${x}" y1="30" x2="${x}" y2="${h-10}" stroke="#eee" stroke-width="0.5"/>`;
        svg += `<text x="${x}" y="42" fill="${a}" font-size="8" text-anchor="middle">W${i+1}</text>`;
      }
      nodes.forEach((nd, i) => {
        const y = 50 + i*35;
        const barStart = (i*0.1)*chartW;
        const barW = Math.max(60, (0.25+i*0.08)*chartW);
        svg += `<text x="${startX-8}" y="${y+18}" text-anchor="end" fill="${a}" font-size="9">${esc(nd.label)}</text>`;
        svg += `<rect x="${startX+barStart}" y="${y}" width="${barW}" height="25" rx="4" fill="${p}" opacity="${0.7+i*0.06}"/>`;
      });
      return svg + '</svg>';
    }
    case 'funnel': {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      nodes.forEach((nd, i) => {
        const topW = w*0.8 - i*(w*0.8/nodes.length)*0.7;
        const botW = w*0.8 - (i+1)*(w*0.8/nodes.length)*0.7;
        const yT = 20 + i*((h-40)/nodes.length), yB = 20 + (i+1)*((h-40)/nodes.length);
        svg += `<polygon points="${w/2-topW/2},${yT} ${w/2+topW/2},${yT} ${w/2+botW/2},${yB} ${w/2-botW/2},${yB}" fill="${p}" opacity="${1-i*0.15}"/>`;
        svg += `<text x="${w/2}" y="${(yT+yB)/2+4}" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${esc(nd.label)}</text>`;
      });
      return svg + '</svg>';
    }
    case 'list-blocks': {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      const bw = Math.min(130, (w-40)/nodes.length - 8);
      nodes.forEach((nd, i) => {
        const x = 20 + i*(bw+8);
        svg += `<rect x="${x}" y="60" width="${bw}" height="230" rx="8" fill="${i%2===0?p:s}"/>`;
        svg += `<text x="${x+bw/2}" y="180" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${esc(nd.label)}</text>`;
      });
      return svg + '</svg>';
    }
    case 'picture-list': {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      const bw = Math.min(130, (w-40)/nodes.length - 8);
      nodes.forEach((nd, i) => {
        const x = 20 + i*(bw+8);
        svg += `<rect x="${x}" y="40" width="${bw}" height="${bw}" rx="8" fill="${bg}" stroke="${p}" stroke-width="2"/>`;
        svg += `<circle cx="${x+bw/2}" cy="${40+bw/2-10}" r="20" fill="${s}"/>`;
        svg += `<text x="${x+bw/2}" y="${40+bw/2-6}" text-anchor="middle" fill="white" font-size="8">Photo</text>`;
        svg += `<text x="${x+bw/2}" y="${50+bw+8}" text-anchor="middle" fill="${a}" font-size="10" font-weight="bold">${esc(nd.label)}</text>`;
      });
      return svg + '</svg>';
    }
    case 'infographic-bar': {
      const maxW = w - 180;
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<text x="${w/2}" y="25" text-anchor="middle" fill="${a}" font-size="15" font-weight="bold">Data Overview</text>`;
      nodes.forEach((nd, i) => {
        const y = 45 + i*50;
        const bw = maxW*(0.4 + i*0.12);
        svg += `<text x="15" y="${y+18}" fill="${a}" font-size="11" font-weight="bold">${esc(nd.label)}</text>`;
        svg += `<rect x="140" y="${y}" width="${bw}" height="28" rx="14" fill="${p}" opacity="${0.7+i*0.06}"/>`;
        svg += `<text x="${140+bw-10}" y="${y+18}" text-anchor="end" fill="white" font-size="10" font-weight="bold">${Math.round(bw/maxW*100)}%</text>`;
      });
      return svg + '</svg>';
    }
    case 'infographic-pie': {
      const cx = w/2, cy = h/2, r = 120;
      let startAngle = -Math.PI/2;
      const colors = [p, '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      nodes.forEach((nd, i) => {
        const portion = 1/nodes.length, endAngle = startAngle + portion*2*Math.PI;
        const x1 = cx+r*Math.cos(startAngle), y1 = cy+r*Math.sin(startAngle);
        const x2 = cx+r*Math.cos(endAngle), y2 = cy+r*Math.sin(endAngle);
        svg += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${portion>0.5?1:0},1 ${x2},${y2} Z" fill="${colors[i%6]}" stroke="#fff" stroke-width="2"/>`;
        const mid = (startAngle+endAngle)/2;
        svg += `<text x="${cx+(r+25)*Math.cos(mid)}" y="${cy+(r+25)*Math.sin(mid)+4}" text-anchor="middle" fill="${colors[i%6]}" font-size="10" font-weight="bold">${esc(nd.label)}</text>`;
        startAngle = endAngle;
      });
      return svg + '</svg>';
    }
    case 'process-detailed': {
      const steps = nodes.length > 0 ? nodes : [{id:'1',label:'Phase 1: Plan'},{id:'2',label:'Phase 2: Design'},{id:'3',label:'Phase 3: Build'},{id:'4',label:'Phase 4: Test'}];
      const n = Math.min(steps.length, 4), sw = 120, gap = 20;
      const totalW = n * sw + (n - 1) * gap, sx = (w - totalW) / 2;
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="arrowPD" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${a}"/></marker></defs>`;
      steps.slice(0, n).forEach((st, i) => {
        const x = sx + i * (sw + gap);
        svg += `<rect x="${x}" y="30" width="${sw}" height="50" rx="8" fill="${p}"/>`;
        svg += `<text x="${x+sw/2}" y="60" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${esc(st.label)}</text>`;
        // Sub-steps
        svg += `<rect x="${x+5}" y="90" width="${sw-10}" height="22" rx="4" fill="${bg}" stroke="${s}" stroke-width="1"/>`;
        svg += `<text x="${x+sw/2}" y="105" text-anchor="middle" fill="${a}" font-size="8">Sub-step 1</text>`;
        svg += `<rect x="${x+5}" y="118" width="${sw-10}" height="22" rx="4" fill="${bg}" stroke="${s}" stroke-width="1"/>`;
        svg += `<text x="${x+sw/2}" y="133" text-anchor="middle" fill="${a}" font-size="8">Sub-step 2</text>`;
        svg += `<rect x="${x+5}" y="146" width="${sw-10}" height="22" rx="4" fill="${bg}" stroke="${s}" stroke-width="1"/>`;
        svg += `<text x="${x+sw/2}" y="161" text-anchor="middle" fill="${a}" font-size="8">Sub-step 3</text>`;
        if (i < n - 1) {
          svg += `<line x1="${x+sw}" y1="55" x2="${x+sw+gap}" y2="55" stroke="${a}" stroke-width="2" marker-end="url(#arrowPD)"/>`;
        }
      });
      // Progress bar at bottom
      svg += `<rect x="${sx}" y="${h-50}" width="${totalW}" height="8" rx="4" fill="#e2e8f0"/>`;
      svg += `<rect x="${sx}" y="${h-50}" width="${totalW*0.6}" height="8" rx="4" fill="${p}"/>`;
      svg += `<text x="${sx+totalW/2}" y="${h-28}" text-anchor="middle" fill="${a}" font-size="10">Progress: 60%</text>`;
      return svg + '</svg>';
    }
    case 'org-chart-detailed': {
      const top = esc(nodes[0]?.label || 'CEO - John Smith');
      const childLabels = [nodes[1]?.label || 'VP Engineering', nodes[2]?.label || 'VP Marketing', nodes[3]?.label || 'VP Sales'].map(esc);
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      // Top card with photo placeholder
      svg += `<rect x="200" y="10" width="200" height="70" rx="10" fill="${p}" stroke="${a}" stroke-width="2"/>`;
      svg += `<circle cx="235" cy="45" r="20" fill="${bg}" stroke="white" stroke-width="2"/>`;
      svg += `<text x="235" y="49" text-anchor="middle" fill="${a}" font-size="8" font-weight="bold">CEO</text>`;
      svg += `<text x="320" y="38" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${top}</text>`;
      svg += `<text x="320" y="55" text-anchor="middle" fill="${bg}" font-size="9">Executive Office</text>`;
      // Lines
      svg += `<line x1="300" y1="80" x2="300" y2="110" stroke="#94a3b8" stroke-width="2"/>`;
      svg += `<line x1="100" y1="110" x2="500" y2="110" stroke="#94a3b8" stroke-width="2"/>`;
      childLabels.forEach((label, i) => {
        const cx = 100 + i * 200;
        svg += `<line x1="${cx}" y1="110" x2="${cx}" y2="130" stroke="#94a3b8" stroke-width="2"/>`;
        svg += `<rect x="${cx-80}" y="130" width="160" height="65" rx="8" fill="${s}" stroke="${p}" stroke-width="1"/>`;
        svg += `<circle cx="${cx-45}" cy="155" r="14" fill="${bg}" stroke="white" stroke-width="1.5"/>`;
        svg += `<text x="${cx-45}" y="159" text-anchor="middle" fill="${a}" font-size="6">VP</text>`;
        svg += `<text x="${cx+15}" y="152" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${label}</text>`;
        svg += `<text x="${cx+15}" y="168" text-anchor="middle" fill="${bg}" font-size="8">Department ${i+1}</text>`;
        // Sub-reports
        svg += `<line x1="${cx}" y1="195" x2="${cx}" y2="220" stroke="#94a3b8" stroke-width="1"/>`;
        svg += `<rect x="${cx-50}" y="220" width="100" height="30" rx="5" fill="#93c5fd"/>`;
        svg += `<text x="${cx}" y="239" text-anchor="middle" fill="#1e3a5f" font-size="8">Team Lead</text>`;
        svg += `<line x1="${cx}" y1="250" x2="${cx}" y2="270" stroke="#94a3b8" stroke-width="0.8"/>`;
        svg += `<rect x="${cx-40}" y="270" width="80" height="22" rx="4" fill="#bfdbfe"/>`;
        svg += `<text x="${cx}" y="285" text-anchor="middle" fill="#1e3a5f" font-size="7">3 Members</text>`;
      });
      return svg + '</svg>';
    }
    case 'decision-tree': {
      const items = nodes.length > 0 ? nodes : [{id:'1',label:'Decision Point'},{id:'2',label:'Yes: Proceed'},{id:'3',label:'No: Reconsider'},{id:'4',label:'Outcome A'},{id:'5',label:'Outcome B'}];
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="arrowDT" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="${a}"/></marker></defs>`;
      // Root decision diamond
      svg += `<polygon points="300,15 380,50 300,85 220,50" fill="${p}" stroke="${a}" stroke-width="2"/>`;
      svg += `<text x="300" y="54" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${esc(items[0]?.label || 'Decision')}</text>`;
      // Yes branch (left)
      svg += `<line x1="220" y1="50" x2="130" y2="130" stroke="#22c55e" stroke-width="2" marker-end="url(#arrowDT)"/>`;
      svg += `<text x="165" y="80" fill="#22c55e" font-size="10" font-weight="bold">Yes</text>`;
      svg += `<rect x="${60}" y="130" width="140" height="45" rx="8" fill="#22c55e"/>`;
      svg += `<text x="130" y="157" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${esc(items[1]?.label || 'Yes Path')}</text>`;
      // No branch (right)
      svg += `<line x1="380" y1="50" x2="470" y2="130" stroke="#ef4444" stroke-width="2" marker-end="url(#arrowDT)"/>`;
      svg += `<text x="435" y="80" fill="#ef4444" font-size="10" font-weight="bold">No</text>`;
      svg += `<rect x="${400}" y="130" width="140" height="45" rx="8" fill="#ef4444"/>`;
      svg += `<text x="470" y="157" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${esc(items[2]?.label || 'No Path')}</text>`;
      // Leaf nodes
      const leaves = items.slice(3, 7);
      leaves.forEach((nd, i) => {
        const x = 40 + i * 140;
        svg += `<line x1="${i < 2 ? 130 : 470}" y1="175" x2="${x+60}" y2="260" stroke="${s}" stroke-width="1.5" marker-end="url(#arrowDT)"/>`;
        svg += `<rect x="${x}" y="260" width="120" height="35" rx="18" fill="${s}"/>`;
        svg += `<text x="${x+60}" y="282" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${esc(nd.label)}</text>`;
      });
      return svg + '</svg>';
    }
    case 'swimlane': {
      const lanes = nodes.length > 0 ? nodes : [{id:'1',label:'Marketing'},{id:'2',label:'Engineering'},{id:'3',label:'QA'}];
      const laneCount = Math.min(lanes.length, 5);
      const laneH = (h - 40) / laneCount;
      const laneColors = ['#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3', '#ede9fe'];
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="arrowSL" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="${a}"/></marker></defs>`;
      // Header
      svg += `<rect x="0" y="0" width="${w}" height="35" rx="0" fill="${p}"/>`;
      svg += `<text x="${w/2}" y="23" text-anchor="middle" fill="white" font-size="13" font-weight="bold">Swimlane Process</text>`;
      lanes.slice(0, laneCount).forEach((lane, i) => {
        const y = 40 + i * laneH;
        svg += `<rect x="0" y="${y}" width="${w}" height="${laneH}" fill="${laneColors[i % 5]}" opacity="0.4" stroke="#cbd5e1" stroke-width="1"/>`;
        svg += `<rect x="2" y="${y+2}" width="75" height="${laneH-4}" fill="${p}" opacity="0.15" rx="4"/>`;
        svg += `<text x="40" y="${y+laneH/2+4}" text-anchor="middle" fill="#1e3a5f" font-size="9" font-weight="bold">${esc(lane.label)}</text>`;
        // Process steps inside lane
        const stepCount = 3;
        for (let j = 0; j < stepCount; j++) {
          const sx = 100 + j * 160;
          svg += `<rect x="${sx}" y="${y+laneH/2-15}" width="110" height="30" rx="6" fill="${p}" opacity="${0.6+j*0.15}"/>`;
          svg += `<text x="${sx+55}" y="${y+laneH/2+4}" text-anchor="middle" fill="white" font-size="9">Step ${j+1}</text>`;
          if (j < stepCount - 1) {
            svg += `<line x1="${sx+110}" y1="${y+laneH/2}" x2="${sx+160}" y2="${y+laneH/2}" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowSL)"/>`;
          }
        }
      });
      return svg + '</svg>';
    }
    case 'data-flow': {
      const items = nodes.length > 0 ? nodes : [{id:'1',label:'User Input'},{id:'2',label:'Process Data'},{id:'3',label:'Database'},{id:'4',label:'External API'},{id:'5',label:'Output Report'}];
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="arrowDF" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="${a}"/></marker></defs>`;
      // External entity (rectangle with double border) - top
      svg += `<rect x="230" y="10" width="140" height="40" rx="0" fill="${p}" stroke="${a}" stroke-width="2"/>`;
      svg += `<rect x="233" y="13" width="134" height="34" rx="0" fill="none" stroke="white" stroke-width="0.5"/>`;
      svg += `<text x="300" y="35" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${esc(items[0]?.label || 'External Entity')}</text>`;
      // Arrow down to process
      svg += `<line x1="300" y1="50" x2="300" y2="100" stroke="${a}" stroke-width="2" marker-end="url(#arrowDF)"/>`;
      svg += `<text x="310" y="80" fill="${a}" font-size="8">data flow</text>`;
      // Process (circle) - center
      svg += `<circle cx="300" cy="150" r="45" fill="${p}" stroke="${a}" stroke-width="2"/>`;
      svg += `<text x="300" y="154" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${esc(items[1]?.label || 'Process')}</text>`;
      // Data store (open rectangle) - left
      svg += `<line x1="20" y1="130" x2="130" y2="130" stroke="${a}" stroke-width="2"/>`;
      svg += `<rect x="20" y="130" width="110" height="40" fill="${bg}" stroke="none"/>`;
      svg += `<line x1="20" y1="170" x2="130" y2="170" stroke="${a}" stroke-width="2"/>`;
      svg += `<text x="75" y="155" text-anchor="middle" fill="#1e3a5f" font-size="10" font-weight="bold">${esc(items[2]?.label || 'Data Store')}</text>`;
      svg += `<line x1="130" y1="150" x2="255" y2="150" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowDF)"/>`;
      // External entity - right
      svg += `<rect x="450" y="130" width="130" height="40" rx="0" fill="${s}" stroke="${a}" stroke-width="2"/>`;
      svg += `<rect x="453" y="133" width="124" height="34" rx="0" fill="none" stroke="white" stroke-width="0.5"/>`;
      svg += `<text x="515" y="155" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${esc(items[3]?.label || 'External')}</text>`;
      svg += `<line x1="345" y1="150" x2="450" y2="150" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowDF)"/>`;
      // Output data stores at bottom
      svg += `<line x1="300" y1="195" x2="300" y2="250" stroke="${a}" stroke-width="2" marker-end="url(#arrowDF)"/>`;
      items.slice(4).forEach((nd, i) => {
        const x = 200 + i * 120;
        svg += `<line x1="${x}" y1="260" x2="${x+100}" y2="260" stroke="${a}" stroke-width="1.5"/>`;
        svg += `<rect x="${x}" y="260" width="100" height="30" fill="${bg}" stroke="none"/>`;
        svg += `<line x1="${x}" y1="290" x2="${x+100}" y2="290" stroke="${a}" stroke-width="1.5"/>`;
        svg += `<text x="${x+50}" y="280" text-anchor="middle" fill="${a}" font-size="9" font-weight="bold">${esc(nd.label)}</text>`;
      });
      return svg + '</svg>';
    }
    case 'network-topology': {
      const items = nodes.length > 0 ? nodes : [{id:'1',label:'Server'},{id:'2',label:'Client 1'},{id:'3',label:'Client 2'},{id:'4',label:'Client 3'},{id:'5',label:'Router'}];
      const cx = 300, cy = 175;
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      // Central hub
      svg += `<rect x="${cx-40}" y="${cy-30}" width="80" height="60" rx="8" fill="${p}" stroke="${a}" stroke-width="2"/>`;
      svg += `<rect x="${cx-25}" y="${cy-20}" width="50" height="8" rx="2" fill="${bg}"/>`;
      svg += `<rect x="${cx-25}" y="${cy-8}" width="50" height="8" rx="2" fill="${bg}"/>`;
      svg += `<rect x="${cx-25}" y="${cy+4}" width="50" height="8" rx="2" fill="${bg}"/>`;
      svg += `<text x="${cx}" y="${cy+28}" text-anchor="middle" fill="white" font-size="11" font-weight="bold">${esc(items[0]?.label || 'Hub')}</text>`;
      // Peripheral nodes in star pattern
      items.slice(1).forEach((nd, i) => {
        const angle = (2 * Math.PI * i) / (items.length - 1) - Math.PI / 2;
        const nx = cx + 150 * Math.cos(angle), ny = cy + 120 * Math.sin(angle);
        // Connection line (dashed for some)
        svg += `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${s}" stroke-width="2" ${i % 2 === 0 ? 'stroke-dasharray="6,3"' : ''}/>`;
        // Node shape - alternate between monitor and circle
        if (i % 2 === 0) {
          svg += `<rect x="${nx-30}" y="${ny-20}" width="60" height="40" rx="6" fill="${s}" stroke="${p}" stroke-width="1.5"/>`;
          svg += `<rect x="${nx-20}" y="${ny-14}" width="40" height="22" rx="2" fill="#1e293b"/>`;
        } else {
          svg += `<circle cx="${nx}" cy="${ny}" r="25" fill="${s}" stroke="${p}" stroke-width="1.5"/>`;
        }
        svg += `<text x="${nx}" y="${ny+4}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">${esc(nd.label)}</text>`;
      });
      // Speed indicators on connections
      svg += `<text x="${cx+20}" y="${cy-35}" fill="${bg}" font-size="7">1 Gbps</text>`;
      return svg + '</svg>';
    }
    case 'bpmn': {
      const items = nodes.length > 0 ? nodes : [{id:'1',label:'Start Event'},{id:'2',label:'Review Task'},{id:'3',label:'Approve?'},{id:'4',label:'Process Order'},{id:'5',label:'End Event'}];
      const n = Math.min(items.length, 6);
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="arrowBP" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="${a}"/></marker></defs>`;
      // Pool header
      svg += `<rect x="10" y="10" width="${w-20}" height="30" rx="4" fill="${p}" opacity="0.2"/>`;
      svg += `<text x="${w/2}" y="30" text-anchor="middle" fill="${a}" font-size="11" font-weight="bold">Business Process</text>`;
      const baseY = 130;
      items.slice(0, n).forEach((nd, i) => {
        const x = 50 + i * 100;
        const isStart = i === 0;
        const isEnd = i === n - 1;
        const isGateway = nd.label.includes('?') || i === Math.floor(n / 2);
        if (isStart) {
          // Start event - thin circle
          svg += `<circle cx="${x}" cy="${baseY}" r="20" fill="#22c55e" stroke="#16a34a" stroke-width="2"/>`;
          svg += `<polygon points="${x-6},${baseY-8} ${x-6},${baseY+8} ${x+8},${baseY}" fill="white"/>`;
        } else if (isEnd) {
          // End event - thick circle
          svg += `<circle cx="${x}" cy="${baseY}" r="20" fill="#ef4444" stroke="#dc2626" stroke-width="4"/>`;
          svg += `<rect x="${x-6}" y="${baseY-6}" width="12" height="12" fill="white" rx="1"/>`;
        } else if (isGateway) {
          // Gateway - diamond
          svg += `<polygon points="${x},${baseY-25} ${x+25},${baseY} ${x},${baseY+25} ${x-25},${baseY}" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>`;
          svg += `<text x="${x}" y="${baseY+4}" text-anchor="middle" fill="white" font-size="14" font-weight="bold">X</text>`;
        } else {
          // Task - rounded rectangle
          svg += `<rect x="${x-40}" y="${baseY-22}" width="80" height="44" rx="8" fill="${p}" stroke="${a}" stroke-width="2"/>`;
          svg += `<text x="${x}" y="${baseY+4}" text-anchor="middle" fill="white" font-size="9" font-weight="bold">${esc(nd.label)}</text>`;
        }
        // Labels below
        svg += `<text x="${x}" y="${baseY+45}" text-anchor="middle" fill="${a}" font-size="9">${esc(nd.label)}</text>`;
        // Arrows
        if (i < n - 1) {
          const nextX = 50 + (i + 1) * 100;
          const startOffset = isGateway ? 25 : (isStart || isEnd ? 20 : 40);
          const endOffset = (items[i + 1]?.label.includes('?') || (i + 1) === Math.floor(n / 2)) ? 25 : ((i + 1) === n - 1 ? 20 : 40);
          svg += `<line x1="${x + startOffset}" y1="${baseY}" x2="${nextX - endOffset}" y2="${baseY}" stroke="${a}" stroke-width="2" marker-end="url(#arrowBP)"/>`;
        }
      });
      // Annotation
      svg += `<rect x="20" y="${h-60}" width="${w-40}" height="1" fill="#e2e8f0"/>`;
      svg += `<text x="${w/2}" y="${h-35}" text-anchor="middle" fill="#94a3b8" font-size="9">BPMN 2.0 Process Diagram</text>`;
      return svg + '</svg>';
    }
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="#999" font-size="14">Select a diagram type</text></svg>`;
  }
}

export default function SmartArtModal() {
  const {
    showSmartArtModal,
    setShowSmartArtModal,
    activeSlideIndex,
    addElement,
  } = usePresentationStore();

  const [selectedType, setSelectedType] = useState<SmartArtType>('org-chart');
  const [activeCategory, setActiveCategory] = useState('Hierarchy');
  const [nodes, setNodes] = useState<NodeData[]>(() => getDefaultNodes('org-chart'));

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPreviewSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSelectType = useCallback((type: SmartArtType) => {
    setSelectedType(type);
    setNodes(getDefaultNodes(type));
  }, []);

  if (!showSmartArtModal) return null;

  const handleUpdateNode = (id: string, label: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, label } : n)));
  };

  const handleAddNode = () => {
    const newId = String(Date.now());
    setNodes((prev) => [...prev, { id: newId, label: `Item ${prev.length + 1}` }]);
  };

  const handleRemoveNode = (id: string) => {
    if (nodes.length <= 2) return;
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleInsert = () => {
    const svgContent = generateSmartArtSVG(selectedType, nodes);
    const encoded = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;

    addElement(activeSlideIndex, {
      type: 'image',
      x: 80,
      y: 60,
      width: 600,
      height: 350,
      content: encoded,
      style: {},
    });

    setShowSmartArtModal(false);
    setNodes(getDefaultNodes('org-chart'));
    setSelectedType('org-chart');
  };

  const handleOverlayTextChange = (nodeId: string, newText: string) => {
    handleUpdateNode(nodeId, newText);
  };

  const previewSvg = generateSmartArtSVG(selectedType, nodes);
  const textOverlays = previewSize.width > 0
    ? getTextOverlays(selectedType, nodes, previewSize.width, previewSize.height)
    : [];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
      <div
        className="rounded-lg shadow-2xl border flex flex-col"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
          width: 720,
          maxWidth: '95vw',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-base font-semibold">Insert SmartArt</h2>
          <button
            onClick={() => setShowSmartArtModal(false)}
            className="p-1 rounded hover:opacity-80"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Category + Type selector */}
          <div
            className="w-56 border-r overflow-y-auto flex-shrink-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="text-[10px] font-medium mb-1 opacity-60">Categories</div>
              <div className="flex flex-wrap gap-1">
                {SMARTART_CATEGORIES.map(cat => (
                  <button key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-2 py-0.5 text-[9px] rounded border"
                    style={{
                      borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border)',
                      background: activeCategory === cat ? 'var(--primary)' : 'transparent',
                      color: activeCategory === cat ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-2 space-y-0.5">
              <div className="text-[10px] font-medium mb-1 opacity-60">Layouts</div>
              {SMART_ART_OPTIONS.filter(o => o.category === activeCategory).map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleSelectType(opt.type)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all"
                  style={{
                    background: selectedType === opt.type ? 'var(--primary)' : 'transparent',
                    color: selectedType === opt.type ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                  }}
                >
                  {opt.icon}
                  <div>
                    <div className="font-medium text-[11px]">{opt.label}</div>
                    <div className="text-[9px] opacity-60">{opt.description}</div>
                  </div>
                </button>
              ))}
              {SMART_ART_OPTIONS.filter(o => o.category === activeCategory).length === 0 && (
                <div className="text-[10px] opacity-50 px-2 py-4 text-center">No layouts in this category</div>
              )}
            </div>
          </div>

          {/* Right: Preview & nodes */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Preview with editable overlays */}
            <div
              className="rounded border mb-4 overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                ref={previewContainerRef}
                dangerouslySetInnerHTML={{ __html: previewSvg }}
                style={{ width: '100%', height: 220 }}
              />
              {/* Editable text overlays */}
              {textOverlays.map((overlay) => {
                const node = nodes.find(n => n.id === overlay.nodeId);
                if (!node) return null;
                return (
                  <span
                    key={overlay.nodeId}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const text = e.currentTarget.textContent || '';
                      if (text !== node.label) {
                        handleOverlayTextChange(overlay.nodeId, text);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                    style={{
                      position: 'absolute',
                      left: overlay.x,
                      top: overlay.y,
                      width: overlay.width,
                      height: overlay.height,
                      fontSize: Math.max(8, overlay.fontSize),
                      color: 'transparent',
                      caretColor: overlay.color,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'text',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      lineHeight: `${overlay.height}px`,
                      padding: 0,
                      margin: 0,
                      zIndex: 10,
                      borderRadius: 2,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.color = overlay.color;
                      e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                      e.currentTarget.style.outline = '1px solid rgba(255,255,255,0.4)';
                    }}
                    onMouseEnter={(e) => {
                      if (document.activeElement !== e.currentTarget) {
                        e.currentTarget.style.outline = '1px dashed rgba(255,255,255,0.25)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.currentTarget) {
                        e.currentTarget.style.outline = 'none';
                      }
                    }}
                  >
                    {node.label}
                  </span>
                );
              })}
            </div>

            {/* Node editor */}
            <div className="text-xs font-medium mb-2 opacity-60">Edit Nodes</div>
            <div className="space-y-1.5 mb-3">
              {nodes.map((node) => (
                <div key={node.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={node.label}
                    onChange={(e) => handleUpdateNode(node.id, e.target.value)}
                    className="flex-1 px-2 py-1 rounded border text-sm outline-none"
                    style={{
                      background: 'var(--muted)',
                      borderColor: 'var(--border)',
                      color: 'var(--card-foreground)',
                    }}
                  />
                  <button
                    onClick={() => handleRemoveNode(node.id)}
                    className="p-1 rounded hover:opacity-80 text-xs"
                    style={{ color: '#ef4444' }}
                    disabled={nodes.length <= 2}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddNode}
              className="text-xs px-3 py-1 rounded border hover:opacity-80"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)',
              }}
            >
              + Add Node
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setShowSmartArtModal(false)}
            className="px-4 py-1.5 rounded text-sm border hover:opacity-80"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--card-foreground)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="px-4 py-1.5 rounded text-sm font-medium hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            Insert SmartArt
          </button>
        </div>
      </div>
    </div>
  );
}
