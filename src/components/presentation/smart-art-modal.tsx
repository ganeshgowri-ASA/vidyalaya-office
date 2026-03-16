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
  | 'list-blocks' | 'picture-list' | 'infographic-bar' | 'infographic-pie';

interface SmartArtOption {
  type: SmartArtType;
  label: string;
  icon: React.ReactNode;
  description: string;
  category: string;
}

const SMARTART_CATEGORIES = ['List', 'Process', 'Cycle', 'Hierarchy', 'Relationship', 'Matrix', 'Pyramid', 'Picture', 'Diagrams', 'Infographics'];

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
            {/* Preview */}
            <div
              className="rounded border mb-4 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: previewSvg }}
                style={{ width: '100%', height: 220 }}
              />
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
