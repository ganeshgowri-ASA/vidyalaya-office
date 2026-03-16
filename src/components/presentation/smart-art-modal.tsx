'use client';

import React, { useState } from 'react';
import {
  X,
  GitBranch,
  ArrowRightCircle,
  RefreshCw,
  Network,
  Circle,
} from 'lucide-react';
import { usePresentationStore } from '@/store/presentation-store';

type SmartArtType = 'org-chart' | 'process-flow' | 'cycle' | 'hierarchy' | 'venn'
  | 'mind-map' | 'timeline' | 'swot' | 'fishbone' | 'gantt'
  | 'pyramid' | 'matrix' | 'flowchart' | 'funnel' | 'radial'
  | 'list-blocks' | 'picture-list' | 'infographic-bar' | 'infographic-pie'
  | 'process-detailed' | 'org-chart-detailed' | 'decision-tree' | 'swimlane'
  | 'data-flow' | 'network-topology' | 'bpmn';

interface SmartArtOption {
  type: SmartArtType;
  label: string;
  icon: React.ReactNode;
  description: string;
  category: string;
}

const SMARTART_CATEGORIES = ['List', 'Process', 'Cycle', 'Hierarchy', 'Relationship', 'Matrix', 'Pyramid', 'Picture', 'Diagrams', 'Infographics', 'Flowcharts', 'Network'];

const SMART_ART_OPTIONS: SmartArtOption[] = [
  // List
  { type: 'list-blocks', label: 'Block List', icon: <Network size={20} />, description: 'Horizontal block list', category: 'List' },
  { type: 'picture-list', label: 'Picture List', icon: <Circle size={20} />, description: 'Pictures with descriptions', category: 'Picture' },
  // Process
  { type: 'process-flow', label: 'Basic Process', icon: <ArrowRightCircle size={20} />, description: 'Sequential steps with arrows', category: 'Process' },
  { type: 'flowchart', label: 'Flowchart', icon: <Network size={20} />, description: 'Visio-like flowchart with decisions', category: 'Process' },
  { type: 'funnel', label: 'Funnel', icon: <GitBranch size={20} />, description: 'Funnel narrowing process', category: 'Process' },
  // Cycle
  { type: 'cycle', label: 'Basic Cycle', icon: <RefreshCw size={20} />, description: 'Circular process or lifecycle', category: 'Cycle' },
  { type: 'radial', label: 'Radial Cycle', icon: <Circle size={20} />, description: 'Center with radiating elements', category: 'Cycle' },
  // Hierarchy
  { type: 'hierarchy', label: 'Hierarchy Tree', icon: <GitBranch size={20} />, description: 'Top-down tree structure', category: 'Hierarchy' },
  { type: 'org-chart', label: 'Org Chart', icon: <Network size={20} />, description: 'Organization chart with photos', category: 'Hierarchy' },
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
  // Flowcharts (SmartDraw/Visio-inspired)
  { type: 'process-detailed', label: 'Detailed Process', icon: <ArrowRightCircle size={20} />, description: 'Process flow with sub-steps', category: 'Flowcharts' },
  { type: 'decision-tree', label: 'Decision Tree', icon: <GitBranch size={20} />, description: 'Yes/No branching decisions', category: 'Flowcharts' },
  { type: 'swimlane', label: 'Swimlane Diagram', icon: <Network size={20} />, description: 'Horizontal lanes with process steps', category: 'Flowcharts' },
  { type: 'bpmn', label: 'BPMN Process', icon: <ArrowRightCircle size={20} />, description: 'Business process with events & gateways', category: 'Flowcharts' },
  { type: 'org-chart-detailed', label: 'Detailed Org Chart', icon: <Network size={20} />, description: 'Org chart with titles & departments', category: 'Hierarchy' },
  // Network
  { type: 'data-flow', label: 'Data Flow Diagram', icon: <Network size={20} />, description: 'DFD with data stores & processes', category: 'Network' },
  { type: 'network-topology', label: 'Network Topology', icon: <Circle size={20} />, description: 'Star/ring/mesh network layouts', category: 'Network' },
];

interface NodeData {
  id: string;
  label: string;
}

function esc(t: string) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

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
      const steps = nodes.length > 0 ? nodes : [{id:'1',label:'Start'},{id:'2',label:'Process A'},{id:'3',label:'Sub-process'},{id:'4',label:'Review'},{id:'5',label:'Complete'}];
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="arrowPD" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${a}"/></marker></defs>`;
      const stepH = 50, gap = 20, startY = 20;
      steps.slice(0, 6).forEach((st, i) => {
        const y = startY + i * (stepH + gap);
        const indent = i > 0 && i < steps.length - 1 ? 30 : 0;
        const isTerminal = i === 0 || i === steps.length - 1;
        if (isTerminal) {
          svg += `<rect x="${100+indent}" y="${y}" width="400" height="${stepH}" rx="25" fill="${a}"/>`;
        } else {
          svg += `<rect x="${100+indent}" y="${y}" width="400" height="${stepH}" rx="6" fill="${p}" opacity="${0.8+i*0.04}"/>`;
        }
        svg += `<text x="${300+indent}" y="${y+stepH/2+5}" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${esc(st.label)}</text>`;
        if (i < steps.length - 1) {
          svg += `<line x1="300" y1="${y+stepH}" x2="300" y2="${y+stepH+gap}" stroke="${a}" stroke-width="2" marker-end="url(#arrowPD)"/>`;
        }
      });
      return svg + '</svg>';
    }
    case 'org-chart-detailed': {
      const items = nodes.length > 0 ? nodes : [{id:'1',label:'CEO'},{id:'2',label:'VP Engineering'},{id:'3',label:'VP Sales'},{id:'4',label:'VP Marketing'},{id:'5',label:'CTO'}];
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      // Root
      svg += `<rect x="220" y="10" width="160" height="60" rx="8" fill="${a}"/>`;
      svg += `<circle cx="260" cy="30" r="10" fill="${bg}" opacity="0.5"/>`;
      svg += `<text x="300" y="34" text-anchor="middle" fill="white" font-size="10">CEO</text>`;
      svg += `<text x="300" y="54" text-anchor="middle" fill="${bg}" font-size="9">${esc(items[0]?.label || 'CEO')}</text>`;
      svg += `<line x1="300" y1="70" x2="300" y2="95" stroke="#94a3b8" stroke-width="2"/>`;
      const childCount = Math.min(items.length - 1, 4);
      if (childCount > 0) {
        const spacing = 140;
        const totalW = (childCount - 1) * spacing;
        const startX = 300 - totalW / 2;
        svg += `<line x1="${startX}" y1="95" x2="${startX + totalW}" y2="95" stroke="#94a3b8" stroke-width="2"/>`;
        items.slice(1, 5).forEach((item, i) => {
          const cx = startX + i * spacing;
          svg += `<line x1="${cx}" y1="95" x2="${cx}" y2="115" stroke="#94a3b8" stroke-width="2"/>`;
          svg += `<rect x="${cx-65}" y="115" width="130" height="55" rx="6" fill="${p}"/>`;
          svg += `<circle cx="${cx-35}" cy="133" r="8" fill="${bg}" opacity="0.4"/>`;
          svg += `<text x="${cx+5}" y="137" text-anchor="middle" fill="white" font-size="9">${esc(item.label)}</text>`;
          svg += `<text x="${cx}" y="157" text-anchor="middle" fill="${bg}" font-size="8">Department</text>`;
          // Sub-nodes
          svg += `<rect x="${cx-50}" y="185" width="100" height="30" rx="4" fill="${s}"/>`;
          svg += `<text x="${cx}" y="204" text-anchor="middle" fill="white" font-size="8">Team Member</text>`;
        });
      }
      return svg + '</svg>';
    }
    case 'decision-tree': {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="arrowDT" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="${a}"/></marker></defs>`;
      // Root decision
      svg += `<polygon points="300,15 390,55 300,95 210,55" fill="${p}"/>`;
      svg += `<text x="300" y="59" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${esc(nodes[0]?.label || 'Decision?')}</text>`;
      // Yes branch
      svg += `<line x1="210" y1="55" x2="130" y2="130" stroke="#22c55e" stroke-width="2" marker-end="url(#arrowDT)"/>`;
      svg += `<text x="155" y="85" fill="#22c55e" font-size="9" font-weight="bold">Yes</text>`;
      svg += `<rect x="60" y="130" width="140" height="45" rx="6" fill="#22c55e"/>`;
      svg += `<text x="130" y="157" text-anchor="middle" fill="white" font-size="10">${esc(nodes[1]?.label || 'Action A')}</text>`;
      // No branch
      svg += `<line x1="390" y1="55" x2="470" y2="130" stroke="#ef4444" stroke-width="2" marker-end="url(#arrowDT)"/>`;
      svg += `<text x="440" y="85" fill="#ef4444" font-size="9" font-weight="bold">No</text>`;
      svg += `<polygon points="470,130 530,160 470,190 410,160" fill="#f59e0b"/>`;
      svg += `<text x="470" y="164" text-anchor="middle" fill="white" font-size="9">${esc(nodes[2]?.label || 'Check B?')}</text>`;
      // Sub branches
      svg += `<line x1="410" y1="160" x2="340" y2="230" stroke="#22c55e" stroke-width="1.5"/>`;
      svg += `<rect x="270" y="230" width="120" height="38" rx="6" fill="#22c55e" opacity="0.8"/>`;
      svg += `<text x="330" y="253" text-anchor="middle" fill="white" font-size="9">${esc(nodes[3]?.label || 'Result 1')}</text>`;
      svg += `<line x1="530" y1="160" x2="560" y2="230" stroke="#ef4444" stroke-width="1.5"/>`;
      svg += `<rect x="500" y="230" width="120" height="38" rx="6" fill="#ef4444" opacity="0.8"/>`;
      svg += `<text x="560" y="253" text-anchor="middle" fill="white" font-size="9">${esc(nodes[4]?.label || 'Result 2')}</text>`;
      return svg + '</svg>';
    }
    case 'swimlane': {
      const lanes = nodes.length > 0 ? nodes : [{id:'1',label:'Customer'},{id:'2',label:'Sales'},{id:'3',label:'Engineering'}];
      const laneH = Math.floor((h - 40) / Math.min(lanes.length, 4));
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="arrowSL" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="${a}"/></marker></defs>`;
      lanes.slice(0, 4).forEach((lane, i) => {
        const y = 20 + i * laneH;
        svg += `<rect x="5" y="${y}" width="${w-10}" height="${laneH}" rx="4" fill="${i % 2 === 0 ? bg : '#f0f9ff'}" stroke="${s}" stroke-width="1"/>`;
        svg += `<rect x="5" y="${y}" width="80" height="${laneH}" rx="4" fill="${p}" opacity="0.9"/>`;
        svg += `<text x="45" y="${y+laneH/2+4}" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${esc(lane.label)}</text>`;
        // Process steps in lane
        const stepX = 110, stepW = 90, stepGap = 30;
        for (let j = 0; j < 3; j++) {
          const sx = stepX + j * (stepW + stepGap);
          svg += `<rect x="${sx}" y="${y+laneH/2-15}" width="${stepW}" height="30" rx="4" fill="${s}" opacity="0.7"/>`;
          svg += `<text x="${sx+stepW/2}" y="${y+laneH/2+4}" text-anchor="middle" fill="white" font-size="8">Step ${j+1}</text>`;
          if (j < 2) svg += `<line x1="${sx+stepW}" y1="${y+laneH/2}" x2="${sx+stepW+stepGap}" y2="${y+laneH/2}" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowSL)"/>`;
        }
      });
      return svg + '</svg>';
    }
    case 'data-flow': {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="arrowDF" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="${a}"/></marker></defs>`;
      // External entity
      svg += `<rect x="20" y="40" width="100" height="50" fill="none" stroke="${a}" stroke-width="2"/>`;
      svg += `<text x="70" y="70" text-anchor="middle" fill="${a}" font-size="10" font-weight="bold">${esc(nodes[0]?.label || 'User')}</text>`;
      // Process 1
      svg += `<circle cx="250" cy="65" r="40" fill="${p}" stroke="${a}" stroke-width="2"/>`;
      svg += `<text x="250" y="60" text-anchor="middle" fill="white" font-size="9">1.0</text>`;
      svg += `<text x="250" y="74" text-anchor="middle" fill="white" font-size="9">${esc(nodes[1]?.label || 'Process')}</text>`;
      // Data store
      svg += `<line x1="170" y1="200" x2="330" y2="200" stroke="${a}" stroke-width="2"/>`;
      svg += `<line x1="170" y1="230" x2="330" y2="230" stroke="${a}" stroke-width="2"/>`;
      svg += `<text x="250" y="220" text-anchor="middle" fill="${a}" font-size="10">D1 ${esc(nodes[2]?.label || 'Database')}</text>`;
      // Process 2
      svg += `<circle cx="450" cy="65" r="40" fill="${s}" stroke="${a}" stroke-width="2"/>`;
      svg += `<text x="450" y="60" text-anchor="middle" fill="white" font-size="9">2.0</text>`;
      svg += `<text x="450" y="74" text-anchor="middle" fill="white" font-size="9">${esc(nodes[3]?.label || 'Validate')}</text>`;
      // Arrows
      svg += `<line x1="120" y1="65" x2="210" y2="65" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowDF)"/>`;
      svg += `<text x="165" y="57" text-anchor="middle" fill="${a}" font-size="8">Request</text>`;
      svg += `<line x1="290" y1="65" x2="410" y2="65" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowDF)"/>`;
      svg += `<line x1="250" y1="105" x2="250" y2="200" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowDF)"/>`;
      svg += `<line x1="450" y1="105" x2="450" y2="200" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowDF)"/>`;
      svg += `<line x1="330" y1="215" x2="410" y2="215" stroke="${a}" stroke-width="1.5"/>`;
      svg += `<line x1="410" y1="215" x2="410" y2="105" stroke="${a}" stroke-width="1.5"/>`;
      // External entity 2
      svg += `<rect x="500" y="140" width="90" height="50" fill="none" stroke="${a}" stroke-width="2"/>`;
      svg += `<text x="545" y="170" text-anchor="middle" fill="${a}" font-size="9">${esc(nodes[4]?.label || 'External')}</text>`;
      svg += `<line x1="470" y1="95" x2="500" y2="140" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowDF)"/>`;
      return svg + '</svg>';
    }
    case 'network-topology': {
      const centerX = w/2, centerY = h/2;
      const nodeCount = Math.min(Math.max(nodes.length, 4), 8);
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      // Central hub
      svg += `<rect x="${centerX-40}" y="${centerY-25}" width="80" height="50" rx="6" fill="${a}"/>`;
      svg += `<text x="${centerX}" y="${centerY-5}" text-anchor="middle" fill="white" font-size="8">SERVER</text>`;
      svg += `<text x="${centerX}" y="${centerY+10}" text-anchor="middle" fill="${bg}" font-size="9">${esc(nodes[0]?.label || 'Hub')}</text>`;
      // Peripheral nodes in star topology
      nodes.slice(1, nodeCount).forEach((nd, i) => {
        const angle = (2 * Math.PI * i) / (nodeCount - 1) - Math.PI / 2;
        const nx = centerX + 150 * Math.cos(angle);
        const ny = centerY + 120 * Math.sin(angle);
        svg += `<line x1="${centerX}" y1="${centerY}" x2="${nx}" y2="${ny}" stroke="${s}" stroke-width="2" stroke-dasharray="4,4"/>`;
        svg += `<rect x="${nx-35}" y="${ny-18}" width="70" height="36" rx="4" fill="${p}"/>`;
        svg += `<text x="${nx}" y="${ny+4}" text-anchor="middle" fill="white" font-size="9">${esc(nd.label)}</text>`;
      });
      // Legend
      svg += `<text x="15" y="${h-15}" fill="${a}" font-size="8" opacity="0.6">Star Topology</text>`;
      return svg + '</svg>';
    }
    case 'bpmn': {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
      svg += `<defs><marker id="arrowBP" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="${a}"/></marker></defs>`;
      const cy = h / 2;
      // Start event (circle)
      svg += `<circle cx="40" cy="${cy}" r="18" fill="#22c55e" stroke="#15803d" stroke-width="2"/>`;
      svg += `<text x="40" y="${cy+4}" text-anchor="middle" fill="white" font-size="8">Start</text>`;
      // Task 1
      svg += `<line x1="58" y1="${cy}" x2="100" y2="${cy}" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowBP)"/>`;
      svg += `<rect x="100" y="${cy-22}" width="100" height="44" rx="6" fill="${p}"/>`;
      svg += `<text x="150" y="${cy+4}" text-anchor="middle" fill="white" font-size="9">${esc(nodes[0]?.label || 'Task 1')}</text>`;
      // Gateway (diamond)
      svg += `<line x1="200" y1="${cy}" x2="240" y2="${cy}" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowBP)"/>`;
      svg += `<polygon points="270,${cy-25} 295,${cy} 270,${cy+25} 245,${cy}" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>`;
      svg += `<text x="270" y="${cy+4}" text-anchor="middle" fill="white" font-size="12">X</text>`;
      // Branch A
      svg += `<line x1="295" y1="${cy}" x2="340" y2="${cy}" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowBP)"/>`;
      svg += `<rect x="340" y="${cy-22}" width="100" height="44" rx="6" fill="${s}"/>`;
      svg += `<text x="390" y="${cy+4}" text-anchor="middle" fill="white" font-size="9">${esc(nodes[1]?.label || 'Task 2')}</text>`;
      // Branch B (down)
      svg += `<line x1="270" y1="${cy+25}" x2="270" y2="${cy+70}" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowBP)"/>`;
      svg += `<rect x="220" y="${cy+70}" width="100" height="44" rx="6" fill="${s}"/>`;
      svg += `<text x="270" y="${cy+96}" text-anchor="middle" fill="white" font-size="9">${esc(nodes[2]?.label || 'Task 3')}</text>`;
      // End event
      svg += `<line x1="440" y1="${cy}" x2="500" y2="${cy}" stroke="${a}" stroke-width="1.5" marker-end="url(#arrowBP)"/>`;
      svg += `<circle cx="520" cy="${cy}" r="18" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/>`;
      svg += `<text x="520" y="${cy+4}" text-anchor="middle" fill="white" font-size="8">End</text>`;
      // Merge from branch B
      svg += `<line x1="320" y1="${cy+92}" x2="500" y2="${cy+92}" stroke="${a}" stroke-width="1"/>`;
      svg += `<line x1="500" y1="${cy+92}" x2="500" y2="${cy+18}" stroke="${a}" stroke-width="1"/>`;
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
  const [nodes, setNodes] = useState<NodeData[]>([
    { id: '1', label: 'Item 1' },
    { id: '2', label: 'Item 2' },
    { id: '3', label: 'Item 3' },
  ]);

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
    setNodes([
      { id: '1', label: 'Item 1' },
      { id: '2', label: 'Item 2' },
      { id: '3', label: 'Item 3' },
    ]);
  };

  const previewSvg = generateSmartArtSVG(selectedType, nodes);

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
                  onClick={() => setSelectedType(opt.type)}
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
            {/* Preview with editable text overlays */}
            <div
              className="rounded border mb-2 overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: previewSvg }}
                style={{ width: '100%', height: 220 }}
              />
              {/* Editable text overlay hint */}
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] opacity-60" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                Edit text in nodes below
              </div>
            </div>

            {/* Inline text editing for nodes */}
            <div className="text-xs font-medium mb-2 opacity-60 flex items-center justify-between">
              <span>Edit Nodes</span>
              <span className="text-[9px] opacity-50">Click text to edit - changes update preview live</span>
            </div>
            <div className="space-y-1.5 mb-3">
              {nodes.map((node, idx) => (
                <div key={node.id} className="flex items-center gap-2">
                  <span className="text-[10px] opacity-40 w-5 text-right shrink-0">{idx + 1}</span>
                  <input
                    type="text"
                    value={node.label}
                    onChange={(e) => handleUpdateNode(node.id, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 px-2 py-1.5 rounded border text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    style={{
                      background: 'var(--muted)',
                      borderColor: 'var(--border)',
                      color: 'var(--card-foreground)',
                    }}
                    placeholder={`Node ${idx + 1} label`}
                  />
                  <button
                    onClick={() => handleRemoveNode(node.id)}
                    className="p-1 rounded hover:opacity-80 text-xs"
                    style={{ color: '#ef4444', opacity: nodes.length <= 2 ? 0.3 : 1 }}
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
