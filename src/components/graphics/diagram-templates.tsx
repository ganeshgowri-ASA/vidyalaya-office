'use client';
import React, { useState } from 'react';
import { useGraphicsStore, createShape, genId, Shape, ShapeBase } from '@/store/graphics-store';

export interface DiagramTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  shapes: Partial<ShapeBase & { type: string }>[];
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'flowchart', label: 'Flowchart', icon: '🔀' },
  { id: 'orgchart', label: 'Org Chart', icon: '🏢' },
  { id: 'mindmap', label: 'Mind Map', icon: '🧠' },
  { id: 'network', label: 'Network', icon: '🌐' },
  { id: 'uml', label: 'UML', icon: '📐' },
  { id: 'wireframe', label: 'Wireframe', icon: '📱' },
  { id: 'erd', label: 'ER Diagram', icon: '🗄' },
  { id: 'bpmn', label: 'BPMN', icon: '⚙' },
  { id: 'vsm', label: 'Value Stream', icon: '🏭' },
  { id: 'quality', label: 'Quality', icon: '🎯' },
  { id: 'sixsigma', label: 'Six Sigma', icon: '📊' },
  { id: 'qctools', label: '7QC Tools', icon: '🔧' },
  { id: 'infographic', label: 'Infographic', icon: '📈' },
  { id: 'lean', label: 'Lean', icon: '🔄' },
];

const TEMPLATES: DiagramTemplate[] = [
  {
    id: 'basic-flowchart',
    name: 'Basic Flowchart',
    category: 'flowchart',
    description: 'Start to end process with decision',
    icon: '🔀',
    shapes: [
      { type: 'ellipse', x: 340, y: 40, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Start' },
      { type: 'rect', x: 330, y: 150, width: 140, height: 70, fill: '#3b82f6', stroke: '#1e40af', label: 'Process A' },
      { type: 'diamond', x: 330, y: 280, width: 140, height: 100, fill: '#f59e0b', stroke: '#b45309', label: 'Decision?' },
      { type: 'rect', x: 140, y: 430, width: 140, height: 70, fill: '#3b82f6', stroke: '#1e40af', label: 'Process B' },
      { type: 'rect', x: 520, y: 430, width: 140, height: 70, fill: '#3b82f6', stroke: '#1e40af', label: 'Process C' },
      { type: 'ellipse', x: 340, y: 560, width: 120, height: 60, fill: '#ef4444', stroke: '#b91c1c', label: 'End' },
      { type: 'arrow', x: 395, y: 100, width: 10, height: 50, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'arrow', x: 395, y: 220, width: 10, height: 60, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'text', x: 470, y: 300, width: 40, height: 24, fill: 'transparent', stroke: 'transparent', label: 'Yes' },
      { type: 'text', x: 290, y: 300, width: 30, height: 24, fill: 'transparent', stroke: 'transparent', label: 'No' },
    ],
  },
  {
    id: 'decision-tree',
    name: 'Decision Tree',
    category: 'flowchart',
    description: 'Multi-branch decision flow',
    icon: '🌳',
    shapes: [
      { type: 'diamond', x: 320, y: 40, width: 160, height: 100, fill: '#8b5cf6', stroke: '#6d28d9', label: 'Main Question?' },
      { type: 'diamond', x: 100, y: 200, width: 140, height: 90, fill: '#f59e0b', stroke: '#b45309', label: 'Option A?' },
      { type: 'diamond', x: 500, y: 200, width: 140, height: 90, fill: '#f59e0b', stroke: '#b45309', label: 'Option B?' },
      { type: 'rect', x: 30, y: 350, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Result 1' },
      { type: 'rect', x: 190, y: 350, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Result 2' },
      { type: 'rect', x: 430, y: 350, width: 120, height: 60, fill: '#ef4444', stroke: '#b91c1c', label: 'Result 3' },
      { type: 'rect', x: 590, y: 350, width: 120, height: 60, fill: '#ef4444', stroke: '#b91c1c', label: 'Result 4' },
      { type: 'text', x: 230, y: 140, width: 30, height: 24, fill: 'transparent', stroke: 'transparent', label: 'Yes' },
      { type: 'text', x: 490, y: 140, width: 30, height: 24, fill: 'transparent', stroke: 'transparent', label: 'No' },
    ],
  },
  {
    id: 'company-orgchart',
    name: 'Company Hierarchy',
    category: 'orgchart',
    description: 'CEO to department structure',
    icon: '🏢',
    shapes: [
      { type: 'rect', x: 320, y: 40, width: 160, height: 70, fill: '#8b5cf6', stroke: '#6d28d9', label: 'CEO' },
      { type: 'rect', x: 100, y: 170, width: 150, height: 60, fill: '#3b82f6', stroke: '#1e40af', label: 'VP Engineering' },
      { type: 'rect', x: 320, y: 170, width: 150, height: 60, fill: '#3b82f6', stroke: '#1e40af', label: 'VP Product' },
      { type: 'rect', x: 540, y: 170, width: 150, height: 60, fill: '#3b82f6', stroke: '#1e40af', label: 'VP Sales' },
      { type: 'rect', x: 40, y: 290, width: 130, height: 50, fill: '#06b6d4', stroke: '#0e7490', label: 'Frontend' },
      { type: 'rect', x: 200, y: 290, width: 130, height: 50, fill: '#06b6d4', stroke: '#0e7490', label: 'Backend' },
      { type: 'rect', x: 350, y: 290, width: 130, height: 50, fill: '#06b6d4', stroke: '#0e7490', label: 'Design' },
      { type: 'rect', x: 510, y: 290, width: 130, height: 50, fill: '#06b6d4', stroke: '#0e7490', label: 'Enterprise' },
      { type: 'rect', x: 670, y: 290, width: 130, height: 50, fill: '#06b6d4', stroke: '#0e7490', label: 'SMB' },
    ],
  },
  {
    id: 'brainstorm-mindmap',
    name: 'Brainstorming',
    category: 'mindmap',
    description: 'Central idea with branches',
    icon: '🧠',
    shapes: [
      { type: 'ellipse', x: 320, y: 220, width: 160, height: 100, fill: '#8b5cf6', stroke: '#6d28d9', label: 'Main Idea' },
      { type: 'ellipse', x: 100, y: 60, width: 130, height: 70, fill: '#3b82f6', stroke: '#1e40af', label: 'Topic A' },
      { type: 'ellipse', x: 530, y: 60, width: 130, height: 70, fill: '#22c55e', stroke: '#15803d', label: 'Topic B' },
      { type: 'ellipse', x: 60, y: 380, width: 130, height: 70, fill: '#f59e0b', stroke: '#b45309', label: 'Topic C' },
      { type: 'ellipse', x: 570, y: 380, width: 130, height: 70, fill: '#ef4444', stroke: '#b91c1c', label: 'Topic D' },
      { type: 'rect', x: 10, y: 0, width: 90, height: 40, fill: '#60a5fa', stroke: '#2563eb', label: 'Sub A1' },
      { type: 'rect', x: 180, y: 0, width: 90, height: 40, fill: '#60a5fa', stroke: '#2563eb', label: 'Sub A2' },
      { type: 'rect', x: 510, y: 0, width: 90, height: 40, fill: '#4ade80', stroke: '#16a34a', label: 'Sub B1' },
      { type: 'rect', x: 660, y: 0, width: 90, height: 40, fill: '#4ade80', stroke: '#16a34a', label: 'Sub B2' },
    ],
  },
  {
    id: 'it-infrastructure',
    name: 'IT Infrastructure',
    category: 'network',
    description: 'Servers, firewall, and clients',
    icon: '🌐',
    shapes: [
      { type: 'cloud', x: 300, y: 20, width: 180, height: 100, fill: '#3b82f6', stroke: '#1e40af', label: 'Internet' },
      { type: 'rect', x: 330, y: 170, width: 120, height: 60, fill: '#ef4444', stroke: '#b91c1c', label: 'Firewall' },
      { type: 'rect', x: 330, y: 290, width: 120, height: 60, fill: '#8b5cf6', stroke: '#6d28d9', label: 'Load Balancer' },
      { type: 'rect', x: 120, y: 410, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Web Server 1' },
      { type: 'rect', x: 330, y: 410, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Web Server 2' },
      { type: 'rect', x: 540, y: 410, width: 120, height: 60, fill: '#22c55e', stroke: '#15803d', label: 'Web Server 3' },
      { type: 'cylinder', x: 220, y: 540, width: 120, height: 70, fill: '#f59e0b', stroke: '#b45309', label: 'Primary DB' },
      { type: 'cylinder', x: 440, y: 540, width: 120, height: 70, fill: '#f59e0b', stroke: '#b45309', label: 'Replica DB' },
    ],
  },
  // ===== VALUE STREAM MAPPING (VSM) =====
  {
    id: 'vsm-manufacturing',
    name: 'Value Stream Map',
    category: 'vsm',
    description: 'Manufacturing VSM with process boxes, inventory, timeline',
    icon: '🏭',
    shapes: [
      // Supplier & Customer
      { type: 'rect', x: 20, y: 30, width: 120, height: 70, fill: '#7c3aed', stroke: '#5b21b6', label: 'Supplier' },
      { type: 'rect', x: 880, y: 30, width: 120, height: 70, fill: '#7c3aed', stroke: '#5b21b6', label: 'Customer' },
      // Production Control
      { type: 'rect', x: 400, y: 20, width: 180, height: 50, fill: '#2563eb', stroke: '#1d4ed8', label: 'Production Control' },
      // Info flow arrows (top)
      { type: 'arrow', x: 140, y: 45, width: 260, height: 10, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'arrow', x: 580, y: 45, width: 300, height: 10, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'text', x: 200, y: 20, width: 120, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Weekly Forecast' },
      { type: 'text', x: 650, y: 20, width: 120, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Daily Orders' },
      // Process boxes
      { type: 'rect', x: 60, y: 160, width: 130, height: 70, fill: '#0891b2', stroke: '#0e7490', label: 'Stamping' },
      { type: 'rect', x: 260, y: 160, width: 130, height: 70, fill: '#0891b2', stroke: '#0e7490', label: 'Welding' },
      { type: 'rect', x: 460, y: 160, width: 130, height: 70, fill: '#0891b2', stroke: '#0e7490', label: 'Assembly' },
      { type: 'rect', x: 660, y: 160, width: 130, height: 70, fill: '#0891b2', stroke: '#0e7490', label: 'Shipping' },
      // Data boxes below processes
      { type: 'rect', x: 60, y: 240, width: 130, height: 55, fill: '#164e63', stroke: '#155e75', label: 'C/T: 1s\nC/O: 1hr\nUptime: 85%' },
      { type: 'rect', x: 260, y: 240, width: 130, height: 55, fill: '#164e63', stroke: '#155e75', label: 'C/T: 39s\nC/O: 10m\nUptime: 100%' },
      { type: 'rect', x: 460, y: 240, width: 130, height: 55, fill: '#164e63', stroke: '#155e75', label: 'C/T: 62s\nC/O: 0\nUptime: 100%' },
      { type: 'rect', x: 660, y: 240, width: 130, height: 55, fill: '#164e63', stroke: '#155e75', label: 'C/T: 0\nC/O: 0\nUptime: 100%' },
      // Inventory triangles between processes
      { type: 'triangle', x: 200, y: 155, width: 40, height: 35, fill: '#f59e0b', stroke: '#d97706', label: '4600' },
      { type: 'triangle', x: 400, y: 155, width: 40, height: 35, fill: '#f59e0b', stroke: '#d97706', label: '1100' },
      { type: 'triangle', x: 600, y: 155, width: 40, height: 35, fill: '#f59e0b', stroke: '#d97706', label: '1600' },
      // Push arrows between processes
      { type: 'arrow', x: 190, y: 195, width: 70, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 390, y: 195, width: 70, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 590, y: 195, width: 70, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      // Kaizen burst
      { type: 'star', x: 310, y: 120, width: 50, height: 45, fill: '#ef4444', stroke: '#dc2626', label: 'Kaizen' },
      // Timeline at bottom
      { type: 'line', x: 40, y: 340, width: 780, height: 2, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'text', x: 60, y: 350, width: 60, height: 18, fill: 'transparent', stroke: 'transparent', label: '5 days' },
      { type: 'text', x: 160, y: 325, width: 40, height: 18, fill: 'transparent', stroke: 'transparent', label: '1 sec' },
      { type: 'text', x: 260, y: 350, width: 60, height: 18, fill: 'transparent', stroke: 'transparent', label: '7.6 days' },
      { type: 'text', x: 360, y: 325, width: 40, height: 18, fill: 'transparent', stroke: 'transparent', label: '39 sec' },
      { type: 'text', x: 460, y: 350, width: 60, height: 18, fill: 'transparent', stroke: 'transparent', label: '1.8 days' },
      { type: 'text', x: 560, y: 325, width: 40, height: 18, fill: 'transparent', stroke: 'transparent', label: '62 sec' },
      { type: 'text', x: 660, y: 350, width: 60, height: 18, fill: 'transparent', stroke: 'transparent', label: '2.7 days' },
      // Lead time summary
      { type: 'rect', x: 760, y: 310, width: 120, height: 50, fill: '#1e293b', stroke: '#475569', label: 'Lead: 17.1d\nVA: 102s' },
    ],
  },
  // ===== QUALITY HOUSE (House of Quality / QFD) =====
  {
    id: 'house-of-quality',
    name: 'House of Quality (QFD)',
    category: 'quality',
    description: 'Quality Function Deployment matrix with correlation roof',
    icon: '🏠',
    shapes: [
      // Title
      { type: 'banner', x: 250, y: 10, width: 300, height: 40, fill: '#7c3aed', stroke: '#5b21b6', label: 'House of Quality' },
      // Correlation roof (triangle)
      { type: 'triangle', x: 250, y: 55, width: 300, height: 100, fill: '#312e81', stroke: '#4338ca', label: 'Correlations' },
      // Technical requirements header (top)
      { type: 'rect', x: 250, y: 155, width: 60, height: 50, fill: '#2563eb', stroke: '#1d4ed8', label: 'Weight' },
      { type: 'rect', x: 310, y: 155, width: 60, height: 50, fill: '#2563eb', stroke: '#1d4ed8', label: 'Material' },
      { type: 'rect', x: 370, y: 155, width: 60, height: 50, fill: '#2563eb', stroke: '#1d4ed8', label: 'Thickness' },
      { type: 'rect', x: 430, y: 155, width: 60, height: 50, fill: '#2563eb', stroke: '#1d4ed8', label: 'Finish' },
      { type: 'rect', x: 490, y: 155, width: 60, height: 50, fill: '#2563eb', stroke: '#1d4ed8', label: 'Process' },
      // Customer requirements label (left column header)
      { type: 'rect', x: 30, y: 155, width: 100, height: 50, fill: '#059669', stroke: '#047857', label: 'Customer\nRequirements' },
      { type: 'rect', x: 130, y: 155, width: 50, height: 50, fill: '#059669', stroke: '#047857', label: 'Priority' },
      { type: 'rect', x: 180, y: 155, width: 70, height: 50, fill: '#059669', stroke: '#047857', label: 'Importance' },
      // Customer requirements rows
      { type: 'rect', x: 30, y: 210, width: 100, height: 40, fill: '#065f46', stroke: '#047857', label: 'Durability' },
      { type: 'rect', x: 130, y: 210, width: 50, height: 40, fill: '#064e3b', stroke: '#047857', label: '5' },
      { type: 'rect', x: 180, y: 210, width: 70, height: 40, fill: '#064e3b', stroke: '#047857', label: '27%' },
      { type: 'rect', x: 30, y: 255, width: 100, height: 40, fill: '#065f46', stroke: '#047857', label: 'Lightweight' },
      { type: 'rect', x: 130, y: 255, width: 50, height: 40, fill: '#064e3b', stroke: '#047857', label: '4' },
      { type: 'rect', x: 180, y: 255, width: 70, height: 40, fill: '#064e3b', stroke: '#047857', label: '22%' },
      { type: 'rect', x: 30, y: 300, width: 100, height: 40, fill: '#065f46', stroke: '#047857', label: 'Aesthetics' },
      { type: 'rect', x: 130, y: 300, width: 50, height: 40, fill: '#064e3b', stroke: '#047857', label: '3' },
      { type: 'rect', x: 180, y: 300, width: 70, height: 40, fill: '#064e3b', stroke: '#047857', label: '16%' },
      { type: 'rect', x: 30, y: 345, width: 100, height: 40, fill: '#065f46', stroke: '#047857', label: 'Easy to Use' },
      { type: 'rect', x: 130, y: 345, width: 50, height: 40, fill: '#064e3b', stroke: '#047857', label: '4' },
      { type: 'rect', x: 180, y: 345, width: 70, height: 40, fill: '#064e3b', stroke: '#047857', label: '22%' },
      { type: 'rect', x: 30, y: 390, width: 100, height: 40, fill: '#065f46', stroke: '#047857', label: 'Low Cost' },
      { type: 'rect', x: 130, y: 390, width: 50, height: 40, fill: '#064e3b', stroke: '#047857', label: '2' },
      { type: 'rect', x: 180, y: 390, width: 70, height: 40, fill: '#064e3b', stroke: '#047857', label: '13%' },
      // Relationship matrix cells (center grid)
      { type: 'ellipse', x: 265, y: 215, width: 30, height: 30, fill: '#22c55e', stroke: '#16a34a', label: '9' },
      { type: 'ellipse', x: 325, y: 215, width: 30, height: 30, fill: '#22c55e', stroke: '#16a34a', label: '9' },
      { type: 'ellipse', x: 385, y: 215, width: 30, height: 30, fill: '#22c55e', stroke: '#16a34a', label: '9' },
      { type: 'ellipse', x: 445, y: 260, width: 30, height: 30, fill: '#eab308', stroke: '#ca8a04', label: '3' },
      { type: 'ellipse', x: 265, y: 260, width: 30, height: 30, fill: '#22c55e', stroke: '#16a34a', label: '9' },
      { type: 'ellipse', x: 385, y: 305, width: 30, height: 30, fill: '#eab308', stroke: '#ca8a04', label: '3' },
      { type: 'ellipse', x: 445, y: 305, width: 30, height: 30, fill: '#22c55e', stroke: '#16a34a', label: '9' },
      { type: 'ellipse', x: 505, y: 350, width: 30, height: 30, fill: '#eab308', stroke: '#ca8a04', label: '3' },
      { type: 'ellipse', x: 325, y: 395, width: 30, height: 30, fill: '#ef4444', stroke: '#dc2626', label: '1' },
      { type: 'ellipse', x: 505, y: 395, width: 30, height: 30, fill: '#22c55e', stroke: '#16a34a', label: '9' },
      // Competitive benchmarks (right side)
      { type: 'rect', x: 570, y: 155, width: 60, height: 50, fill: '#ea580c', stroke: '#c2410c', label: 'Us' },
      { type: 'rect', x: 630, y: 155, width: 60, height: 50, fill: '#dc2626', stroke: '#b91c1c', label: 'Comp A' },
      { type: 'rect', x: 690, y: 155, width: 60, height: 50, fill: '#9333ea', stroke: '#7e22ce', label: 'Comp B' },
      { type: 'rect', x: 570, y: 210, width: 60, height: 40, fill: '#7c2d12', stroke: '#c2410c', label: '4' },
      { type: 'rect', x: 630, y: 210, width: 60, height: 40, fill: '#7f1d1d', stroke: '#b91c1c', label: '3' },
      { type: 'rect', x: 690, y: 210, width: 60, height: 40, fill: '#581c87', stroke: '#7e22ce', label: '5' },
      // Target values (bottom)
      { type: 'rect', x: 250, y: 440, width: 300, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Technical Targets & Importance' },
      { type: 'rect', x: 250, y: 480, width: 60, height: 35, fill: '#172554', stroke: '#1e40af', label: '< 2kg' },
      { type: 'rect', x: 310, y: 480, width: 60, height: 35, fill: '#172554', stroke: '#1e40af', label: 'Alloy' },
      { type: 'rect', x: 370, y: 480, width: 60, height: 35, fill: '#172554', stroke: '#1e40af', label: '2mm' },
      { type: 'rect', x: 430, y: 480, width: 60, height: 35, fill: '#172554', stroke: '#1e40af', label: 'Matte' },
      { type: 'rect', x: 490, y: 480, width: 60, height: 35, fill: '#172554', stroke: '#1e40af', label: 'CNC' },
    ],
  },
  // ===== FMEA TEMPLATE =====
  {
    id: 'fmea-template',
    name: 'FMEA Analysis',
    category: 'quality',
    description: 'Failure Mode Effects Analysis with RPN ratings',
    icon: '⚠',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 500, height: 40, fill: '#dc2626', stroke: '#b91c1c', label: 'FMEA - Failure Mode & Effects Analysis' },
      // Header row
      { type: 'rect', x: 20, y: 70, width: 100, height: 45, fill: '#1e40af', stroke: '#1d4ed8', label: 'Process\nStep' },
      { type: 'rect', x: 120, y: 70, width: 110, height: 45, fill: '#1e40af', stroke: '#1d4ed8', label: 'Potential\nFailure Mode' },
      { type: 'rect', x: 230, y: 70, width: 110, height: 45, fill: '#1e40af', stroke: '#1d4ed8', label: 'Potential\nEffects' },
      { type: 'rect', x: 340, y: 70, width: 50, height: 45, fill: '#7c2d12', stroke: '#9a3412', label: 'SEV' },
      { type: 'rect', x: 390, y: 70, width: 110, height: 45, fill: '#1e40af', stroke: '#1d4ed8', label: 'Potential\nCauses' },
      { type: 'rect', x: 500, y: 70, width: 50, height: 45, fill: '#7c2d12', stroke: '#9a3412', label: 'OCC' },
      { type: 'rect', x: 550, y: 70, width: 90, height: 45, fill: '#1e40af', stroke: '#1d4ed8', label: 'Current\nControls' },
      { type: 'rect', x: 640, y: 70, width: 50, height: 45, fill: '#7c2d12', stroke: '#9a3412', label: 'DET' },
      { type: 'rect', x: 690, y: 70, width: 50, height: 45, fill: '#ef4444', stroke: '#dc2626', label: 'RPN' },
      { type: 'rect', x: 740, y: 70, width: 130, height: 45, fill: '#15803d', stroke: '#166534', label: 'Recommended\nActions' },
      // Row 1 - High risk (red)
      { type: 'rect', x: 20, y: 120, width: 100, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Machining' },
      { type: 'rect', x: 120, y: 120, width: 110, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Dimension\nout of spec' },
      { type: 'rect', x: 230, y: 120, width: 110, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Part does\nnot fit' },
      { type: 'rect', x: 340, y: 120, width: 50, height: 50, fill: '#7f1d1d', stroke: '#991b1b', label: '8' },
      { type: 'rect', x: 390, y: 120, width: 110, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Tool wear' },
      { type: 'rect', x: 500, y: 120, width: 50, height: 50, fill: '#7f1d1d', stroke: '#991b1b', label: '7' },
      { type: 'rect', x: 550, y: 120, width: 90, height: 50, fill: '#1e293b', stroke: '#334155', label: 'SPC check' },
      { type: 'rect', x: 640, y: 120, width: 50, height: 50, fill: '#7f1d1d', stroke: '#991b1b', label: '6' },
      { type: 'rect', x: 690, y: 120, width: 50, height: 50, fill: '#ef4444', stroke: '#dc2626', label: '336' },
      { type: 'rect', x: 740, y: 120, width: 130, height: 50, fill: '#14532d', stroke: '#166534', label: 'Auto tool\ncompensation' },
      // Row 2 - Medium risk (yellow)
      { type: 'rect', x: 20, y: 175, width: 100, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Assembly' },
      { type: 'rect', x: 120, y: 175, width: 110, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Wrong\norientation' },
      { type: 'rect', x: 230, y: 175, width: 110, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Product\nmalfunction' },
      { type: 'rect', x: 340, y: 175, width: 50, height: 50, fill: '#713f12', stroke: '#854d0e', label: '6' },
      { type: 'rect', x: 390, y: 175, width: 110, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Operator\nerror' },
      { type: 'rect', x: 500, y: 175, width: 50, height: 50, fill: '#713f12', stroke: '#854d0e', label: '4' },
      { type: 'rect', x: 550, y: 175, width: 90, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Poka-Yoke' },
      { type: 'rect', x: 640, y: 175, width: 50, height: 50, fill: '#713f12', stroke: '#854d0e', label: '3' },
      { type: 'rect', x: 690, y: 175, width: 50, height: 50, fill: '#f59e0b', stroke: '#d97706', label: '72' },
      { type: 'rect', x: 740, y: 175, width: 130, height: 50, fill: '#14532d', stroke: '#166534', label: 'Add fixture\nguide pins' },
      // Row 3 - Low risk (green)
      { type: 'rect', x: 20, y: 230, width: 100, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Inspection' },
      { type: 'rect', x: 120, y: 230, width: 110, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Missed\ndefect' },
      { type: 'rect', x: 230, y: 230, width: 110, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Customer\ncomplaint' },
      { type: 'rect', x: 340, y: 230, width: 50, height: 50, fill: '#14532d', stroke: '#166534', label: '5' },
      { type: 'rect', x: 390, y: 230, width: 110, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Fatigue/\nlighting' },
      { type: 'rect', x: 500, y: 230, width: 50, height: 50, fill: '#14532d', stroke: '#166534', label: '3' },
      { type: 'rect', x: 550, y: 230, width: 90, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Vision\nsystem' },
      { type: 'rect', x: 640, y: 230, width: 50, height: 50, fill: '#14532d', stroke: '#166534', label: '2' },
      { type: 'rect', x: 690, y: 230, width: 50, height: 50, fill: '#22c55e', stroke: '#16a34a', label: '30' },
      { type: 'rect', x: 740, y: 230, width: 130, height: 50, fill: '#14532d', stroke: '#166534', label: 'Add camera\ninspection' },
      // RPN Legend
      { type: 'rect', x: 20, y: 310, width: 80, height: 30, fill: '#ef4444', stroke: '#dc2626', label: 'High >200' },
      { type: 'rect', x: 110, y: 310, width: 90, height: 30, fill: '#f59e0b', stroke: '#d97706', label: 'Med 50-200' },
      { type: 'rect', x: 210, y: 310, width: 80, height: 30, fill: '#22c55e', stroke: '#16a34a', label: 'Low <50' },
    ],
  },
  // ===== SIX SIGMA - DMAIC ROADMAP =====
  {
    id: 'dmaic-roadmap',
    name: 'DMAIC Roadmap',
    category: 'sixsigma',
    description: 'Define-Measure-Analyze-Improve-Control phases',
    icon: '📊',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 400, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Six Sigma DMAIC Roadmap' },
      // Phase boxes (chevron-style using blockArrow)
      { type: 'blockArrow', x: 30, y: 70, width: 160, height: 60, fill: '#7c3aed', stroke: '#6d28d9', label: 'D - DEFINE' },
      { type: 'blockArrow', x: 200, y: 70, width: 160, height: 60, fill: '#2563eb', stroke: '#1d4ed8', label: 'M - MEASURE' },
      { type: 'blockArrow', x: 370, y: 70, width: 160, height: 60, fill: '#0891b2', stroke: '#0e7490', label: 'A - ANALYZE' },
      { type: 'blockArrow', x: 540, y: 70, width: 160, height: 60, fill: '#059669', stroke: '#047857', label: 'I - IMPROVE' },
      { type: 'blockArrow', x: 710, y: 70, width: 160, height: 60, fill: '#d97706', stroke: '#b45309', label: 'C - CONTROL' },
      // Define deliverables
      { type: 'rect', x: 30, y: 150, width: 160, height: 35, fill: '#4c1d95', stroke: '#6d28d9', label: 'Project Charter' },
      { type: 'rect', x: 30, y: 190, width: 160, height: 35, fill: '#4c1d95', stroke: '#6d28d9', label: 'Voice of Customer' },
      { type: 'rect', x: 30, y: 230, width: 160, height: 35, fill: '#4c1d95', stroke: '#6d28d9', label: 'SIPOC Diagram' },
      { type: 'rect', x: 30, y: 270, width: 160, height: 35, fill: '#4c1d95', stroke: '#6d28d9', label: 'CTQ Tree' },
      // Measure deliverables
      { type: 'rect', x: 200, y: 150, width: 160, height: 35, fill: '#172554', stroke: '#1d4ed8', label: 'Data Collection Plan' },
      { type: 'rect', x: 200, y: 190, width: 160, height: 35, fill: '#172554', stroke: '#1d4ed8', label: 'MSA / Gage R&R' },
      { type: 'rect', x: 200, y: 230, width: 160, height: 35, fill: '#172554', stroke: '#1d4ed8', label: 'Process Capability' },
      { type: 'rect', x: 200, y: 270, width: 160, height: 35, fill: '#172554', stroke: '#1d4ed8', label: 'Baseline Sigma' },
      // Analyze deliverables
      { type: 'rect', x: 370, y: 150, width: 160, height: 35, fill: '#164e63', stroke: '#0e7490', label: 'Root Cause Analysis' },
      { type: 'rect', x: 370, y: 190, width: 160, height: 35, fill: '#164e63', stroke: '#0e7490', label: 'Hypothesis Testing' },
      { type: 'rect', x: 370, y: 230, width: 160, height: 35, fill: '#164e63', stroke: '#0e7490', label: 'Regression Analysis' },
      { type: 'rect', x: 370, y: 270, width: 160, height: 35, fill: '#164e63', stroke: '#0e7490', label: 'FMEA' },
      // Improve deliverables
      { type: 'rect', x: 540, y: 150, width: 160, height: 35, fill: '#064e3b', stroke: '#047857', label: 'DOE / Pilot' },
      { type: 'rect', x: 540, y: 190, width: 160, height: 35, fill: '#064e3b', stroke: '#047857', label: 'Solution Selection' },
      { type: 'rect', x: 540, y: 230, width: 160, height: 35, fill: '#064e3b', stroke: '#047857', label: 'Implementation Plan' },
      { type: 'rect', x: 540, y: 270, width: 160, height: 35, fill: '#064e3b', stroke: '#047857', label: 'Risk Mitigation' },
      // Control deliverables
      { type: 'rect', x: 710, y: 150, width: 160, height: 35, fill: '#78350f', stroke: '#b45309', label: 'Control Plan' },
      { type: 'rect', x: 710, y: 190, width: 160, height: 35, fill: '#78350f', stroke: '#b45309', label: 'SPC Charts' },
      { type: 'rect', x: 710, y: 230, width: 160, height: 35, fill: '#78350f', stroke: '#b45309', label: 'Training / SOPs' },
      { type: 'rect', x: 710, y: 270, width: 160, height: 35, fill: '#78350f', stroke: '#b45309', label: 'Handoff & Close' },
      // Gate reviews
      { type: 'diamond', x: 175, y: 315, width: 40, height: 35, fill: '#f59e0b', stroke: '#d97706', label: 'G1' },
      { type: 'diamond', x: 345, y: 315, width: 40, height: 35, fill: '#f59e0b', stroke: '#d97706', label: 'G2' },
      { type: 'diamond', x: 515, y: 315, width: 40, height: 35, fill: '#f59e0b', stroke: '#d97706', label: 'G3' },
      { type: 'diamond', x: 685, y: 315, width: 40, height: 35, fill: '#f59e0b', stroke: '#d97706', label: 'G4' },
      { type: 'diamond', x: 855, y: 315, width: 40, height: 35, fill: '#22c55e', stroke: '#16a34a', label: 'G5' },
      { type: 'text', x: 350, y: 360, width: 200, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Gate Reviews (Tollgates)' },
    ],
  },
  // ===== SIX SIGMA - SIPOC DIAGRAM =====
  {
    id: 'sipoc-diagram',
    name: 'SIPOC Diagram',
    category: 'sixsigma',
    description: 'Suppliers-Inputs-Process-Outputs-Customers',
    icon: '🔗',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 400, height: 40, fill: '#0891b2', stroke: '#0e7490', label: 'SIPOC Diagram' },
      // Column headers
      { type: 'rect', x: 20, y: 65, width: 150, height: 50, fill: '#7c3aed', stroke: '#6d28d9', label: 'SUPPLIERS' },
      { type: 'rect', x: 180, y: 65, width: 150, height: 50, fill: '#2563eb', stroke: '#1d4ed8', label: 'INPUTS' },
      { type: 'rect', x: 340, y: 65, width: 150, height: 50, fill: '#059669', stroke: '#047857', label: 'PROCESS' },
      { type: 'rect', x: 500, y: 65, width: 150, height: 50, fill: '#d97706', stroke: '#b45309', label: 'OUTPUTS' },
      { type: 'rect', x: 660, y: 65, width: 150, height: 50, fill: '#dc2626', stroke: '#b91c1c', label: 'CUSTOMERS' },
      // Arrows between columns
      { type: 'arrow', x: 170, y: 90, width: 10, height: 10, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'arrow', x: 330, y: 90, width: 10, height: 10, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'arrow', x: 490, y: 90, width: 10, height: 10, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'arrow', x: 650, y: 90, width: 10, height: 10, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      // Suppliers column
      { type: 'rect', x: 20, y: 125, width: 150, height: 35, fill: '#4c1d95', stroke: '#6d28d9', label: 'Raw Material Vendor' },
      { type: 'rect', x: 20, y: 165, width: 150, height: 35, fill: '#4c1d95', stroke: '#6d28d9', label: 'IT Department' },
      { type: 'rect', x: 20, y: 205, width: 150, height: 35, fill: '#4c1d95', stroke: '#6d28d9', label: 'HR Department' },
      { type: 'rect', x: 20, y: 245, width: 150, height: 35, fill: '#4c1d95', stroke: '#6d28d9', label: 'Logistics Partner' },
      // Inputs column
      { type: 'rect', x: 180, y: 125, width: 150, height: 35, fill: '#172554', stroke: '#1d4ed8', label: 'Raw Materials' },
      { type: 'rect', x: 180, y: 165, width: 150, height: 35, fill: '#172554', stroke: '#1d4ed8', label: 'Work Orders' },
      { type: 'rect', x: 180, y: 205, width: 150, height: 35, fill: '#172554', stroke: '#1d4ed8', label: 'Specifications' },
      { type: 'rect', x: 180, y: 245, width: 150, height: 35, fill: '#172554', stroke: '#1d4ed8', label: 'Equipment' },
      // Process steps (center)
      { type: 'rect', x: 350, y: 125, width: 130, height: 35, fill: '#064e3b', stroke: '#047857', label: '1. Receive Order' },
      { type: 'arrow', x: 415, y: 160, width: 4, height: 5, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'rect', x: 350, y: 170, width: 130, height: 35, fill: '#064e3b', stroke: '#047857', label: '2. Process' },
      { type: 'arrow', x: 415, y: 205, width: 4, height: 5, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'rect', x: 350, y: 215, width: 130, height: 35, fill: '#064e3b', stroke: '#047857', label: '3. Inspect' },
      { type: 'arrow', x: 415, y: 250, width: 4, height: 5, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'rect', x: 350, y: 260, width: 130, height: 35, fill: '#064e3b', stroke: '#047857', label: '4. Ship' },
      // Outputs column
      { type: 'rect', x: 500, y: 125, width: 150, height: 35, fill: '#78350f', stroke: '#b45309', label: 'Finished Product' },
      { type: 'rect', x: 500, y: 165, width: 150, height: 35, fill: '#78350f', stroke: '#b45309', label: 'Quality Report' },
      { type: 'rect', x: 500, y: 205, width: 150, height: 35, fill: '#78350f', stroke: '#b45309', label: 'Shipping Docs' },
      { type: 'rect', x: 500, y: 245, width: 150, height: 35, fill: '#78350f', stroke: '#b45309', label: 'Invoice' },
      // Customers column
      { type: 'rect', x: 660, y: 125, width: 150, height: 35, fill: '#7f1d1d', stroke: '#b91c1c', label: 'End Customer' },
      { type: 'rect', x: 660, y: 165, width: 150, height: 35, fill: '#7f1d1d', stroke: '#b91c1c', label: 'Quality Dept' },
      { type: 'rect', x: 660, y: 205, width: 150, height: 35, fill: '#7f1d1d', stroke: '#b91c1c', label: 'Warehouse' },
      { type: 'rect', x: 660, y: 245, width: 150, height: 35, fill: '#7f1d1d', stroke: '#b91c1c', label: 'Finance Dept' },
    ],
  },
  // ===== 7QC TOOLS - FISHBONE / ISHIKAWA =====
  {
    id: 'fishbone-ishikawa',
    name: 'Fishbone (Ishikawa)',
    category: 'qctools',
    description: 'Cause & Effect diagram with 6M categories',
    icon: '🐟',
    shapes: [
      // Effect (head)
      { type: 'rect', x: 780, y: 185, width: 140, height: 60, fill: '#dc2626', stroke: '#b91c1c', label: 'EFFECT\nDefect Rate' },
      // Main spine
      { type: 'line', x: 60, y: 215, width: 720, height: 2, fill: '#94a3b8', stroke: '#e2e8f0', label: '' },
      // Top category boxes (Man, Machine, Material)
      { type: 'rect', x: 60, y: 20, width: 110, height: 40, fill: '#7c3aed', stroke: '#6d28d9', label: 'MAN' },
      { type: 'rect', x: 280, y: 20, width: 110, height: 40, fill: '#2563eb', stroke: '#1d4ed8', label: 'MACHINE' },
      { type: 'rect', x: 500, y: 20, width: 110, height: 40, fill: '#0891b2', stroke: '#0e7490', label: 'MATERIAL' },
      // Bottom category boxes (Method, Measurement, Mother Nature)
      { type: 'rect', x: 60, y: 370, width: 110, height: 40, fill: '#059669', stroke: '#047857', label: 'METHOD' },
      { type: 'rect', x: 280, y: 370, width: 110, height: 40, fill: '#d97706', stroke: '#b45309', label: 'MEASUREMENT' },
      { type: 'rect', x: 500, y: 370, width: 110, height: 40, fill: '#dc2626', stroke: '#b91c1c', label: 'ENVIRONMENT' },
      // Top bones (diagonal lines represented by arrows)
      { type: 'arrow', x: 115, y: 60, width: 10, height: 155, fill: '#a78bfa', stroke: '#a78bfa', label: '' },
      { type: 'arrow', x: 335, y: 60, width: 10, height: 155, fill: '#60a5fa', stroke: '#60a5fa', label: '' },
      { type: 'arrow', x: 555, y: 60, width: 10, height: 155, fill: '#22d3ee', stroke: '#22d3ee', label: '' },
      // Bottom bones
      { type: 'arrow', x: 115, y: 215, width: 10, height: 155, fill: '#34d399', stroke: '#34d399', label: '' },
      { type: 'arrow', x: 335, y: 215, width: 10, height: 155, fill: '#fbbf24', stroke: '#fbbf24', label: '' },
      { type: 'arrow', x: 555, y: 215, width: 10, height: 155, fill: '#f87171', stroke: '#f87171', label: '' },
      // Man causes
      { type: 'text', x: 30, y: 85, width: 80, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Training' },
      { type: 'text', x: 30, y: 115, width: 80, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Fatigue' },
      { type: 'text', x: 30, y: 145, width: 80, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Skills gap' },
      // Machine causes
      { type: 'text', x: 250, y: 85, width: 80, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Calibration' },
      { type: 'text', x: 250, y: 115, width: 80, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Maintenance' },
      { type: 'text', x: 250, y: 145, width: 80, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Wear' },
      // Material causes
      { type: 'text', x: 470, y: 85, width: 80, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Quality' },
      { type: 'text', x: 470, y: 115, width: 80, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Supplier' },
      { type: 'text', x: 470, y: 145, width: 80, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Storage' },
      // Method causes
      { type: 'text', x: 30, y: 260, width: 90, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Procedure' },
      { type: 'text', x: 30, y: 290, width: 90, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Work instr.' },
      { type: 'text', x: 30, y: 320, width: 90, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Sequence' },
      // Measurement causes
      { type: 'text', x: 250, y: 260, width: 90, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Gage R&R' },
      { type: 'text', x: 250, y: 290, width: 90, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Accuracy' },
      { type: 'text', x: 250, y: 320, width: 90, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Frequency' },
      // Environment causes
      { type: 'text', x: 470, y: 260, width: 90, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Temperature' },
      { type: 'text', x: 470, y: 290, width: 90, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Humidity' },
      { type: 'text', x: 470, y: 320, width: 90, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Cleanliness' },
    ],
  },
  // ===== 7QC TOOLS - PARETO CHART =====
  {
    id: 'pareto-chart',
    name: 'Pareto Chart',
    category: 'qctools',
    description: '80/20 analysis with bar chart and cumulative line',
    icon: '📊',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 350, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Pareto Chart - Defect Analysis' },
      // Y-axis label
      { type: 'text', x: 15, y: 200, width: 30, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Count' },
      // X-axis label
      { type: 'text', x: 350, y: 400, width: 100, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Defect Category' },
      // Bars (tallest to shortest - Pareto principle)
      { type: 'rect', x: 80, y: 110, width: 70, height: 260, fill: '#3b82f6', stroke: '#2563eb', label: 'Scratches\n42%' },
      { type: 'rect', x: 170, y: 170, width: 70, height: 200, fill: '#3b82f6', stroke: '#2563eb', label: 'Dents\n28%' },
      { type: 'rect', x: 260, y: 240, width: 70, height: 130, fill: '#3b82f6', stroke: '#2563eb', label: 'Cracks\n15%' },
      { type: 'rect', x: 350, y: 290, width: 70, height: 80, fill: '#3b82f6', stroke: '#2563eb', label: 'Color\n8%' },
      { type: 'rect', x: 440, y: 320, width: 70, height: 50, fill: '#3b82f6', stroke: '#2563eb', label: 'Burrs\n4%' },
      { type: 'rect', x: 530, y: 340, width: 70, height: 30, fill: '#94a3b8', stroke: '#64748b', label: 'Other\n3%' },
      // Cumulative % dots (connected by line concept)
      { type: 'ellipse', x: 108, y: 100, width: 12, height: 12, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 198, y: 80, width: 12, height: 12, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 288, y: 72, width: 12, height: 12, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 378, y: 68, width: 12, height: 12, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 468, y: 64, width: 12, height: 12, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 558, y: 60, width: 12, height: 12, fill: '#ef4444', stroke: '#dc2626', label: '' },
      // Cumulative % labels
      { type: 'text', x: 95, y: 85, width: 35, height: 15, fill: 'transparent', stroke: 'transparent', label: '42%' },
      { type: 'text', x: 185, y: 65, width: 35, height: 15, fill: 'transparent', stroke: 'transparent', label: '70%' },
      { type: 'text', x: 275, y: 55, width: 35, height: 15, fill: 'transparent', stroke: 'transparent', label: '85%' },
      { type: 'text', x: 365, y: 52, width: 35, height: 15, fill: 'transparent', stroke: 'transparent', label: '93%' },
      { type: 'text', x: 455, y: 48, width: 35, height: 15, fill: 'transparent', stroke: 'transparent', label: '97%' },
      { type: 'text', x: 545, y: 44, width: 40, height: 15, fill: 'transparent', stroke: 'transparent', label: '100%' },
      // 80% line
      { type: 'line', x: 60, y: 75, width: 560, height: 2, fill: '#ef4444', stroke: '#ef4444', label: '' },
      { type: 'text', x: 620, y: 68, width: 40, height: 18, fill: 'transparent', stroke: 'transparent', label: '80%' },
      // Baseline
      { type: 'line', x: 60, y: 370, width: 560, height: 2, fill: '#475569', stroke: '#475569', label: '' },
      // Legend
      { type: 'rect', x: 640, y: 110, width: 20, height: 15, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'text', x: 665, y: 110, width: 50, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Count' },
      { type: 'ellipse', x: 644, y: 138, width: 12, height: 12, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'text', x: 665, y: 135, width: 70, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Cumulative %' },
    ],
  },
  // ===== 7QC TOOLS - CONTROL CHART =====
  {
    id: 'control-chart',
    name: 'Control Chart (X-bar)',
    category: 'qctools',
    description: 'Statistical process control chart with UCL/LCL',
    icon: '📈',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 350, height: 40, fill: '#059669', stroke: '#047857', label: 'X-bar Control Chart' },
      // UCL line
      { type: 'line', x: 80, y: 100, width: 620, height: 2, fill: '#ef4444', stroke: '#ef4444', label: '' },
      { type: 'text', x: 710, y: 92, width: 50, height: 18, fill: 'transparent', stroke: 'transparent', label: 'UCL=52.3' },
      // Center line (mean)
      { type: 'line', x: 80, y: 210, width: 620, height: 2, fill: '#22c55e', stroke: '#22c55e', label: '' },
      { type: 'text', x: 710, y: 202, width: 50, height: 18, fill: 'transparent', stroke: 'transparent', label: 'X̄=50.0' },
      // LCL line
      { type: 'line', x: 80, y: 320, width: 620, height: 2, fill: '#ef4444', stroke: '#ef4444', label: '' },
      { type: 'text', x: 710, y: 312, width: 50, height: 18, fill: 'transparent', stroke: 'transparent', label: 'LCL=47.7' },
      // Data points (simulating a control chart pattern)
      { type: 'ellipse', x: 95, y: 195, width: 12, height: 12, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'ellipse', x: 145, y: 220, width: 12, height: 12, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'ellipse', x: 195, y: 185, width: 12, height: 12, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'ellipse', x: 245, y: 240, width: 12, height: 12, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'ellipse', x: 295, y: 175, width: 12, height: 12, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'ellipse', x: 345, y: 230, width: 12, height: 12, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'ellipse', x: 395, y: 200, width: 12, height: 12, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'ellipse', x: 445, y: 155, width: 12, height: 12, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'ellipse', x: 495, y: 130, width: 12, height: 12, fill: '#f59e0b', stroke: '#d97706', label: '' },
      { type: 'ellipse', x: 545, y: 90, width: 12, height: 12, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 595, y: 165, width: 12, height: 12, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'ellipse', x: 645, y: 210, width: 12, height: 12, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      // Out of control annotation
      { type: 'callout', x: 520, y: 50, width: 100, height: 40, fill: '#ef4444', stroke: '#dc2626', label: 'Out of Control!' },
      // Zone labels
      { type: 'text', x: 30, y: 130, width: 40, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Zone A' },
      { type: 'text', x: 30, y: 170, width: 40, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Zone B' },
      { type: 'text', x: 30, y: 200, width: 40, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Zone C' },
      // X-axis
      { type: 'line', x: 80, y: 370, width: 620, height: 2, fill: '#475569', stroke: '#475569', label: '' },
      { type: 'text', x: 350, y: 380, width: 100, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Sample Number' },
    ],
  },
  // ===== 7QC TOOLS - CHECK SHEET =====
  {
    id: 'check-sheet',
    name: 'Check Sheet',
    category: 'qctools',
    description: 'Data collection form for defect tracking',
    icon: '✅',
    shapes: [
      // Title
      { type: 'banner', x: 150, y: 10, width: 350, height: 40, fill: '#2563eb', stroke: '#1d4ed8', label: 'Defect Check Sheet - Week 12' },
      // Header row
      { type: 'rect', x: 30, y: 65, width: 110, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Defect Type' },
      { type: 'rect', x: 140, y: 65, width: 80, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Mon' },
      { type: 'rect', x: 220, y: 65, width: 80, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Tue' },
      { type: 'rect', x: 300, y: 65, width: 80, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Wed' },
      { type: 'rect', x: 380, y: 65, width: 80, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Thu' },
      { type: 'rect', x: 460, y: 65, width: 80, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Fri' },
      { type: 'rect', x: 540, y: 65, width: 70, height: 40, fill: '#7c2d12', stroke: '#9a3412', label: 'Total' },
      // Row 1
      { type: 'rect', x: 30, y: 110, width: 110, height: 35, fill: '#1e293b', stroke: '#334155', label: 'Scratch' },
      { type: 'rect', x: 140, y: 110, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|||| |' },
      { type: 'rect', x: 220, y: 110, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '||||' },
      { type: 'rect', x: 300, y: 110, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|||| ||' },
      { type: 'rect', x: 380, y: 110, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|||' },
      { type: 'rect', x: 460, y: 110, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|||| |||' },
      { type: 'rect', x: 540, y: 110, width: 70, height: 35, fill: '#ef4444', stroke: '#dc2626', label: '28' },
      // Row 2
      { type: 'rect', x: 30, y: 150, width: 110, height: 35, fill: '#1e293b', stroke: '#334155', label: 'Dent' },
      { type: 'rect', x: 140, y: 150, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|||' },
      { type: 'rect', x: 220, y: 150, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '||' },
      { type: 'rect', x: 300, y: 150, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '||||' },
      { type: 'rect', x: 380, y: 150, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '||' },
      { type: 'rect', x: 460, y: 150, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|||' },
      { type: 'rect', x: 540, y: 150, width: 70, height: 35, fill: '#f59e0b', stroke: '#d97706', label: '14' },
      // Row 3
      { type: 'rect', x: 30, y: 190, width: 110, height: 35, fill: '#1e293b', stroke: '#334155', label: 'Crack' },
      { type: 'rect', x: 140, y: 190, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|' },
      { type: 'rect', x: 220, y: 190, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '||' },
      { type: 'rect', x: 300, y: 190, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|' },
      { type: 'rect', x: 380, y: 190, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '||' },
      { type: 'rect', x: 460, y: 190, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|' },
      { type: 'rect', x: 540, y: 190, width: 70, height: 35, fill: '#22c55e', stroke: '#16a34a', label: '7' },
      // Row 4
      { type: 'rect', x: 30, y: 230, width: 110, height: 35, fill: '#1e293b', stroke: '#334155', label: 'Discolor' },
      { type: 'rect', x: 140, y: 230, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'rect', x: 220, y: 230, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|' },
      { type: 'rect', x: 300, y: 230, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '||' },
      { type: 'rect', x: 380, y: 230, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'rect', x: 460, y: 230, width: 80, height: 35, fill: '#0f172a', stroke: '#334155', label: '|' },
      { type: 'rect', x: 540, y: 230, width: 70, height: 35, fill: '#22c55e', stroke: '#16a34a', label: '4' },
      // Total row
      { type: 'rect', x: 30, y: 280, width: 110, height: 35, fill: '#1e40af', stroke: '#1d4ed8', label: 'Daily Total' },
      { type: 'rect', x: 140, y: 280, width: 80, height: 35, fill: '#172554', stroke: '#1d4ed8', label: '10' },
      { type: 'rect', x: 220, y: 280, width: 80, height: 35, fill: '#172554', stroke: '#1d4ed8', label: '9' },
      { type: 'rect', x: 300, y: 280, width: 80, height: 35, fill: '#172554', stroke: '#1d4ed8', label: '14' },
      { type: 'rect', x: 380, y: 280, width: 80, height: 35, fill: '#172554', stroke: '#1d4ed8', label: '7' },
      { type: 'rect', x: 460, y: 280, width: 80, height: 35, fill: '#172554', stroke: '#1d4ed8', label: '13' },
      { type: 'rect', x: 540, y: 280, width: 70, height: 35, fill: '#dc2626', stroke: '#b91c1c', label: '53' },
    ],
  },
  // ===== BUSINESS INFOGRAPHIC - SWOT ANALYSIS =====
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    category: 'infographic',
    description: 'Strengths, Weaknesses, Opportunities, Threats matrix',
    icon: '🎯',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 300, height: 40, fill: '#1e293b', stroke: '#334155', label: 'SWOT Analysis' },
      // Center label
      { type: 'ellipse', x: 310, y: 195, width: 80, height: 80, fill: '#1e293b', stroke: '#475569', label: 'SWOT' },
      // Quadrant headers
      { type: 'rect', x: 60, y: 65, width: 250, height: 45, fill: '#15803d', stroke: '#166534', label: 'STRENGTHS' },
      { type: 'rect', x: 390, y: 65, width: 250, height: 45, fill: '#dc2626', stroke: '#b91c1c', label: 'WEAKNESSES' },
      { type: 'rect', x: 60, y: 285, width: 250, height: 45, fill: '#2563eb', stroke: '#1d4ed8', label: 'OPPORTUNITIES' },
      { type: 'rect', x: 390, y: 285, width: 250, height: 45, fill: '#d97706', stroke: '#b45309', label: 'THREATS' },
      // Strengths items
      { type: 'rect', x: 70, y: 115, width: 230, height: 30, fill: '#064e3b', stroke: '#065f46', label: 'Strong brand recognition' },
      { type: 'rect', x: 70, y: 150, width: 230, height: 30, fill: '#064e3b', stroke: '#065f46', label: 'Skilled workforce' },
      { type: 'rect', x: 70, y: 185, width: 230, height: 30, fill: '#064e3b', stroke: '#065f46', label: 'Proprietary technology' },
      { type: 'rect', x: 70, y: 220, width: 230, height: 30, fill: '#064e3b', stroke: '#065f46', label: 'Strong cash flow' },
      // Weaknesses items
      { type: 'rect', x: 400, y: 115, width: 230, height: 30, fill: '#7f1d1d', stroke: '#991b1b', label: 'Limited market presence' },
      { type: 'rect', x: 400, y: 150, width: 230, height: 30, fill: '#7f1d1d', stroke: '#991b1b', label: 'High production costs' },
      { type: 'rect', x: 400, y: 185, width: 230, height: 30, fill: '#7f1d1d', stroke: '#991b1b', label: 'Aging infrastructure' },
      { type: 'rect', x: 400, y: 220, width: 230, height: 30, fill: '#7f1d1d', stroke: '#991b1b', label: 'Talent retention issues' },
      // Opportunities items
      { type: 'rect', x: 70, y: 335, width: 230, height: 30, fill: '#172554', stroke: '#1e3a5f', label: 'Emerging markets' },
      { type: 'rect', x: 70, y: 370, width: 230, height: 30, fill: '#172554', stroke: '#1e3a5f', label: 'Digital transformation' },
      { type: 'rect', x: 70, y: 405, width: 230, height: 30, fill: '#172554', stroke: '#1e3a5f', label: 'Strategic partnerships' },
      { type: 'rect', x: 70, y: 440, width: 230, height: 30, fill: '#172554', stroke: '#1e3a5f', label: 'New product lines' },
      // Threats items
      { type: 'rect', x: 400, y: 335, width: 230, height: 30, fill: '#78350f', stroke: '#92400e', label: 'Aggressive competitors' },
      { type: 'rect', x: 400, y: 370, width: 230, height: 30, fill: '#78350f', stroke: '#92400e', label: 'Regulatory changes' },
      { type: 'rect', x: 400, y: 405, width: 230, height: 30, fill: '#78350f', stroke: '#92400e', label: 'Economic downturn' },
      { type: 'rect', x: 400, y: 440, width: 230, height: 30, fill: '#78350f', stroke: '#92400e', label: 'Supply chain disruption' },
      // Internal/External labels
      { type: 'text', x: 5, y: 180, width: 50, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Internal' },
      { type: 'text', x: 5, y: 380, width: 50, height: 20, fill: 'transparent', stroke: 'transparent', label: 'External' },
      { type: 'text', x: 240, y: 55, width: 50, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Positive' },
      { type: 'text', x: 450, y: 55, width: 50, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Negative' },
    ],
  },
  // ===== BUSINESS INFOGRAPHIC - BCG MATRIX =====
  {
    id: 'bcg-matrix',
    name: 'BCG Matrix',
    category: 'infographic',
    description: 'Growth-Share matrix: Stars, Cash Cows, Question Marks, Dogs',
    icon: '🌟',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 300, height: 40, fill: '#1e293b', stroke: '#334155', label: 'BCG Growth-Share Matrix' },
      // Axis labels
      { type: 'text', x: 5, y: 200, width: 40, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Market Growth' },
      { type: 'text', x: 320, y: 430, width: 100, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Relative Market Share' },
      { type: 'text', x: 15, y: 110, width: 30, height: 15, fill: 'transparent', stroke: 'transparent', label: 'High' },
      { type: 'text', x: 15, y: 340, width: 30, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Low' },
      { type: 'text', x: 120, y: 415, width: 30, height: 15, fill: 'transparent', stroke: 'transparent', label: 'High' },
      { type: 'text', x: 520, y: 415, width: 30, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Low' },
      // Question Marks (top-right)
      { type: 'rect', x: 370, y: 65, width: 250, height: 170, fill: '#312e81', stroke: '#4338ca', label: '' },
      { type: 'text', x: 430, y: 75, width: 120, height: 25, fill: 'transparent', stroke: 'transparent', label: '? QUESTION MARKS' },
      { type: 'ellipse', x: 420, y: 120, width: 70, height: 70, fill: '#6366f1', stroke: '#4f46e5', label: 'Product D' },
      { type: 'ellipse', x: 530, y: 140, width: 50, height: 50, fill: '#818cf8', stroke: '#6366f1', label: 'Prod E' },
      // Stars (top-left)
      { type: 'rect', x: 60, y: 65, width: 250, height: 170, fill: '#7f1d1d', stroke: '#991b1b', label: '' },
      { type: 'text', x: 140, y: 75, width: 80, height: 25, fill: 'transparent', stroke: 'transparent', label: 'STARS' },
      { type: 'star', x: 120, y: 110, width: 80, height: 80, fill: '#f59e0b', stroke: '#d97706', label: 'Product A' },
      { type: 'star', x: 230, y: 130, width: 55, height: 55, fill: '#fbbf24', stroke: '#f59e0b', label: 'Prod B' },
      // Cash Cows (bottom-left)
      { type: 'rect', x: 60, y: 240, width: 250, height: 170, fill: '#14532d', stroke: '#166534', label: '' },
      { type: 'text', x: 120, y: 250, width: 100, height: 25, fill: 'transparent', stroke: 'transparent', label: 'CASH COWS' },
      { type: 'ellipse', x: 110, y: 300, width: 100, height: 80, fill: '#22c55e', stroke: '#16a34a', label: 'Product C' },
      { type: 'ellipse', x: 240, y: 320, width: 55, height: 55, fill: '#4ade80', stroke: '#22c55e', label: 'Prod F' },
      // Dogs (bottom-right)
      { type: 'rect', x: 370, y: 240, width: 250, height: 170, fill: '#1e293b', stroke: '#475569', label: '' },
      { type: 'text', x: 450, y: 250, width: 60, height: 25, fill: 'transparent', stroke: 'transparent', label: 'DOGS' },
      { type: 'ellipse', x: 430, y: 310, width: 50, height: 50, fill: '#64748b', stroke: '#475569', label: 'Prod G' },
      { type: 'ellipse', x: 530, y: 320, width: 40, height: 40, fill: '#94a3b8', stroke: '#64748b', label: 'Prod H' },
      // Divider lines
      { type: 'line', x: 60, y: 237, width: 560, height: 2, fill: '#475569', stroke: '#e2e8f0', label: '' },
      { type: 'line', x: 340, y: 65, width: 2, height: 345, fill: '#475569', stroke: '#e2e8f0', label: '' },
    ],
  },
  // ===== BUSINESS INFOGRAPHIC - PORTER'S 5 FORCES =====
  {
    id: 'porters-five-forces',
    name: "Porter's 5 Forces",
    category: 'infographic',
    description: 'Competitive analysis framework with 5 industry forces',
    icon: '🏢',
    shapes: [
      // Center - Industry Rivalry
      { type: 'hexagon', x: 290, y: 185, width: 180, height: 140, fill: '#7c3aed', stroke: '#6d28d9', label: 'Industry\nRivalry' },
      // Top - Threat of New Entrants
      { type: 'rect', x: 290, y: 20, width: 180, height: 70, fill: '#dc2626', stroke: '#b91c1c', label: 'Threat of\nNew Entrants' },
      { type: 'arrow', x: 380, y: 90, width: 10, height: 95, fill: '#f87171', stroke: '#f87171', label: '' },
      { type: 'text', x: 290, y: 100, width: 80, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Barriers to entry' },
      { type: 'text', x: 290, y: 118, width: 80, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Capital needs' },
      // Bottom - Threat of Substitutes
      { type: 'rect', x: 290, y: 400, width: 180, height: 70, fill: '#d97706', stroke: '#b45309', label: 'Threat of\nSubstitutes' },
      { type: 'arrow', x: 380, y: 325, width: 10, height: 75, fill: '#fbbf24', stroke: '#fbbf24', label: '' },
      { type: 'text', x: 290, y: 375, width: 90, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Switching costs' },
      { type: 'text', x: 290, y: 390, width: 90, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Price-perf ratio' },
      // Left - Supplier Power
      { type: 'rect', x: 30, y: 210, width: 160, height: 70, fill: '#2563eb', stroke: '#1d4ed8', label: 'Supplier\nPower' },
      { type: 'arrow', x: 190, y: 245, width: 100, height: 10, fill: '#60a5fa', stroke: '#60a5fa', label: '' },
      { type: 'text', x: 35, y: 285, width: 80, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Concentration' },
      { type: 'text', x: 35, y: 300, width: 80, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Differentiation' },
      // Right - Buyer Power
      { type: 'rect', x: 570, y: 210, width: 160, height: 70, fill: '#059669', stroke: '#047857', label: 'Buyer\nPower' },
      { type: 'arrow', x: 470, y: 245, width: 100, height: 10, fill: '#34d399', stroke: '#34d399', label: '' },
      { type: 'text', x: 575, y: 285, width: 80, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Volume' },
      { type: 'text', x: 575, y: 300, width: 80, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Price sensitivity' },
    ],
  },
  // ===== BUSINESS INFOGRAPHIC - TIMELINE =====
  {
    id: 'project-timeline',
    name: 'Project Timeline',
    category: 'infographic',
    description: 'Horizontal timeline with milestones and phases',
    icon: '📅',
    shapes: [
      // Title
      { type: 'banner', x: 250, y: 10, width: 350, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Project Roadmap 2025' },
      // Main timeline line
      { type: 'line', x: 40, y: 200, width: 850, height: 2, fill: '#475569', stroke: '#94a3b8', label: '' },
      // Q1
      { type: 'ellipse', x: 90, y: 188, width: 24, height: 24, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'rect', x: 50, y: 100, width: 120, height: 70, fill: '#064e3b', stroke: '#047857', label: 'Q1: Planning\nRequirements\nTeam setup' },
      { type: 'arrow', x: 102, y: 170, width: 4, height: 18, fill: '#22c55e', stroke: '#22c55e', label: '' },
      { type: 'text', x: 75, y: 218, width: 50, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Jan-Mar' },
      // Q2
      { type: 'ellipse', x: 290, y: 188, width: 24, height: 24, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'rect', x: 250, y: 235, width: 120, height: 70, fill: '#172554', stroke: '#1d4ed8', label: 'Q2: Design\nPrototyping\nUser testing' },
      { type: 'arrow', x: 302, y: 212, width: 4, height: 23, fill: '#3b82f6', stroke: '#3b82f6', label: '' },
      { type: 'text', x: 275, y: 175, width: 50, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Apr-Jun' },
      // Q3
      { type: 'ellipse', x: 490, y: 188, width: 24, height: 24, fill: '#8b5cf6', stroke: '#7c3aed', label: '' },
      { type: 'rect', x: 450, y: 100, width: 120, height: 70, fill: '#4c1d95', stroke: '#6d28d9', label: 'Q3: Build\nDevelopment\nIntegration' },
      { type: 'arrow', x: 502, y: 170, width: 4, height: 18, fill: '#8b5cf6', stroke: '#8b5cf6', label: '' },
      { type: 'text', x: 475, y: 218, width: 50, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Jul-Sep' },
      // Q4
      { type: 'ellipse', x: 690, y: 188, width: 24, height: 24, fill: '#f59e0b', stroke: '#d97706', label: '' },
      { type: 'rect', x: 650, y: 235, width: 120, height: 70, fill: '#78350f', stroke: '#b45309', label: 'Q4: Launch\nDeployment\nMonitoring' },
      { type: 'arrow', x: 702, y: 212, width: 4, height: 23, fill: '#f59e0b', stroke: '#f59e0b', label: '' },
      { type: 'text', x: 675, y: 175, width: 50, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Oct-Dec' },
      // Milestone markers
      { type: 'diamond', x: 185, y: 188, width: 24, height: 24, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'text', x: 160, y: 218, width: 70, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Kickoff' },
      { type: 'diamond', x: 585, y: 188, width: 24, height: 24, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'text', x: 560, y: 218, width: 70, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Beta' },
      { type: 'diamond', x: 830, y: 188, width: 24, height: 24, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'text', x: 810, y: 218, width: 60, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Go Live' },
    ],
  },
  // ===== BUSINESS INFOGRAPHIC - STATISTICS DASHBOARD =====
  {
    id: 'stats-dashboard',
    name: 'Statistics Dashboard',
    category: 'infographic',
    description: 'KPI cards with metrics, trends, and indicators',
    icon: '📊',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 400, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Executive Dashboard - Q4 2025' },
      // KPI Card 1 - Revenue
      { type: 'rect', x: 30, y: 70, width: 200, height: 110, fill: '#064e3b', stroke: '#047857', label: '' },
      { type: 'text', x: 50, y: 80, width: 120, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Total Revenue' },
      { type: 'text', x: 60, y: 105, width: 100, height: 30, fill: 'transparent', stroke: 'transparent', label: '$12.4M' },
      { type: 'triangle', x: 80, y: 145, width: 20, height: 15, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'text', x: 105, y: 145, width: 60, height: 15, fill: 'transparent', stroke: 'transparent', label: '+18.2%' },
      // KPI Card 2 - Users
      { type: 'rect', x: 250, y: 70, width: 200, height: 110, fill: '#172554', stroke: '#1d4ed8', label: '' },
      { type: 'text', x: 270, y: 80, width: 120, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Active Users' },
      { type: 'text', x: 280, y: 105, width: 100, height: 30, fill: 'transparent', stroke: 'transparent', label: '284K' },
      { type: 'triangle', x: 300, y: 145, width: 20, height: 15, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'text', x: 325, y: 145, width: 60, height: 15, fill: 'transparent', stroke: 'transparent', label: '+24.7%' },
      // KPI Card 3 - Conversion
      { type: 'rect', x: 470, y: 70, width: 200, height: 110, fill: '#4c1d95', stroke: '#6d28d9', label: '' },
      { type: 'text', x: 490, y: 80, width: 140, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Conversion Rate' },
      { type: 'text', x: 500, y: 105, width: 100, height: 30, fill: 'transparent', stroke: 'transparent', label: '3.8%' },
      { type: 'triangle', x: 520, y: 155, width: 20, height: 15, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'text', x: 545, y: 145, width: 60, height: 15, fill: 'transparent', stroke: 'transparent', label: '-2.1%' },
      // KPI Card 4 - NPS
      { type: 'rect', x: 690, y: 70, width: 200, height: 110, fill: '#78350f', stroke: '#b45309', label: '' },
      { type: 'text', x: 710, y: 80, width: 120, height: 18, fill: 'transparent', stroke: 'transparent', label: 'NPS Score' },
      { type: 'text', x: 720, y: 105, width: 100, height: 30, fill: 'transparent', stroke: 'transparent', label: '72' },
      { type: 'triangle', x: 740, y: 145, width: 20, height: 15, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'text', x: 765, y: 145, width: 60, height: 15, fill: 'transparent', stroke: 'transparent', label: '+5 pts' },
      // Chart area - Bar chart representation
      { type: 'rect', x: 30, y: 200, width: 420, height: 200, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'text', x: 160, y: 205, width: 120, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Monthly Revenue' },
      { type: 'rect', x: 55, y: 310, width: 30, height: 70, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'rect', x: 100, y: 290, width: 30, height: 90, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'rect', x: 145, y: 260, width: 30, height: 120, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'rect', x: 190, y: 280, width: 30, height: 100, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'rect', x: 235, y: 250, width: 30, height: 130, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'rect', x: 280, y: 230, width: 30, height: 150, fill: '#22c55e', stroke: '#16a34a', label: '' },
      // Pie chart area
      { type: 'rect', x: 470, y: 200, width: 420, height: 200, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'text', x: 600, y: 205, width: 120, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Revenue Split' },
      { type: 'ellipse', x: 610, y: 290, width: 120, height: 120, fill: '#3b82f6', stroke: '#2563eb', label: 'SaaS 45%' },
      { type: 'ellipse', x: 700, y: 260, width: 60, height: 60, fill: '#22c55e', stroke: '#16a34a', label: '25%' },
      { type: 'ellipse', x: 720, y: 330, width: 50, height: 50, fill: '#f59e0b', stroke: '#d97706', label: '18%' },
      { type: 'ellipse', x: 560, y: 340, width: 40, height: 40, fill: '#8b5cf6', stroke: '#7c3aed', label: '12%' },
    ],
  },
  // ===== LEAN - KANBAN BOARD =====
  {
    id: 'kanban-board',
    name: 'Kanban Board',
    category: 'lean',
    description: 'Visual workflow board with WIP limits',
    icon: '📋',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 400, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Kanban Board' },
      // Column headers
      { type: 'rect', x: 20, y: 60, width: 160, height: 45, fill: '#475569', stroke: '#64748b', label: 'BACKLOG' },
      { type: 'rect', x: 190, y: 60, width: 160, height: 45, fill: '#2563eb', stroke: '#1d4ed8', label: 'TO DO (WIP: 4)' },
      { type: 'rect', x: 360, y: 60, width: 160, height: 45, fill: '#d97706', stroke: '#b45309', label: 'IN PROGRESS (3)' },
      { type: 'rect', x: 530, y: 60, width: 160, height: 45, fill: '#7c3aed', stroke: '#6d28d9', label: 'REVIEW (2)' },
      { type: 'rect', x: 700, y: 60, width: 160, height: 45, fill: '#059669', stroke: '#047857', label: 'DONE' },
      // Backlog cards
      { type: 'rect', x: 30, y: 115, width: 140, height: 50, fill: '#1e293b', stroke: '#475569', label: 'User research\nfor v2.0' },
      { type: 'rect', x: 30, y: 175, width: 140, height: 50, fill: '#1e293b', stroke: '#475569', label: 'API redesign' },
      { type: 'rect', x: 30, y: 235, width: 140, height: 50, fill: '#1e293b', stroke: '#475569', label: 'Perf audit' },
      // To Do cards
      { type: 'rect', x: 200, y: 115, width: 140, height: 50, fill: '#172554', stroke: '#1d4ed8', label: 'Auth module\nHigh Priority' },
      { type: 'rect', x: 200, y: 175, width: 140, height: 50, fill: '#172554', stroke: '#1d4ed8', label: 'Dashboard UI' },
      { type: 'rect', x: 200, y: 235, width: 140, height: 50, fill: '#172554', stroke: '#1d4ed8', label: 'Email notifs' },
      // In Progress cards (with assignee dots)
      { type: 'rect', x: 370, y: 115, width: 140, height: 50, fill: '#78350f', stroke: '#b45309', label: 'Search feature\n@alice' },
      { type: 'rect', x: 370, y: 175, width: 140, height: 50, fill: '#78350f', stroke: '#b45309', label: 'Payment flow\n@bob' },
      { type: 'ellipse', x: 490, y: 120, width: 16, height: 16, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 490, y: 180, width: 16, height: 16, fill: '#f59e0b', stroke: '#d97706', label: '' },
      // Review cards
      { type: 'rect', x: 540, y: 115, width: 140, height: 50, fill: '#4c1d95', stroke: '#6d28d9', label: 'User profile\nPR #142' },
      { type: 'rect', x: 540, y: 175, width: 140, height: 50, fill: '#4c1d95', stroke: '#6d28d9', label: 'Settings page\nPR #138' },
      // Done cards (with checkmarks implied)
      { type: 'rect', x: 710, y: 115, width: 140, height: 50, fill: '#064e3b', stroke: '#047857', label: 'Login page' },
      { type: 'rect', x: 710, y: 175, width: 140, height: 50, fill: '#064e3b', stroke: '#047857', label: 'Onboarding' },
      { type: 'rect', x: 710, y: 235, width: 140, height: 50, fill: '#064e3b', stroke: '#047857', label: 'CI/CD pipeline' },
      // Swimlane divider
      { type: 'line', x: 20, y: 310, width: 840, height: 2, fill: '#334155', stroke: '#475569', label: '' },
      { type: 'text', x: 30, y: 320, width: 80, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Blocked' },
      { type: 'rect', x: 370, y: 340, width: 140, height: 50, fill: '#7f1d1d', stroke: '#ef4444', label: 'DB migration\nBlocked by ops' },
    ],
  },
  // ===== LEAN - A3 PROBLEM SOLVING =====
  {
    id: 'a3-problem-solving',
    name: 'A3 Problem Solving',
    category: 'lean',
    description: 'Toyota A3 report with background, analysis, plan',
    icon: '📄',
    shapes: [
      // Title bar
      { type: 'rect', x: 20, y: 10, width: 860, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'A3 Problem Solving Report - Reduce Cycle Time' },
      // Left side sections
      // 1. Background
      { type: 'rect', x: 20, y: 60, width: 420, height: 35, fill: '#7c3aed', stroke: '#6d28d9', label: '1. BACKGROUND' },
      { type: 'rect', x: 20, y: 95, width: 420, height: 60, fill: '#1e293b', stroke: '#334155', label: 'Production cycle time increased 25%\nover last quarter. Customer complaints\nrising. On-time delivery dropped to 78%.' },
      // 2. Current Condition
      { type: 'rect', x: 20, y: 165, width: 420, height: 35, fill: '#dc2626', stroke: '#b91c1c', label: '2. CURRENT CONDITION' },
      { type: 'rect', x: 20, y: 200, width: 200, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Cycle time: 48 min\nTarget: 36 min' },
      { type: 'rect', x: 230, y: 200, width: 210, height: 50, fill: '#1e293b', stroke: '#334155', label: 'Defect rate: 4.2%\nTarget: 1.5%' },
      // 3. Goal
      { type: 'rect', x: 20, y: 260, width: 420, height: 35, fill: '#059669', stroke: '#047857', label: '3. TARGET / GOAL' },
      { type: 'rect', x: 20, y: 295, width: 420, height: 50, fill: '#064e3b', stroke: '#065f46', label: 'Reduce cycle time to 36 min by Q2\nAchieve 98% on-time delivery' },
      // 4. Root Cause Analysis
      { type: 'rect', x: 20, y: 355, width: 420, height: 35, fill: '#d97706', stroke: '#b45309', label: '4. ROOT CAUSE ANALYSIS' },
      { type: 'rect', x: 30, y: 395, width: 120, height: 35, fill: '#78350f', stroke: '#92400e', label: 'Changeover' },
      { type: 'arrow', x: 150, y: 412, width: 20, height: 4, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'rect', x: 175, y: 395, width: 120, height: 35, fill: '#78350f', stroke: '#92400e', label: 'No standard' },
      { type: 'arrow', x: 295, y: 412, width: 20, height: 4, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'star', x: 320, y: 393, width: 40, height: 38, fill: '#ef4444', stroke: '#dc2626', label: 'WHY?' },
      // Right side sections
      // 5. Countermeasures
      { type: 'rect', x: 460, y: 60, width: 420, height: 35, fill: '#2563eb', stroke: '#1d4ed8', label: '5. COUNTERMEASURES' },
      { type: 'rect', x: 460, y: 100, width: 30, height: 25, fill: '#22c55e', stroke: '#16a34a', label: '1' },
      { type: 'rect', x: 495, y: 100, width: 385, height: 25, fill: '#1e293b', stroke: '#334155', label: 'Implement SMED for changeover reduction' },
      { type: 'rect', x: 460, y: 130, width: 30, height: 25, fill: '#22c55e', stroke: '#16a34a', label: '2' },
      { type: 'rect', x: 495, y: 130, width: 385, height: 25, fill: '#1e293b', stroke: '#334155', label: 'Standardize work instructions at each station' },
      { type: 'rect', x: 460, y: 160, width: 30, height: 25, fill: '#22c55e', stroke: '#16a34a', label: '3' },
      { type: 'rect', x: 495, y: 160, width: 385, height: 25, fill: '#1e293b', stroke: '#334155', label: 'Install visual management boards' },
      // 6. Implementation Plan
      { type: 'rect', x: 460, y: 200, width: 420, height: 35, fill: '#0891b2', stroke: '#0e7490', label: '6. IMPLEMENTATION PLAN' },
      { type: 'rect', x: 460, y: 240, width: 140, height: 35, fill: '#164e63', stroke: '#155e75', label: 'Week 1-2:\nSMED training' },
      { type: 'arrow', x: 600, y: 257, width: 10, height: 4, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'rect', x: 615, y: 240, width: 120, height: 35, fill: '#164e63', stroke: '#155e75', label: 'Week 3-4:\nPilot line' },
      { type: 'arrow', x: 735, y: 257, width: 10, height: 4, fill: '#94a3b8', stroke: '#94a3b8', label: '' },
      { type: 'rect', x: 750, y: 240, width: 130, height: 35, fill: '#164e63', stroke: '#155e75', label: 'Week 5-8:\nFull rollout' },
      // 7. Follow-up
      { type: 'rect', x: 460, y: 295, width: 420, height: 35, fill: '#15803d', stroke: '#166534', label: '7. FOLLOW-UP & RESULTS' },
      { type: 'rect', x: 460, y: 335, width: 420, height: 50, fill: '#064e3b', stroke: '#065f46', label: 'Weekly gemba walks to verify adherence\nMonthly metrics review with team' },
      // Owner & Date
      { type: 'rect', x: 460, y: 400, width: 200, height: 35, fill: '#1e293b', stroke: '#334155', label: 'Owner: John Smith' },
      { type: 'rect', x: 670, y: 400, width: 210, height: 35, fill: '#1e293b', stroke: '#334155', label: 'Date: 2025-03-15' },
    ],
  },
  // ===== LEAN - 5S AUDIT =====
  {
    id: '5s-audit',
    name: '5S Audit Scorecard',
    category: 'lean',
    description: 'Sort, Set in Order, Shine, Standardize, Sustain audit',
    icon: '🧹',
    shapes: [
      // Title
      { type: 'banner', x: 150, y: 10, width: 400, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: '5S Workplace Audit Scorecard' },
      // Headers
      { type: 'rect', x: 30, y: 65, width: 120, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: '5S Element' },
      { type: 'rect', x: 150, y: 65, width: 200, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Description' },
      { type: 'rect', x: 350, y: 65, width: 60, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Score' },
      { type: 'rect', x: 410, y: 65, width: 300, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'Visual Rating' },
      // 1. Sort (Seiri)
      { type: 'rect', x: 30, y: 110, width: 120, height: 55, fill: '#dc2626', stroke: '#b91c1c', label: '1S - SORT\n(Seiri)' },
      { type: 'rect', x: 150, y: 110, width: 200, height: 55, fill: '#1e293b', stroke: '#334155', label: 'Remove unnecessary\nitems from workspace' },
      { type: 'rect', x: 350, y: 110, width: 60, height: 55, fill: '#064e3b', stroke: '#047857', label: '4/5' },
      { type: 'rect', x: 410, y: 120, width: 240, height: 30, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'rect', x: 412, y: 122, width: 190, height: 26, fill: '#22c55e', stroke: '#16a34a', label: '' },
      // 2. Set in Order (Seiton)
      { type: 'rect', x: 30, y: 170, width: 120, height: 55, fill: '#d97706', stroke: '#b45309', label: '2S - SET\n(Seiton)' },
      { type: 'rect', x: 150, y: 170, width: 200, height: 55, fill: '#1e293b', stroke: '#334155', label: 'A place for everything\nand everything in place' },
      { type: 'rect', x: 350, y: 170, width: 60, height: 55, fill: '#064e3b', stroke: '#047857', label: '3/5' },
      { type: 'rect', x: 410, y: 180, width: 240, height: 30, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'rect', x: 412, y: 182, width: 144, height: 26, fill: '#f59e0b', stroke: '#d97706', label: '' },
      // 3. Shine (Seiso)
      { type: 'rect', x: 30, y: 230, width: 120, height: 55, fill: '#2563eb', stroke: '#1d4ed8', label: '3S - SHINE\n(Seiso)' },
      { type: 'rect', x: 150, y: 230, width: 200, height: 55, fill: '#1e293b', stroke: '#334155', label: 'Clean & inspect\nworkplace regularly' },
      { type: 'rect', x: 350, y: 230, width: 60, height: 55, fill: '#064e3b', stroke: '#047857', label: '5/5' },
      { type: 'rect', x: 410, y: 240, width: 240, height: 30, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'rect', x: 412, y: 242, width: 236, height: 26, fill: '#22c55e', stroke: '#16a34a', label: '' },
      // 4. Standardize (Seiketsu)
      { type: 'rect', x: 30, y: 290, width: 120, height: 55, fill: '#059669', stroke: '#047857', label: '4S - STANDARD\n(Seiketsu)' },
      { type: 'rect', x: 150, y: 290, width: 200, height: 55, fill: '#1e293b', stroke: '#334155', label: 'Create standards\nfor the first 3S' },
      { type: 'rect', x: 350, y: 290, width: 60, height: 55, fill: '#78350f', stroke: '#b45309', label: '2/5' },
      { type: 'rect', x: 410, y: 300, width: 240, height: 30, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'rect', x: 412, y: 302, width: 96, height: 26, fill: '#ef4444', stroke: '#dc2626', label: '' },
      // 5. Sustain (Shitsuke)
      { type: 'rect', x: 30, y: 350, width: 120, height: 55, fill: '#7c3aed', stroke: '#6d28d9', label: '5S - SUSTAIN\n(Shitsuke)' },
      { type: 'rect', x: 150, y: 350, width: 200, height: 55, fill: '#1e293b', stroke: '#334155', label: 'Maintain discipline\nand continuous improv.' },
      { type: 'rect', x: 350, y: 350, width: 60, height: 55, fill: '#78350f', stroke: '#b45309', label: '3/5' },
      { type: 'rect', x: 410, y: 360, width: 240, height: 30, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'rect', x: 412, y: 362, width: 144, height: 26, fill: '#f59e0b', stroke: '#d97706', label: '' },
      // Total score
      { type: 'rect', x: 30, y: 420, width: 320, height: 40, fill: '#1e40af', stroke: '#1d4ed8', label: 'TOTAL SCORE' },
      { type: 'rect', x: 350, y: 420, width: 60, height: 40, fill: '#f59e0b', stroke: '#d97706', label: '17/25' },
      { type: 'text', x: 430, y: 430, width: 100, height: 20, fill: 'transparent', stroke: 'transparent', label: '68% - Needs Improvement' },
    ],
  },
  // ===== LEAN - SPAGHETTI DIAGRAM =====
  {
    id: 'spaghetti-diagram',
    name: 'Spaghetti Diagram',
    category: 'lean',
    description: 'Workflow movement visualization on floor layout',
    icon: '🍝',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 350, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Spaghetti Diagram - Assembly Area' },
      // Floor plan outline
      { type: 'rect', x: 40, y: 60, width: 720, height: 380, fill: '#0f172a', stroke: '#475569', label: '' },
      // Workstations
      { type: 'rect', x: 60, y: 80, width: 100, height: 60, fill: '#2563eb', stroke: '#1d4ed8', label: 'Station 1\nReceiving' },
      { type: 'rect', x: 300, y: 80, width: 100, height: 60, fill: '#059669', stroke: '#047857', label: 'Station 2\nInspection' },
      { type: 'rect', x: 560, y: 80, width: 100, height: 60, fill: '#d97706', stroke: '#b45309', label: 'Station 3\nAssembly' },
      { type: 'rect', x: 60, y: 300, width: 100, height: 60, fill: '#7c3aed', stroke: '#6d28d9', label: 'Station 4\nTesting' },
      { type: 'rect', x: 300, y: 300, width: 100, height: 60, fill: '#dc2626', stroke: '#b91c1c', label: 'Station 5\nPacking' },
      { type: 'rect', x: 560, y: 300, width: 100, height: 60, fill: '#0891b2', stroke: '#0e7490', label: 'Station 6\nShipping' },
      // Storage areas
      { type: 'rect', x: 180, y: 180, width: 80, height: 60, fill: '#1e293b', stroke: '#475569', label: 'Parts\nStorage' },
      { type: 'rect', x: 440, y: 180, width: 80, height: 60, fill: '#1e293b', stroke: '#475569', label: 'Tools\nStorage' },
      // Movement paths (spaghetti lines)
      { type: 'line', x: 160, y: 110, width: 140, height: 2, fill: '#ef4444', stroke: '#ef4444', label: '' },
      { type: 'line', x: 400, y: 110, width: 160, height: 2, fill: '#ef4444', stroke: '#ef4444', label: '' },
      { type: 'line', x: 610, y: 140, width: 2, height: 160, fill: '#ef4444', stroke: '#ef4444', label: '' },
      { type: 'line', x: 400, y: 330, width: 160, height: 2, fill: '#ef4444', stroke: '#ef4444', label: '' },
      { type: 'line', x: 160, y: 330, width: 140, height: 2, fill: '#ef4444', stroke: '#ef4444', label: '' },
      // Cross-movement waste paths
      { type: 'line', x: 110, y: 140, width: 2, height: 160, fill: '#f59e0b', stroke: '#f59e0b', label: '' },
      { type: 'line', x: 160, y: 200, width: 20, height: 2, fill: '#f59e0b', stroke: '#f59e0b', label: '' },
      { type: 'line', x: 260, y: 210, width: 180, height: 2, fill: '#f59e0b', stroke: '#f59e0b', label: '' },
      { type: 'line', x: 520, y: 210, width: 40, height: 2, fill: '#f59e0b', stroke: '#f59e0b', label: '' },
      { type: 'line', x: 350, y: 140, width: 2, height: 160, fill: '#f59e0b', stroke: '#f59e0b', label: '' },
      // Legend
      { type: 'line', x: 60, y: 460, width: 40, height: 2, fill: '#ef4444', stroke: '#ef4444', label: '' },
      { type: 'text', x: 110, y: 453, width: 80, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Primary path' },
      { type: 'line', x: 250, y: 460, width: 40, height: 2, fill: '#f59e0b', stroke: '#f59e0b', label: '' },
      { type: 'text', x: 300, y: 453, width: 100, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Waste movement' },
      { type: 'text', x: 470, y: 453, width: 160, height: 15, fill: 'transparent', stroke: 'transparent', label: 'Total distance: 847m/day' },
    ],
  },
];

function TemplateThumbnail({ template }: { template: DiagramTemplate }) {
  const minX = Math.min(...template.shapes.map(s => s.x ?? 0));
  const minY = Math.min(...template.shapes.map(s => s.y ?? 0));
  const maxX = Math.max(...template.shapes.map(s => (s.x ?? 0) + (s.width ?? 100)));
  const maxY = Math.max(...template.shapes.map(s => (s.y ?? 0) + (s.height ?? 60)));
  const pad = 10;
  const vb = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;

  return (
    <svg viewBox={vb} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {template.shapes.map((s, i) => {
        const x = s.x ?? 0, y = s.y ?? 0, w = s.width ?? 100, h = s.height ?? 60;
        const common = { fill: s.fill ?? '#3b82f6', stroke: s.stroke ?? '#1e40af', strokeWidth: 1.5, opacity: 0.9 };
        let el: React.ReactNode = null;
        switch (s.type) {
          case 'rect': el = <rect x={x} y={y} width={w} height={h} rx={4} {...common} />; break;
          case 'ellipse': el = <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />; break;
          case 'diamond': el = <polygon points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`} {...common} />; break;
          case 'triangle': el = <polygon points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`} {...common} />; break;
          case 'hexagon': {
            const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
            el = <polygon points={`${cx - rx},${cy} ${cx - rx / 2},${cy - ry} ${cx + rx / 2},${cy - ry} ${cx + rx},${cy} ${cx + rx / 2},${cy + ry} ${cx - rx / 2},${cy + ry}`} {...common} />;
            break;
          }
          case 'star': {
            const cx = x + w / 2, cy = y + h / 2, or2 = Math.min(w, h) / 2, ir = or2 * 0.4;
            const pts = Array.from({ length: 10 }, (_, j) => {
              const angle = (j * Math.PI) / 5 - Math.PI / 2;
              const r = j % 2 === 0 ? or2 : ir;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ');
            el = <polygon points={pts} {...common} />;
            break;
          }
          case 'cloud': el = <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />; break;
          case 'cylinder': el = <><rect x={x} y={y + 10} width={w} height={h - 10} rx={2} {...common} /><ellipse cx={x + w / 2} cy={y + 10} rx={w / 2} ry={10} {...common} /></>; break;
          case 'arrow': el = <line x1={x} y1={y} x2={x} y2={y + h} stroke={s.stroke ?? '#94a3b8'} strokeWidth={1.5} markerEnd="url(#arrowhead)" />; break;
          case 'line': el = <line x1={x} y1={y} x2={x + w} y2={y + h} stroke={s.stroke ?? '#94a3b8'} strokeWidth={1.5} />; break;
          case 'blockArrow': el = <polygon points={`${x},${y + h * 0.25} ${x + w * 0.7},${y + h * 0.25} ${x + w * 0.7},${y} ${x + w},${y + h / 2} ${x + w * 0.7},${y + h} ${x + w * 0.7},${y + h * 0.75} ${x},${y + h * 0.75}`} {...common} />; break;
          case 'banner': el = <><rect x={x} y={y} width={w} height={h} rx={2} {...common} /><polygon points={`${x},${y} ${x + 10},${y + h / 2} ${x},${y + h}`} fill={s.stroke ?? '#1e40af'} /><polygon points={`${x + w},${y} ${x + w - 10},${y + h / 2} ${x + w},${y + h}`} fill={s.stroke ?? '#1e40af'} /></>; break;
          case 'callout': el = <><rect x={x} y={y} width={w} height={h * 0.75} rx={4} {...common} /><polygon points={`${x + w * 0.3},${y + h * 0.75} ${x + w * 0.2},${y + h} ${x + w * 0.5},${y + h * 0.75}`} {...common} /></>; break;
          case 'text': break;
          default: el = <rect x={x} y={y} width={w} height={h} rx={4} {...common} />;
        }
        return <g key={i}>{el}{s.label && s.type !== 'arrow' && s.type !== 'text' && (
          <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={Math.min(10, w / (s.label.length * 0.7))} fontFamily="system-ui">{s.label}</text>
        )}</g>;
      })}
      <defs><marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><polygon points="0 0, 6 2, 0 4" fill="#94a3b8" /></marker></defs>
    </svg>
  );
}

export default function DiagramTemplateGallery() {
  const { shapes, pushHistory, setSelectedId, setSelectedIds, setPan, setZoom } = useGraphicsStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const loadTemplate = (template: DiagramTemplate) => {
    const newShapes: Shape[] = template.shapes.map(s => {
      const base = createShape((s.type as any) ?? 'rect', s.x ?? 0, s.y ?? 0);
      return {
        ...base,
        id: genId(),
        width: s.width ?? base.width,
        height: s.height ?? base.height,
        fill: s.fill ?? base.fill,
        stroke: s.stroke ?? base.stroke,
        label: s.label ?? '',
      } as Shape;
    });
    pushHistory([...shapes, ...newShapes]);
    setPan({ x: 0, y: 0 });
    setZoom(0.8);
    setSelectedId(null);
    setSelectedIds([]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="p-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full px-2 py-1.5 rounded bg-[#0f172a] border border-[#334155] text-xs text-[#e2e8f0] placeholder:text-[#64748b]"
        />
      </div>

      {/* Category filters */}
      <div className="px-2 pb-2 flex flex-wrap gap-1">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#0f172a] text-[#94a3b8] hover:bg-[#334155]'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Template cards */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        {filtered.length === 0 && (
          <p className="text-[10px] text-[#64748b] text-center py-4">No templates found</p>
        )}
        {filtered.map(t => (
          <button
            key={t.id}
            onClick={() => loadTemplate(t)}
            className="w-full rounded-lg border border-[#334155] bg-[#0f172a] hover:border-blue-500 hover:bg-[#1a2540] transition-colors text-left group"
          >
            <div className="h-24 p-2 border-b border-[#334155] bg-[#0a0f1a] rounded-t-lg">
              <TemplateThumbnail template={t} />
            </div>
            <div className="p-2">
              <p className="text-[11px] font-medium text-[#e2e8f0] group-hover:text-blue-400 transition-colors">
                {t.icon} {t.name}
              </p>
              <p className="text-[9px] text-[#64748b] mt-0.5">{t.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { TEMPLATES, TEMPLATE_CATEGORIES };
