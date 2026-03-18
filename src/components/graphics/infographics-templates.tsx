'use client';
import React, { useState } from 'react';

export interface TemplateShape {
  type: 'rect' | 'ellipse' | 'diamond' | 'triangle' | 'text' | 'line' | 'arrow' | 'hexagon' | 'star';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  label?: string;
  text?: string;
  fontSize?: number;
  opacity?: number;
  borderRadius?: number;
  rotation?: number;
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
}

export interface InfographicTemplate {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  icon: string;
  preview: React.ReactNode;
  shapes: TemplateShape[];
}


// ─── Quality Tools (7QC Tools) ────────────────────────────────────────────────

const fishboneShapes: TemplateShape[] = [
  // Main spine arrow
  { type: 'arrow', x: 100, y: 250, startPoint: { x: 100, y: 250 }, endPoint: { x: 650, y: 250 }, stroke: '#60a5fa', strokeWidth: 3 },
  // Effect box
  { type: 'rect', x: 660, y: 220, width: 120, height: 60, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 2, label: 'Effect' },
  // Top branches
  { type: 'line', x: 200, y: 250, startPoint: { x: 200, y: 250 }, endPoint: { x: 160, y: 150 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'line', x: 350, y: 250, startPoint: { x: 350, y: 250 }, endPoint: { x: 310, y: 150 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'line', x: 500, y: 250, startPoint: { x: 500, y: 250 }, endPoint: { x: 460, y: 150 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Bottom branches
  { type: 'line', x: 200, y: 250, startPoint: { x: 200, y: 250 }, endPoint: { x: 160, y: 350 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'line', x: 350, y: 250, startPoint: { x: 350, y: 250 }, endPoint: { x: 310, y: 350 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'line', x: 500, y: 250, startPoint: { x: 500, y: 250 }, endPoint: { x: 460, y: 350 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Branch labels (top)
  { type: 'text', x: 110, y: 130, text: 'Man', fill: 'transparent', stroke: 'transparent', fontSize: 13 },
  { type: 'text', x: 260, y: 130, text: 'Machine', fill: 'transparent', stroke: 'transparent', fontSize: 13 },
  { type: 'text', x: 410, y: 130, text: 'Method', fill: 'transparent', stroke: 'transparent', fontSize: 13 },
  // Branch labels (bottom)
  { type: 'text', x: 100, y: 370, text: 'Material', fill: 'transparent', stroke: 'transparent', fontSize: 13 },
  { type: 'text', x: 245, y: 370, text: 'Measurement', fill: 'transparent', stroke: 'transparent', fontSize: 13 },
  { type: 'text', x: 405, y: 370, text: 'Mother Nature', fill: 'transparent', stroke: 'transparent', fontSize: 13 },
  // Title
  { type: 'text', x: 300, y: 50, text: 'Fishbone / Ishikawa Diagram', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
];

const paretoShapes: TemplateShape[] = [
  // Title
  { type: 'text', x: 280, y: 40, text: 'Pareto Chart', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Bars (decreasing height)
  { type: 'rect', x: 80, y: 130, width: 70, height: 220, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1, label: 'A' },
  { type: 'rect', x: 165, y: 185, width: 70, height: 165, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1, label: 'B' },
  { type: 'rect', x: 250, y: 220, width: 70, height: 130, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1, label: 'C' },
  { type: 'rect', x: 335, y: 260, width: 70, height: 90, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1, label: 'D' },
  { type: 'rect', x: 420, y: 295, width: 70, height: 55, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1, label: 'E' },
  { type: 'rect', x: 505, y: 315, width: 70, height: 35, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1, label: 'F' },
  { type: 'rect', x: 590, y: 325, width: 70, height: 25, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1, label: 'G' },
  // 80% line
  { type: 'line', x: 80, y: 186, startPoint: { x: 80, y: 186 }, endPoint: { x: 680, y: 186 }, stroke: '#ef4444', strokeWidth: 2 },
  { type: 'text', x: 685, y: 190, text: '80% line', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  // Axis
  { type: 'line', x: 80, y: 350, startPoint: { x: 80, y: 350 }, endPoint: { x: 680, y: 350 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'line', x: 80, y: 100, startPoint: { x: 80, y: 100 }, endPoint: { x: 80, y: 350 }, stroke: '#94a3b8', strokeWidth: 2 },
];

const histogramShapes: TemplateShape[] = [
  { type: 'text', x: 300, y: 40, text: 'Histogram', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  { type: 'rect', x: 80, y: 280, width: 65, height: 70, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 1, label: '5-10' },
  { type: 'rect', x: 150, y: 240, width: 65, height: 110, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 1, label: '10-15' },
  { type: 'rect', x: 220, y: 190, width: 65, height: 160, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 1, label: '15-20' },
  { type: 'rect', x: 290, y: 140, width: 65, height: 210, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 1, label: '20-25' },
  { type: 'rect', x: 360, y: 160, width: 65, height: 190, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 1, label: '25-30' },
  { type: 'rect', x: 430, y: 210, width: 65, height: 140, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 1, label: '30-35' },
  { type: 'rect', x: 500, y: 260, width: 65, height: 90, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 1, label: '35-40' },
  { type: 'rect', x: 570, y: 300, width: 65, height: 50, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 1, label: '40-45' },
  { type: 'line', x: 80, y: 350, startPoint: { x: 80, y: 350 }, endPoint: { x: 650, y: 350 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'line', x: 80, y: 100, startPoint: { x: 80, y: 100 }, endPoint: { x: 80, y: 350 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'text', x: 290, y: 420, text: 'Measurement Value', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  { type: 'text', x: 10, y: 220, text: 'Frequency', fill: 'transparent', stroke: 'transparent', fontSize: 12, rotation: -90 },
];

const controlChartShapes: TemplateShape[] = [
  { type: 'text', x: 270, y: 40, text: 'Control Chart (X-bar)', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // UCL line
  { type: 'line', x: 80, y: 130, startPoint: { x: 80, y: 130 }, endPoint: { x: 700, y: 130 }, stroke: '#ef4444', strokeWidth: 2 },
  { type: 'text', x: 705, y: 134, text: 'UCL', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  // CL (center line)
  { type: 'line', x: 80, y: 230, startPoint: { x: 80, y: 230 }, endPoint: { x: 700, y: 230 }, stroke: '#22c55e', strokeWidth: 2 },
  { type: 'text', x: 710, y: 234, text: 'CL', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  // LCL line
  { type: 'line', x: 80, y: 330, startPoint: { x: 80, y: 330 }, endPoint: { x: 700, y: 330 }, stroke: '#ef4444', strokeWidth: 2 },
  { type: 'text', x: 705, y: 334, text: 'LCL', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  // Data points
  { type: 'ellipse', x: 120, y: 210, width: 10, height: 10, fill: '#60a5fa', stroke: '#93c5fd', strokeWidth: 1 },
  { type: 'ellipse', x: 180, y: 190, width: 10, height: 10, fill: '#60a5fa', stroke: '#93c5fd', strokeWidth: 1 },
  { type: 'ellipse', x: 240, y: 250, width: 10, height: 10, fill: '#60a5fa', stroke: '#93c5fd', strokeWidth: 1 },
  { type: 'ellipse', x: 300, y: 170, width: 10, height: 10, fill: '#60a5fa', stroke: '#93c5fd', strokeWidth: 1 },
  { type: 'ellipse', x: 360, y: 220, width: 10, height: 10, fill: '#60a5fa', stroke: '#93c5fd', strokeWidth: 1 },
  { type: 'ellipse', x: 420, y: 280, width: 10, height: 10, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1 },
  { type: 'ellipse', x: 480, y: 200, width: 10, height: 10, fill: '#60a5fa', stroke: '#93c5fd', strokeWidth: 1 },
  { type: 'ellipse', x: 540, y: 240, width: 10, height: 10, fill: '#60a5fa', stroke: '#93c5fd', strokeWidth: 1 },
  { type: 'ellipse', x: 600, y: 160, width: 10, height: 10, fill: '#60a5fa', stroke: '#93c5fd', strokeWidth: 1 },
  { type: 'ellipse', x: 660, y: 230, width: 10, height: 10, fill: '#60a5fa', stroke: '#93c5fd', strokeWidth: 1 },
  // Axes
  { type: 'line', x: 80, y: 100, startPoint: { x: 80, y: 100 }, endPoint: { x: 80, y: 380 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'line', x: 80, y: 380, startPoint: { x: 80, y: 380 }, endPoint: { x: 720, y: 380 }, stroke: '#94a3b8', strokeWidth: 2 },
];

const scatterShapes: TemplateShape[] = [
  { type: 'text', x: 290, y: 40, text: 'Scatter Diagram', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  { type: 'line', x: 80, y: 380, startPoint: { x: 80, y: 380 }, endPoint: { x: 700, y: 380 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'line', x: 80, y: 100, startPoint: { x: 80, y: 100 }, endPoint: { x: 80, y: 380 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'text', x: 350, y: 430, text: 'Variable X', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  { type: 'text', x: 20, y: 220, text: 'Variable Y', fill: 'transparent', stroke: 'transparent', fontSize: 12, rotation: -90 },
  // Scattered data points (positive correlation pattern)
  { type: 'ellipse', x: 130, y: 340, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 160, y: 310, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 195, y: 330, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 230, y: 295, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 270, y: 270, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 310, y: 280, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 355, y: 245, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 395, y: 220, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 435, y: 230, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 480, y: 195, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 520, y: 180, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 565, y: 160, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 610, y: 145, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'ellipse', x: 655, y: 130, width: 8, height: 8, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  // Trend line
  { type: 'line', x: 120, y: 355, startPoint: { x: 120, y: 355 }, endPoint: { x: 670, y: 120 }, stroke: '#f59e0b', strokeWidth: 1 },
];

const checkSheetShapes: TemplateShape[] = [
  { type: 'text', x: 280, y: 40, text: 'Check Sheet', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Header row
  { type: 'rect', x: 80, y: 80, width: 160, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Defect Type' },
  { type: 'rect', x: 244, y: 80, width: 80, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Mon' },
  { type: 'rect', x: 328, y: 80, width: 80, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Tue' },
  { type: 'rect', x: 412, y: 80, width: 80, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Wed' },
  { type: 'rect', x: 496, y: 80, width: 80, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Thu' },
  { type: 'rect', x: 580, y: 80, width: 80, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Total' },
  // Data rows
  { type: 'rect', x: 80, y: 124, width: 160, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Surface Scratch' },
  { type: 'rect', x: 244, y: 124, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|||' },
  { type: 'rect', x: 328, y: 124, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '||' },
  { type: 'rect', x: 412, y: 124, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '||||' },
  { type: 'rect', x: 496, y: 124, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|' },
  { type: 'rect', x: 580, y: 124, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '10' },
  { type: 'rect', x: 80, y: 168, width: 160, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Dimensional Error' },
  { type: 'rect', x: 244, y: 168, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '||' },
  { type: 'rect', x: 328, y: 168, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '||||' },
  { type: 'rect', x: 412, y: 168, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|||' },
  { type: 'rect', x: 496, y: 168, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|||||' },
  { type: 'rect', x: 580, y: 168, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '14' },
  { type: 'rect', x: 80, y: 212, width: 160, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Assembly Defect' },
  { type: 'rect', x: 244, y: 212, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|' },
  { type: 'rect', x: 328, y: 212, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|||' },
  { type: 'rect', x: 412, y: 212, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|' },
  { type: 'rect', x: 496, y: 212, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '||' },
  { type: 'rect', x: 580, y: 212, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '7' },
  { type: 'rect', x: 80, y: 256, width: 160, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Paint Defect' },
  { type: 'rect', x: 244, y: 256, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '||||' },
  { type: 'rect', x: 328, y: 256, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|' },
  { type: 'rect', x: 412, y: 256, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '||' },
  { type: 'rect', x: 496, y: 256, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|||' },
  { type: 'rect', x: 580, y: 256, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '10' },
  { type: 'rect', x: 80, y: 300, width: 160, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Missing Parts' },
  { type: 'rect', x: 244, y: 300, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '||' },
  { type: 'rect', x: 328, y: 300, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|' },
  { type: 'rect', x: 412, y: 300, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|||' },
  { type: 'rect', x: 496, y: 300, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '|' },
  { type: 'rect', x: 580, y: 300, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '7' },
];

const processFlowchartShapes: TemplateShape[] = [
  { type: 'text', x: 290, y: 30, text: 'Process Flowchart', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Start
  { type: 'rect', x: 330, y: 60, width: 140, height: 50, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 2, label: 'Start', borderRadius: 25 },
  { type: 'arrow', x: 400, y: 110, startPoint: { x: 400, y: 110 }, endPoint: { x: 400, y: 160 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Input
  { type: 'rect', x: 290, y: 160, width: 220, height: 55, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 2, label: 'Receive Order' },
  { type: 'arrow', x: 400, y: 215, startPoint: { x: 400, y: 215 }, endPoint: { x: 400, y: 265 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Decision
  { type: 'diamond', x: 340, y: 265, width: 120, height: 70, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 2, label: 'In Stock?' },
  // Yes path
  { type: 'arrow', x: 460, y: 300, startPoint: { x: 460, y: 300 }, endPoint: { x: 540, y: 300 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'text', x: 468, y: 290, text: 'Yes', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'rect', x: 540, y: 270, width: 140, height: 55, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 2, label: 'Process Order' },
  { type: 'arrow', x: 610, y: 325, startPoint: { x: 610, y: 325 }, endPoint: { x: 610, y: 375 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'rect', x: 540, y: 375, width: 140, height: 55, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 2, label: 'Ship to Customer' },
  // No path
  { type: 'arrow', x: 340, y: 300, startPoint: { x: 340, y: 300 }, endPoint: { x: 220, y: 300 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'text', x: 258, y: 290, text: 'No', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'rect', x: 80, y: 270, width: 140, height: 55, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 2, label: 'Back Order' },
  // End
  { type: 'arrow', x: 610, y: 430, startPoint: { x: 610, y: 430 }, endPoint: { x: 610, y: 460 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'rect', x: 540, y: 460, width: 140, height: 50, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 2, label: 'End', borderRadius: 25 },
];


// ─── Six Sigma ────────────────────────────────────────────────────────────────

const dmaicShapes: TemplateShape[] = [
  { type: 'text', x: 280, y: 40, text: 'DMAIC Flow', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  { type: 'rect', x: 50, y: 180, width: 120, height: 80, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 2, label: 'Define' },
  { type: 'arrow', x: 170, y: 220, startPoint: { x: 170, y: 220 }, endPoint: { x: 200, y: 220 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'rect', x: 200, y: 180, width: 120, height: 80, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 2, label: 'Measure' },
  { type: 'arrow', x: 320, y: 220, startPoint: { x: 320, y: 220 }, endPoint: { x: 350, y: 220 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'rect', x: 350, y: 180, width: 120, height: 80, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 2, label: 'Analyze' },
  { type: 'arrow', x: 470, y: 220, startPoint: { x: 470, y: 220 }, endPoint: { x: 500, y: 220 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'rect', x: 500, y: 180, width: 120, height: 80, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 2, label: 'Improve' },
  { type: 'arrow', x: 620, y: 220, startPoint: { x: 620, y: 220 }, endPoint: { x: 650, y: 220 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'rect', x: 650, y: 180, width: 120, height: 80, fill: '#06b6d4', stroke: '#22d3ee', strokeWidth: 2, label: 'Control' },
  // Sub labels
  { type: 'text', x: 70, y: 290, text: 'Problem\nStatement', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 215, y: 290, text: 'Data\nCollection', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 365, y: 290, text: 'Root Cause\nAnalysis', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 515, y: 290, text: 'Solution\nImplement', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 660, y: 290, text: 'Sustain\nGains', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
];

const sipocShapes: TemplateShape[] = [
  { type: 'text', x: 280, y: 30, text: 'SIPOC Diagram', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Headers
  { type: 'rect', x: 50, y: 70, width: 130, height: 45, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Supplier' },
  { type: 'rect', x: 190, y: 70, width: 130, height: 45, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'Input' },
  { type: 'rect', x: 330, y: 70, width: 130, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'Process' },
  { type: 'rect', x: 470, y: 70, width: 130, height: 45, fill: '#92400e', stroke: '#f59e0b', strokeWidth: 2, label: 'Output' },
  { type: 'rect', x: 610, y: 70, width: 130, height: 45, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 2, label: 'Customer' },
  // Column cells - row 1
  { type: 'rect', x: 50, y: 125, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Vendor A' },
  { type: 'rect', x: 190, y: 125, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Raw Material' },
  { type: 'rect', x: 330, y: 125, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Receive Order' },
  { type: 'rect', x: 470, y: 125, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Product A' },
  { type: 'rect', x: 610, y: 125, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Client X' },
  // Column cells - row 2
  { type: 'rect', x: 50, y: 185, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Vendor B' },
  { type: 'rect', x: 190, y: 185, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Specifications' },
  { type: 'rect', x: 330, y: 185, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Manufacturing' },
  { type: 'rect', x: 470, y: 185, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Service B' },
  { type: 'rect', x: 610, y: 185, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Client Y' },
  // Column cells - row 3
  { type: 'rect', x: 50, y: 245, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Internal' },
  { type: 'rect', x: 190, y: 245, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Equipment' },
  { type: 'rect', x: 330, y: 245, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'QC Check' },
  { type: 'rect', x: 470, y: 245, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Report' },
  { type: 'rect', x: 610, y: 245, width: 130, height: 55, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'End User' },
];

const ctqTreeShapes: TemplateShape[] = [
  { type: 'text', x: 290, y: 30, text: 'CTQ Tree (Critical to Quality)', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Root
  { type: 'rect', x: 50, y: 210, width: 140, height: 60, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Customer Need' },
  { type: 'line', x: 190, y: 240, startPoint: { x: 190, y: 240 }, endPoint: { x: 270, y: 240 }, stroke: '#60a5fa', strokeWidth: 2 },
  // Level 2 - Drivers
  { type: 'rect', x: 270, y: 130, width: 130, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'Quality Driver 1' },
  { type: 'rect', x: 270, y: 215, width: 130, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'Quality Driver 2' },
  { type: 'rect', x: 270, y: 300, width: 130, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'Quality Driver 3' },
  // Connectors L2
  { type: 'line', x: 190, y: 155, startPoint: { x: 190, y: 155 }, endPoint: { x: 270, y: 155 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 190, y: 325, startPoint: { x: 190, y: 325 }, endPoint: { x: 270, y: 325 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 190, y: 155, startPoint: { x: 190, y: 155 }, endPoint: { x: 190, y: 325 }, stroke: '#94a3b8', strokeWidth: 1 },
  // Level 3 - CTQ
  { type: 'rect', x: 470, y: 80, width: 120, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'CTQ 1.1' },
  { type: 'rect', x: 470, y: 140, width: 120, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'CTQ 1.2' },
  { type: 'rect', x: 470, y: 200, width: 120, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'CTQ 2.1' },
  { type: 'rect', x: 470, y: 255, width: 120, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'CTQ 2.2' },
  { type: 'rect', x: 470, y: 310, width: 120, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'CTQ 3.1' },
  { type: 'rect', x: 470, y: 365, width: 120, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'CTQ 3.2' },
  // Connectors L3
  { type: 'line', x: 400, y: 155, startPoint: { x: 400, y: 155 }, endPoint: { x: 470, y: 102 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 400, y: 155, startPoint: { x: 400, y: 155 }, endPoint: { x: 470, y: 162 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 400, y: 240, startPoint: { x: 400, y: 240 }, endPoint: { x: 470, y: 222 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 400, y: 240, startPoint: { x: 400, y: 240 }, endPoint: { x: 470, y: 277 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 400, y: 325, startPoint: { x: 400, y: 325 }, endPoint: { x: 470, y: 332 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 400, y: 325, startPoint: { x: 400, y: 325 }, endPoint: { x: 470, y: 387 }, stroke: '#94a3b8', strokeWidth: 1 },
];

const processCapabilityShapes: TemplateShape[] = [
  { type: 'text', x: 255, y: 30, text: 'Process Capability Study', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Bell curve approximation using ellipses
  { type: 'ellipse', x: 395, y: 200, width: 300, height: 180, fill: 'rgba(59,130,246,0.2)', stroke: '#3b82f6', strokeWidth: 2 },
  { type: 'ellipse', x: 395, y: 230, width: 200, height: 120, fill: 'rgba(59,130,246,0.25)', stroke: '#60a5fa', strokeWidth: 1 },
  { type: 'ellipse', x: 395, y: 250, width: 100, height: 60, fill: 'rgba(59,130,246,0.35)', stroke: '#93c5fd', strokeWidth: 1 },
  // Spec limits
  { type: 'line', x: 230, y: 100, startPoint: { x: 230, y: 100 }, endPoint: { x: 230, y: 340 }, stroke: '#ef4444', strokeWidth: 2 },
  { type: 'line', x: 560, y: 100, startPoint: { x: 560, y: 100 }, endPoint: { x: 560, y: 340 }, stroke: '#ef4444', strokeWidth: 2 },
  // Center line
  { type: 'line', x: 395, y: 100, startPoint: { x: 395, y: 100 }, endPoint: { x: 395, y: 340 }, stroke: '#22c55e', strokeWidth: 1 },
  // Base line
  { type: 'line', x: 100, y: 340, startPoint: { x: 100, y: 340 }, endPoint: { x: 700, y: 340 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Labels
  { type: 'text', x: 195, y: 90, text: 'LSL', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  { type: 'text', x: 545, y: 90, text: 'USL', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  { type: 'text', x: 375, y: 90, text: 'Target', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  // KPI boxes
  { type: 'rect', x: 100, y: 370, width: 130, height: 60, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Cp = 1.45' },
  { type: 'rect', x: 250, y: 370, width: 130, height: 60, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Cpk = 1.32' },
  { type: 'rect', x: 400, y: 370, width: 130, height: 60, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Sigma = 4.2' },
  { type: 'rect', x: 550, y: 370, width: 130, height: 60, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'PPM = 2145' },
];

const vocShapes: TemplateShape[] = [
  { type: 'text', x: 265, y: 30, text: 'Voice of Customer (VOC)', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Header
  { type: 'rect', x: 50, y: 70, width: 260, height: 45, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Customer Need' },
  { type: 'rect', x: 320, y: 70, width: 100, height: 45, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'Importance' },
  { type: 'rect', x: 430, y: 70, width: 100, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'Satisfaction' },
  { type: 'rect', x: 540, y: 70, width: 100, height: 45, fill: '#92400e', stroke: '#f59e0b', strokeWidth: 2, label: 'Priority' },
  { type: 'rect', x: 650, y: 70, width: 100, height: 45, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 2, label: 'Action' },
  // Rows
  { type: 'rect', x: 50, y: 125, width: 260, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Fast Delivery' },
  { type: 'diamond', x: 345, y: 135, width: 50, height: 30, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '5' },
  { type: 'diamond', x: 455, y: 135, width: 50, height: 30, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '3' },
  { type: 'rect', x: 540, y: 125, width: 100, height: 50, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: 'HIGH' },
  { type: 'rect', x: 650, y: 125, width: 100, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Improve' },
  { type: 'rect', x: 50, y: 180, width: 260, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Low Price' },
  { type: 'diamond', x: 345, y: 190, width: 50, height: 30, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '4' },
  { type: 'diamond', x: 455, y: 190, width: 50, height: 30, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '4' },
  { type: 'rect', x: 540, y: 180, width: 100, height: 50, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: 'MED' },
  { type: 'rect', x: 650, y: 180, width: 100, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Monitor' },
  { type: 'rect', x: 50, y: 235, width: 260, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Product Quality' },
  { type: 'diamond', x: 345, y: 245, width: 50, height: 30, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '5' },
  { type: 'diamond', x: 455, y: 245, width: 50, height: 30, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '2' },
  { type: 'rect', x: 540, y: 235, width: 100, height: 50, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: 'CRITICAL' },
  { type: 'rect', x: 650, y: 235, width: 100, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Fix Now' },
  { type: 'rect', x: 50, y: 290, width: 260, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Easy Returns' },
  { type: 'diamond', x: 345, y: 300, width: 50, height: 30, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '3' },
  { type: 'diamond', x: 455, y: 300, width: 50, height: 30, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '4' },
  { type: 'rect', x: 540, y: 290, width: 100, height: 50, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: 'LOW' },
  { type: 'rect', x: 650, y: 290, width: 100, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Maintain' },
];


// ─── Strategic Planning ───────────────────────────────────────────────────────

const swotShapes: TemplateShape[] = [
  { type: 'text', x: 310, y: 25, text: 'SWOT Analysis', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  { type: 'rect', x: 50, y: 60, width: 310, height: 200, fill: '#14532d', stroke: '#22c55e', strokeWidth: 2, label: 'STRENGTHS' },
  { type: 'rect', x: 380, y: 60, width: 310, height: 200, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 2, label: 'WEAKNESSES' },
  { type: 'rect', x: 50, y: 280, width: 310, height: 200, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: 'OPPORTUNITIES' },
  { type: 'rect', x: 380, y: 280, width: 310, height: 200, fill: '#78350f', stroke: '#f59e0b', strokeWidth: 2, label: 'THREATS' },
  { type: 'text', x: 80, y: 120, text: '+ Market leader in segment', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 80, y: 150, text: '+ Strong brand recognition', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 80, y: 180, text: '+ Loyal customer base', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 410, y: 120, text: '- High operational costs', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 410, y: 150, text: '- Limited digital presence', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 410, y: 180, text: '- Slow product iterations', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 80, y: 340, text: '+ Emerging markets growth', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 80, y: 370, text: '+ Technology partnerships', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 80, y: 400, text: '+ Regulatory tailwinds', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 410, y: 340, text: '- Intense competition', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 410, y: 370, text: '- Economic uncertainty', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 410, y: 400, text: '- Supply chain risks', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
];

const portersFiveForcesShapes: TemplateShape[] = [
  { type: 'text', x: 255, y: 20, text: "Porter's Five Forces", fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Center - Industry Rivalry
  { type: 'rect', x: 290, y: 190, width: 220, height: 90, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Industry Rivalry' },
  // Top - New Entrants
  { type: 'rect', x: 290, y: 50, width: 220, height: 80, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'New Entrants' },
  { type: 'arrow', x: 400, y: 130, startPoint: { x: 400, y: 130 }, endPoint: { x: 400, y: 190 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Bottom - Substitutes
  { type: 'rect', x: 290, y: 340, width: 220, height: 80, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'Substitutes' },
  { type: 'arrow', x: 400, y: 340, startPoint: { x: 400, y: 340 }, endPoint: { x: 400, y: 280 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Left - Suppliers
  { type: 'rect', x: 50, y: 195, width: 190, height: 80, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'Suppliers' },
  { type: 'arrow', x: 240, y: 235, startPoint: { x: 240, y: 235 }, endPoint: { x: 290, y: 235 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Right - Buyers
  { type: 'rect', x: 560, y: 195, width: 190, height: 80, fill: '#92400e', stroke: '#f59e0b', strokeWidth: 2, label: 'Buyers / Customers' },
  { type: 'arrow', x: 510, y: 235, startPoint: { x: 510, y: 235 }, endPoint: { x: 560, y: 235 }, stroke: '#94a3b8', strokeWidth: 2 },
];

const valueStreamShapes: TemplateShape[] = [
  { type: 'text', x: 265, y: 25, text: 'Value Stream Map', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Supplier
  { type: 'rect', x: 40, y: 100, width: 100, height: 80, fill: '#1e293b', stroke: '#60a5fa', strokeWidth: 2, label: 'Supplier' },
  // Arrow
  { type: 'arrow', x: 140, y: 140, startPoint: { x: 140, y: 140 }, endPoint: { x: 190, y: 140 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Process boxes
  { type: 'rect', x: 190, y: 100, width: 100, height: 80, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: 'Process 1' },
  { type: 'arrow', x: 290, y: 140, startPoint: { x: 290, y: 140 }, endPoint: { x: 340, y: 140 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'rect', x: 340, y: 100, width: 100, height: 80, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: 'Process 2' },
  { type: 'arrow', x: 440, y: 140, startPoint: { x: 440, y: 140 }, endPoint: { x: 490, y: 140 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'rect', x: 490, y: 100, width: 100, height: 80, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: 'Process 3' },
  { type: 'arrow', x: 590, y: 140, startPoint: { x: 590, y: 140 }, endPoint: { x: 640, y: 140 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Customer
  { type: 'rect', x: 640, y: 100, width: 100, height: 80, fill: '#1e293b', stroke: '#22c55e', strokeWidth: 2, label: 'Customer' },
  // Inventory triangles (diamonds used as approx)
  { type: 'diamond', x: 168, y: 155, width: 30, height: 30, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '50' },
  { type: 'diamond', x: 318, y: 155, width: 30, height: 30, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '120' },
  { type: 'diamond', x: 468, y: 155, width: 30, height: 30, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '80' },
  // Timeline
  { type: 'line', x: 40, y: 260, startPoint: { x: 40, y: 260 }, endPoint: { x: 740, y: 260 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'rect', x: 40, y: 270, width: 100, height: 40, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: '2 days VA' },
  { type: 'rect', x: 155, y: 270, width: 100, height: 40, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 1, label: '5 days NVA' },
  { type: 'rect', x: 270, y: 270, width: 100, height: 40, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: '3 days VA' },
  { type: 'rect', x: 385, y: 270, width: 100, height: 40, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 1, label: '3 days NVA' },
  { type: 'rect', x: 500, y: 270, width: 100, height: 40, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: '4 days VA' },
  { type: 'text', x: 250, y: 340, text: 'Total Lead Time: 17 days | Value-Added: 9 days', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
];

const balancedScorecardShapes: TemplateShape[] = [
  { type: 'text', x: 265, y: 25, text: 'Balanced Scorecard', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Center vision
  { type: 'ellipse', x: 340, y: 230, width: 120, height: 70, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Vision & Strategy' },
  // Four perspectives
  { type: 'rect', x: 270, y: 60, width: 160, height: 90, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'Financial' },
  { type: 'rect', x: 580, y: 190, width: 160, height: 90, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'Customer' },
  { type: 'rect', x: 270, y: 370, width: 160, height: 90, fill: '#92400e', stroke: '#f59e0b', strokeWidth: 2, label: 'Internal Process' },
  { type: 'rect', x: 60, y: 190, width: 160, height: 90, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 2, label: 'Learning & Growth' },
  // Arrows forming cycle
  { type: 'arrow', x: 350, y: 150, startPoint: { x: 350, y: 150 }, endPoint: { x: 350, y: 200 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'arrow', x: 460, y: 235, startPoint: { x: 460, y: 235 }, endPoint: { x: 580, y: 235 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'arrow', x: 350, y: 300, startPoint: { x: 350, y: 300 }, endPoint: { x: 350, y: 370 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'arrow', x: 220, y: 235, startPoint: { x: 220, y: 235 }, endPoint: { x: 280, y: 235 }, stroke: '#94a3b8', strokeWidth: 2 },
];

const ansoffMatrixShapes: TemplateShape[] = [
  { type: 'text', x: 270, y: 25, text: 'Ansoff Matrix', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Axis labels
  { type: 'text', x: 245, y: 65, text: 'Existing Products', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  { type: 'text', x: 520, y: 65, text: 'New Products', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  { type: 'text', x: 15, y: 185, text: 'Existing Markets', fill: 'transparent', stroke: 'transparent', fontSize: 11, rotation: -90 },
  { type: 'text', x: 15, y: 360, text: 'New Markets', fill: 'transparent', stroke: 'transparent', fontSize: 11, rotation: -90 },
  // 4 quadrants
  { type: 'rect', x: 100, y: 90, width: 280, height: 185, fill: '#14532d', stroke: '#22c55e', strokeWidth: 2, label: 'Market Penetration' },
  { type: 'rect', x: 420, y: 90, width: 280, height: 185, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: 'Product Development' },
  { type: 'rect', x: 100, y: 305, width: 280, height: 185, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'Market Development' },
  { type: 'rect', x: 420, y: 305, width: 280, height: 185, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 2, label: 'Diversification' },
  // Sub-labels
  { type: 'text', x: 155, y: 185, text: 'Low Risk - Sell more\nof existing products\nto existing markets', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 475, y: 185, text: 'Medium Risk - Develop\nnew products for\nexisting markets', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 155, y: 400, text: 'Medium Risk - Sell\nexisting products in\nnew markets', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 475, y: 400, text: 'High Risk - New\nproducts for\nnew markets', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
];

const houseOfQualityShapes: TemplateShape[] = [
  { type: 'text', x: 255, y: 20, text: 'House of Quality (QFD)', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Roof triangle
  { type: 'triangle', x: 400, y: 50, width: 400, height: 100, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: 'Correlation Matrix' },
  // Left column - Customer Needs
  { type: 'rect', x: 50, y: 160, width: 140, height: 180, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Customer\nRequirements' },
  // Top row - Technical Requirements
  { type: 'rect', x: 200, y: 160, width: 80, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 1, label: 'Tech 1' },
  { type: 'rect', x: 285, y: 160, width: 80, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 1, label: 'Tech 2' },
  { type: 'rect', x: 370, y: 160, width: 80, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 1, label: 'Tech 3' },
  { type: 'rect', x: 455, y: 160, width: 80, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 1, label: 'Tech 4' },
  { type: 'rect', x: 540, y: 160, width: 80, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 1, label: 'Tech 5' },
  // Right column - Competitive Analysis
  { type: 'rect', x: 630, y: 160, width: 110, height: 180, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'Competitive\nAnalysis' },
  // Correlation cells (4x5 grid)
  { type: 'rect', x: 200, y: 215, width: 80, height: 40, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: '●●●' },
  { type: 'rect', x: 285, y: 215, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '○' },
  { type: 'rect', x: 370, y: 215, width: 80, height: 40, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: '●●' },
  { type: 'rect', x: 455, y: 215, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '' },
  { type: 'rect', x: 540, y: 215, width: 80, height: 40, fill: '#78350f', stroke: '#f59e0b', strokeWidth: 1, label: '△' },
  { type: 'rect', x: 200, y: 258, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '○' },
  { type: 'rect', x: 285, y: 258, width: 80, height: 40, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: '●●●' },
  { type: 'rect', x: 370, y: 258, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '' },
  { type: 'rect', x: 455, y: 258, width: 80, height: 40, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: '●●' },
  { type: 'rect', x: 540, y: 258, width: 80, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '○' },
  // Bottom row - Technical Targets
  { type: 'rect', x: 200, y: 345, width: 420, height: 55, fill: '#92400e', stroke: '#f59e0b', strokeWidth: 2, label: 'Technical Targets / Benchmarks' },
];


// ─── Project Management ───────────────────────────────────────────────────────

const ganttShapes: TemplateShape[] = [
  { type: 'text', x: 270, y: 25, text: 'Gantt Chart', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Header row
  { type: 'rect', x: 50, y: 60, width: 160, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Task' },
  { type: 'rect', x: 215, y: 60, width: 130, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Week 1' },
  { type: 'rect', x: 350, y: 60, width: 130, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Week 2' },
  { type: 'rect', x: 485, y: 60, width: 130, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Week 3' },
  { type: 'rect', x: 620, y: 60, width: 130, height: 40, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 1, label: 'Week 4' },
  // Task rows background
  { type: 'rect', x: 50, y: 105, width: 160, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Planning' },
  { type: 'rect', x: 50, y: 150, width: 160, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Design' },
  { type: 'rect', x: 50, y: 195, width: 160, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Development' },
  { type: 'rect', x: 50, y: 240, width: 160, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Testing' },
  { type: 'rect', x: 50, y: 285, width: 160, height: 40, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Deployment' },
  // Progress bars
  { type: 'rect', x: 218, y: 110, width: 250, height: 30, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '100%' },
  { type: 'rect', x: 218, y: 155, width: 130, height: 30, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1 },
  { type: 'rect', x: 353, y: 155, width: 130, height: 30, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1 },
  { type: 'rect', x: 353, y: 200, width: 260, height: 30, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 1 },
  { type: 'rect', x: 618, y: 200, width: 65, height: 30, fill: '#8b5cf6', stroke: '#a78bfa', strokeWidth: 1, opacity: 0.5 },
  { type: 'rect', x: 618, y: 245, width: 130, height: 30, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1 },
  { type: 'rect', x: 618, y: 290, width: 65, height: 30, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1 },
  // Today marker
  { type: 'line', x: 620, y: 60, startPoint: { x: 620, y: 60 }, endPoint: { x: 620, y: 330 }, stroke: '#ef4444', strokeWidth: 2 },
  { type: 'text', x: 600, y: 345, text: 'Today', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
];

const raciShapes: TemplateShape[] = [
  { type: 'text', x: 275, y: 25, text: 'RACI Matrix', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Header
  { type: 'rect', x: 50, y: 60, width: 180, height: 45, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Activity / Task' },
  { type: 'rect', x: 235, y: 60, width: 100, height: 45, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Project Mgr' },
  { type: 'rect', x: 340, y: 60, width: 100, height: 45, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Dev Lead' },
  { type: 'rect', x: 445, y: 60, width: 100, height: 45, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'QA Team' },
  { type: 'rect', x: 550, y: 60, width: 100, height: 45, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Stakeholder' },
  { type: 'rect', x: 655, y: 60, width: 100, height: 45, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Client' },
  // Rows
  { type: 'rect', x: 50, y: 110, width: 180, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Requirements' },
  { type: 'rect', x: 235, y: 110, width: 100, height: 45, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: 'A' },
  { type: 'rect', x: 340, y: 110, width: 100, height: 45, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 1, label: 'R' },
  { type: 'rect', x: 445, y: 110, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'C' },
  { type: 'rect', x: 550, y: 110, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'I' },
  { type: 'rect', x: 655, y: 110, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'C' },
  { type: 'rect', x: 50, y: 160, width: 180, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Design' },
  { type: 'rect', x: 235, y: 160, width: 100, height: 45, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: 'A' },
  { type: 'rect', x: 340, y: 160, width: 100, height: 45, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 1, label: 'R' },
  { type: 'rect', x: 445, y: 160, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'I' },
  { type: 'rect', x: 550, y: 160, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'C' },
  { type: 'rect', x: 655, y: 160, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'I' },
  { type: 'rect', x: 50, y: 210, width: 180, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Development' },
  { type: 'rect', x: 235, y: 210, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'I' },
  { type: 'rect', x: 340, y: 210, width: 100, height: 45, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: 'A' },
  { type: 'rect', x: 445, y: 210, width: 100, height: 45, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 1, label: 'R' },
  { type: 'rect', x: 550, y: 210, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'I' },
  { type: 'rect', x: 655, y: 210, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'I' },
  { type: 'rect', x: 50, y: 260, width: 180, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Testing' },
  { type: 'rect', x: 235, y: 260, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'C' },
  { type: 'rect', x: 340, y: 260, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'C' },
  { type: 'rect', x: 445, y: 260, width: 100, height: 45, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: 'A/R' },
  { type: 'rect', x: 550, y: 260, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'I' },
  { type: 'rect', x: 655, y: 260, width: 100, height: 45, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'I' },
  // Legend
  { type: 'text', x: 60, y: 330, text: 'R = Responsible  A = Accountable  C = Consulted  I = Informed', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
];

const riskMatrixShapes: TemplateShape[] = [
  { type: 'text', x: 280, y: 20, text: 'Risk Assessment Matrix', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Y-axis label
  { type: 'text', x: 20, y: 260, text: 'Probability', fill: 'transparent', stroke: 'transparent', fontSize: 12, rotation: -90 },
  // X-axis label
  { type: 'text', x: 340, y: 490, text: 'Impact', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  // Row 5 (Very High prob) - all red
  { type: 'rect', x: 80, y: 60, width: 100, height: 80, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '5' },
  { type: 'rect', x: 185, y: 60, width: 100, height: 80, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '10' },
  { type: 'rect', x: 290, y: 60, width: 100, height: 80, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '15' },
  { type: 'rect', x: 395, y: 60, width: 100, height: 80, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '20' },
  { type: 'rect', x: 500, y: 60, width: 100, height: 80, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '25' },
  // Row 4
  { type: 'rect', x: 80, y: 145, width: 100, height: 80, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '4' },
  { type: 'rect', x: 185, y: 145, width: 100, height: 80, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '8' },
  { type: 'rect', x: 290, y: 145, width: 100, height: 80, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '12' },
  { type: 'rect', x: 395, y: 145, width: 100, height: 80, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '16' },
  { type: 'rect', x: 500, y: 145, width: 100, height: 80, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '20' },
  // Row 3
  { type: 'rect', x: 80, y: 230, width: 100, height: 80, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '3' },
  { type: 'rect', x: 185, y: 230, width: 100, height: 80, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '6' },
  { type: 'rect', x: 290, y: 230, width: 100, height: 80, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '9' },
  { type: 'rect', x: 395, y: 230, width: 100, height: 80, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '12' },
  { type: 'rect', x: 500, y: 230, width: 100, height: 80, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '15' },
  // Row 2
  { type: 'rect', x: 80, y: 315, width: 100, height: 80, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '2' },
  { type: 'rect', x: 185, y: 315, width: 100, height: 80, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '4' },
  { type: 'rect', x: 290, y: 315, width: 100, height: 80, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '6' },
  { type: 'rect', x: 395, y: 315, width: 100, height: 80, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '8' },
  { type: 'rect', x: 500, y: 315, width: 100, height: 80, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 1, label: '10' },
  // Row 1 (Very Low prob) - greens
  { type: 'rect', x: 80, y: 400, width: 100, height: 80, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '1' },
  { type: 'rect', x: 185, y: 400, width: 100, height: 80, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '2' },
  { type: 'rect', x: 290, y: 400, width: 100, height: 80, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: '3' },
  { type: 'rect', x: 395, y: 400, width: 100, height: 80, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '4' },
  { type: 'rect', x: 500, y: 400, width: 100, height: 80, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: '5' },
  // Axis labels
  { type: 'text', x: 30, y: 100, text: 'Very High', fill: 'transparent', stroke: 'transparent', fontSize: 9 },
  { type: 'text', x: 30, y: 185, text: 'High', fill: 'transparent', stroke: 'transparent', fontSize: 9 },
  { type: 'text', x: 30, y: 270, text: 'Medium', fill: 'transparent', stroke: 'transparent', fontSize: 9 },
  { type: 'text', x: 30, y: 355, text: 'Low', fill: 'transparent', stroke: 'transparent', fontSize: 9 },
  { type: 'text', x: 30, y: 440, text: 'Very Low', fill: 'transparent', stroke: 'transparent', fontSize: 9 },
];

const stakeholderMapShapes: TemplateShape[] = [
  { type: 'text', x: 270, y: 20, text: 'Stakeholder Mapping', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // 2x2 grid
  { type: 'rect', x: 50, y: 60, width: 300, height: 200, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: 'Keep Satisfied' },
  { type: 'rect', x: 390, y: 60, width: 300, height: 200, fill: '#14532d', stroke: '#22c55e', strokeWidth: 2, label: 'Manage Closely' },
  { type: 'rect', x: 50, y: 300, width: 300, height: 200, fill: '#1e293b', stroke: '#475569', strokeWidth: 2, label: 'Monitor' },
  { type: 'rect', x: 390, y: 300, width: 300, height: 200, fill: '#78350f', stroke: '#f59e0b', strokeWidth: 2, label: 'Keep Informed' },
  // Axis labels
  { type: 'text', x: 270, y: 510, text: 'Low Interest                                  High Interest', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 15, y: 260, text: 'Power', fill: 'transparent', stroke: 'transparent', fontSize: 11, rotation: -90 },
  // Stakeholder ellipses
  { type: 'ellipse', x: 155, y: 130, width: 90, height: 40, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1, label: 'Regulator' },
  { type: 'ellipse', x: 490, y: 110, width: 90, height: 40, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: 'Sponsor' },
  { type: 'ellipse', x: 560, y: 160, width: 90, height: 40, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1, label: 'CEO' },
  { type: 'ellipse', x: 150, y: 370, width: 90, height: 40, fill: '#475569', stroke: '#94a3b8', strokeWidth: 1, label: 'Public' },
  { type: 'ellipse', x: 490, y: 360, width: 90, height: 40, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: 'Team Lead' },
  { type: 'ellipse', x: 560, y: 410, width: 90, height: 40, fill: '#f59e0b', stroke: '#fcd34d', strokeWidth: 1, label: 'Key Users' },
];

const wbsShapes: TemplateShape[] = [
  { type: 'text', x: 250, y: 20, text: 'Work Breakdown Structure', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Root
  { type: 'rect', x: 300, y: 55, width: 200, height: 55, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'Project: New App' },
  // Lines to L2
  { type: 'line', x: 400, y: 110, startPoint: { x: 400, y: 110 }, endPoint: { x: 400, y: 150 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 150, y: 150, startPoint: { x: 150, y: 150 }, endPoint: { x: 650, y: 150 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 150, y: 150, startPoint: { x: 150, y: 150 }, endPoint: { x: 150, y: 175 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 400, y: 150, startPoint: { x: 400, y: 150 }, endPoint: { x: 400, y: 175 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 650, y: 150, startPoint: { x: 650, y: 150 }, endPoint: { x: 650, y: 175 }, stroke: '#94a3b8', strokeWidth: 1 },
  // L2 nodes
  { type: 'rect', x: 50, y: 175, width: 200, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: '1. Planning' },
  { type: 'rect', x: 300, y: 175, width: 200, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: '2. Development' },
  { type: 'rect', x: 550, y: 175, width: 200, height: 50, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: '3. Deployment' },
  // Lines to L3
  { type: 'line', x: 150, y: 225, startPoint: { x: 150, y: 225 }, endPoint: { x: 150, y: 265 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 80, y: 265, startPoint: { x: 80, y: 265 }, endPoint: { x: 220, y: 265 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 80, y: 265, startPoint: { x: 80, y: 265 }, endPoint: { x: 80, y: 285 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 220, y: 265, startPoint: { x: 220, y: 265 }, endPoint: { x: 220, y: 285 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 400, y: 225, startPoint: { x: 400, y: 225 }, endPoint: { x: 400, y: 265 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 330, y: 265, startPoint: { x: 330, y: 265 }, endPoint: { x: 470, y: 265 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 330, y: 265, startPoint: { x: 330, y: 265 }, endPoint: { x: 330, y: 285 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 400, y: 265, startPoint: { x: 400, y: 265 }, endPoint: { x: 400, y: 285 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 470, y: 265, startPoint: { x: 470, y: 265 }, endPoint: { x: 470, y: 285 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 650, y: 225, startPoint: { x: 650, y: 225 }, endPoint: { x: 650, y: 265 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 580, y: 265, startPoint: { x: 580, y: 265 }, endPoint: { x: 720, y: 265 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 580, y: 265, startPoint: { x: 580, y: 265 }, endPoint: { x: 580, y: 285 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 720, y: 265, startPoint: { x: 720, y: 265 }, endPoint: { x: 720, y: 285 }, stroke: '#94a3b8', strokeWidth: 1 },
  // L3 nodes
  { type: 'rect', x: 30, y: 285, width: 100, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: '1.1 Scope' },
  { type: 'rect', x: 170, y: 285, width: 100, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: '1.2 Schedule' },
  { type: 'rect', x: 280, y: 285, width: 100, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: '2.1 Backend' },
  { type: 'rect', x: 350, y: 285, width: 100, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: '2.2 Frontend' },
  { type: 'rect', x: 420, y: 285, width: 100, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: '2.3 Database' },
  { type: 'rect', x: 530, y: 285, width: 100, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: '3.1 Testing' },
  { type: 'rect', x: 670, y: 285, width: 100, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: '3.2 Go-Live' },
];


// ─── General Infographics ─────────────────────────────────────────────────────

const timelineShapes: TemplateShape[] = [
  { type: 'text', x: 280, y: 25, text: 'Timeline / Roadmap', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Main horizontal line
  { type: 'line', x: 50, y: 280, startPoint: { x: 50, y: 280 }, endPoint: { x: 750, y: 280 }, stroke: '#60a5fa', strokeWidth: 3 },
  // Milestone diamonds
  { type: 'diamond', x: 128, y: 272, width: 20, height: 20, fill: '#3b82f6', stroke: '#93c5fd', strokeWidth: 2 },
  { type: 'diamond', x: 253, y: 272, width: 20, height: 20, fill: '#8b5cf6', stroke: '#c4b5fd', strokeWidth: 2 },
  { type: 'diamond', x: 383, y: 272, width: 20, height: 20, fill: '#22c55e', stroke: '#86efac', strokeWidth: 2 },
  { type: 'diamond', x: 513, y: 272, width: 20, height: 20, fill: '#f59e0b', stroke: '#fde68a', strokeWidth: 2 },
  { type: 'diamond', x: 643, y: 272, width: 20, height: 20, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 2 },
  // Events above
  { type: 'rect', x: 78, y: 170, width: 120, height: 70, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 1, label: 'Q1: Project Kick-off' },
  { type: 'line', x: 138, y: 240, startPoint: { x: 138, y: 240 }, endPoint: { x: 138, y: 272 }, stroke: '#3b82f6', strokeWidth: 1 },
  { type: 'rect', x: 333, y: 170, width: 120, height: 70, fill: '#14532d', stroke: '#22c55e', strokeWidth: 1, label: 'Q3: MVP Launch' },
  { type: 'line', x: 393, y: 240, startPoint: { x: 393, y: 240 }, endPoint: { x: 393, y: 272 }, stroke: '#22c55e', strokeWidth: 1 },
  { type: 'rect', x: 593, y: 170, width: 120, height: 70, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 1, label: 'Q5: Full Release' },
  { type: 'line', x: 653, y: 240, startPoint: { x: 653, y: 240 }, endPoint: { x: 653, y: 272 }, stroke: '#ef4444', strokeWidth: 1 },
  // Events below
  { type: 'line', x: 263, y: 288, startPoint: { x: 263, y: 288 }, endPoint: { x: 263, y: 320 }, stroke: '#8b5cf6', strokeWidth: 1 },
  { type: 'rect', x: 203, y: 320, width: 120, height: 70, fill: '#4c1d95', stroke: '#8b5cf6', strokeWidth: 1, label: 'Q2: Design Phase' },
  { type: 'line', x: 523, y: 288, startPoint: { x: 523, y: 288 }, endPoint: { x: 523, y: 320 }, stroke: '#f59e0b', strokeWidth: 1 },
  { type: 'rect', x: 463, y: 320, width: 120, height: 70, fill: '#78350f', stroke: '#f59e0b', strokeWidth: 1, label: 'Q4: Beta Testing' },
];

const mindMapShapes: TemplateShape[] = [
  { type: 'text', x: 290, y: 20, text: 'Mind Map', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Center
  { type: 'ellipse', x: 370, y: 230, width: 140, height: 70, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 3, label: 'Central Idea' },
  // Main branches
  { type: 'line', x: 440, y: 195, startPoint: { x: 440, y: 195 }, endPoint: { x: 530, y: 110 }, stroke: '#60a5fa', strokeWidth: 2 },
  { type: 'ellipse', x: 530, y: 90, width: 110, height: 45, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'Topic 1' },
  { type: 'line', x: 510, y: 230, startPoint: { x: 510, y: 230 }, endPoint: { x: 620, y: 200 }, stroke: '#60a5fa', strokeWidth: 2 },
  { type: 'ellipse', x: 640, y: 185, width: 110, height: 45, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'Topic 2' },
  { type: 'line', x: 510, y: 265, startPoint: { x: 510, y: 265 }, endPoint: { x: 620, y: 310 }, stroke: '#60a5fa', strokeWidth: 2 },
  { type: 'ellipse', x: 640, y: 295, width: 110, height: 45, fill: '#92400e', stroke: '#f59e0b', strokeWidth: 2, label: 'Topic 3' },
  { type: 'line', x: 440, y: 268, startPoint: { x: 440, y: 268 }, endPoint: { x: 490, y: 370 }, stroke: '#60a5fa', strokeWidth: 2 },
  { type: 'ellipse', x: 490, y: 365, width: 110, height: 45, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 2, label: 'Topic 4' },
  { type: 'line', x: 370, y: 268, startPoint: { x: 370, y: 268 }, endPoint: { x: 280, y: 360 }, stroke: '#60a5fa', strokeWidth: 2 },
  { type: 'ellipse', x: 230, y: 355, width: 110, height: 45, fill: '#134e4a', stroke: '#14b8a6', strokeWidth: 2, label: 'Topic 5' },
  { type: 'line', x: 300, y: 265, startPoint: { x: 300, y: 265 }, endPoint: { x: 180, y: 290 }, stroke: '#60a5fa', strokeWidth: 2 },
  { type: 'ellipse', x: 110, y: 278, width: 110, height: 45, fill: '#4c1d95', stroke: '#8b5cf6', strokeWidth: 2, label: 'Topic 6' },
  // Sub-branches for Topic 1
  { type: 'line', x: 585, y: 90, startPoint: { x: 585, y: 90 }, endPoint: { x: 650, y: 55 }, stroke: '#a78bfa', strokeWidth: 1 },
  { type: 'ellipse', x: 660, y: 45, width: 80, height: 30, fill: '#1e293b', stroke: '#8b5cf6', strokeWidth: 1, label: 'Sub 1.1' },
  { type: 'line', x: 585, y: 115, startPoint: { x: 585, y: 115 }, endPoint: { x: 660, y: 130 }, stroke: '#a78bfa', strokeWidth: 1 },
  { type: 'ellipse', x: 670, y: 125, width: 80, height: 30, fill: '#1e293b', stroke: '#8b5cf6', strokeWidth: 1, label: 'Sub 1.2' },
];

const orgChartShapes: TemplateShape[] = [
  { type: 'text', x: 280, y: 20, text: 'Organization Chart', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Root (CEO)
  { type: 'rect', x: 300, y: 55, width: 200, height: 60, fill: '#1e40af', stroke: '#3b82f6', strokeWidth: 2, label: 'CEO' },
  { type: 'line', x: 400, y: 115, startPoint: { x: 400, y: 115 }, endPoint: { x: 400, y: 150 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 150, y: 150, startPoint: { x: 150, y: 150 }, endPoint: { x: 650, y: 150 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 150, y: 150, startPoint: { x: 150, y: 150 }, endPoint: { x: 150, y: 175 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 400, y: 150, startPoint: { x: 400, y: 150 }, endPoint: { x: 400, y: 175 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 650, y: 150, startPoint: { x: 650, y: 150 }, endPoint: { x: 650, y: 175 }, stroke: '#94a3b8', strokeWidth: 1 },
  // Level 2
  { type: 'rect', x: 50, y: 175, width: 200, height: 55, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'CTO' },
  { type: 'rect', x: 300, y: 175, width: 200, height: 55, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'CFO' },
  { type: 'rect', x: 550, y: 175, width: 200, height: 55, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: 'COO' },
  // Lines to L3
  { type: 'line', x: 150, y: 230, startPoint: { x: 150, y: 230 }, endPoint: { x: 150, y: 270 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 80, y: 270, startPoint: { x: 80, y: 270 }, endPoint: { x: 220, y: 270 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 80, y: 270, startPoint: { x: 80, y: 270 }, endPoint: { x: 80, y: 290 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 220, y: 270, startPoint: { x: 220, y: 270 }, endPoint: { x: 220, y: 290 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 400, y: 230, startPoint: { x: 400, y: 230 }, endPoint: { x: 400, y: 270 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 330, y: 270, startPoint: { x: 330, y: 270 }, endPoint: { x: 470, y: 270 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 330, y: 270, startPoint: { x: 330, y: 270 }, endPoint: { x: 330, y: 290 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 470, y: 270, startPoint: { x: 470, y: 270 }, endPoint: { x: 470, y: 290 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 650, y: 230, startPoint: { x: 650, y: 230 }, endPoint: { x: 650, y: 270 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 580, y: 270, startPoint: { x: 580, y: 270 }, endPoint: { x: 720, y: 270 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 580, y: 270, startPoint: { x: 580, y: 270 }, endPoint: { x: 580, y: 290 }, stroke: '#94a3b8', strokeWidth: 1 },
  { type: 'line', x: 720, y: 270, startPoint: { x: 720, y: 270 }, endPoint: { x: 720, y: 290 }, stroke: '#94a3b8', strokeWidth: 1 },
  // Level 3
  { type: 'rect', x: 30, y: 290, width: 100, height: 50, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: 'Dev Lead' },
  { type: 'rect', x: 170, y: 290, width: 100, height: 50, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: 'Infra Lead' },
  { type: 'rect', x: 280, y: 290, width: 100, height: 50, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: 'Controller' },
  { type: 'rect', x: 420, y: 290, width: 100, height: 50, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: 'Analyst' },
  { type: 'rect', x: 530, y: 290, width: 100, height: 50, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: 'Ops Mgr' },
  { type: 'rect', x: 670, y: 290, width: 100, height: 50, fill: '#065f46', stroke: '#10b981', strokeWidth: 1, label: 'HR Lead' },
];

const comparisonShapes: TemplateShape[] = [
  { type: 'text', x: 260, y: 25, text: 'Product Comparison', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Headers
  { type: 'rect', x: 50, y: 65, width: 260, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Feature' },
  { type: 'rect', x: 320, y: 65, width: 200, height: 50, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: 'Product A' },
  { type: 'rect', x: 530, y: 65, width: 200, height: 50, fill: '#14532d', stroke: '#22c55e', strokeWidth: 2, label: 'Product B' },
  // Rows
  { type: 'rect', x: 50, y: 120, width: 260, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Price' },
  { type: 'rect', x: 320, y: 120, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '$49/mo' },
  { type: 'rect', x: 530, y: 120, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '$39/mo' },
  { type: 'rect', x: 50, y: 175, width: 260, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Storage' },
  { type: 'rect', x: 320, y: 175, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '100 GB' },
  { type: 'rect', x: 530, y: 175, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '50 GB' },
  { type: 'rect', x: 50, y: 230, width: 260, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'API Access' },
  { type: 'rect', x: 320, y: 230, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '✓ Yes' },
  { type: 'rect', x: 530, y: 230, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '✗ No' },
  { type: 'rect', x: 50, y: 285, width: 260, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Support' },
  { type: 'rect', x: 320, y: 285, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '24/7 Chat' },
  { type: 'rect', x: 530, y: 285, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Email Only' },
  { type: 'rect', x: 50, y: 340, width: 260, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: 'Integrations' },
  { type: 'rect', x: 320, y: 340, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '50+' },
  { type: 'rect', x: 530, y: 340, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1, label: '20+' },
];

const statisticsDashShapes: TemplateShape[] = [
  { type: 'text', x: 260, y: 20, text: 'Statistics Dashboard', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Large KPI numbers
  { type: 'rect', x: 50, y: 55, width: 160, height: 90, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2 },
  { type: 'text', x: 85, y: 95, text: '98.5%', fill: 'transparent', stroke: 'transparent', fontSize: 24 },
  { type: 'text', x: 75, y: 130, text: 'Uptime', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'rect', x: 220, y: 55, width: 160, height: 90, fill: '#14532d', stroke: '#22c55e', strokeWidth: 2 },
  { type: 'text', x: 255, y: 95, text: '12,847', fill: 'transparent', stroke: 'transparent', fontSize: 24 },
  { type: 'text', x: 255, y: 130, text: 'Users', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'rect', x: 390, y: 55, width: 160, height: 90, fill: '#78350f', stroke: '#f59e0b', strokeWidth: 2 },
  { type: 'text', x: 415, y: 95, text: '$248K', fill: 'transparent', stroke: 'transparent', fontSize: 24 },
  { type: 'text', x: 415, y: 130, text: 'Revenue', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'rect', x: 560, y: 55, width: 160, height: 90, fill: '#4c1d95', stroke: '#8b5cf6', strokeWidth: 2 },
  { type: 'text', x: 595, y: 95, text: '4.8/5', fill: 'transparent', stroke: 'transparent', fontSize: 24 },
  { type: 'text', x: 590, y: 130, text: 'NPS Score', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  // Bar chart
  { type: 'rect', x: 50, y: 165, width: 340, height: 180, fill: '#0f172a', stroke: '#334155', strokeWidth: 1, label: 'Monthly Revenue' },
  { type: 'rect', x: 70, y: 270, width: 30, height: 60, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1 },
  { type: 'rect', x: 110, y: 255, width: 30, height: 75, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1 },
  { type: 'rect', x: 150, y: 240, width: 30, height: 90, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1 },
  { type: 'rect', x: 190, y: 220, width: 30, height: 110, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'rect', x: 230, y: 200, width: 30, height: 130, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  { type: 'rect', x: 270, y: 185, width: 30, height: 145, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
  // Pie chart approximation (ellipse)
  { type: 'ellipse', x: 570, y: 255, width: 130, height: 130, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 2, label: 'Market Share' },
  { type: 'ellipse', x: 615, y: 215, width: 50, height: 50, fill: '#1e293b', stroke: '#334155', strokeWidth: 1 },
  { type: 'ellipse', x: 555, y: 260, width: 60, height: 60, fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1 },
];

const processStepsShapes: TemplateShape[] = [
  { type: 'text', x: 270, y: 35, text: 'Process Steps (Horizontal)', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  { type: 'rect', x: 40, y: 160, width: 110, height: 80, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: '1. Discovery' },
  { type: 'arrow', x: 150, y: 200, startPoint: { x: 150, y: 200 }, endPoint: { x: 185, y: 200 }, stroke: '#60a5fa', strokeWidth: 2 },
  { type: 'rect', x: 185, y: 160, width: 110, height: 80, fill: '#5b21b6', stroke: '#8b5cf6', strokeWidth: 2, label: '2. Planning' },
  { type: 'arrow', x: 295, y: 200, startPoint: { x: 295, y: 200 }, endPoint: { x: 330, y: 200 }, stroke: '#60a5fa', strokeWidth: 2 },
  { type: 'rect', x: 330, y: 160, width: 110, height: 80, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: '3. Design' },
  { type: 'arrow', x: 440, y: 200, startPoint: { x: 440, y: 200 }, endPoint: { x: 475, y: 200 }, stroke: '#60a5fa', strokeWidth: 2 },
  { type: 'rect', x: 475, y: 160, width: 110, height: 80, fill: '#92400e', stroke: '#f59e0b', strokeWidth: 2, label: '4. Build' },
  { type: 'arrow', x: 585, y: 200, startPoint: { x: 585, y: 200 }, endPoint: { x: 620, y: 200 }, stroke: '#60a5fa', strokeWidth: 2 },
  { type: 'rect', x: 620, y: 160, width: 110, height: 80, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 2, label: '5. Launch' },
  // Step numbers
  { type: 'ellipse', x: 95, y: 152, width: 30, height: 30, fill: '#3b82f6', stroke: '#93c5fd', strokeWidth: 2, label: '1' },
  { type: 'ellipse', x: 240, y: 152, width: 30, height: 30, fill: '#8b5cf6', stroke: '#c4b5fd', strokeWidth: 2, label: '2' },
  { type: 'ellipse', x: 385, y: 152, width: 30, height: 30, fill: '#22c55e', stroke: '#86efac', strokeWidth: 2, label: '3' },
  { type: 'ellipse', x: 530, y: 152, width: 30, height: 30, fill: '#f59e0b', stroke: '#fde68a', strokeWidth: 2, label: '4' },
  { type: 'ellipse', x: 675, y: 152, width: 30, height: 30, fill: '#ef4444', stroke: '#fca5a5', strokeWidth: 2, label: '5' },
];

const cycleDiagramShapes: TemplateShape[] = [
  { type: 'text', x: 280, y: 25, text: 'Cycle Diagram (PDCA)', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Four ellipses in a square arrangement
  { type: 'ellipse', x: 290, y: 115, width: 140, height: 80, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: 'Plan' },
  { type: 'ellipse', x: 480, y: 240, width: 140, height: 80, fill: '#14532d', stroke: '#22c55e', strokeWidth: 2, label: 'Do' },
  { type: 'ellipse', x: 290, y: 360, width: 140, height: 80, fill: '#92400e', stroke: '#f59e0b', strokeWidth: 2, label: 'Check' },
  { type: 'ellipse', x: 100, y: 240, width: 140, height: 80, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 2, label: 'Act' },
  // Arrows between them (cycle)
  { type: 'arrow', x: 430, y: 140, startPoint: { x: 430, y: 140 }, endPoint: { x: 480, y: 215 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'arrow', x: 480, y: 280, startPoint: { x: 480, y: 280 }, endPoint: { x: 430, y: 345 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'arrow', x: 290, y: 380, startPoint: { x: 290, y: 380 }, endPoint: { x: 240, y: 305 }, stroke: '#94a3b8', strokeWidth: 2 },
  { type: 'arrow', x: 170, y: 215, startPoint: { x: 170, y: 215 }, endPoint: { x: 230, y: 150 }, stroke: '#94a3b8', strokeWidth: 2 },
  // Center text
  { type: 'text', x: 295, y: 255, text: 'Continuous\nImprovement', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
];

const vennShapes: TemplateShape[] = [
  { type: 'text', x: 270, y: 25, text: 'Venn Diagram', fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Three overlapping ellipses
  { type: 'ellipse', x: 280, y: 190, width: 220, height: 200, fill: 'rgba(239,68,68,0.35)', stroke: '#ef4444', strokeWidth: 2, label: 'Set A', opacity: 0.7 },
  { type: 'ellipse', x: 420, y: 190, width: 220, height: 200, fill: 'rgba(59,130,246,0.35)', stroke: '#3b82f6', strokeWidth: 2, label: 'Set B', opacity: 0.7 },
  { type: 'ellipse', x: 350, y: 310, width: 220, height: 200, fill: 'rgba(34,197,94,0.35)', stroke: '#22c55e', strokeWidth: 2, label: 'Set C', opacity: 0.7 },
  // Labels for each region
  { type: 'text', x: 240, y: 200, text: 'Only A', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  { type: 'text', x: 490, y: 200, text: 'Only B', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  { type: 'text', x: 350, y: 450, text: 'Only C', fill: 'transparent', stroke: 'transparent', fontSize: 12 },
  { type: 'text', x: 310, y: 260, text: 'A∩B', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 440, y: 310, text: 'B∩C', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 285, y: 355, text: 'A∩C', fill: 'transparent', stroke: 'transparent', fontSize: 11 },
  { type: 'text', x: 350, y: 315, text: 'A∩B∩C', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
];

const pyramidShapes: TemplateShape[] = [
  { type: 'text', x: 265, y: 20, text: "Maslow's Hierarchy / Pyramid", fill: 'transparent', stroke: 'transparent', fontSize: 16 },
  // Pyramid layers (top to bottom, decreasing width)
  { type: 'rect', x: 325, y: 65, width: 150, height: 55, fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 2, label: 'Self-\nActualization' },
  { type: 'rect', x: 275, y: 125, width: 250, height: 55, fill: '#78350f', stroke: '#f59e0b', strokeWidth: 2, label: 'Esteem Needs' },
  { type: 'rect', x: 225, y: 185, width: 350, height: 55, fill: '#1e3a5f', stroke: '#3b82f6', strokeWidth: 2, label: 'Social / Belonging Needs' },
  { type: 'rect', x: 150, y: 245, width: 500, height: 55, fill: '#4c1d95', stroke: '#8b5cf6', strokeWidth: 2, label: 'Safety Needs' },
  { type: 'rect', x: 75, y: 305, width: 650, height: 55, fill: '#065f46', stroke: '#10b981', strokeWidth: 2, label: 'Physiological Needs (Food, Water, Shelter)' },
  // Level labels on right
  { type: 'text', x: 740, y: 97, text: 'Level 5', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 740, y: 157, text: 'Level 4', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 740, y: 217, text: 'Level 3', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 740, y: 277, text: 'Level 2', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
  { type: 'text', x: 740, y: 337, text: 'Level 1', fill: 'transparent', stroke: 'transparent', fontSize: 10 },
];


// ─── SVG Preview Components ───────────────────────────────────────────────────

const FishbonePreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <line x1="20" y1="70" x2="180" y2="70" stroke="#60a5fa" strokeWidth="2.5" />
    <polygon points="180,70 170,65 170,75" fill="#60a5fa" />
    <rect x="185" y="58" width="45" height="24" fill="#ef4444" rx="2" />
    <text x="207" y="73" textAnchor="middle" fill="white" fontSize="8">Effect</text>
    <line x1="60" y1="70" x2="40" y2="42" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="100" y1="70" x2="80" y2="42" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="140" y1="70" x2="120" y2="42" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="60" y1="70" x2="40" y2="98" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="100" y1="70" x2="80" y2="98" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="140" y1="70" x2="120" y2="98" stroke="#94a3b8" strokeWidth="1.5" />
    <text x="28" y="38" fill="#e2e8f0" fontSize="7">Man</text>
    <text x="68" y="38" fill="#e2e8f0" fontSize="7">Machine</text>
    <text x="108" y="38" fill="#e2e8f0" fontSize="7">Method</text>
    <text x="22" y="112" fill="#e2e8f0" fontSize="7">Material</text>
    <text x="62" y="112" fill="#e2e8f0" fontSize="7">Measure</text>
    <text x="104" y="112" fill="#e2e8f0" fontSize="7">Mother Nature</text>
  </svg>
);

const ParetoPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="25" y="30" width="25" height="80" fill="#3b82f6" />
    <rect x="55" y="45" width="25" height="65" fill="#3b82f6" />
    <rect x="85" y="60" width="25" height="50" fill="#3b82f6" />
    <rect x="115" y="75" width="25" height="35" fill="#3b82f6" />
    <rect x="145" y="88" width="25" height="22" fill="#3b82f6" />
    <rect x="175" y="97" width="25" height="13" fill="#3b82f6" />
    <line x1="20" y1="60" x2="210" y2="60" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" />
    <text x="212" y="63" fill="#ef4444" fontSize="7">80%</text>
    <line x1="20" y1="110" x2="210" y2="110" stroke="#94a3b8" strokeWidth="1" />
    <line x1="20" y1="20" x2="20" y2="110" stroke="#94a3b8" strokeWidth="1" />
    <text x="80" y="130" textAnchor="middle" fill="#94a3b8" fontSize="8">Categories</text>
  </svg>
);

const HistogramPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="20" y="85" width="22" height="30" fill="#8b5cf6" />
    <rect x="45" y="65" width="22" height="50" fill="#8b5cf6" />
    <rect x="70" y="42" width="22" height="73" fill="#8b5cf6" />
    <rect x="95" y="28" width="22" height="87" fill="#8b5cf6" />
    <rect x="120" y="38" width="22" height="77" fill="#8b5cf6" />
    <rect x="145" y="55" width="22" height="60" fill="#8b5cf6" />
    <rect x="170" y="72" width="22" height="43" fill="#8b5cf6" />
    <rect x="195" y="90" width="22" height="25" fill="#8b5cf6" />
    <line x1="15" y1="115" x2="225" y2="115" stroke="#94a3b8" strokeWidth="1" />
    <line x1="15" y1="20" x2="15" y2="115" stroke="#94a3b8" strokeWidth="1" />
    <text x="118" y="132" textAnchor="middle" fill="#94a3b8" fontSize="8">Measurement</text>
  </svg>
);

const ControlChartPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <line x1="20" y1="35" x2="220" y2="35" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" />
    <text x="222" y="38" fill="#ef4444" fontSize="7">UCL</text>
    <line x1="20" y1="75" x2="220" y2="75" stroke="#22c55e" strokeWidth="1.5" />
    <text x="222" y="78" fill="#22c55e" fontSize="7">CL</text>
    <line x1="20" y1="115" x2="220" y2="115" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" />
    <text x="222" y="118" fill="#ef4444" fontSize="7">LCL</text>
    <circle cx="40" cy="68" r="3" fill="#60a5fa" />
    <circle cx="65" cy="60" r="3" fill="#60a5fa" />
    <circle cx="90" cy="82" r="3" fill="#60a5fa" />
    <circle cx="115" cy="55" r="3" fill="#60a5fa" />
    <circle cx="140" cy="72" r="3" fill="#f59e0b" />
    <circle cx="165" cy="65" r="3" fill="#60a5fa" />
    <circle cx="190" cy="78" r="3" fill="#60a5fa" />
    <polyline points="40,68 65,60 90,82 115,55 140,72 165,65 190,78" fill="none" stroke="#60a5fa" strokeWidth="1" />
  </svg>
);

const ScatterPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <line x1="25" y1="115" x2="220" y2="115" stroke="#94a3b8" strokeWidth="1" />
    <line x1="25" y1="15" x2="25" y2="115" stroke="#94a3b8" strokeWidth="1" />
    <circle cx="45" cy="100" r="3" fill="#22c55e" />
    <circle cx="65" cy="90" r="3" fill="#22c55e" />
    <circle cx="85" cy="85" r="3" fill="#22c55e" />
    <circle cx="105" cy="75" r="3" fill="#22c55e" />
    <circle cx="125" cy="65" r="3" fill="#22c55e" />
    <circle cx="145" cy="55" r="3" fill="#22c55e" />
    <circle cx="165" cy="48" r="3" fill="#22c55e" />
    <circle cx="185" cy="38" r="3" fill="#22c55e" />
    <circle cx="70" cy="95" r="3" fill="#22c55e" />
    <circle cx="155" cy="52" r="3" fill="#22c55e" />
    <line x1="40" y1="105" x2="195" y2="30" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,2" />
    <text x="118" y="132" textAnchor="middle" fill="#94a3b8" fontSize="8">Variable X</text>
  </svg>
);

const CheckSheetPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="10" y="10" width="100" height="22" fill="#1e40af" rx="1" />
    <text x="60" y="24" textAnchor="middle" fill="white" fontSize="7">Defect Type</text>
    <rect x="115" y="10" width="30" height="22" fill="#1e40af" rx="1" />
    <text x="130" y="24" textAnchor="middle" fill="white" fontSize="7">Mon</text>
    <rect x="150" y="10" width="30" height="22" fill="#1e40af" rx="1" />
    <text x="165" y="24" textAnchor="middle" fill="white" fontSize="7">Tue</text>
    <rect x="185" y="10" width="30" height="22" fill="#1e40af" rx="1" />
    <text x="200" y="24" textAnchor="middle" fill="white" fontSize="7">Wed</text>
    {[0,1,2,3,4].map(i => (
      <g key={i}>
        <rect x="10" y={36+i*22} width="100" height="20" fill="#334155" />
        <rect x="115" y={36+i*22} width="30" height="20" fill="#1e293b" />
        <rect x="150" y={36+i*22} width="30" height="20" fill="#1e293b" />
        <rect x="185" y={36+i*22} width="30" height="20" fill="#1e293b" />
        <text x="60" y={50+i*22} textAnchor="middle" fill="#e2e8f0" fontSize="7">Defect {i+1}</text>
        <text x="130" y={50+i*22} textAnchor="middle" fill="#60a5fa" fontSize="8">|||</text>
        <text x="165" y={50+i*22} textAnchor="middle" fill="#60a5fa" fontSize="8">||</text>
        <text x="200" y={50+i*22} textAnchor="middle" fill="#60a5fa" fontSize="8">||||</text>
      </g>
    ))}
  </svg>
);

const ProcessFlowPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="90" y="10" width="60" height="25" fill="#22c55e" rx="12" />
    <text x="120" y="26" textAnchor="middle" fill="white" fontSize="8">Start</text>
    <line x1="120" y1="35" x2="120" y2="48" stroke="#94a3b8" strokeWidth="1.5" />
    <polygon points="120,35 117,43 120,48 123,43" fill="#94a3b8" />
    <rect x="75" y="50" width="90" height="25" fill="#3b82f6" />
    <text x="120" y="66" textAnchor="middle" fill="white" fontSize="8">Process</text>
    <line x1="120" y1="75" x2="120" y2="88" stroke="#94a3b8" strokeWidth="1.5" />
    <polygon points="110,88 120,103 130,88" fill="#f59e0b" />
    <text x="120" y="99" textAnchor="middle" fill="white" fontSize="7">Decision?</text>
    <line x1="130" y1="96" x2="175" y2="96" stroke="#94a3b8" strokeWidth="1.5" />
    <rect x="155" y="82" width="60" height="25" fill="#3b82f6" />
    <text x="185" y="97" textAnchor="middle" fill="white" fontSize="7">Yes Path</text>
    <line x1="120" y1="103" x2="120" y2="115" stroke="#94a3b8" strokeWidth="1.5" />
    <rect x="90" y="115" width="60" height="22" fill="#ef4444" rx="11" />
    <text x="120" y="129" textAnchor="middle" fill="white" fontSize="8">End</text>
  </svg>
);

const DMAICPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    {[
      ['#3b82f6','D'],['#8b5cf6','M'],['#f59e0b','A'],['#22c55e','I'],['#06b6d4','C']
    ].map(([color,label],i) => (
      <g key={i}>
        <rect x={10+i*46} y="50" width="40" height="45" fill={color as string} rx="3" />
        <text x={30+i*46} y="75" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{label}</text>
        {i < 4 && <polygon points={`${50+i*46},72 ${54+i*46},68 ${54+i*46},76`} fill="#94a3b8" />}
      </g>
    ))}
    <text x="120" y="120" textAnchor="middle" fill="#94a3b8" fontSize="8">Define · Measure · Analyze · Improve · Control</text>
  </svg>
);

const SIPOCPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    {[
      ['#1e40af','S','Supplier'],['#5b21b6','I','Input'],['#065f46','P','Process'],['#92400e','O','Output'],['#7f1d1d','C','Customer']
    ].map(([color,label,full],i) => (
      <g key={i}>
        <rect x={8+i*46} y="15" width="40" height="22" fill={color as string} rx="2" />
        <text x={28+i*46} y="29" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{label}</text>
        <rect x={8+i*46} y="42" width="40" height="20" fill="#334155" />
        <rect x={8+i*46} y="66" width="40" height="20" fill="#334155" />
        <rect x={8+i*46} y="90" width="40" height="20" fill="#334155" />
        <text x={28+i*46} y="128" textAnchor="middle" fill="#94a3b8" fontSize="6">{full}</text>
      </g>
    ))}
  </svg>
);

const CTQPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="10" y="58" width="60" height="30" fill="#1e40af" rx="2" />
    <text x="40" y="76" textAnchor="middle" fill="white" fontSize="8">Customer</text>
    <line x1="70" y1="73" x2="95" y2="40" stroke="#60a5fa" strokeWidth="1" />
    <line x1="70" y1="73" x2="95" y2="73" stroke="#60a5fa" strokeWidth="1" />
    <line x1="70" y1="73" x2="95" y2="105" stroke="#60a5fa" strokeWidth="1" />
    <rect x="95" y="28" width="55" height="22" fill="#5b21b6" rx="2" />
    <text x="122" y="42" textAnchor="middle" fill="white" fontSize="7">Driver 1</text>
    <rect x="95" y="62" width="55" height="22" fill="#5b21b6" rx="2" />
    <text x="122" y="76" textAnchor="middle" fill="white" fontSize="7">Driver 2</text>
    <rect x="95" y="95" width="55" height="22" fill="#5b21b6" rx="2" />
    <text x="122" y="109" textAnchor="middle" fill="white" fontSize="7">Driver 3</text>
    <line x1="150" y1="39" x2="170" y2="28" stroke="#60a5fa" strokeWidth="1" />
    <line x1="150" y1="39" x2="170" y2="50" stroke="#60a5fa" strokeWidth="1" />
    <rect x="170" y="18" width="55" height="20" fill="#065f46" rx="2" />
    <text x="197" y="31" textAnchor="middle" fill="white" fontSize="6">CTQ 1.1</text>
    <rect x="170" y="42" width="55" height="20" fill="#065f46" rx="2" />
    <text x="197" y="55" textAnchor="middle" fill="white" fontSize="6">CTQ 1.2</text>
    <rect x="170" y="66" width="55" height="20" fill="#065f46" rx="2" />
    <text x="197" y="79" textAnchor="middle" fill="white" fontSize="6">CTQ 2.1</text>
    <rect x="170" y="90" width="55" height="20" fill="#065f46" rx="2" />
    <text x="197" y="103" textAnchor="middle" fill="white" fontSize="6">CTQ 2.2</text>
  </svg>
);

const ProcessCapabilityPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <ellipse cx="120" cy="75" rx="80" ry="45" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1.5" />
    <ellipse cx="120" cy="80" rx="55" ry="30" fill="rgba(59,130,246,0.25)" stroke="#60a5fa" strokeWidth="1" />
    <ellipse cx="120" cy="83" rx="30" ry="15" fill="rgba(59,130,246,0.35)" stroke="#93c5fd" strokeWidth="1" />
    <line x1="55" y1="25" x2="55" y2="110" stroke="#ef4444" strokeWidth="1.5" />
    <line x1="185" y1="25" x2="185" y2="110" stroke="#ef4444" strokeWidth="1.5" />
    <line x1="120" y1="25" x2="120" y2="110" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,2" />
    <line x1="20" y1="110" x2="220" y2="110" stroke="#94a3b8" strokeWidth="1" />
    <text x="50" y="20" fill="#ef4444" fontSize="7">LSL</text>
    <text x="180" y="20" fill="#ef4444" fontSize="7">USL</text>
    <text x="115" y="20" fill="#22c55e" fontSize="7">μ</text>
    <rect x="15" y="118" width="50" height="16" fill="#1e293b" stroke="#334155" strokeWidth="1" />
    <text x="40" y="129" textAnchor="middle" fill="#e2e8f0" fontSize="7">Cp=1.45</text>
    <rect x="72" y="118" width="50" height="16" fill="#1e293b" stroke="#334155" strokeWidth="1" />
    <text x="97" y="129" textAnchor="middle" fill="#e2e8f0" fontSize="7">Cpk=1.32</text>
    <rect x="130" y="118" width="50" height="16" fill="#1e293b" stroke="#334155" strokeWidth="1" />
    <text x="155" y="129" textAnchor="middle" fill="#e2e8f0" fontSize="7">σ=4.2</text>
  </svg>
);

const VOCPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="8" y="10" width="90" height="22" fill="#1e40af" rx="1" />
    <text x="53" y="24" textAnchor="middle" fill="white" fontSize="7">Customer Need</text>
    <rect x="103" y="10" width="40" height="22" fill="#5b21b6" rx="1" />
    <text x="123" y="24" textAnchor="middle" fill="white" fontSize="7">Imp.</text>
    <rect x="148" y="10" width="40" height="22" fill="#065f46" rx="1" />
    <text x="168" y="24" textAnchor="middle" fill="white" fontSize="7">Sat.</text>
    <rect x="193" y="10" width="40" height="22" fill="#92400e" rx="1" />
    <text x="213" y="24" textAnchor="middle" fill="white" fontSize="7">Priority</text>
    {['Fast Delivery','Low Price','Quality','Easy Returns'].map((need,i) => (
      <g key={i}>
        <rect x="8" y={36+i*25} width="90" height="22" fill="#334155" />
        <text x="53" y={51+i*25} textAnchor="middle" fill="#e2e8f0" fontSize="7">{need}</text>
        <polygon points={`123,${40+i*25} 133,${47+i*25} 123,${55+i*25} 113,${47+i*25}`} fill={i===0||i===2?'#22c55e':'#f59e0b'} />
        <polygon points={`168,${40+i*25} 178,${47+i*25} 168,${55+i*25} 158,${47+i*25}`} fill={i===2?'#ef4444':i===1||i===3?'#22c55e':'#f59e0b'} />
        <rect x="193" y={36+i*25} width="40" height="22" fill={i===2?'#7f1d1d':i===0?'#7f1d1d':i===1?'#78350f':'#14532d'} />
        <text x="213" y={51+i*25} textAnchor="middle" fill="white" fontSize="6">{i===2?'CRITICAL':i===0?'HIGH':i===1?'MED':'LOW'}</text>
      </g>
    ))}
  </svg>
);

const SWOTPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="8" y="15" width="110" height="55" fill="#14532d" stroke="#22c55e" strokeWidth="1.5" rx="2" />
    <text x="63" y="40" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">STRENGTHS</text>
    <text x="63" y="55" textAnchor="middle" fill="#86efac" fontSize="7">+ Market Leader</text>
    <text x="63" y="65" textAnchor="middle" fill="#86efac" fontSize="7">+ Strong Brand</text>
    <rect x="122" y="15" width="110" height="55" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" rx="2" />
    <text x="177" y="40" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">WEAKNESSES</text>
    <text x="177" y="55" textAnchor="middle" fill="#fca5a5" fontSize="7">- High Costs</text>
    <text x="177" y="65" textAnchor="middle" fill="#fca5a5" fontSize="7">- Limited Digital</text>
    <rect x="8" y="74" width="110" height="55" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
    <text x="63" y="98" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">OPPORTUNITIES</text>
    <text x="63" y="113" textAnchor="middle" fill="#93c5fd" fontSize="7">+ New Markets</text>
    <text x="63" y="123" textAnchor="middle" fill="#93c5fd" fontSize="7">+ Partnerships</text>
    <rect x="122" y="74" width="110" height="55" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" rx="2" />
    <text x="177" y="98" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">THREATS</text>
    <text x="177" y="113" textAnchor="middle" fill="#fde68a" fontSize="7">- Competition</text>
    <text x="177" y="123" textAnchor="middle" fill="#fde68a" fontSize="7">- Economic Risk</text>
  </svg>
);

const PortersPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="85" y="55" width="70" height="35" fill="#1e40af" rx="2" />
    <text x="120" y="76" textAnchor="middle" fill="white" fontSize="7">Industry Rivalry</text>
    <rect x="85" y="10" width="70" height="30" fill="#5b21b6" rx="2" />
    <text x="120" y="28" textAnchor="middle" fill="white" fontSize="7">New Entrants</text>
    <line x1="120" y1="40" x2="120" y2="55" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arr)" />
    <rect x="85" y="105" width="70" height="30" fill="#5b21b6" rx="2" />
    <text x="120" y="123" textAnchor="middle" fill="white" fontSize="7">Substitutes</text>
    <line x1="120" y1="105" x2="120" y2="92" stroke="#94a3b8" strokeWidth="1.5" />
    <rect x="5" y="60" width="65" height="28" fill="#065f46" rx="2" />
    <text x="37" y="77" textAnchor="middle" fill="white" fontSize="7">Suppliers</text>
    <line x1="70" y1="73" x2="85" y2="73" stroke="#94a3b8" strokeWidth="1.5" />
    <rect x="170" y="60" width="65" height="28" fill="#92400e" rx="2" />
    <text x="202" y="77" textAnchor="middle" fill="white" fontSize="7">Buyers</text>
    <line x1="155" y1="73" x2="170" y2="73" stroke="#94a3b8" strokeWidth="1.5" />
  </svg>
);

const ValueStreamPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="5" y="30" width="40" height="30" fill="#334155" stroke="#60a5fa" strokeWidth="1.5" rx="2" />
    <text x="25" y="48" textAnchor="middle" fill="white" fontSize="7">Supplier</text>
    <line x1="45" y1="45" x2="60" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
    <rect x="60" y="30" width="40" height="30" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
    <text x="80" y="48" textAnchor="middle" fill="white" fontSize="7">Proc 1</text>
    <line x1="100" y1="45" x2="115" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
    <rect x="115" y="30" width="40" height="30" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
    <text x="135" y="48" textAnchor="middle" fill="white" fontSize="7">Proc 2</text>
    <line x1="155" y1="45" x2="170" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
    <rect x="170" y="30" width="40" height="30" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
    <text x="190" y="48" textAnchor="middle" fill="white" fontSize="7">Proc 3</text>
    <line x1="210" y1="45" x2="225" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
    <rect x="220" y="30" width="15" height="30" fill="#334155" stroke="#22c55e" strokeWidth="1.5" />
    <polygon points="50,53 55,48 55,58" fill="#f59e0b" />
    <polygon points="108,53 113,48 113,58" fill="#f59e0b" />
    <polygon points="163,53 168,48 168,58" fill="#f59e0b" />
    <line x1="5" y1="80" x2="235" y2="80" stroke="#94a3b8" strokeWidth="1" />
    <rect x="5" y="83" width="40" height="20" fill="#14532d" stroke="#22c55e" strokeWidth="1" />
    <text x="25" y="96" textAnchor="middle" fill="white" fontSize="6">2d VA</text>
    <rect x="50" y="83" width="40" height="20" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
    <text x="70" y="96" textAnchor="middle" fill="white" fontSize="6">5d NVA</text>
    <rect x="95" y="83" width="40" height="20" fill="#14532d" stroke="#22c55e" strokeWidth="1" />
    <text x="115" y="96" textAnchor="middle" fill="white" fontSize="6">3d VA</text>
    <rect x="140" y="83" width="40" height="20" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
    <text x="160" y="96" textAnchor="middle" fill="white" fontSize="6">3d NVA</text>
    <rect x="185" y="83" width="40" height="20" fill="#14532d" stroke="#22c55e" strokeWidth="1" />
    <text x="205" y="96" textAnchor="middle" fill="white" fontSize="6">4d VA</text>
    <text x="120" y="125" textAnchor="middle" fill="#94a3b8" fontSize="7">Total Lead: 17d | VA: 9d</text>
  </svg>
);

const BalancedScorecardPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <ellipse cx="120" cy="70" rx="35" ry="22" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5" />
    <text x="120" y="68" textAnchor="middle" fill="white" fontSize="6">Vision &</text>
    <text x="120" y="78" textAnchor="middle" fill="white" fontSize="6">Strategy</text>
    <rect x="75" y="5" width="90" height="28" fill="#065f46" stroke="#10b981" strokeWidth="1.5" rx="2" />
    <text x="120" y="22" textAnchor="middle" fill="white" fontSize="8">Financial</text>
    <rect x="160" y="55" width="75" height="28" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
    <text x="197" y="72" textAnchor="middle" fill="white" fontSize="8">Customer</text>
    <rect x="75" y="108" width="90" height="28" fill="#92400e" stroke="#f59e0b" strokeWidth="1.5" rx="2" />
    <text x="120" y="125" textAnchor="middle" fill="white" fontSize="7">Internal Process</text>
    <rect x="5" y="55" width="75" height="28" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" rx="2" />
    <text x="42" y="68" textAnchor="middle" fill="white" fontSize="6">Learning &</text>
    <text x="42" y="78" textAnchor="middle" fill="white" fontSize="6">Growth</text>
    <line x1="120" y1="33" x2="120" y2="48" stroke="#94a3b8" strokeWidth="1" />
    <line x1="155" y1="70" x2="160" y2="70" stroke="#94a3b8" strokeWidth="1" />
    <line x1="120" y1="92" x2="120" y2="108" stroke="#94a3b8" strokeWidth="1" />
    <line x1="80" y1="70" x2="85" y2="70" stroke="#94a3b8" strokeWidth="1" />
  </svg>
);

const AnsoffPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="15" y="15" width="100" height="55" fill="#14532d" stroke="#22c55e" strokeWidth="1.5" rx="2" />
    <text x="65" y="38" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Market</text>
    <text x="65" y="50" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Penetration</text>
    <text x="65" y="62" textAnchor="middle" fill="#86efac" fontSize="6">Low Risk</text>
    <rect x="125" y="15" width="100" height="55" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
    <text x="175" y="38" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Product</text>
    <text x="175" y="50" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Development</text>
    <text x="175" y="62" textAnchor="middle" fill="#93c5fd" fontSize="6">Med Risk</text>
    <rect x="15" y="80" width="100" height="55" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
    <text x="65" y="103" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Market</text>
    <text x="65" y="115" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Development</text>
    <text x="65" y="127" textAnchor="middle" fill="#c4b5fd" fontSize="6">Med Risk</text>
    <rect x="125" y="80" width="100" height="55" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" rx="2" />
    <text x="175" y="103" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Diversification</text>
    <text x="175" y="115" textAnchor="middle" fill="#fca5a5" fontSize="6">High Risk</text>
  </svg>
);

const HouseOfQualityPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <polygon points="120,10 80,50 160,50" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
    <text x="120" y="37" textAnchor="middle" fill="white" fontSize="7">Correlation</text>
    <rect x="10" y="50" width="60" height="75" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
    <text x="40" y="80" textAnchor="middle" fill="white" fontSize="7">Customer</text>
    <text x="40" y="92" textAnchor="middle" fill="white" fontSize="7">Needs</text>
    {[0,1,2,3,4].map(i => (
      <rect key={i} x={75+i*25} y="50" width="22" height="22" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="1" />
    ))}
    {[0,1,2].map(i => (
      <g key={i}>
        {[0,1,2,3,4].map(j => (
          <rect key={j} x={75+j*25} y={76+i*16} width="22" height="14" fill="#334155" stroke="#475569" strokeWidth="1" />
        ))}
      </g>
    ))}
    <rect x="75" y="125" width="125" height="15" fill="#92400e" stroke="#f59e0b" strokeWidth="1" />
    <text x="137" y="136" textAnchor="middle" fill="white" fontSize="6">Technical Targets</text>
    <rect x="205" y="50" width="30" height="75" fill="#065f46" stroke="#10b981" strokeWidth="1.5" rx="2" />
    <text x="220" y="85" textAnchor="middle" fill="white" fontSize="6" transform="rotate(90,220,85)">Competitive</text>
  </svg>
);

const GanttPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="5" y="8" width="60" height="18" fill="#1e40af" rx="1" />
    <text x="35" y="20" textAnchor="middle" fill="white" fontSize="7">Task</text>
    <rect x="70" y="8" width="40" height="18" fill="#1e40af" rx="1" />
    <text x="90" y="20" textAnchor="middle" fill="white" fontSize="7">W1</text>
    <rect x="115" y="8" width="40" height="18" fill="#1e40af" rx="1" />
    <text x="135" y="20" textAnchor="middle" fill="white" fontSize="7">W2</text>
    <rect x="160" y="8" width="40" height="18" fill="#1e40af" rx="1" />
    <text x="180" y="20" textAnchor="middle" fill="white" fontSize="7">W3</text>
    <rect x="205" y="8" width="30" height="18" fill="#1e40af" rx="1" />
    <text x="220" y="20" textAnchor="middle" fill="white" fontSize="7">W4</text>
    {['Planning','Design','Dev','Testing','Deploy'].map((task,i) => (
      <g key={i}>
        <rect x="5" y={30+i*22} width="60" height="18" fill="#334155" />
        <text x="35" y={43+i*22} textAnchor="middle" fill="#e2e8f0" fontSize="7">{task}</text>
      </g>
    ))}
    <rect x="70" y="30" width="85" height="16" fill="#22c55e" rx="2" />
    <rect x="70" y="52" width="40" height="16" fill="#3b82f6" rx="2" />
    <rect x="115" y="52" width="40" height="16" fill="#3b82f6" rx="2" />
    <rect x="115" y="74" width="85" height="16" fill="#8b5cf6" rx="2" />
    <rect x="205" y="96" width="30" height="16" fill="#f59e0b" rx="2" />
    <rect x="205" y="118" width="30" height="16" fill="#ef4444" rx="2" />
    <line x1="165" y1="8" x2="165" y2="140" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" />
  </svg>
);

const RACIPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="5" y="8" width="70" height="20" fill="#1e40af" rx="1" />
    <text x="40" y="21" textAnchor="middle" fill="white" fontSize="7">Activity</text>
    {['PM','Dev','QA','Client'].map((role,i) => (
      <rect key={i} x={80+i*40} y="8" width="37" height="20" fill="#1e40af" rx="1" />
    ))}
    {['PM','Dev','QA','Client'].map((role,i) => (
      <text key={i} x={98+i*40} y="21" textAnchor="middle" fill="white" fontSize="7">{role}</text>
    ))}
    {['Requirements','Design','Development','Testing'].map((act,i) => (
      <g key={i}>
        <rect x="5" y={32+i*25} width="70" height="22" fill="#334155" />
        <text x="40" y={47+i*25} textAnchor="middle" fill="#e2e8f0" fontSize="6">{act}</text>
        {[['A','R','C','I'],['A','R','I','C'],['I','A','R','I'],['C','C','A/R','I']].map((row,ri) => ri===i && row.map((cell,ci) => (
          <g key={ci}>
            <rect x={80+ci*40} y={32+i*25} width="37" height="22" fill={cell==='A'?'#14532d':cell==='R'?'#1e3a5f':'#1e293b'} />
            <text x={98+ci*40} y={47+i*25} textAnchor="middle" fill={cell==='A'?'#22c55e':cell==='R'?'#3b82f6':'#94a3b8'} fontSize="8" fontWeight="bold">{cell}</text>
          </g>
        )))}
      </g>
    ))}
  </svg>
);

const RiskMatrixPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <text x="120" y="10" textAnchor="middle" fill="#94a3b8" fontSize="7">Impact →</text>
    <text x="10" y="80" textAnchor="middle" fill="#94a3b8" fontSize="7" transform="rotate(-90,10,80)">Prob →</text>
    {[0,1,2,3,4].map(row => (
      [0,1,2,3,4].map(col => {
        const score = (4-row+1)*(col+1);
        const color = score >= 15 ? '#ef4444' : score >= 8 ? '#f59e0b' : '#22c55e';
        return (
          <g key={`${row}-${col}`}>
            <rect x={25+col*40} y={15+row*24} width="38" height="22" fill={color} stroke="#1e293b" strokeWidth="1" />
            <text x={44+col*40} y={30+row*24} textAnchor="middle" fill="white" fontSize="8">{score}</text>
          </g>
        );
      })
    ))}
  </svg>
);

const StakeholderPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="10" y="10" width="108" height="58" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
    <text x="64" y="32" textAnchor="middle" fill="#93c5fd" fontSize="7">Keep Satisfied</text>
    <rect x="122" y="10" width="108" height="58" fill="#14532d" stroke="#22c55e" strokeWidth="1.5" rx="2" />
    <text x="176" y="32" textAnchor="middle" fill="#86efac" fontSize="7">Manage Closely</text>
    <rect x="10" y="72" width="108" height="58" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="2" />
    <text x="64" y="95" textAnchor="middle" fill="#94a3b8" fontSize="7">Monitor</text>
    <rect x="122" y="72" width="108" height="58" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" rx="2" />
    <text x="176" y="95" textAnchor="middle" fill="#fde68a" fontSize="7">Keep Informed</text>
    <ellipse cx="45" cy="42" rx="28" ry="12" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1" />
    <text x="45" y="45" textAnchor="middle" fill="white" fontSize="6">Regulator</text>
    <ellipse cx="162" cy="38" rx="28" ry="12" fill="#22c55e" stroke="#4ade80" strokeWidth="1" />
    <text x="162" y="41" textAnchor="middle" fill="white" fontSize="6">Sponsor</text>
    <ellipse cx="55" cy="100" rx="28" ry="12" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
    <text x="55" y="103" textAnchor="middle" fill="white" fontSize="6">Public</text>
    <ellipse cx="175" cy="100" rx="28" ry="12" fill="#f59e0b" stroke="#fcd34d" strokeWidth="1" />
    <text x="175" y="103" textAnchor="middle" fill="white" fontSize="6">Team Lead</text>
  </svg>
);

const WBSPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="85" y="8" width="70" height="28" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
    <text x="120" y="25" textAnchor="middle" fill="white" fontSize="8">Project</text>
    <line x1="120" y1="36" x2="120" y2="50" stroke="#94a3b8" strokeWidth="1" />
    <line x1="40" y1="50" x2="200" y2="50" stroke="#94a3b8" strokeWidth="1" />
    <line x1="40" y1="50" x2="40" y2="58" stroke="#94a3b8" strokeWidth="1" />
    <line x1="120" y1="50" x2="120" y2="58" stroke="#94a3b8" strokeWidth="1" />
    <line x1="200" y1="50" x2="200" y2="58" stroke="#94a3b8" strokeWidth="1" />
    <rect x="5" y="58" width="70" height="24" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
    <text x="40" y="73" textAnchor="middle" fill="white" fontSize="7">Planning</text>
    <rect x="85" y="58" width="70" height="24" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
    <text x="120" y="73" textAnchor="middle" fill="white" fontSize="7">Development</text>
    <rect x="165" y="58" width="70" height="24" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
    <text x="200" y="73" textAnchor="middle" fill="white" fontSize="7">Deployment</text>
    <line x1="40" y1="82" x2="40" y2="95" stroke="#94a3b8" strokeWidth="1" />
    <line x1="20" y1="95" x2="60" y2="95" stroke="#94a3b8" strokeWidth="1" />
    <line x1="20" y1="95" x2="20" y2="105" stroke="#94a3b8" strokeWidth="1" />
    <line x1="60" y1="95" x2="60" y2="105" stroke="#94a3b8" strokeWidth="1" />
    <rect x="5" y="105" width="30" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1" rx="1" />
    <text x="20" y="119" textAnchor="middle" fill="white" fontSize="6">Scope</text>
    <rect x="45" y="105" width="30" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1" rx="1" />
    <text x="60" y="119" textAnchor="middle" fill="white" fontSize="6">Schedule</text>
    <line x1="120" y1="82" x2="120" y2="95" stroke="#94a3b8" strokeWidth="1" />
    <rect x="85" y="100" width="30" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1" rx="1" />
    <text x="100" y="114" textAnchor="middle" fill="white" fontSize="5">Backend</text>
    <rect x="120" y="100" width="30" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1" rx="1" />
    <text x="135" y="114" textAnchor="middle" fill="white" fontSize="5">Frontend</text>
    <rect x="200" y="100" width="30" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1" rx="1" />
    <text x="215" y="114" textAnchor="middle" fill="white" fontSize="6">Go-Live</text>
  </svg>
);

const TimelinePreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <line x1="15" y1="80" x2="225" y2="80" stroke="#60a5fa" strokeWidth="2.5" />
    {[40,90,140,190].map((x,i) => (
      <g key={i}>
        <polygon points={`${x},80 ${x-6},74 ${x},68 ${x+6},74`} fill={['#3b82f6','#8b5cf6','#22c55e','#f59e0b'][i]} />
        {i%2===0 ? (
          <g>
            <rect x={x-28} y="38" width="56" height="24" fill="#334155" rx="2" />
            <text x={x} y="53" textAnchor="middle" fill="#e2e8f0" fontSize="6">Milestone {i+1}</text>
            <line x1={x} y1="62" x2={x} y2="68" stroke="#94a3b8" strokeWidth="1" />
          </g>
        ) : (
          <g>
            <line x1={x} y1="86" x2={x} y2="95" stroke="#94a3b8" strokeWidth="1" />
            <rect x={x-28} y="95" width="56" height="24" fill="#334155" rx="2" />
            <text x={x} y="110" textAnchor="middle" fill="#e2e8f0" fontSize="6">Event {i+1}</text>
          </g>
        )}
      </g>
    ))}
    <text x="120" y="130" textAnchor="middle" fill="#94a3b8" fontSize="7">Q1 → Q2 → Q3 → Q4</text>
  </svg>
);

const MindMapPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <ellipse cx="120" cy="70" rx="30" ry="20" fill="#1e40af" stroke="#3b82f6" strokeWidth="2" />
    <text x="120" y="74" textAnchor="middle" fill="white" fontSize="8">Idea</text>
    {[
      [55,30,'#5b21b6','Topic 1'],
      [175,30,'#065f46','Topic 2'],
      [195,90,'#92400e','Topic 3'],
      [155,125,'#7f1d1d','Topic 4'],
      [85,125,'#134e4a','Topic 5'],
      [45,90,'#4c1d95','Topic 6'],
    ].map(([cx,cy,color,label],i) => (
      <g key={i}>
        <line x1="120" y1="70" x2={cx as number} y2={cy as number} stroke="#60a5fa" strokeWidth="1.5" />
        <ellipse cx={cx as number} cy={cy as number} rx="28" ry="14" fill={color as string} stroke="#60a5fa" strokeWidth="1" />
        <text x={cx as number} y={(cy as number)+4} textAnchor="middle" fill="white" fontSize="6">{label as string}</text>
      </g>
    ))}
  </svg>
);

const OrgChartPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="85" y="8" width="70" height="28" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
    <text x="120" y="25" textAnchor="middle" fill="white" fontSize="8">CEO</text>
    <line x1="120" y1="36" x2="120" y2="50" stroke="#94a3b8" strokeWidth="1" />
    <line x1="40" y1="50" x2="200" y2="50" stroke="#94a3b8" strokeWidth="1" />
    <line x1="40" y1="50" x2="40" y2="60" stroke="#94a3b8" strokeWidth="1" />
    <line x1="120" y1="50" x2="120" y2="60" stroke="#94a3b8" strokeWidth="1" />
    <line x1="200" y1="50" x2="200" y2="60" stroke="#94a3b8" strokeWidth="1" />
    <rect x="5" y="60" width="70" height="26" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
    <text x="40" y="75" textAnchor="middle" fill="white" fontSize="8">CTO</text>
    <rect x="85" y="60" width="70" height="26" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
    <text x="120" y="75" textAnchor="middle" fill="white" fontSize="8">CFO</text>
    <rect x="165" y="60" width="70" height="26" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
    <text x="200" y="75" textAnchor="middle" fill="white" fontSize="8">COO</text>
    <line x1="40" y1="86" x2="40" y2="96" stroke="#94a3b8" strokeWidth="1" />
    <line x1="20" y1="96" x2="60" y2="96" stroke="#94a3b8" strokeWidth="1" />
    <line x1="20" y1="96" x2="20" y2="104" stroke="#94a3b8" strokeWidth="1" />
    <line x1="60" y1="96" x2="60" y2="104" stroke="#94a3b8" strokeWidth="1" />
    <rect x="5" y="104" width="30" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1" rx="1" />
    <text x="20" y="118" textAnchor="middle" fill="white" fontSize="6">Dev</text>
    <rect x="45" y="104" width="30" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1" rx="1" />
    <text x="60" y="118" textAnchor="middle" fill="white" fontSize="6">Infra</text>
    <rect x="85" y="104" width="30" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1" rx="1" />
    <text x="100" y="118" textAnchor="middle" fill="white" fontSize="6">Ctrl</text>
    <rect x="165" y="104" width="30" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1" rx="1" />
    <text x="180" y="118" textAnchor="middle" fill="white" fontSize="6">Ops</text>
    <rect x="205" y="104" width="30" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1" rx="1" />
    <text x="220" y="118" textAnchor="middle" fill="white" fontSize="6">HR</text>
  </svg>
);

const ComparisonPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="8" y="10" width="100" height="22" fill="#334155" rx="1" />
    <text x="58" y="24" textAnchor="middle" fill="#94a3b8" fontSize="8">Feature</text>
    <rect x="113" y="10" width="55" height="22" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" rx="1" />
    <text x="140" y="24" textAnchor="middle" fill="white" fontSize="8">Product A</text>
    <rect x="173" y="10" width="60" height="22" fill="#14532d" stroke="#22c55e" strokeWidth="1.5" rx="1" />
    <text x="203" y="24" textAnchor="middle" fill="white" fontSize="8">Product B</text>
    {['Price','Storage','API','Support','Integrations'].map((feat,i) => (
      <g key={i}>
        <rect x="8" y={36+i*20} width="100" height="18" fill="#334155" />
        <text x="58" y={49+i*20} textAnchor="middle" fill="#e2e8f0" fontSize="7">{feat}</text>
        <rect x="113" y={36+i*20} width="55" height="18" fill="#1e293b" stroke="#334155" />
        <rect x="173" y={36+i*20} width="60" height="18" fill="#1e293b" stroke="#334155" />
        <text x="140" y={49+i*20} textAnchor="middle" fill="#3b82f6" fontSize="7">✓</text>
        <text x="203" y={49+i*20} textAnchor="middle" fill={i===2?'#ef4444':'#22c55e'} fontSize="7">{i===2?'✗':'✓'}</text>
      </g>
    ))}
  </svg>
);

const StatsDashPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="5" y="5" width="52" height="38" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1" rx="2" />
    <text x="31" y="24" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="bold">98.5%</text>
    <text x="31" y="38" textAnchor="middle" fill="#94a3b8" fontSize="6">Uptime</text>
    <rect x="62" y="5" width="52" height="38" fill="#14532d" stroke="#22c55e" strokeWidth="1" rx="2" />
    <text x="88" y="24" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="bold">12.8K</text>
    <text x="88" y="38" textAnchor="middle" fill="#94a3b8" fontSize="6">Users</text>
    <rect x="119" y="5" width="52" height="38" fill="#78350f" stroke="#f59e0b" strokeWidth="1" rx="2" />
    <text x="145" y="24" textAnchor="middle" fill="#fcd34d" fontSize="9" fontWeight="bold">$248K</text>
    <text x="145" y="38" textAnchor="middle" fill="#94a3b8" fontSize="6">Revenue</text>
    <rect x="176" y="5" width="58" height="38" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="1" rx="2" />
    <text x="205" y="24" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="bold">4.8★</text>
    <text x="205" y="38" textAnchor="middle" fill="#94a3b8" fontSize="6">NPS Score</text>
    <rect x="5" y="48" width="130" height="87" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="2" />
    <text x="70" y="62" textAnchor="middle" fill="#94a3b8" fontSize="7">Monthly Revenue</text>
    {[60,72,85,95,100,88].map((h,i) => (
      <rect key={i} x={12+i*18} y={135-h} width="14" height={h} fill={i>=3?'#22c55e':'#3b82f6'} rx="1" />
    ))}
    <ellipse cx="190" cy="100" rx="42" ry="32" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1.5" />
    <text x="190" y="95" textAnchor="middle" fill="white" fontSize="7">Market</text>
    <text x="190" y="107" textAnchor="middle" fill="white" fontSize="7">Share</text>
    <ellipse cx="200" cy="88" rx="16" ry="16" fill="#1e293b" />
    <ellipse cx="182" cy="108" rx="18" ry="18" fill="#22c55e" />
  </svg>
);

const ProcessStepsPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    {[
      ['#1e3a5f','#3b82f6','1'],['#5b21b6','#8b5cf6','2'],['#065f46','#10b981','3'],
      ['#92400e','#f59e0b','4'],['#7f1d1d','#ef4444','5']
    ].map(([bg,border,num],i) => (
      <g key={i}>
        <rect x={8+i*46} y="50" width="40" height="45" fill={bg as string} stroke={border as string} strokeWidth="1.5" rx="3" />
        <circle cx={28+i*46} cy="42" r="10" fill={border as string} />
        <text x={28+i*46} y="46" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{num}</text>
        <text x={28+i*46} y="78" textAnchor="middle" fill="white" fontSize="6">Step {num}</text>
        {i < 4 && <polygon points={`${49+i*46},72 ${53+i*46},68 ${53+i*46},76`} fill="#94a3b8" />}
      </g>
    ))}
  </svg>
);

const CyclePreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <ellipse cx="120" cy="30" rx="38" ry="18" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
    <text x="120" y="34" textAnchor="middle" fill="white" fontSize="8">Plan</text>
    <ellipse cx="205" cy="75" rx="30" ry="18" fill="#14532d" stroke="#22c55e" strokeWidth="1.5" />
    <text x="205" y="79" textAnchor="middle" fill="white" fontSize="8">Do</text>
    <ellipse cx="120" cy="118" rx="38" ry="18" fill="#92400e" stroke="#f59e0b" strokeWidth="1.5" />
    <text x="120" y="122" textAnchor="middle" fill="white" fontSize="8">Check</text>
    <ellipse cx="35" cy="75" rx="30" ry="18" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
    <text x="35" y="79" textAnchor="middle" fill="white" fontSize="8">Act</text>
    <path d="M 158,35 Q 195,40 195,57" stroke="#94a3b8" strokeWidth="1.5" fill="none" markerEnd="url(#arrowHead)" />
    <path d="M 200,93 Q 185,118 155,120" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
    <path d="M 85,120 Q 45,115 40,93" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
    <path d="M 40,57 Q 60,30 82,30" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
  </svg>
);

const VennPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <ellipse cx="90" cy="65" rx="65" ry="55" fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="1.5" />
    <ellipse cx="150" cy="65" rx="65" ry="55" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="1.5" />
    <ellipse cx="120" cy="95" rx="65" ry="45" fill="rgba(34,197,94,0.3)" stroke="#22c55e" strokeWidth="1.5" />
    <text x="62" y="50" textAnchor="middle" fill="#fca5a5" fontSize="8">Set A</text>
    <text x="178" y="50" textAnchor="middle" fill="#93c5fd" fontSize="8">Set B</text>
    <text x="120" y="132" textAnchor="middle" fill="#86efac" fontSize="8">Set C</text>
    <text x="120" y="75" textAnchor="middle" fill="white" fontSize="7">A∩B∩C</text>
  </svg>
);

const PyramidPreview = () => (
  <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
    <rect width="240" height="140" fill="#1e293b" rx="4" />
    <rect x="90" y="10" width="60" height="22" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" rx="1" />
    <text x="120" y="25" textAnchor="middle" fill="white" fontSize="7">Self-Act.</text>
    <rect x="72" y="36" width="96" height="22" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" rx="1" />
    <text x="120" y="51" textAnchor="middle" fill="white" fontSize="7">Esteem</text>
    <rect x="52" y="62" width="136" height="22" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" rx="1" />
    <text x="120" y="77" textAnchor="middle" fill="white" fontSize="7">Social / Belonging</text>
    <rect x="30" y="88" width="180" height="22" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="1.5" rx="1" />
    <text x="120" y="103" textAnchor="middle" fill="white" fontSize="7">Safety Needs</text>
    <rect x="8" y="114" width="224" height="22" fill="#065f46" stroke="#10b981" strokeWidth="1.5" rx="1" />
    <text x="120" y="129" textAnchor="middle" fill="white" fontSize="7">Physiological (Food, Water, Shelter)</text>
  </svg>
);


// ─── Templates Array ──────────────────────────────────────────────────────────

export const INFOGRAPHIC_TEMPLATES: InfographicTemplate[] = [
  // Quality Tools (7QC)
  {
    id: 'fishbone-ishikawa',
    name: 'Fishbone / Ishikawa Diagram',
    category: 'Quality Tools',
    tags: ['cause', 'effect', 'root cause', 'ishikawa', 'fishbone', '7qc', 'quality'],
    description: 'Identify root causes of a problem by categorizing causes into Man, Machine, Method, Material, Measurement, and Mother Nature.',
    icon: '🐟',
    preview: <FishbonePreview />,
    shapes: fishboneShapes,
  },
  {
    id: 'pareto-chart',
    name: 'Pareto Chart',
    category: 'Quality Tools',
    tags: ['pareto', '80/20', 'bar chart', 'frequency', '7qc', 'quality', 'priority'],
    description: 'Identify the most significant factors in a dataset. Uses the 80/20 rule to prioritize issues by frequency.',
    icon: '📊',
    preview: <ParetoPreview />,
    shapes: paretoShapes,
  },
  {
    id: 'histogram',
    name: 'Histogram',
    category: 'Quality Tools',
    tags: ['histogram', 'distribution', 'frequency', 'data', '7qc', 'quality'],
    description: 'Display the frequency distribution of a dataset. Shows how measurements are distributed across intervals.',
    icon: '📈',
    preview: <HistogramPreview />,
    shapes: histogramShapes,
  },
  {
    id: 'control-chart',
    name: 'Control Chart (X-bar)',
    category: 'Quality Tools',
    tags: ['control chart', 'spc', 'UCL', 'LCL', 'process control', '7qc', 'quality'],
    description: 'Monitor process stability over time with Upper Control Limit (UCL), Center Line (CL), and Lower Control Limit (LCL).',
    icon: '📉',
    preview: <ControlChartPreview />,
    shapes: controlChartShapes,
  },
  {
    id: 'scatter-diagram',
    name: 'Scatter Diagram',
    category: 'Quality Tools',
    tags: ['scatter', 'correlation', 'regression', 'variable', '7qc', 'quality'],
    description: 'Visualize the relationship between two variables. Identify positive, negative, or no correlation patterns.',
    icon: '🔵',
    preview: <ScatterPreview />,
    shapes: scatterShapes,
  },
  {
    id: 'check-sheet',
    name: 'Check Sheet',
    category: 'Quality Tools',
    tags: ['check sheet', 'tally', 'data collection', 'defects', '7qc', 'quality'],
    description: 'Systematically collect and record data in real time. Track defect types by category and time period.',
    icon: '☑',
    preview: <CheckSheetPreview />,
    shapes: checkSheetShapes,
  },
  {
    id: 'process-flowchart',
    name: 'Process Flowchart',
    category: 'Quality Tools',
    tags: ['flowchart', 'process', 'decision', 'workflow', '7qc', 'quality'],
    description: 'Map the steps of a process with decisions, inputs, and outputs to understand and improve workflows.',
    icon: '🔀',
    preview: <ProcessFlowPreview />,
    shapes: processFlowchartShapes,
  },
  // Six Sigma
  {
    id: 'dmaic-flow',
    name: 'DMAIC Flow',
    category: 'Six Sigma',
    tags: ['dmaic', 'define', 'measure', 'analyze', 'improve', 'control', 'six sigma'],
    description: 'The five-phase Six Sigma improvement cycle: Define, Measure, Analyze, Improve, and Control.',
    icon: '⚙',
    preview: <DMAICPreview />,
    shapes: dmaicShapes,
  },
  {
    id: 'sipoc-diagram',
    name: 'SIPOC Diagram',
    category: 'Six Sigma',
    tags: ['sipoc', 'supplier', 'input', 'process', 'output', 'customer', 'six sigma'],
    description: 'High-level process map showing Suppliers, Inputs, Process steps, Outputs, and Customers.',
    icon: '🔄',
    preview: <SIPOCPreview />,
    shapes: sipocShapes,
  },
  {
    id: 'voice-of-customer',
    name: 'Voice of Customer (VOC)',
    category: 'Six Sigma',
    tags: ['voc', 'customer', 'satisfaction', 'requirements', 'six sigma', 'quality'],
    description: 'Capture customer needs, importance ratings, current satisfaction levels, and action priorities.',
    icon: '🗣',
    preview: <VOCPreview />,
    shapes: vocShapes,
  },
  {
    id: 'ctq-tree',
    name: 'CTQ Tree',
    category: 'Six Sigma',
    tags: ['ctq', 'critical to quality', 'requirements', 'tree', 'six sigma'],
    description: 'Break down customer needs into measurable Critical-to-Quality characteristics through a tree structure.',
    icon: '🌳',
    preview: <CTQPreview />,
    shapes: ctqTreeShapes,
  },
  {
    id: 'process-capability',
    name: 'Process Capability Study',
    category: 'Six Sigma',
    tags: ['cp', 'cpk', 'capability', 'LSL', 'USL', 'bell curve', 'six sigma'],
    description: 'Evaluate process performance against specification limits using Cp, Cpk, and sigma level metrics.',
    icon: '🔔',
    preview: <ProcessCapabilityPreview />,
    shapes: processCapabilityShapes,
  },
  // Strategic Planning
  {
    id: 'house-of-quality',
    name: 'House of Quality (QFD)',
    category: 'Strategic Planning',
    tags: ['qfd', 'house of quality', 'customer', 'technical', 'correlation', 'strategic'],
    description: 'Quality Function Deployment matrix linking customer requirements to technical specifications with a correlation roof.',
    icon: '🏠',
    preview: <HouseOfQualityPreview />,
    shapes: houseOfQualityShapes,
  },
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    category: 'Strategic Planning',
    tags: ['swot', 'strengths', 'weaknesses', 'opportunities', 'threats', 'strategic'],
    description: 'Analyze internal Strengths and Weaknesses alongside external Opportunities and Threats.',
    icon: '⊞',
    preview: <SWOTPreview />,
    shapes: swotShapes,
  },
  {
    id: 'porters-five-forces',
    name: "Porter's Five Forces",
    category: 'Strategic Planning',
    tags: ['porter', 'five forces', 'competition', 'buyers', 'suppliers', 'strategic'],
    description: "Assess competitive intensity using Porter's framework: Rivalry, New Entrants, Substitutes, Buyers, and Suppliers.",
    icon: '⚡',
    preview: <PortersPreview />,
    shapes: portersFiveForcesShapes,
  },
  {
    id: 'value-stream-map',
    name: 'Value Stream Map',
    category: 'Strategic Planning',
    tags: ['vsm', 'value stream', 'lean', 'waste', 'flow', 'timeline', 'strategic'],
    description: 'Visualize the flow of materials and information from supplier to customer, identifying value-added and non-value-added steps.',
    icon: '🏭',
    preview: <ValueStreamPreview />,
    shapes: valueStreamShapes,
  },
  {
    id: 'balanced-scorecard',
    name: 'Balanced Scorecard',
    category: 'Strategic Planning',
    tags: ['balanced scorecard', 'kpi', 'financial', 'customer', 'internal', 'learning', 'strategic'],
    description: 'Track performance across Financial, Customer, Internal Process, and Learning & Growth perspectives.',
    icon: '🎯',
    preview: <BalancedScorecardPreview />,
    shapes: balancedScorecardShapes,
  },
  {
    id: 'ansoff-matrix',
    name: 'Ansoff Matrix',
    category: 'Strategic Planning',
    tags: ['ansoff', 'growth', 'market penetration', 'diversification', 'strategic', 'product'],
    description: 'Explore four growth strategies: Market Penetration, Product Development, Market Development, and Diversification.',
    icon: '🗺',
    preview: <AnsoffPreview />,
    shapes: ansoffMatrixShapes,
  },
  // Project Management
  {
    id: 'gantt-chart',
    name: 'Gantt Chart',
    category: 'Project Management',
    tags: ['gantt', 'timeline', 'schedule', 'tasks', 'project', 'weeks'],
    description: 'Visualize project schedule with task bars, dependencies, and a today marker across weekly time periods.',
    icon: '📅',
    preview: <GanttPreview />,
    shapes: ganttShapes,
  },
  {
    id: 'raci-matrix',
    name: 'RACI Matrix',
    category: 'Project Management',
    tags: ['raci', 'responsible', 'accountable', 'consulted', 'informed', 'project', 'roles'],
    description: 'Define roles and responsibilities: who is Responsible, Accountable, Consulted, and Informed for each task.',
    icon: '👥',
    preview: <RACIPreview />,
    shapes: raciShapes,
  },
  {
    id: 'risk-matrix',
    name: 'Risk Assessment Matrix',
    category: 'Project Management',
    tags: ['risk', 'probability', 'impact', 'assessment', 'matrix', 'project'],
    description: 'Evaluate project risks by plotting Probability vs Impact on a 5x5 color-coded matrix (Green/Yellow/Red).',
    icon: '⚠',
    preview: <RiskMatrixPreview />,
    shapes: riskMatrixShapes,
  },
  {
    id: 'stakeholder-map',
    name: 'Stakeholder Map',
    category: 'Project Management',
    tags: ['stakeholder', 'power', 'interest', 'influence', 'mapping', 'project'],
    description: 'Plot stakeholders by Power and Interest to determine engagement strategies (Manage Closely, Keep Informed, etc.).',
    icon: '🗺',
    preview: <StakeholderPreview />,
    shapes: stakeholderMapShapes,
  },
  {
    id: 'wbs',
    name: 'Work Breakdown Structure',
    category: 'Project Management',
    tags: ['wbs', 'work breakdown', 'deliverables', 'hierarchy', 'project', 'tasks'],
    description: 'Decompose project work into a hierarchical tree of deliverables, from project root to work packages.',
    icon: '🌿',
    preview: <WBSPreview />,
    shapes: wbsShapes,
  },
  // General Infographics
  {
    id: 'timeline-roadmap',
    name: 'Timeline / Roadmap',
    category: 'General Infographics',
    tags: ['timeline', 'roadmap', 'milestones', 'quarters', 'phases', 'infographic'],
    description: 'Display project milestones and events along a horizontal timeline with alternating above/below labels.',
    icon: '📍',
    preview: <TimelinePreview />,
    shapes: timelineShapes,
  },
  {
    id: 'mind-map',
    name: 'Mind Map',
    category: 'General Infographics',
    tags: ['mind map', 'brainstorm', 'ideas', 'branches', 'central', 'infographic'],
    description: 'Radiate ideas from a central concept with main branches and sub-branches for brainstorming and planning.',
    icon: '🧠',
    preview: <MindMapPreview />,
    shapes: mindMapShapes,
  },
  {
    id: 'org-chart',
    name: 'Org Chart',
    category: 'General Infographics',
    tags: ['org chart', 'organization', 'hierarchy', 'management', 'team', 'infographic'],
    description: 'Visualize organizational hierarchy from CEO through department heads to individual contributors.',
    icon: '🏢',
    preview: <OrgChartPreview />,
    shapes: orgChartShapes,
  },
  {
    id: 'comparison-infographic',
    name: 'Comparison Infographic',
    category: 'General Infographics',
    tags: ['comparison', 'vs', 'features', 'table', 'products', 'infographic'],
    description: 'Compare two products or options side by side across multiple features with visual checkmarks.',
    icon: '⚖',
    preview: <ComparisonPreview />,
    shapes: comparisonShapes,
  },
  {
    id: 'statistics-dashboard',
    name: 'Statistics Dashboard',
    category: 'General Infographics',
    tags: ['dashboard', 'kpi', 'statistics', 'charts', 'metrics', 'infographic'],
    description: 'Display key performance indicators with large number callouts, bar charts, and pie chart summaries.',
    icon: '📊',
    preview: <StatsDashPreview />,
    shapes: statisticsDashShapes,
  },
  {
    id: 'process-steps-horizontal',
    name: 'Process Steps (Horizontal)',
    category: 'General Infographics',
    tags: ['process', 'steps', 'flow', 'arrows', 'numbered', 'horizontal', 'infographic'],
    description: 'Show sequential process steps with numbered circles and connecting arrows in a horizontal layout.',
    icon: '➡',
    preview: <ProcessStepsPreview />,
    shapes: processStepsShapes,
  },
  {
    id: 'cycle-diagram',
    name: 'Cycle Diagram (PDCA)',
    category: 'General Infographics',
    tags: ['cycle', 'pdca', 'plan do check act', 'continuous improvement', 'loop', 'infographic'],
    description: 'Illustrate the Plan-Do-Check-Act continuous improvement cycle with four interconnected phases.',
    icon: '🔁',
    preview: <CyclePreview />,
    shapes: cycleDiagramShapes,
  },
  {
    id: 'venn-diagram',
    name: 'Venn Diagram',
    category: 'General Infographics',
    tags: ['venn', 'overlap', 'sets', 'intersection', 'union', 'infographic'],
    description: 'Show relationships and overlapping areas between three sets with colored translucent ellipses.',
    icon: '⊙',
    preview: <VennPreview />,
    shapes: vennShapes,
  },
  {
    id: 'pyramid-diagram',
    name: 'Pyramid Diagram',
    category: 'General Infographics',
    tags: ['pyramid', 'hierarchy', "maslow's", 'levels', 'layers', 'infographic'],
    description: "Represent hierarchical information in pyramid layers, inspired by Maslow's Hierarchy of Needs.",
    icon: '🔺',
    preview: <PyramidPreview />,
    shapes: pyramidShapes,
  },
];


// ─── Category definitions ─────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Quality Tools', 'Six Sigma', 'Strategic Planning', 'Project Management', 'General Infographics'] as const;
type Category = typeof CATEGORIES[number];

// ─── TemplateGallery Component ────────────────────────────────────────────────

interface TemplateGalleryProps {
  onLoadTemplate: (shapes: TemplateShape[]) => void;
  onClose: () => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onLoadTemplate, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  const filteredTemplates = INFOGRAPHIC_TEMPLATES.filter(template => {
    const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
    if (!searchQuery.trim()) return matchesCategory;
    const q = searchQuery.toLowerCase();
    return matchesCategory && (
      template.name.toLowerCase().includes(q) ||
      template.description.toLowerCase().includes(q) ||
      template.category.toLowerCase().includes(q) ||
      template.tags.some(tag => tag.toLowerCase().includes(q))
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onKeyDown={handleKeyDown}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '12px',
          width: '90vw',
          maxWidth: '1100px',
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid #334155',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 700, margin: 0 }}>
              Template Gallery
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search templates, tags, categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                padding: '8px 14px',
                fontSize: '13px',
                width: '280px',
                outline: 'none',
              }}
            />
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#94a3b8',
                width: '36px', height: '36px',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex', gap: '6px', padding: '12px 24px',
          borderBottom: '1px solid #334155',
          flexShrink: 0,
          overflowX: 'auto',
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: activeCategory === cat ? 600 : 400,
                whiteSpace: 'nowrap',
                backgroundColor: activeCategory === cat ? '#3b82f6' : '#1e293b',
                color: activeCategory === cat ? '#ffffff' : '#94a3b8',
                transition: 'all 0.15s',
              }}
            >
              {cat}
              {cat !== 'All' && (
                <span style={{
                  marginLeft: '6px',
                  backgroundColor: activeCategory === cat ? 'rgba(255,255,255,0.2)' : '#334155',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '10px',
                }}>
                  {INFOGRAPHIC_TEMPLATES.filter(t => t.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
        }}>
          {filteredTemplates.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '200px', color: '#94a3b8',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>No templates found</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>Try a different search term or category</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '16px',
            }}>
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  onMouseEnter={() => setHoveredId(template.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    backgroundColor: '#1e293b',
                    border: `1px solid ${hoveredId === template.id ? '#3b82f6' : '#334155'}`,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    transform: hoveredId === template.id ? 'translateY(-2px)' : 'none',
                    boxShadow: hoveredId === template.id ? '0 8px 24px rgba(59,130,246,0.15)' : 'none',
                    position: 'relative',
                  }}
                >
                  {/* Preview */}
                  <div style={{
                    height: '130px',
                    backgroundColor: '#0f172a',
                    borderBottom: '1px solid #334155',
                    padding: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {template.preview}
                  </div>

                  {/* Use Template button overlay on hover */}
                  {hoveredId === template.id && (
                    <div
                      onClick={() => onLoadTemplate(template.shapes)}
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: '130px',
                        backgroundColor: 'rgba(15,23,42,0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <button
                        style={{
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                        }}
                      >
                        Use Template
                      </button>
                    </div>
                  )}

                  {/* Card content */}
                  <div style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>{template.icon}</span>
                      <h3 style={{
                        color: '#e2e8f0',
                        fontSize: '13px',
                        fontWeight: 600,
                        margin: 0,
                        lineHeight: 1.3,
                      }}>
                        {template.name}
                      </h3>
                    </div>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '11px',
                      margin: '4px 0 8px',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {template.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        backgroundColor: '#0f172a',
                        color: '#60a5fa',
                        border: '1px solid #1e3a5f',
                        borderRadius: '10px',
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontWeight: 500,
                      }}>
                        {template.category}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {template.tags.slice(0, 2).map(tag => (
                          <span key={tag} style={{
                            backgroundColor: '#334155',
                            color: '#94a3b8',
                            borderRadius: '8px',
                            padding: '2px 6px',
                            fontSize: '9px',
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Generate Section */}
        <div style={{
          borderTop: '1px solid #334155',
          padding: '16px 24px',
          backgroundColor: '#0f172a',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '16px' }}>✨</span>
            <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>AI Generate Layout</span>
            <span style={{
              backgroundColor: '#1e3a5f',
              color: '#60a5fa',
              borderRadius: '10px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 500,
            }}>
              Beta
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Describe your diagram... e.g. 'Create a SWOT analysis for a SaaS startup' or 'Draw a 6-step hiring process flowchart'"
              rows={2}
              style={{
                flex: 1,
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                padding: '10px 14px',
                fontSize: '13px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => {
                if (!aiPrompt.trim()) return;
                // Placeholder: future AI generation
                alert('AI generation coming soon! For now, choose a template above.');
              }}
              style={{
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <span>✨</span>
              Generate Layout
            </button>
          </div>
          <p style={{ color: '#475569', fontSize: '11px', margin: '8px 0 0' }}>
            Describe your diagram in plain English and AI will generate a starting layout. Works best with specific diagram types.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;

