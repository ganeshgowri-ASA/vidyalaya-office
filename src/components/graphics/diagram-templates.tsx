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
  { id: 'projectmgmt', label: 'Project Mgmt', icon: '📋' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'strategy', label: 'Strategy', icon: '🎯' },
  { id: 'agile', label: 'Agile', icon: '🔄' },
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
  // ===== PROJECT MANAGEMENT - GANTT CHART =====
  {
    id: 'gantt-chart',
    name: 'Gantt Chart',
    category: 'projectmgmt',
    description: 'Project timeline with task bars, milestones, dependencies, critical path',
    icon: '📅',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 400, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Project Alpha - Gantt Chart' },
      // Date headers
      { type: 'rect', x: 220, y: 60, width: 120, height: 30, fill: '#1e3a5f', stroke: '#2563eb', label: 'Week 1' },
      { type: 'rect', x: 340, y: 60, width: 120, height: 30, fill: '#1e3a5f', stroke: '#2563eb', label: 'Week 2' },
      { type: 'rect', x: 460, y: 60, width: 120, height: 30, fill: '#1e3a5f', stroke: '#2563eb', label: 'Week 3' },
      { type: 'rect', x: 580, y: 60, width: 120, height: 30, fill: '#1e3a5f', stroke: '#2563eb', label: 'Week 4' },
      { type: 'rect', x: 700, y: 60, width: 120, height: 30, fill: '#1e3a5f', stroke: '#2563eb', label: 'Week 5' },
      // Task labels (left column)
      { type: 'rect', x: 20, y: 60, width: 190, height: 30, fill: '#334155', stroke: '#475569', label: 'Task Name' },
      { type: 'rect', x: 20, y: 100, width: 190, height: 35, fill: '#0f172a', stroke: '#334155', label: 'Requirements' },
      { type: 'rect', x: 20, y: 145, width: 190, height: 35, fill: '#0f172a', stroke: '#334155', label: 'UI Design' },
      { type: 'rect', x: 20, y: 190, width: 190, height: 35, fill: '#0f172a', stroke: '#334155', label: 'Backend Dev' },
      { type: 'rect', x: 20, y: 235, width: 190, height: 35, fill: '#0f172a', stroke: '#334155', label: 'Frontend Dev' },
      { type: 'rect', x: 20, y: 280, width: 190, height: 35, fill: '#0f172a', stroke: '#334155', label: 'Integration' },
      { type: 'rect', x: 20, y: 325, width: 190, height: 35, fill: '#0f172a', stroke: '#334155', label: 'Testing' },
      { type: 'rect', x: 20, y: 370, width: 190, height: 35, fill: '#0f172a', stroke: '#334155', label: 'Deployment' },
      // Task bars
      { type: 'rect', x: 220, y: 105, width: 180, height: 24, fill: '#2563eb', stroke: '#1d4ed8', label: '100%  Alice' },
      { type: 'rect', x: 310, y: 150, width: 150, height: 24, fill: '#8b5cf6', stroke: '#7c3aed', label: '80%  Bob' },
      { type: 'rect', x: 400, y: 195, width: 240, height: 24, fill: '#ef4444', stroke: '#dc2626', label: '60%  Carol' },
      { type: 'rect', x: 460, y: 240, width: 200, height: 24, fill: '#ef4444', stroke: '#dc2626', label: '45%  Dave' },
      { type: 'rect', x: 620, y: 285, width: 120, height: 24, fill: '#ef4444', stroke: '#dc2626', label: '10%  Eve' },
      { type: 'rect', x: 700, y: 330, width: 100, height: 24, fill: '#f59e0b', stroke: '#d97706', label: '0%  QA Team' },
      { type: 'rect', x: 780, y: 375, width: 40, height: 24, fill: '#22c55e', stroke: '#15803d', label: 'Ops' },
      // Progress fill overlay (partial bars)
      { type: 'rect', x: 220, y: 105, width: 180, height: 24, fill: '#3b82f6', stroke: '#2563eb', label: '' },
      { type: 'rect', x: 310, y: 150, width: 120, height: 24, fill: '#a78bfa', stroke: '#8b5cf6', label: '' },
      { type: 'rect', x: 400, y: 195, width: 144, height: 24, fill: '#f87171', stroke: '#ef4444', label: '' },
      // Milestones (diamonds)
      { type: 'diamond', x: 390, y: 100, width: 24, height: 24, fill: '#22c55e', stroke: '#15803d', label: 'M1' },
      { type: 'diamond', x: 650, y: 190, width: 24, height: 24, fill: '#f59e0b', stroke: '#d97706', label: 'M2' },
      { type: 'diamond', x: 810, y: 370, width: 24, height: 24, fill: '#22c55e', stroke: '#15803d', label: 'GO' },
      // Dependency arrows
      { type: 'arrow', x: 400, y: 117, width: 60, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 460, y: 162, width: 0, height: 33, fill: '#64748b', stroke: '#64748b', label: '' },
      // Critical path label
      { type: 'text', x: 400, y: 415, width: 200, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Red = Critical Path' },
      // Legend
      { type: 'rect', x: 620, y: 410, width: 16, height: 16, fill: '#22c55e', stroke: '#15803d', label: '' },
      { type: 'text', x: 640, y: 410, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Milestone' },
      { type: 'rect', x: 720, y: 410, width: 16, height: 16, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'text', x: 740, y: 410, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Critical' },
    ],
  },
  // ===== PROJECT MANAGEMENT - PROJECT PROGRESS TRACKER =====
  {
    id: 'project-progress-tracker',
    name: 'Project Progress Tracker',
    category: 'projectmgmt',
    description: 'Dashboard with progress donut, phase cards, risk indicators, budget chart',
    icon: '📊',
    shapes: [
      // Title
      { type: 'banner', x: 180, y: 10, width: 440, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Project Progress Dashboard' },
      // Overall progress donut (represented as concentric circles)
      { type: 'ellipse', x: 40, y: 70, width: 150, height: 150, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'ellipse', x: 55, y: 85, width: 120, height: 120, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'ellipse', x: 70, y: 100, width: 90, height: 90, fill: '#0f172a', stroke: '#0f172a', label: '68%\nComplete' },
      { type: 'text', x: 60, y: 230, width: 110, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Overall Progress' },
      // Phase status cards
      { type: 'rect', x: 220, y: 70, width: 140, height: 55, fill: '#14532d', stroke: '#22c55e', label: 'Planning\nComplete 100%' },
      { type: 'rect', x: 370, y: 70, width: 140, height: 55, fill: '#14532d', stroke: '#22c55e', label: 'Design\nComplete 100%' },
      { type: 'rect', x: 520, y: 70, width: 140, height: 55, fill: '#422006', stroke: '#f59e0b', label: 'Development\nIn Progress 65%' },
      { type: 'rect', x: 670, y: 70, width: 140, height: 55, fill: '#1e293b', stroke: '#475569', label: 'Testing\nPending 0%' },
      { type: 'rect', x: 445, y: 135, width: 140, height: 55, fill: '#1e293b', stroke: '#475569', label: 'Launch\nPending 0%' },
      // Milestone timeline
      { type: 'text', x: 220, y: 210, width: 200, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Milestone Timeline' },
      { type: 'line', x: 220, y: 240, width: 590, height: 2, fill: '#475569', stroke: '#475569', label: '' },
      { type: 'diamond', x: 250, y: 232, width: 18, height: 18, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'text', x: 235, y: 255, width: 60, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Kickoff' },
      { type: 'diamond', x: 400, y: 232, width: 18, height: 18, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'text', x: 380, y: 255, width: 70, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Design OK' },
      { type: 'diamond', x: 560, y: 232, width: 18, height: 18, fill: '#f59e0b', stroke: '#d97706', label: '' },
      { type: 'text', x: 540, y: 255, width: 60, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Beta' },
      { type: 'diamond', x: 720, y: 232, width: 18, height: 18, fill: '#64748b', stroke: '#475569', label: '' },
      { type: 'text', x: 700, y: 255, width: 60, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Launch' },
      // Risk indicators
      { type: 'text', x: 40, y: 290, width: 150, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Risk Indicators' },
      { type: 'rect', x: 40, y: 315, width: 120, height: 40, fill: '#14532d', stroke: '#22c55e', label: 'Scope: LOW' },
      { type: 'rect', x: 170, y: 315, width: 120, height: 40, fill: '#422006', stroke: '#f59e0b', label: 'Schedule: MED' },
      { type: 'rect', x: 300, y: 315, width: 120, height: 40, fill: '#450a0a', stroke: '#ef4444', label: 'Budget: HIGH' },
      // Budget vs Actual bars
      { type: 'text', x: 470, y: 290, width: 200, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Budget vs Actual ($K)' },
      { type: 'rect', x: 470, y: 315, width: 160, height: 20, fill: '#2563eb', stroke: '#1d4ed8', label: 'Budget: $240K' },
      { type: 'rect', x: 470, y: 340, width: 190, height: 20, fill: '#ef4444', stroke: '#dc2626', label: 'Actual: $285K' },
      { type: 'text', x: 670, y: 340, width: 80, height: 18, fill: 'transparent', stroke: 'transparent', label: '+$45K over' },
    ],
  },
  // ===== PROJECT MANAGEMENT - PROJECT ROADMAP =====
  {
    id: 'project-roadmap',
    name: 'Project Roadmap',
    category: 'projectmgmt',
    description: 'Quarterly roadmap with swim lanes, milestones, phase gates',
    icon: '🗺',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 400, height: 40, fill: '#1e293b', stroke: '#334155', label: '2026 Product Roadmap' },
      // Quarter headers
      { type: 'rect', x: 160, y: 60, width: 180, height: 30, fill: '#1e3a5f', stroke: '#2563eb', label: 'Q1 Jan-Mar' },
      { type: 'rect', x: 350, y: 60, width: 180, height: 30, fill: '#1e3a5f', stroke: '#2563eb', label: 'Q2 Apr-Jun' },
      { type: 'rect', x: 540, y: 60, width: 180, height: 30, fill: '#1e3a5f', stroke: '#2563eb', label: 'Q3 Jul-Sep' },
      { type: 'rect', x: 730, y: 60, width: 180, height: 30, fill: '#1e3a5f', stroke: '#2563eb', label: 'Q4 Oct-Dec' },
      // Swim lane labels
      { type: 'rect', x: 10, y: 100, width: 140, height: 70, fill: '#312e81', stroke: '#4338ca', label: 'Engineering' },
      { type: 'rect', x: 10, y: 180, width: 140, height: 70, fill: '#1e3a5f', stroke: '#2563eb', label: 'Design' },
      { type: 'rect', x: 10, y: 260, width: 140, height: 70, fill: '#14532d', stroke: '#22c55e', label: 'Marketing' },
      { type: 'rect', x: 10, y: 340, width: 140, height: 70, fill: '#422006', stroke: '#f59e0b', label: 'Operations' },
      // Swim lane backgrounds
      { type: 'rect', x: 160, y: 100, width: 750, height: 70, fill: '#0f172a', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 160, y: 180, width: 750, height: 70, fill: '#0a0f1a', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 160, y: 260, width: 750, height: 70, fill: '#0f172a', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 160, y: 340, width: 750, height: 70, fill: '#0a0f1a', stroke: '#1e293b', label: '' },
      // Engineering items
      { type: 'rect', x: 170, y: 110, width: 160, height: 24, fill: '#7c3aed', stroke: '#6d28d9', label: 'API v2 Build' },
      { type: 'rect', x: 360, y: 110, width: 200, height: 24, fill: '#ef4444', stroke: '#dc2626', label: 'Core Platform Refactor' },
      { type: 'rect', x: 600, y: 110, width: 140, height: 24, fill: '#7c3aed', stroke: '#6d28d9', label: 'Scale Infra' },
      { type: 'rect', x: 760, y: 110, width: 140, height: 24, fill: '#8b5cf6', stroke: '#7c3aed', label: 'AI Features' },
      // Design items
      { type: 'rect', x: 170, y: 190, width: 120, height: 24, fill: '#0891b2', stroke: '#0e7490', label: 'Design System' },
      { type: 'rect', x: 380, y: 190, width: 150, height: 24, fill: '#0891b2', stroke: '#0e7490', label: 'UX Redesign' },
      { type: 'rect', x: 620, y: 190, width: 120, height: 24, fill: '#06b6d4', stroke: '#0891b2', label: 'Mobile UI' },
      // Marketing items
      { type: 'rect', x: 200, y: 270, width: 130, height: 24, fill: '#22c55e', stroke: '#16a34a', label: 'Brand Refresh' },
      { type: 'rect', x: 450, y: 270, width: 100, height: 24, fill: '#22c55e', stroke: '#16a34a', label: 'Campaign' },
      { type: 'rect', x: 700, y: 270, width: 160, height: 24, fill: '#16a34a', stroke: '#15803d', label: 'Product Launch' },
      // Operations items
      { type: 'rect', x: 170, y: 350, width: 180, height: 24, fill: '#f59e0b', stroke: '#d97706', label: 'Process Automation' },
      { type: 'rect', x: 540, y: 350, width: 160, height: 24, fill: '#f59e0b', stroke: '#d97706', label: 'SOC2 Compliance' },
      // Phase gate diamonds
      { type: 'diamond', x: 340, y: 425, width: 24, height: 24, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'text', x: 320, y: 455, width: 80, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Gate 1' },
      { type: 'diamond', x: 530, y: 425, width: 24, height: 24, fill: '#f59e0b', stroke: '#d97706', label: '' },
      { type: 'text', x: 510, y: 455, width: 80, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Gate 2' },
      { type: 'diamond', x: 720, y: 425, width: 24, height: 24, fill: '#64748b', stroke: '#475569', label: '' },
      { type: 'text', x: 700, y: 455, width: 80, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Gate 3' },
      // Phase gate line
      { type: 'line', x: 160, y: 437, width: 750, height: 2, fill: '#334155', stroke: '#334155', label: '' },
    ],
  },
  // ===== ANALYTICS - CORRELATION MATRIX =====
  {
    id: 'correlation-matrix',
    name: 'Correlation Matrix',
    category: 'analytics',
    description: 'NxN grid with color-coded correlations and coefficient values',
    icon: '🔗',
    shapes: [
      // Title
      { type: 'banner', x: 200, y: 10, width: 400, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Variable Correlation Matrix' },
      // Column headers
      { type: 'rect', x: 160, y: 60, width: 110, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Revenue' },
      { type: 'rect', x: 280, y: 60, width: 110, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Marketing' },
      { type: 'rect', x: 400, y: 60, width: 110, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Cust Sat' },
      { type: 'rect', x: 520, y: 60, width: 110, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Retention' },
      { type: 'rect', x: 640, y: 60, width: 110, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Churn' },
      // Row headers
      { type: 'rect', x: 40, y: 105, width: 110, height: 50, fill: '#1e3a5f', stroke: '#2563eb', label: 'Revenue' },
      { type: 'rect', x: 40, y: 165, width: 110, height: 50, fill: '#1e3a5f', stroke: '#2563eb', label: 'Marketing' },
      { type: 'rect', x: 40, y: 225, width: 110, height: 50, fill: '#1e3a5f', stroke: '#2563eb', label: 'Cust Sat' },
      { type: 'rect', x: 40, y: 285, width: 110, height: 50, fill: '#1e3a5f', stroke: '#2563eb', label: 'Retention' },
      { type: 'rect', x: 40, y: 345, width: 110, height: 50, fill: '#1e3a5f', stroke: '#2563eb', label: 'Churn' },
      // Diagonal (1.00 - self-correlation)
      { type: 'rect', x: 160, y: 105, width: 110, height: 50, fill: '#1e40af', stroke: '#2563eb', label: '1.00' },
      { type: 'rect', x: 280, y: 165, width: 110, height: 50, fill: '#1e40af', stroke: '#2563eb', label: '1.00' },
      { type: 'rect', x: 400, y: 225, width: 110, height: 50, fill: '#1e40af', stroke: '#2563eb', label: '1.00' },
      { type: 'rect', x: 520, y: 285, width: 110, height: 50, fill: '#1e40af', stroke: '#2563eb', label: '1.00' },
      { type: 'rect', x: 640, y: 345, width: 110, height: 50, fill: '#1e40af', stroke: '#2563eb', label: '1.00' },
      // Positive correlations (green shades)
      { type: 'rect', x: 280, y: 105, width: 110, height: 50, fill: '#14532d', stroke: '#22c55e', label: '0.82' },
      { type: 'rect', x: 400, y: 105, width: 110, height: 50, fill: '#166534', stroke: '#22c55e', label: '0.71' },
      { type: 'rect', x: 520, y: 105, width: 110, height: 50, fill: '#14532d', stroke: '#22c55e', label: '0.89' },
      { type: 'rect', x: 160, y: 165, width: 110, height: 50, fill: '#14532d', stroke: '#22c55e', label: '0.82' },
      { type: 'rect', x: 400, y: 165, width: 110, height: 50, fill: '#365314', stroke: '#84cc16', label: '0.45' },
      { type: 'rect', x: 160, y: 225, width: 110, height: 50, fill: '#166534', stroke: '#22c55e', label: '0.71' },
      { type: 'rect', x: 520, y: 225, width: 110, height: 50, fill: '#14532d', stroke: '#22c55e', label: '0.78' },
      { type: 'rect', x: 160, y: 285, width: 110, height: 50, fill: '#14532d', stroke: '#22c55e', label: '0.89' },
      { type: 'rect', x: 400, y: 285, width: 110, height: 50, fill: '#14532d', stroke: '#22c55e', label: '0.78' },
      // Negative correlations (red shades)
      { type: 'rect', x: 640, y: 105, width: 110, height: 50, fill: '#450a0a', stroke: '#ef4444', label: '-0.76' },
      { type: 'rect', x: 640, y: 165, width: 110, height: 50, fill: '#7f1d1d', stroke: '#f87171', label: '-0.38' },
      { type: 'rect', x: 640, y: 225, width: 110, height: 50, fill: '#450a0a', stroke: '#ef4444', label: '-0.85' },
      { type: 'rect', x: 640, y: 285, width: 110, height: 50, fill: '#450a0a', stroke: '#ef4444', label: '-0.91' },
      { type: 'rect', x: 520, y: 165, width: 110, height: 50, fill: '#365314', stroke: '#84cc16', label: '0.52' },
      { type: 'rect', x: 280, y: 225, width: 110, height: 50, fill: '#365314', stroke: '#84cc16', label: '0.45' },
      { type: 'rect', x: 280, y: 285, width: 110, height: 50, fill: '#365314', stroke: '#84cc16', label: '0.52' },
      { type: 'rect', x: 160, y: 345, width: 110, height: 50, fill: '#450a0a', stroke: '#ef4444', label: '-0.76' },
      { type: 'rect', x: 280, y: 345, width: 110, height: 50, fill: '#7f1d1d', stroke: '#f87171', label: '-0.38' },
      { type: 'rect', x: 400, y: 345, width: 110, height: 50, fill: '#450a0a', stroke: '#ef4444', label: '-0.85' },
      { type: 'rect', x: 520, y: 345, width: 110, height: 50, fill: '#450a0a', stroke: '#ef4444', label: '-0.91' },
      // Legend
      { type: 'rect', x: 160, y: 410, width: 60, height: 20, fill: '#14532d', stroke: '#22c55e', label: '' },
      { type: 'text', x: 225, y: 412, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Strong +' },
      { type: 'rect', x: 320, y: 410, width: 60, height: 20, fill: '#365314', stroke: '#84cc16', label: '' },
      { type: 'text', x: 385, y: 412, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Moderate +' },
      { type: 'rect', x: 480, y: 410, width: 60, height: 20, fill: '#7f1d1d', stroke: '#f87171', label: '' },
      { type: 'text', x: 545, y: 412, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Moderate -' },
      { type: 'rect', x: 640, y: 410, width: 60, height: 20, fill: '#450a0a', stroke: '#ef4444', label: '' },
      { type: 'text', x: 705, y: 412, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Strong -' },
    ],
  },
  // ===== ANALYTICS - SUPPLIER-DEMAND MATCHING MATRIX =====
  {
    id: 'supplier-demand-matrix',
    name: 'Supplier-Demand Matrix',
    category: 'analytics',
    description: 'Supplier vs demand matching with traffic light status and capacity',
    icon: '🔄',
    shapes: [
      { type: 'banner', x: 180, y: 10, width: 440, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Supplier-Demand Matching Matrix' },
      // Column headers (demand)
      { type: 'rect', x: 160, y: 60, width: 130, height: 35, fill: '#312e81', stroke: '#4338ca', label: 'Product A\n500 units' },
      { type: 'rect', x: 300, y: 60, width: 130, height: 35, fill: '#312e81', stroke: '#4338ca', label: 'Product B\n300 units' },
      { type: 'rect', x: 440, y: 60, width: 130, height: 35, fill: '#312e81', stroke: '#4338ca', label: 'Product C\n700 units' },
      { type: 'rect', x: 580, y: 60, width: 130, height: 35, fill: '#312e81', stroke: '#4338ca', label: 'Product D\n200 units' },
      { type: 'rect', x: 720, y: 60, width: 80, height: 35, fill: '#1e293b', stroke: '#475569', label: 'Total\nCapacity' },
      // Row headers (suppliers)
      { type: 'rect', x: 20, y: 105, width: 130, height: 50, fill: '#1e3a5f', stroke: '#2563eb', label: 'Supplier 1\nCap: 600' },
      { type: 'rect', x: 20, y: 165, width: 130, height: 50, fill: '#1e3a5f', stroke: '#2563eb', label: 'Supplier 2\nCap: 450' },
      { type: 'rect', x: 20, y: 225, width: 130, height: 50, fill: '#1e3a5f', stroke: '#2563eb', label: 'Supplier 3\nCap: 800' },
      { type: 'rect', x: 20, y: 285, width: 130, height: 50, fill: '#1e3a5f', stroke: '#2563eb', label: 'Supplier 4\nCap: 350' },
      // Totals row
      { type: 'rect', x: 20, y: 345, width: 130, height: 40, fill: '#1e293b', stroke: '#475569', label: 'Total Alloc' },
      // Matrix cells - traffic light (green=matched, yellow=partial, red=gap)
      { type: 'rect', x: 160, y: 105, width: 130, height: 50, fill: '#14532d', stroke: '#22c55e', label: '400 units\nMatched' },
      { type: 'rect', x: 300, y: 105, width: 130, height: 50, fill: '#422006', stroke: '#f59e0b', label: '200 units\nPartial' },
      { type: 'rect', x: 440, y: 105, width: 130, height: 50, fill: '#1e293b', stroke: '#475569', label: '—' },
      { type: 'rect', x: 580, y: 105, width: 130, height: 50, fill: '#1e293b', stroke: '#475569', label: '—' },
      { type: 'rect', x: 720, y: 105, width: 80, height: 50, fill: '#0f172a', stroke: '#334155', label: '600' },
      { type: 'rect', x: 160, y: 165, width: 130, height: 50, fill: '#1e293b', stroke: '#475569', label: '—' },
      { type: 'rect', x: 300, y: 165, width: 130, height: 50, fill: '#14532d', stroke: '#22c55e', label: '100 units\nMatched' },
      { type: 'rect', x: 440, y: 165, width: 130, height: 50, fill: '#422006', stroke: '#f59e0b', label: '350 units\nPartial' },
      { type: 'rect', x: 580, y: 165, width: 130, height: 50, fill: '#1e293b', stroke: '#475569', label: '—' },
      { type: 'rect', x: 720, y: 165, width: 80, height: 50, fill: '#0f172a', stroke: '#334155', label: '450' },
      { type: 'rect', x: 160, y: 225, width: 130, height: 50, fill: '#14532d', stroke: '#22c55e', label: '100 units\nMatched' },
      { type: 'rect', x: 300, y: 225, width: 130, height: 50, fill: '#1e293b', stroke: '#475569', label: '—' },
      { type: 'rect', x: 440, y: 225, width: 130, height: 50, fill: '#14532d', stroke: '#22c55e', label: '350 units\nMatched' },
      { type: 'rect', x: 580, y: 225, width: 130, height: 50, fill: '#14532d', stroke: '#22c55e', label: '200 units\nMatched' },
      { type: 'rect', x: 720, y: 225, width: 80, height: 50, fill: '#0f172a', stroke: '#334155', label: '800' },
      { type: 'rect', x: 160, y: 285, width: 130, height: 50, fill: '#1e293b', stroke: '#475569', label: '—' },
      { type: 'rect', x: 300, y: 285, width: 130, height: 50, fill: '#1e293b', stroke: '#475569', label: '—' },
      { type: 'rect', x: 440, y: 285, width: 130, height: 50, fill: '#450a0a', stroke: '#ef4444', label: '0 units\nGap!' },
      { type: 'rect', x: 580, y: 285, width: 130, height: 50, fill: '#1e293b', stroke: '#475569', label: '—' },
      { type: 'rect', x: 720, y: 285, width: 80, height: 50, fill: '#0f172a', stroke: '#334155', label: '350' },
      // Totals row
      { type: 'rect', x: 160, y: 345, width: 130, height: 40, fill: '#0f172a', stroke: '#22c55e', label: '500 / 500' },
      { type: 'rect', x: 300, y: 345, width: 130, height: 40, fill: '#0f172a', stroke: '#22c55e', label: '300 / 300' },
      { type: 'rect', x: 440, y: 345, width: 130, height: 40, fill: '#0f172a', stroke: '#22c55e', label: '700 / 700' },
      { type: 'rect', x: 580, y: 345, width: 130, height: 40, fill: '#0f172a', stroke: '#22c55e', label: '200 / 200' },
    ],
  },
  // ===== ANALYTICS - HEAT MAP =====
  {
    id: 'heat-map',
    name: 'Heat Map',
    category: 'analytics',
    description: 'Data visualization grid with gradient coloring and annotations',
    icon: '🌡',
    shapes: [
      { type: 'banner', x: 200, y: 10, width: 360, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Website Traffic Heat Map' },
      // Column headers (hours)
      { type: 'text', x: 130, y: 55, width: 40, height: 16, fill: 'transparent', stroke: 'transparent', label: '6AM' },
      { type: 'text', x: 200, y: 55, width: 40, height: 16, fill: 'transparent', stroke: 'transparent', label: '9AM' },
      { type: 'text', x: 270, y: 55, width: 40, height: 16, fill: 'transparent', stroke: 'transparent', label: '12PM' },
      { type: 'text', x: 340, y: 55, width: 40, height: 16, fill: 'transparent', stroke: 'transparent', label: '3PM' },
      { type: 'text', x: 410, y: 55, width: 40, height: 16, fill: 'transparent', stroke: 'transparent', label: '6PM' },
      { type: 'text', x: 480, y: 55, width: 40, height: 16, fill: 'transparent', stroke: 'transparent', label: '9PM' },
      { type: 'text', x: 550, y: 55, width: 40, height: 16, fill: 'transparent', stroke: 'transparent', label: '12AM' },
      // Row headers (days)
      { type: 'text', x: 40, y: 80, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Mon' },
      { type: 'text', x: 40, y: 130, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Tue' },
      { type: 'text', x: 40, y: 180, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Wed' },
      { type: 'text', x: 40, y: 230, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Thu' },
      { type: 'text', x: 40, y: 280, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Fri' },
      { type: 'text', x: 40, y: 330, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Sat' },
      { type: 'text', x: 40, y: 380, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Sun' },
      // Mon row - low morning, high midday, medium evening
      { type: 'rect', x: 120, y: 75, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '120' },
      { type: 'rect', x: 190, y: 75, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '340' },
      { type: 'rect', x: 260, y: 75, width: 60, height: 40, fill: '#4d7c0f', stroke: '#1e293b', label: '890' },
      { type: 'rect', x: 330, y: 75, width: 60, height: 40, fill: '#65a30d', stroke: '#1e293b', label: '1.2K' },
      { type: 'rect', x: 400, y: 75, width: 60, height: 40, fill: '#84cc16', stroke: '#1e293b', label: '1.5K' },
      { type: 'rect', x: 470, y: 75, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '450' },
      { type: 'rect', x: 540, y: 75, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '80' },
      // Tue row
      { type: 'rect', x: 120, y: 125, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '150' },
      { type: 'rect', x: 190, y: 125, width: 60, height: 40, fill: '#4d7c0f', stroke: '#1e293b', label: '560' },
      { type: 'rect', x: 260, y: 125, width: 60, height: 40, fill: '#65a30d', stroke: '#1e293b', label: '1.1K' },
      { type: 'rect', x: 330, y: 125, width: 60, height: 40, fill: '#84cc16', stroke: '#1e293b', label: '1.4K' },
      { type: 'rect', x: 400, y: 125, width: 60, height: 40, fill: '#a3e635', stroke: '#1e293b', label: '1.8K' },
      { type: 'rect', x: 470, y: 125, width: 60, height: 40, fill: '#4d7c0f', stroke: '#1e293b', label: '620' },
      { type: 'rect', x: 540, y: 125, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '95' },
      // Wed row (peak day)
      { type: 'rect', x: 120, y: 175, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '200' },
      { type: 'rect', x: 190, y: 175, width: 60, height: 40, fill: '#65a30d', stroke: '#1e293b', label: '780' },
      { type: 'rect', x: 260, y: 175, width: 60, height: 40, fill: '#a3e635', stroke: '#1e293b', label: '2.1K' },
      { type: 'rect', x: 330, y: 175, width: 60, height: 40, fill: '#d9f99d', stroke: '#1e293b', label: '2.5K' },
      { type: 'rect', x: 400, y: 175, width: 60, height: 40, fill: '#a3e635', stroke: '#1e293b', label: '1.9K' },
      { type: 'rect', x: 470, y: 175, width: 60, height: 40, fill: '#4d7c0f', stroke: '#1e293b', label: '700' },
      { type: 'rect', x: 540, y: 175, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '110' },
      // Thu row
      { type: 'rect', x: 120, y: 225, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '130' },
      { type: 'rect', x: 190, y: 225, width: 60, height: 40, fill: '#4d7c0f', stroke: '#1e293b', label: '520' },
      { type: 'rect', x: 260, y: 225, width: 60, height: 40, fill: '#65a30d', stroke: '#1e293b', label: '1.0K' },
      { type: 'rect', x: 330, y: 225, width: 60, height: 40, fill: '#84cc16', stroke: '#1e293b', label: '1.3K' },
      { type: 'rect', x: 400, y: 225, width: 60, height: 40, fill: '#84cc16', stroke: '#1e293b', label: '1.6K' },
      { type: 'rect', x: 470, y: 225, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '480' },
      { type: 'rect', x: 540, y: 225, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '75' },
      // Fri row
      { type: 'rect', x: 120, y: 275, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '100' },
      { type: 'rect', x: 190, y: 275, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '400' },
      { type: 'rect', x: 260, y: 275, width: 60, height: 40, fill: '#4d7c0f', stroke: '#1e293b', label: '750' },
      { type: 'rect', x: 330, y: 275, width: 60, height: 40, fill: '#65a30d', stroke: '#1e293b', label: '1.0K' },
      { type: 'rect', x: 400, y: 275, width: 60, height: 40, fill: '#65a30d', stroke: '#1e293b', label: '1.1K' },
      { type: 'rect', x: 470, y: 275, width: 60, height: 40, fill: '#4d7c0f', stroke: '#1e293b', label: '580' },
      { type: 'rect', x: 540, y: 275, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '130' },
      // Sat row (low)
      { type: 'rect', x: 120, y: 325, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '60' },
      { type: 'rect', x: 190, y: 325, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '180' },
      { type: 'rect', x: 260, y: 325, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '320' },
      { type: 'rect', x: 330, y: 325, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '290' },
      { type: 'rect', x: 400, y: 325, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '350' },
      { type: 'rect', x: 470, y: 325, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '410' },
      { type: 'rect', x: 540, y: 325, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '160' },
      // Sun row (low)
      { type: 'rect', x: 120, y: 375, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '45' },
      { type: 'rect', x: 190, y: 375, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '150' },
      { type: 'rect', x: 260, y: 375, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '220' },
      { type: 'rect', x: 330, y: 375, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '260' },
      { type: 'rect', x: 400, y: 375, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '310' },
      { type: 'rect', x: 470, y: 375, width: 60, height: 40, fill: '#365314', stroke: '#1e293b', label: '380' },
      { type: 'rect', x: 540, y: 375, width: 60, height: 40, fill: '#1a2e05', stroke: '#1e293b', label: '140' },
      // Legend gradient
      { type: 'text', x: 120, y: 430, width: 50, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Low' },
      { type: 'rect', x: 170, y: 428, width: 50, height: 18, fill: '#1a2e05', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 220, y: 428, width: 50, height: 18, fill: '#365314', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 270, y: 428, width: 50, height: 18, fill: '#4d7c0f', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 320, y: 428, width: 50, height: 18, fill: '#65a30d', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 370, y: 428, width: 50, height: 18, fill: '#84cc16', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 420, y: 428, width: 50, height: 18, fill: '#a3e635', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 470, y: 428, width: 50, height: 18, fill: '#d9f99d', stroke: '#1e293b', label: '' },
      { type: 'text', x: 530, y: 430, width: 50, height: 14, fill: 'transparent', stroke: 'transparent', label: 'High' },
    ],
  },
  // ===== STRATEGY - ICEBERG MODEL =====
  {
    id: 'iceberg-model',
    name: 'Iceberg Model',
    category: 'strategy',
    description: 'Events above waterline, patterns/structures/mental models below',
    icon: '🧊',
    shapes: [
      { type: 'banner', x: 220, y: 10, width: 360, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Iceberg Model - Systems Thinking' },
      // Sky background
      { type: 'rect', x: 100, y: 60, width: 600, height: 80, fill: '#0c4a6e', stroke: '#0284c7', label: '' },
      // Tip of iceberg (above water)
      { type: 'triangle', x: 300, y: 65, width: 200, height: 70, fill: '#e0f2fe', stroke: '#7dd3fc', label: '' },
      { type: 'text', x: 340, y: 85, width: 120, height: 20, fill: 'transparent', stroke: 'transparent', label: 'EVENTS' },
      { type: 'text', x: 310, y: 105, width: 180, height: 14, fill: 'transparent', stroke: 'transparent', label: 'What happened?' },
      // Waterline
      { type: 'line', x: 100, y: 140, width: 600, height: 3, fill: '#38bdf8', stroke: '#38bdf8', label: '' },
      { type: 'text', x: 620, y: 128, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Waterline' },
      // Below water - gradient layers
      // Layer 1: Patterns/Trends
      { type: 'rect', x: 180, y: 150, width: 440, height: 80, fill: '#0c4a6e', stroke: '#0369a1', label: '' },
      { type: 'rect', x: 200, y: 158, width: 400, height: 62, fill: '#0e7490', stroke: '#06b6d4', label: 'PATTERNS / TRENDS\nWhat has been happening over time?\nRecurring events, trends, data patterns' },
      // Layer 2: Underlying Structures
      { type: 'rect', x: 160, y: 240, width: 480, height: 80, fill: '#164e63', stroke: '#155e75', label: '' },
      { type: 'rect', x: 180, y: 248, width: 440, height: 62, fill: '#1e3a5f', stroke: '#2563eb', label: 'UNDERLYING STRUCTURES\nWhat is causing the patterns?\nPolicies, power dynamics, incentives' },
      // Layer 3: Mental Models
      { type: 'rect', x: 140, y: 330, width: 520, height: 80, fill: '#1e293b', stroke: '#334155', label: '' },
      { type: 'rect', x: 160, y: 338, width: 480, height: 62, fill: '#312e81', stroke: '#4338ca', label: 'MENTAL MODELS\nWhat assumptions/beliefs shape the system?\nValues, beliefs, worldviews, paradigms' },
      // Depth arrows
      { type: 'arrow', x: 120, y: 160, width: 10, height: 240, fill: '#38bdf8', stroke: '#38bdf8', label: '' },
      { type: 'text', x: 60, y: 260, width: 50, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Depth' },
      // Leverage labels
      { type: 'text', x: 640, y: 170, width: 100, height: 14, fill: 'transparent', stroke: 'transparent', label: 'React' },
      { type: 'text', x: 640, y: 260, width: 100, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Anticipate' },
      { type: 'text', x: 640, y: 350, width: 100, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Design' },
      { type: 'text', x: 640, y: 370, width: 100, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Transform' },
    ],
  },
  // ===== STRATEGY - CUSTOMER VOICE (VOC) LISTENING =====
  {
    id: 'voc-listening',
    name: 'Customer Voice (VOC)',
    category: 'strategy',
    description: 'Central customer with feedback channels, sentiment, and insights',
    icon: '🎤',
    shapes: [
      { type: 'banner', x: 200, y: 10, width: 400, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Voice of Customer (VOC) Listening' },
      // Central customer icon
      { type: 'ellipse', x: 320, y: 180, width: 120, height: 120, fill: '#7c3aed', stroke: '#6d28d9', label: 'CUSTOMER\nVoice' },
      // Feedback channels radiating outward
      { type: 'rect', x: 80, y: 70, width: 140, height: 55, fill: '#14532d', stroke: '#22c55e', label: 'Surveys\nNPS: 72' },
      { type: 'rect', x: 560, y: 70, width: 140, height: 55, fill: '#422006', stroke: '#f59e0b', label: 'Social Media\nSentiment: Mixed' },
      { type: 'rect', x: 40, y: 210, width: 140, height: 55, fill: '#450a0a', stroke: '#ef4444', label: 'Complaints\n156 open tickets' },
      { type: 'rect', x: 600, y: 210, width: 140, height: 55, fill: '#14532d', stroke: '#22c55e', label: 'Interviews\n24 completed' },
      { type: 'rect', x: 80, y: 350, width: 140, height: 55, fill: '#1e3a5f', stroke: '#2563eb', label: 'Support Calls\nCSAT: 4.2/5' },
      { type: 'rect', x: 560, y: 350, width: 140, height: 55, fill: '#312e81', stroke: '#8b5cf6', label: 'Reviews\n4.1 stars avg' },
      // Connecting lines
      { type: 'arrow', x: 220, y: 97, width: 100, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 440, y: 97, width: 120, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 180, y: 237, width: 140, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 440, y: 237, width: 160, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 220, y: 377, width: 100, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 440, y: 377, width: 120, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      // Priority matrix (bottom)
      { type: 'text', x: 180, y: 440, width: 200, height: 18, fill: 'transparent', stroke: 'transparent', label: 'Priority Matrix' },
      { type: 'rect', x: 180, y: 465, width: 140, height: 40, fill: '#450a0a', stroke: '#ef4444', label: 'P1: Response Time' },
      { type: 'rect', x: 330, y: 465, width: 140, height: 40, fill: '#422006', stroke: '#f59e0b', label: 'P2: UI Refresh' },
      { type: 'rect', x: 480, y: 465, width: 140, height: 40, fill: '#14532d', stroke: '#22c55e', label: 'P3: New Features' },
      // Actionable insights panel
      { type: 'rect', x: 180, y: 520, width: 440, height: 50, fill: '#1e293b', stroke: '#2563eb', label: 'Key Insight: 68% of complaints relate to response time.\nAction: Implement AI chatbot + hire 5 support agents' },
    ],
  },
  // ===== STRATEGY - CONTINUAL IMPROVEMENT WHIRLPOOL =====
  {
    id: 'improvement-whirlpool',
    name: 'Improvement Whirlpool',
    category: 'strategy',
    description: 'PDCA spiral with concentric maturity rings showing continuous flow',
    icon: '🌀',
    shapes: [
      { type: 'banner', x: 180, y: 10, width: 440, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Continual Improvement Whirlpool' },
      // Outermost ring - Level 1 (Initial)
      { type: 'ellipse', x: 160, y: 70, width: 480, height: 400, fill: '#0f172a', stroke: '#334155', label: '' },
      { type: 'text', x: 160, y: 80, width: 120, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Level 1: Initial' },
      // Ring 2 - Managed
      { type: 'ellipse', x: 210, y: 110, width: 380, height: 320, fill: '#1e293b', stroke: '#475569', label: '' },
      { type: 'text', x: 215, y: 120, width: 120, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Level 2: Managed' },
      // Ring 3 - Defined
      { type: 'ellipse', x: 260, y: 150, width: 280, height: 240, fill: '#1e3a5f', stroke: '#2563eb', label: '' },
      { type: 'text', x: 265, y: 160, width: 120, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Level 3: Defined' },
      // Ring 4 - Optimized (center)
      { type: 'ellipse', x: 320, y: 200, width: 160, height: 140, fill: '#312e81', stroke: '#7c3aed', label: '' },
      { type: 'text', x: 340, y: 250, width: 120, height: 20, fill: 'transparent', stroke: 'transparent', label: 'Level 4:\nOptimized' },
      // PDCA cycle labels on outer ring
      { type: 'rect', x: 530, y: 120, width: 100, height: 45, fill: '#2563eb', stroke: '#1d4ed8', label: 'PLAN\nCycle 1' },
      { type: 'rect', x: 600, y: 240, width: 100, height: 45, fill: '#22c55e', stroke: '#16a34a', label: 'DO\nCycle 1' },
      { type: 'rect', x: 530, y: 370, width: 100, height: 45, fill: '#f59e0b', stroke: '#d97706', label: 'CHECK\nCycle 1' },
      { type: 'rect', x: 100, y: 370, width: 100, height: 45, fill: '#ef4444', stroke: '#dc2626', label: 'ACT\nCycle 1' },
      // PDCA cycle 2 (inner)
      { type: 'rect', x: 460, y: 160, width: 80, height: 35, fill: '#3b82f6', stroke: '#2563eb', label: 'PLAN 2' },
      { type: 'rect', x: 500, y: 260, width: 80, height: 35, fill: '#4ade80', stroke: '#22c55e', label: 'DO 2' },
      { type: 'rect', x: 460, y: 340, width: 80, height: 35, fill: '#fbbf24', stroke: '#f59e0b', label: 'CHECK 2' },
      { type: 'rect', x: 175, y: 340, width: 80, height: 35, fill: '#f87171', stroke: '#ef4444', label: 'ACT 2' },
      // Flow arrows (clockwise spiral)
      { type: 'arrow', x: 580, y: 165, width: 20, height: 75, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 580, y: 285, width: 10, height: 85, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 200, y: 395, width: 330, height: 10, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 150, y: 165, width: 10, height: 205, fill: '#64748b', stroke: '#64748b', label: '' },
      // Center star (excellence)
      { type: 'star', x: 370, y: 240, width: 60, height: 55, fill: '#fbbf24', stroke: '#f59e0b', label: '' },
      // Bottom legend
      { type: 'text', x: 200, y: 490, width: 400, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Each cycle tightens toward operational excellence' },
    ],
  },
  // ===== STRATEGY - KANO MODEL =====
  {
    id: 'kano-model',
    name: 'Kano Model',
    category: 'strategy',
    description: 'Customer satisfaction vs feature implementation with Delighter/Performance/Must-Be curves',
    icon: '📈',
    shapes: [
      { type: 'banner', x: 220, y: 10, width: 360, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Kano Model Analysis' },
      // Y-axis (Satisfaction)
      { type: 'line', x: 350, y: 70, width: 2, height: 380, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'text', x: 280, y: 70, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Satisfied' },
      { type: 'text', x: 270, y: 435, width: 70, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Dissatisfied' },
      { type: 'arrow', x: 350, y: 70, width: 10, height: 5, fill: '#64748b', stroke: '#64748b', label: '' },
      // X-axis (Implementation)
      { type: 'line', x: 100, y: 260, width: 600, height: 2, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'text', x: 100, y: 268, width: 100, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Not Implemented' },
      { type: 'text', x: 600, y: 268, width: 100, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Fully Done' },
      // Delighters/Exciters curve (top-right, exponential)
      { type: 'ellipse', x: 380, y: 105, width: 30, height: 30, fill: '#7c3aed', stroke: '#6d28d9', label: '' },
      { type: 'ellipse', x: 430, y: 120, width: 30, height: 30, fill: '#7c3aed', stroke: '#6d28d9', label: '' },
      { type: 'ellipse', x: 480, y: 140, width: 30, height: 30, fill: '#7c3aed', stroke: '#6d28d9', label: '' },
      { type: 'ellipse', x: 530, y: 170, width: 30, height: 30, fill: '#7c3aed', stroke: '#6d28d9', label: '' },
      { type: 'ellipse', x: 570, y: 210, width: 30, height: 30, fill: '#7c3aed', stroke: '#6d28d9', label: '' },
      { type: 'ellipse', x: 600, y: 240, width: 30, height: 30, fill: '#7c3aed', stroke: '#6d28d9', label: '' },
      { type: 'text', x: 550, y: 90, width: 120, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Delighters' },
      { type: 'rect', x: 530, y: 108, width: 100, height: 28, fill: '#312e81', stroke: '#7c3aed', label: 'WOW features' },
      // Performance/Linear curve (diagonal)
      { type: 'ellipse', x: 180, y: 370, width: 25, height: 25, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 250, y: 330, width: 25, height: 25, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 340, y: 260, width: 25, height: 25, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 430, y: 190, width: 25, height: 25, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 520, y: 140, width: 25, height: 25, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 600, y: 100, width: 25, height: 25, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'text', x: 620, y: 160, width: 100, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Performance' },
      // Must-Be/Basic curve (bottom, logarithmic)
      { type: 'ellipse', x: 160, y: 400, width: 25, height: 25, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 230, y: 370, width: 25, height: 25, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 310, y: 320, width: 25, height: 25, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 400, y: 290, width: 25, height: 25, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 500, y: 270, width: 25, height: 25, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'ellipse', x: 600, y: 260, width: 25, height: 25, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'text', x: 620, y: 290, width: 100, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Must-Be' },
      { type: 'rect', x: 620, y: 308, width: 100, height: 28, fill: '#450a0a', stroke: '#ef4444', label: 'Expected basics' },
      // Indifferent line (horizontal near center)
      { type: 'line', x: 200, y: 255, width: 400, height: 2, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'text', x: 620, y: 248, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Indifferent' },
    ],
  },
  // ===== STRATEGY - STAKEHOLDER MAP =====
  {
    id: 'stakeholder-map',
    name: 'Stakeholder Map',
    category: 'strategy',
    description: 'Power/Interest matrix with 4 quadrants and positioned stakeholders',
    icon: '👥',
    shapes: [
      { type: 'banner', x: 200, y: 10, width: 400, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Stakeholder Map - Power vs Interest' },
      // Axes
      { type: 'line', x: 140, y: 60, width: 2, height: 400, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'line', x: 140, y: 460, width: 560, height: 2, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'text', x: 60, y: 60, width: 70, height: 16, fill: 'transparent', stroke: 'transparent', label: 'High Power' },
      { type: 'text', x: 60, y: 450, width: 70, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Low Power' },
      { type: 'text', x: 150, y: 470, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'Low Interest' },
      { type: 'text', x: 610, y: 470, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'High Interest' },
      // Midlines
      { type: 'line', x: 140, y: 260, width: 560, height: 1, fill: '#334155', stroke: '#334155', label: '' },
      { type: 'line', x: 420, y: 60, width: 1, height: 400, fill: '#334155', stroke: '#334155', label: '' },
      // Quadrant labels
      { type: 'rect', x: 150, y: 70, width: 260, height: 35, fill: '#422006', stroke: '#f59e0b', label: 'Keep Satisfied' },
      { type: 'rect', x: 430, y: 70, width: 260, height: 35, fill: '#450a0a', stroke: '#ef4444', label: 'Manage Closely' },
      { type: 'rect', x: 150, y: 270, width: 260, height: 35, fill: '#1e293b', stroke: '#475569', label: 'Monitor' },
      { type: 'rect', x: 430, y: 270, width: 260, height: 35, fill: '#14532d', stroke: '#22c55e', label: 'Keep Informed' },
      // Stakeholders in "Manage Closely" (high power, high interest)
      { type: 'ellipse', x: 470, y: 130, width: 100, height: 45, fill: '#ef4444', stroke: '#dc2626', label: 'CEO' },
      { type: 'ellipse', x: 600, y: 150, width: 100, height: 45, fill: '#ef4444', stroke: '#dc2626', label: 'Board' },
      { type: 'ellipse', x: 530, y: 190, width: 100, height: 45, fill: '#f87171', stroke: '#ef4444', label: 'Key Client' },
      // Stakeholders in "Keep Satisfied" (high power, low interest)
      { type: 'ellipse', x: 200, y: 140, width: 100, height: 45, fill: '#f59e0b', stroke: '#d97706', label: 'Regulator' },
      { type: 'ellipse', x: 320, y: 170, width: 100, height: 45, fill: '#fbbf24', stroke: '#f59e0b', label: 'Legal' },
      // Stakeholders in "Keep Informed" (low power, high interest)
      { type: 'ellipse', x: 480, y: 330, width: 100, height: 45, fill: '#22c55e', stroke: '#16a34a', label: 'Dev Team' },
      { type: 'ellipse', x: 620, y: 360, width: 100, height: 45, fill: '#4ade80', stroke: '#22c55e', label: 'Users' },
      { type: 'ellipse', x: 520, y: 400, width: 100, height: 45, fill: '#22c55e', stroke: '#16a34a', label: 'Partners' },
      // Stakeholders in "Monitor" (low power, low interest)
      { type: 'ellipse', x: 200, y: 340, width: 100, height: 45, fill: '#64748b', stroke: '#475569', label: 'Media' },
      { type: 'ellipse', x: 310, y: 390, width: 100, height: 45, fill: '#64748b', stroke: '#475569', label: 'Community' },
    ],
  },
  // ===== STRATEGY - PORTER'S VALUE CHAIN =====
  {
    id: 'porters-value-chain',
    name: "Porter's Value Chain",
    category: 'strategy',
    description: 'Primary and support activities in arrow-shaped diagram',
    icon: '⛓',
    shapes: [
      { type: 'banner', x: 180, y: 10, width: 440, height: 40, fill: '#1e293b', stroke: '#334155', label: "Porter's Value Chain Analysis" },
      // Support activities (top rows)
      { type: 'rect', x: 40, y: 65, width: 620, height: 50, fill: '#312e81', stroke: '#4338ca', label: 'Firm Infrastructure: General mgmt, planning, finance, legal, quality mgmt' },
      { type: 'rect', x: 40, y: 125, width: 620, height: 50, fill: '#1e3a5f', stroke: '#2563eb', label: 'Human Resource Management: Recruiting, training, development, compensation' },
      { type: 'rect', x: 40, y: 185, width: 620, height: 50, fill: '#164e63', stroke: '#0891b2', label: 'Technology Development: R&D, process automation, design, IT systems' },
      { type: 'rect', x: 40, y: 245, width: 620, height: 50, fill: '#14532d', stroke: '#22c55e', label: 'Procurement: Purchasing, supplier management, vendor relations' },
      // Support label
      { type: 'text', x: 670, y: 65, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'SUPPORT' },
      { type: 'text', x: 670, y: 85, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'ACTIVITIES' },
      // Primary activities (bottom row - arrow shaped)
      { type: 'rect', x: 40, y: 310, width: 130, height: 100, fill: '#0891b2', stroke: '#06b6d4', label: 'Inbound\nLogistics\n\nReceiving\nWarehousing\nInventory' },
      { type: 'rect', x: 180, y: 310, width: 130, height: 100, fill: '#2563eb', stroke: '#3b82f6', label: 'Operations\n\nManufacturing\nPackaging\nAssembly\nTesting' },
      { type: 'rect', x: 320, y: 310, width: 130, height: 100, fill: '#7c3aed', stroke: '#8b5cf6', label: 'Outbound\nLogistics\n\nDistribution\nDelivery\nScheduling' },
      { type: 'rect', x: 460, y: 310, width: 130, height: 100, fill: '#dc2626', stroke: '#ef4444', label: 'Marketing\n& Sales\n\nAdvertising\nPromotion\nPricing' },
      { type: 'rect', x: 600, y: 310, width: 130, height: 100, fill: '#d97706', stroke: '#f59e0b', label: 'Service\n\nInstallation\nRepair\nTraining\nSupport' },
      // Arrow tip (margin)
      { type: 'blockArrow', x: 740, y: 65, width: 80, height: 345, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'text', x: 750, y: 210, width: 60, height: 40, fill: 'transparent', stroke: 'transparent', label: 'M\nA\nR\nG\nI\nN' },
      // Primary label
      { type: 'text', x: 300, y: 420, width: 200, height: 16, fill: 'transparent', stroke: 'transparent', label: 'PRIMARY ACTIVITIES' },
      // Flow arrows between primary
      { type: 'arrow', x: 170, y: 360, width: 10, height: 5, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 310, y: 360, width: 10, height: 5, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 450, y: 360, width: 10, height: 5, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'arrow', x: 590, y: 360, width: 10, height: 5, fill: '#64748b', stroke: '#64748b', label: '' },
    ],
  },
  // ===== AGILE - SPRINT BOARD =====
  {
    id: 'sprint-board',
    name: 'Sprint Board',
    category: 'agile',
    description: 'Kanban columns with story cards, points, assignees, priorities',
    icon: '🏃',
    shapes: [
      { type: 'banner', x: 180, y: 10, width: 440, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Sprint 14 Board - Team Alpha' },
      // Column headers
      { type: 'rect', x: 20, y: 60, width: 150, height: 35, fill: '#475569', stroke: '#64748b', label: 'Backlog (5)' },
      { type: 'rect', x: 180, y: 60, width: 150, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'To Do (3)' },
      { type: 'rect', x: 340, y: 60, width: 150, height: 35, fill: '#422006', stroke: '#f59e0b', label: 'In Progress (2)' },
      { type: 'rect', x: 500, y: 60, width: 150, height: 35, fill: '#312e81', stroke: '#8b5cf6', label: 'Review (2)' },
      { type: 'rect', x: 660, y: 60, width: 150, height: 35, fill: '#14532d', stroke: '#22c55e', label: 'Done (4)' },
      // Column backgrounds
      { type: 'rect', x: 20, y: 100, width: 150, height: 380, fill: '#0f172a', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 180, y: 100, width: 150, height: 380, fill: '#0f172a', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 340, y: 100, width: 150, height: 380, fill: '#0f172a', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 500, y: 100, width: 150, height: 380, fill: '#0f172a', stroke: '#1e293b', label: '' },
      { type: 'rect', x: 660, y: 100, width: 150, height: 380, fill: '#0f172a', stroke: '#1e293b', label: '' },
      // Backlog cards
      { type: 'rect', x: 28, y: 108, width: 134, height: 65, fill: '#1e293b', stroke: '#475569', label: 'API pagination\n3 pts - Low\nUnassigned' },
      { type: 'rect', x: 28, y: 183, width: 134, height: 65, fill: '#1e293b', stroke: '#475569', label: 'Error logging\n2 pts - Med\nUnassigned' },
      { type: 'rect', x: 28, y: 258, width: 134, height: 65, fill: '#1e293b', stroke: '#475569', label: 'Cache layer\n5 pts - Low\nUnassigned' },
      // To Do cards
      { type: 'rect', x: 188, y: 108, width: 134, height: 65, fill: '#1e293b', stroke: '#2563eb', label: 'Auth flow\n5 pts - High\nAlice' },
      { type: 'ellipse', x: 296, y: 155, width: 22, height: 22, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'rect', x: 188, y: 183, width: 134, height: 65, fill: '#1e293b', stroke: '#2563eb', label: 'DB migration\n3 pts - Med\nBob' },
      { type: 'rect', x: 188, y: 258, width: 134, height: 65, fill: '#1e293b', stroke: '#2563eb', label: 'Search index\n8 pts - High\nCarol' },
      { type: 'ellipse', x: 296, y: 305, width: 22, height: 22, fill: '#ef4444', stroke: '#dc2626', label: '' },
      // In Progress cards
      { type: 'rect', x: 348, y: 108, width: 134, height: 65, fill: '#1e293b', stroke: '#f59e0b', label: 'Dashboard UI\n5 pts - High\nDave' },
      { type: 'ellipse', x: 456, y: 155, width: 22, height: 22, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'rect', x: 348, y: 183, width: 134, height: 65, fill: '#1e293b', stroke: '#f59e0b', label: 'Email service\n3 pts - Med\nEve' },
      // Review cards
      { type: 'rect', x: 508, y: 108, width: 134, height: 65, fill: '#1e293b', stroke: '#8b5cf6', label: 'User profile\n3 pts - Med\nAlice' },
      { type: 'rect', x: 508, y: 183, width: 134, height: 65, fill: '#1e293b', stroke: '#8b5cf6', label: 'Unit tests\n2 pts - Low\nBob' },
      // Done cards
      { type: 'rect', x: 668, y: 108, width: 134, height: 65, fill: '#1e293b', stroke: '#22c55e', label: 'Login page\n3 pts\nDave' },
      { type: 'rect', x: 668, y: 183, width: 134, height: 65, fill: '#1e293b', stroke: '#22c55e', label: 'CI pipeline\n5 pts\nCarol' },
      { type: 'rect', x: 668, y: 258, width: 134, height: 65, fill: '#1e293b', stroke: '#22c55e', label: 'Signup form\n2 pts\nEve' },
      { type: 'rect', x: 668, y: 333, width: 134, height: 65, fill: '#1e293b', stroke: '#22c55e', label: 'API docs\n1 pt\nAlice' },
      // Sprint stats bar
      { type: 'rect', x: 20, y: 490, width: 790, height: 30, fill: '#1e293b', stroke: '#334155', label: 'Sprint 14  |  Velocity: 35 pts  |  Committed: 40 pts  |  Done: 11 pts  |  5 days remaining' },
    ],
  },
  // ===== AGILE - BURNDOWN CHART =====
  {
    id: 'burndown-chart',
    name: 'Burndown Chart',
    category: 'agile',
    description: 'Sprint timeline with ideal and actual progress lines, scope changes',
    icon: '📉',
    shapes: [
      { type: 'banner', x: 200, y: 10, width: 400, height: 40, fill: '#1e293b', stroke: '#334155', label: 'Sprint 14 Burndown Chart' },
      // Y-axis
      { type: 'line', x: 100, y: 70, width: 2, height: 340, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'text', x: 30, y: 65, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: '40 pts' },
      { type: 'text', x: 30, y: 135, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: '30 pts' },
      { type: 'text', x: 30, y: 205, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: '20 pts' },
      { type: 'text', x: 30, y: 275, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: '10 pts' },
      { type: 'text', x: 30, y: 345, width: 60, height: 16, fill: 'transparent', stroke: 'transparent', label: '0 pts' },
      // Grid lines
      { type: 'line', x: 100, y: 75, width: 600, height: 1, fill: '#1e293b', stroke: '#1e293b', label: '' },
      { type: 'line', x: 100, y: 145, width: 600, height: 1, fill: '#1e293b', stroke: '#1e293b', label: '' },
      { type: 'line', x: 100, y: 215, width: 600, height: 1, fill: '#1e293b', stroke: '#1e293b', label: '' },
      { type: 'line', x: 100, y: 285, width: 600, height: 1, fill: '#1e293b', stroke: '#1e293b', label: '' },
      // X-axis
      { type: 'line', x: 100, y: 355, width: 600, height: 2, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'text', x: 100, y: 365, width: 40, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Day 1' },
      { type: 'text', x: 160, y: 365, width: 40, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Day 2' },
      { type: 'text', x: 220, y: 365, width: 40, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Day 3' },
      { type: 'text', x: 280, y: 365, width: 40, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Day 4' },
      { type: 'text', x: 340, y: 365, width: 40, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Day 5' },
      { type: 'text', x: 400, y: 365, width: 40, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Day 6' },
      { type: 'text', x: 460, y: 365, width: 40, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Day 7' },
      { type: 'text', x: 520, y: 365, width: 40, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Day 8' },
      { type: 'text', x: 580, y: 365, width: 40, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Day 9' },
      { type: 'text', x: 640, y: 365, width: 40, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Day 10' },
      // Ideal line (diagonal from 40pts to 0) - dashed represented as dots
      { type: 'ellipse', x: 100, y: 72, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'ellipse', x: 160, y: 100, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'ellipse', x: 220, y: 128, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'ellipse', x: 280, y: 156, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'ellipse', x: 340, y: 184, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'ellipse', x: 400, y: 212, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'ellipse', x: 460, y: 240, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'ellipse', x: 520, y: 268, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'ellipse', x: 580, y: 296, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'ellipse', x: 640, y: 324, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'ellipse', x: 700, y: 352, width: 8, height: 8, fill: '#64748b', stroke: '#64748b', label: '' },
      // Actual line (blue, behind schedule)
      { type: 'ellipse', x: 100, y: 72, width: 12, height: 12, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 160, y: 85, width: 12, height: 12, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 220, y: 105, width: 12, height: 12, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 280, y: 140, width: 12, height: 12, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 340, y: 155, width: 12, height: 12, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 400, y: 180, width: 12, height: 12, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'ellipse', x: 460, y: 200, width: 12, height: 12, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      // Connecting lines for actual
      { type: 'line', x: 106, y: 78, width: 54, height: 2, fill: '#2563eb', stroke: '#2563eb', label: '' },
      { type: 'line', x: 166, y: 91, width: 54, height: 2, fill: '#2563eb', stroke: '#2563eb', label: '' },
      { type: 'line', x: 226, y: 111, width: 54, height: 2, fill: '#2563eb', stroke: '#2563eb', label: '' },
      { type: 'line', x: 286, y: 146, width: 54, height: 2, fill: '#2563eb', stroke: '#2563eb', label: '' },
      { type: 'line', x: 346, y: 161, width: 54, height: 2, fill: '#2563eb', stroke: '#2563eb', label: '' },
      { type: 'line', x: 406, y: 186, width: 54, height: 2, fill: '#2563eb', stroke: '#2563eb', label: '' },
      // Scope change indicator
      { type: 'star', x: 270, y: 118, width: 20, height: 20, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'text', x: 240, y: 98, width: 100, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Scope +5pts' },
      // Legend
      { type: 'line', x: 120, y: 400, width: 40, height: 2, fill: '#64748b', stroke: '#64748b', label: '' },
      { type: 'text', x: 165, y: 395, width: 60, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Ideal' },
      { type: 'line', x: 240, y: 400, width: 40, height: 2, fill: '#2563eb', stroke: '#2563eb', label: '' },
      { type: 'text', x: 285, y: 395, width: 60, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Actual' },
      { type: 'star', x: 370, y: 394, width: 14, height: 14, fill: '#ef4444', stroke: '#dc2626', label: '' },
      { type: 'text', x: 390, y: 395, width: 80, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Scope Change' },
    ],
  },
  // ===== AGILE - USER STORY MAP =====
  {
    id: 'user-story-map',
    name: 'User Story Map',
    category: 'agile',
    description: 'Backbone activities, walking skeleton, releases as swim lanes',
    icon: '🗺',
    shapes: [
      { type: 'banner', x: 180, y: 10, width: 440, height: 40, fill: '#1e293b', stroke: '#334155', label: 'User Story Map - E-Commerce App' },
      // Backbone (user activities across top)
      { type: 'text', x: 20, y: 55, width: 80, height: 16, fill: 'transparent', stroke: 'transparent', label: 'BACKBONE' },
      { type: 'rect', x: 20, y: 75, width: 150, height: 45, fill: '#7c3aed', stroke: '#6d28d9', label: 'Browse Products' },
      { type: 'rect', x: 180, y: 75, width: 150, height: 45, fill: '#7c3aed', stroke: '#6d28d9', label: 'Search & Filter' },
      { type: 'rect', x: 340, y: 75, width: 150, height: 45, fill: '#7c3aed', stroke: '#6d28d9', label: 'Add to Cart' },
      { type: 'rect', x: 500, y: 75, width: 150, height: 45, fill: '#7c3aed', stroke: '#6d28d9', label: 'Checkout' },
      { type: 'rect', x: 660, y: 75, width: 150, height: 45, fill: '#7c3aed', stroke: '#6d28d9', label: 'Post-Purchase' },
      // Walking skeleton line
      { type: 'line', x: 20, y: 130, width: 790, height: 2, fill: '#f59e0b', stroke: '#f59e0b', label: '' },
      { type: 'text', x: 20, y: 133, width: 120, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Walking Skeleton' },
      // Release 1 swim lane
      { type: 'rect', x: 0, y: 150, width: 16, height: 90, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'text', x: 0, y: 185, width: 16, height: 16, fill: 'transparent', stroke: 'transparent', label: 'R1' },
      { type: 'rect', x: 20, y: 155, width: 150, height: 35, fill: '#14532d', stroke: '#22c55e', label: 'Product list page' },
      { type: 'rect', x: 20, y: 195, width: 150, height: 35, fill: '#14532d', stroke: '#22c55e', label: 'Product detail' },
      { type: 'rect', x: 180, y: 155, width: 150, height: 35, fill: '#14532d', stroke: '#22c55e', label: 'Basic text search' },
      { type: 'rect', x: 340, y: 155, width: 150, height: 35, fill: '#14532d', stroke: '#22c55e', label: 'Add item to cart' },
      { type: 'rect', x: 340, y: 195, width: 150, height: 35, fill: '#14532d', stroke: '#22c55e', label: 'View cart' },
      { type: 'rect', x: 500, y: 155, width: 150, height: 35, fill: '#14532d', stroke: '#22c55e', label: 'Basic checkout' },
      { type: 'rect', x: 660, y: 155, width: 150, height: 35, fill: '#14532d', stroke: '#22c55e', label: 'Order confirmation' },
      // Release 2 swim lane
      { type: 'line', x: 20, y: 245, width: 790, height: 1, fill: '#334155', stroke: '#334155', label: '' },
      { type: 'rect', x: 0, y: 250, width: 16, height: 90, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'text', x: 0, y: 285, width: 16, height: 16, fill: 'transparent', stroke: 'transparent', label: 'R2' },
      { type: 'rect', x: 20, y: 255, width: 150, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Category pages' },
      { type: 'rect', x: 20, y: 295, width: 150, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Image gallery' },
      { type: 'rect', x: 180, y: 255, width: 150, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Faceted filters' },
      { type: 'rect', x: 180, y: 295, width: 150, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Sort options' },
      { type: 'rect', x: 340, y: 255, width: 150, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Update quantity' },
      { type: 'rect', x: 500, y: 255, width: 150, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Payment gateway' },
      { type: 'rect', x: 500, y: 295, width: 150, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Address lookup' },
      { type: 'rect', x: 660, y: 255, width: 150, height: 35, fill: '#1e3a5f', stroke: '#2563eb', label: 'Order tracking' },
      // Release 3 swim lane
      { type: 'line', x: 20, y: 345, width: 790, height: 1, fill: '#334155', stroke: '#334155', label: '' },
      { type: 'rect', x: 0, y: 350, width: 16, height: 90, fill: '#f59e0b', stroke: '#d97706', label: '' },
      { type: 'text', x: 0, y: 385, width: 16, height: 16, fill: 'transparent', stroke: 'transparent', label: 'R3' },
      { type: 'rect', x: 20, y: 355, width: 150, height: 35, fill: '#422006', stroke: '#f59e0b', label: 'Recommendations' },
      { type: 'rect', x: 20, y: 395, width: 150, height: 35, fill: '#422006', stroke: '#f59e0b', label: 'Recently viewed' },
      { type: 'rect', x: 180, y: 355, width: 150, height: 35, fill: '#422006', stroke: '#f59e0b', label: 'AI search suggest' },
      { type: 'rect', x: 340, y: 355, width: 150, height: 35, fill: '#422006', stroke: '#f59e0b', label: 'Save for later' },
      { type: 'rect', x: 500, y: 355, width: 150, height: 35, fill: '#422006', stroke: '#f59e0b', label: 'Apple/Google Pay' },
      { type: 'rect', x: 660, y: 355, width: 150, height: 35, fill: '#422006', stroke: '#f59e0b', label: 'Review & rating' },
      { type: 'rect', x: 660, y: 395, width: 150, height: 35, fill: '#422006', stroke: '#f59e0b', label: 'Return request' },
      // Priority legend
      { type: 'rect', x: 200, y: 450, width: 16, height: 16, fill: '#22c55e', stroke: '#16a34a', label: '' },
      { type: 'text', x: 220, y: 450, width: 60, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Release 1' },
      { type: 'rect', x: 300, y: 450, width: 16, height: 16, fill: '#2563eb', stroke: '#1d4ed8', label: '' },
      { type: 'text', x: 320, y: 450, width: 60, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Release 2' },
      { type: 'rect', x: 400, y: 450, width: 16, height: 16, fill: '#f59e0b', stroke: '#d97706', label: '' },
      { type: 'text', x: 420, y: 450, width: 60, height: 14, fill: 'transparent', stroke: 'transparent', label: 'Release 3' },
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
