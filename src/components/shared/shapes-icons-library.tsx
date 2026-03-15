'use client';

import React, { useState, useMemo } from 'react';
import {
  Square, Circle, Triangle, Diamond, Pentagon, Hexagon, Octagon, Star, Plus, Heart,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpRight, ArrowDownRight,
  Minus, ChevronsRight, CornerDownRight,
  RectangleHorizontal, Tv, FileText, Database, HardDrive, Keyboard, Clock, Timer,
  CircleDot, MessageSquare, MessageCircle, Cloud, Lightbulb,
  Zap, Waves, Scroll, Ribbon, Award,
  PlayCircle, SkipBack, SkipForward, Home, Info, CornerUpLeft,
  // Business icons
  Briefcase, Building2, Calculator, Calendar, CreditCard, DollarSign, LineChart as LineChartIcon,
  PieChart as PieChartIcon, TrendingUp, Users, UserCheck, Wallet, Receipt, Landmark, BadgeDollarSign,
  // Technology icons
  Cpu, Monitor, Smartphone, Tablet, Wifi, Bluetooth, Globe, Server, Code, Terminal,
  HardDrive as Storage, Shield, Lock, Key, QrCode, Laptop, Cable, Router,
  // Education
  BookOpen, GraduationCap, Library, Pencil, PenTool, Highlighter, FileQuestion, ClipboardList,
  Brain, Atom, Microscope, FlaskConical, Beaker, TestTube2, Dna,
  // Medical
  Stethoscope, Syringe, Pill, HeartPulse, Activity, Thermometer, Eye, Ear, Hand,
  Accessibility, Cross,
  // Communication
  Mail, Phone, MessageSquare as Chat, Video, Mic, Send, Share2, Link, Bell,
  Megaphone, Radio, Podcast, Rss,
  // Weather
  Sun, Moon, CloudRain, CloudSnow, CloudLightning, Wind, Umbrella, Snowflake, Droplets, Rainbow,
  // Arrows
  MoveRight, MoveLeft, MoveUp, MoveDown, RefreshCw, RotateCw, RotateCcw, Maximize2,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
  // Social Media
  Github, Twitter, Youtube, Twitch, Linkedin, Instagram, Facebook,
  // Other
  Settings, Search, Trash2, Download, Upload, Save, FolderOpen, Image, Camera, Map,
  Navigation, Compass, Flag, Bookmark, Tag, Hash, AtSign, Paperclip,
  Printer, Clipboard, Archive, Package, ShoppingCart, Gift, Coffee, Utensils,
  Music, Headphones, Gamepad2, Palette, Scissors, Wrench, Hammer, Plug,
  type LucideIcon,
} from 'lucide-react';

// ===================== SHAPE DEFINITIONS =====================

export type ShapeCategory = 'basic' | 'lines' | 'flowchart' | 'callouts' | 'stars' | 'actions';

export interface ShapeDefinition {
  id: string;
  name: string;
  category: ShapeCategory;
  svgPath: string; // SVG path data for the shape
  viewBox?: string;
  allowText?: boolean;
}

export const SHAPE_DEFINITIONS: ShapeDefinition[] = [
  // Basic Shapes
  { id: 'rectangle', name: 'Rectangle', category: 'basic', svgPath: 'M 5 5 H 95 V 95 H 5 Z', allowText: true },
  { id: 'rounded-rect', name: 'Rounded Rectangle', category: 'basic', svgPath: 'M 15 5 H 85 Q 95 5 95 15 V 85 Q 95 95 85 95 H 15 Q 5 95 5 85 V 15 Q 5 5 15 5 Z', allowText: true },
  { id: 'circle', name: 'Circle', category: 'basic', svgPath: 'M 50 5 A 45 45 0 1 1 50 95 A 45 45 0 1 1 50 5 Z', allowText: true },
  { id: 'oval', name: 'Oval', category: 'basic', svgPath: 'M 50 10 A 45 35 0 1 1 50 90 A 45 35 0 1 1 50 10 Z', allowText: true },
  { id: 'triangle', name: 'Triangle', category: 'basic', svgPath: 'M 50 5 L 95 95 H 5 Z', allowText: true },
  { id: 'diamond', name: 'Diamond', category: 'basic', svgPath: 'M 50 5 L 95 50 L 50 95 L 5 50 Z', allowText: true },
  { id: 'pentagon', name: 'Pentagon', category: 'basic', svgPath: 'M 50 5 L 95 38 L 78 95 H 22 L 5 38 Z', allowText: true },
  { id: 'hexagon', name: 'Hexagon', category: 'basic', svgPath: 'M 25 5 H 75 L 95 50 L 75 95 H 25 L 5 50 Z', allowText: true },
  { id: 'octagon', name: 'Octagon', category: 'basic', svgPath: 'M 30 5 H 70 L 95 30 V 70 L 70 95 H 30 L 5 70 V 30 Z', allowText: true },
  { id: 'star-4', name: '4-Point Star', category: 'basic', svgPath: 'M 50 5 L 62 38 L 95 50 L 62 62 L 50 95 L 38 62 L 5 50 L 38 38 Z', allowText: true },
  { id: 'star-5', name: '5-Point Star', category: 'basic', svgPath: 'M 50 5 L 61 35 L 95 38 L 68 58 L 79 92 L 50 72 L 21 92 L 32 58 L 5 38 L 39 35 Z', allowText: true },
  { id: 'star-6', name: '6-Point Star', category: 'basic', svgPath: 'M 50 5 L 63 30 L 93 18 L 75 45 L 95 68 L 65 62 L 50 95 L 35 62 L 5 68 L 25 45 L 7 18 L 37 30 Z', allowText: true },
  { id: 'star-8', name: '8-Point Star', category: 'basic', svgPath: 'M 50 5 L 58 30 L 82 10 L 70 35 L 95 50 L 70 65 L 82 90 L 58 70 L 50 95 L 42 70 L 18 90 L 30 65 L 5 50 L 30 35 L 18 10 L 42 30 Z', allowText: true },
  { id: 'cross', name: 'Cross', category: 'basic', svgPath: 'M 35 5 H 65 V 35 H 95 V 65 H 65 V 95 H 35 V 65 H 5 V 35 H 35 Z', allowText: true },
  { id: 'heart', name: 'Heart', category: 'basic', svgPath: 'M 50 90 Q 5 55 5 30 Q 5 5 27 5 Q 50 5 50 30 Q 50 5 73 5 Q 95 5 95 30 Q 95 55 50 90 Z', allowText: true },
  { id: 'arrow-block', name: 'Arrow Block', category: 'basic', svgPath: 'M 5 30 H 60 V 5 L 95 50 L 60 95 V 70 H 5 Z', allowText: true },
  { id: 'trapezoid', name: 'Trapezoid', category: 'basic', svgPath: 'M 20 5 H 80 L 95 95 H 5 Z', allowText: true },
  { id: 'parallelogram', name: 'Parallelogram', category: 'basic', svgPath: 'M 25 5 H 95 L 75 95 H 5 Z', allowText: true },

  // Lines & Connectors
  { id: 'line-straight', name: 'Straight Line', category: 'lines', svgPath: 'M 5 50 L 95 50', allowText: false },
  { id: 'line-elbow', name: 'Elbow Connector', category: 'lines', svgPath: 'M 5 20 H 50 V 80 H 95', allowText: false },
  { id: 'line-curved', name: 'Curved Line', category: 'lines', svgPath: 'M 5 80 Q 50 5 95 80', allowText: false },
  { id: 'arrow-line', name: 'Arrow', category: 'lines', svgPath: 'M 5 50 L 85 50 M 75 35 L 95 50 L 75 65', allowText: false },
  { id: 'double-arrow', name: 'Double Arrow', category: 'lines', svgPath: 'M 25 50 L 75 50 M 15 35 L 5 50 L 15 65 M 85 35 L 95 50 L 85 65', allowText: false },

  // Flowchart Shapes
  { id: 'flow-process', name: 'Process', category: 'flowchart', svgPath: 'M 5 5 H 95 V 95 H 5 Z', allowText: true },
  { id: 'flow-decision', name: 'Decision', category: 'flowchart', svgPath: 'M 50 5 L 95 50 L 50 95 L 5 50 Z', allowText: true },
  { id: 'flow-terminator', name: 'Terminator', category: 'flowchart', svgPath: 'M 25 5 H 75 Q 95 5 95 50 Q 95 95 75 95 H 25 Q 5 95 5 50 Q 5 5 25 5 Z', allowText: true },
  { id: 'flow-document', name: 'Document', category: 'flowchart', svgPath: 'M 5 5 H 95 V 75 Q 72 95 50 75 Q 28 55 5 75 Z', allowText: true },
  { id: 'flow-data', name: 'Data (I/O)', category: 'flowchart', svgPath: 'M 25 5 H 95 L 75 95 H 5 Z', allowText: true },
  { id: 'flow-predefined', name: 'Predefined Process', category: 'flowchart', svgPath: 'M 5 5 H 95 V 95 H 5 Z M 15 5 V 95 M 85 5 V 95', allowText: true },
  { id: 'flow-internal-storage', name: 'Internal Storage', category: 'flowchart', svgPath: 'M 5 5 H 95 V 95 H 5 Z M 5 20 H 95 M 20 5 V 95', allowText: true },
  { id: 'flow-manual-input', name: 'Manual Input', category: 'flowchart', svgPath: 'M 5 25 H 95 V 95 H 5 Z', allowText: true },
  { id: 'flow-preparation', name: 'Preparation', category: 'flowchart', svgPath: 'M 25 5 H 75 L 95 50 L 75 95 H 25 L 5 50 Z', allowText: true },
  { id: 'flow-delay', name: 'Delay', category: 'flowchart', svgPath: 'M 5 5 H 65 Q 95 5 95 50 Q 95 95 65 95 H 5 Z', allowText: true },
  { id: 'flow-database', name: 'Database', category: 'flowchart', svgPath: 'M 5 20 Q 5 5 50 5 Q 95 5 95 20 V 80 Q 95 95 50 95 Q 5 95 5 80 Z M 5 20 Q 5 35 50 35 Q 95 35 95 20', allowText: true },
  { id: 'flow-direct-storage', name: 'Direct Access Storage', category: 'flowchart', svgPath: 'M 20 5 H 80 Q 95 5 95 50 Q 95 95 80 95 H 20 Q 5 95 5 50 Q 5 5 20 5 Z M 80 5 Q 65 5 65 50 Q 65 95 80 95', allowText: true },

  // Callouts
  { id: 'callout-rect', name: 'Rectangular Callout', category: 'callouts', svgPath: 'M 5 5 H 95 V 70 H 55 L 35 95 L 45 70 H 5 Z', allowText: true },
  { id: 'callout-rounded', name: 'Rounded Callout', category: 'callouts', svgPath: 'M 15 5 H 85 Q 95 5 95 15 V 60 Q 95 70 85 70 H 55 L 35 95 L 45 70 H 15 Q 5 70 5 60 V 15 Q 5 5 15 5 Z', allowText: true },
  { id: 'callout-oval', name: 'Oval Callout', category: 'callouts', svgPath: 'M 50 10 A 45 30 0 1 1 50 70 L 35 95 L 45 68 A 45 30 0 0 1 50 10 Z', allowText: true },
  { id: 'callout-cloud', name: 'Cloud Callout', category: 'callouts', svgPath: 'M 30 25 Q 30 10 45 10 Q 55 5 65 15 Q 80 10 85 25 Q 95 30 90 45 Q 95 55 85 60 Q 80 70 65 68 Q 55 75 45 68 Q 35 75 25 65 Q 10 60 15 45 Q 10 35 20 28 Z M 35 68 L 25 90 L 40 72', allowText: true },
  { id: 'callout-thought', name: 'Thought Bubble', category: 'callouts', svgPath: 'M 30 25 Q 30 10 45 10 Q 55 5 65 15 Q 80 10 85 25 Q 95 30 90 45 Q 95 55 85 60 Q 80 70 65 68 Q 55 75 45 68 Q 35 75 25 65 Q 10 60 15 45 Q 10 35 20 28 Z M 30 75 A 5 5 0 1 1 30 85 A 5 5 0 1 1 30 75 M 22 88 A 3 3 0 1 1 22 94 A 3 3 0 1 1 22 88', allowText: true },
  { id: 'callout-line', name: 'Line Callout', category: 'callouts', svgPath: 'M 5 5 H 95 V 65 H 5 Z M 50 65 L 30 95', allowText: true },

  // Stars & Banners
  { id: 'explosion-1', name: 'Explosion 1', category: 'stars', svgPath: 'M 50 5 L 58 25 L 80 10 L 68 32 L 95 35 L 72 48 L 90 70 L 65 58 L 65 90 L 50 65 L 35 90 L 35 58 L 10 70 L 28 48 L 5 35 L 32 32 L 20 10 L 42 25 Z', allowText: true },
  { id: 'wave', name: 'Wave', category: 'stars', svgPath: 'M 5 30 Q 25 5 50 30 Q 75 55 95 30 V 70 Q 75 95 50 70 Q 25 45 5 70 Z', allowText: true },
  { id: 'scroll', name: 'Scroll', category: 'stars', svgPath: 'M 15 10 Q 5 10 5 20 Q 5 30 15 30 H 85 V 80 Q 85 90 75 90 H 15 Q 25 90 25 80 V 25 H 85 Q 95 25 95 15 Q 95 5 85 5 H 20 Q 10 5 10 15 Q 10 25 20 25', allowText: true },
  { id: 'ribbon', name: 'Ribbon', category: 'stars', svgPath: 'M 5 25 L 20 35 V 20 H 80 V 35 L 95 25 L 80 50 V 40 H 20 V 50 Z M 20 50 V 75 H 80 V 50', allowText: true },

  // Action Buttons
  { id: 'btn-forward', name: 'Forward', category: 'actions', svgPath: 'M 5 5 H 95 V 95 H 5 Z M 35 25 L 75 50 L 35 75 Z', allowText: false },
  { id: 'btn-back', name: 'Back', category: 'actions', svgPath: 'M 5 5 H 95 V 95 H 5 Z M 65 25 L 25 50 L 65 75 Z', allowText: false },
  { id: 'btn-beginning', name: 'Beginning', category: 'actions', svgPath: 'M 5 5 H 95 V 95 H 5 Z M 25 25 V 75 M 30 50 L 70 25 V 75 Z', allowText: false },
  { id: 'btn-end', name: 'End', category: 'actions', svgPath: 'M 5 5 H 95 V 95 H 5 Z M 75 25 V 75 M 70 50 L 30 25 V 75 Z', allowText: false },
  { id: 'btn-home', name: 'Home', category: 'actions', svgPath: 'M 5 5 H 95 V 95 H 5 Z M 50 20 L 25 45 H 35 V 75 H 45 V 55 H 55 V 75 H 65 V 45 H 75 Z', allowText: false },
  { id: 'btn-info', name: 'Information', category: 'actions', svgPath: 'M 5 5 H 95 V 95 H 5 Z M 50 25 A 25 25 0 1 1 50 75 A 25 25 0 1 1 50 25 M 47 35 H 53 V 40 H 47 Z M 47 45 H 53 V 65 H 47 Z', allowText: false },
  { id: 'btn-return', name: 'Return', category: 'actions', svgPath: 'M 5 5 H 95 V 95 H 5 Z M 30 55 L 45 40 V 48 H 65 V 35 L 65 48 H 45 V 48 L 45 55 V 62 H 65 V 55 M 30 55 L 45 70 V 62', allowText: false },
];

export const SHAPE_CATEGORIES: { key: ShapeCategory; label: string }[] = [
  { key: 'basic', label: 'Basic Shapes' },
  { key: 'lines', label: 'Lines & Connectors' },
  { key: 'flowchart', label: 'Flowchart' },
  { key: 'callouts', label: 'Callouts' },
  { key: 'stars', label: 'Stars & Banners' },
  { key: 'actions', label: 'Action Buttons' },
];

// ===================== ICON DEFINITIONS =====================

export type IconCategory = 'business' | 'technology' | 'education' | 'medical' | 'finance' | 'communication' | 'weather' | 'arrows' | 'social' | 'general';

export interface IconDefinition {
  id: string;
  name: string;
  category: IconCategory;
  Icon: LucideIcon;
}

export const ICON_CATEGORIES: { key: IconCategory; label: string }[] = [
  { key: 'business', label: 'Business' },
  { key: 'technology', label: 'Technology' },
  { key: 'education', label: 'Education' },
  { key: 'medical', label: 'Medical' },
  { key: 'finance', label: 'Finance' },
  { key: 'communication', label: 'Communication' },
  { key: 'weather', label: 'Weather' },
  { key: 'arrows', label: 'Arrows' },
  { key: 'social', label: 'Social Media' },
  { key: 'general', label: 'General' },
];

export const ICON_DEFINITIONS: IconDefinition[] = [
  // Business (20+)
  { id: 'briefcase', name: 'Briefcase', category: 'business', Icon: Briefcase },
  { id: 'building', name: 'Building', category: 'business', Icon: Building2 },
  { id: 'calculator', name: 'Calculator', category: 'business', Icon: Calculator },
  { id: 'calendar', name: 'Calendar', category: 'business', Icon: Calendar },
  { id: 'users', name: 'Users', category: 'business', Icon: Users },
  { id: 'user-check', name: 'User Check', category: 'business', Icon: UserCheck },
  { id: 'clipboard', name: 'Clipboard', category: 'business', Icon: Clipboard },
  { id: 'clipboard-list', name: 'Checklist', category: 'business', Icon: ClipboardList },
  { id: 'archive', name: 'Archive', category: 'business', Icon: Archive },
  { id: 'printer', name: 'Printer', category: 'business', Icon: Printer },
  { id: 'file-text', name: 'Document', category: 'business', Icon: FileText },
  { id: 'folder', name: 'Folder', category: 'business', Icon: FolderOpen },
  { id: 'search', name: 'Search', category: 'business', Icon: Search },
  { id: 'settings', name: 'Settings', category: 'business', Icon: Settings },
  { id: 'tag', name: 'Tag', category: 'business', Icon: Tag },
  { id: 'bookmark', name: 'Bookmark', category: 'business', Icon: Bookmark },
  { id: 'flag', name: 'Flag', category: 'business', Icon: Flag },
  { id: 'award', name: 'Award', category: 'business', Icon: Award },
  { id: 'package', name: 'Package', category: 'business', Icon: Package },
  { id: 'shopping-cart', name: 'Shopping Cart', category: 'business', Icon: ShoppingCart },

  // Technology (20+)
  { id: 'cpu', name: 'CPU', category: 'technology', Icon: Cpu },
  { id: 'monitor', name: 'Monitor', category: 'technology', Icon: Monitor },
  { id: 'smartphone', name: 'Smartphone', category: 'technology', Icon: Smartphone },
  { id: 'tablet', name: 'Tablet', category: 'technology', Icon: Tablet },
  { id: 'laptop', name: 'Laptop', category: 'technology', Icon: Laptop },
  { id: 'wifi', name: 'WiFi', category: 'technology', Icon: Wifi },
  { id: 'bluetooth', name: 'Bluetooth', category: 'technology', Icon: Bluetooth },
  { id: 'globe', name: 'Globe', category: 'technology', Icon: Globe },
  { id: 'server', name: 'Server', category: 'technology', Icon: Server },
  { id: 'code', name: 'Code', category: 'technology', Icon: Code },
  { id: 'terminal', name: 'Terminal', category: 'technology', Icon: Terminal },
  { id: 'storage', name: 'Storage', category: 'technology', Icon: Storage },
  { id: 'shield', name: 'Shield', category: 'technology', Icon: Shield },
  { id: 'lock', name: 'Lock', category: 'technology', Icon: Lock },
  { id: 'key', name: 'Key', category: 'technology', Icon: Key },
  { id: 'qr-code', name: 'QR Code', category: 'technology', Icon: QrCode },
  { id: 'cable', name: 'Cable', category: 'technology', Icon: Cable },
  { id: 'router', name: 'Router', category: 'technology', Icon: Router },
  { id: 'plug', name: 'Plug', category: 'technology', Icon: Plug },
  { id: 'gamepad', name: 'Gamepad', category: 'technology', Icon: Gamepad2 },

  // Education (20+)
  { id: 'book-open', name: 'Book', category: 'education', Icon: BookOpen },
  { id: 'graduation', name: 'Graduation', category: 'education', Icon: GraduationCap },
  { id: 'library', name: 'Library', category: 'education', Icon: Library },
  { id: 'pencil', name: 'Pencil', category: 'education', Icon: Pencil },
  { id: 'pen-tool', name: 'Pen', category: 'education', Icon: PenTool },
  { id: 'highlighter', name: 'Highlighter', category: 'education', Icon: Highlighter },
  { id: 'question', name: 'Question', category: 'education', Icon: FileQuestion },
  { id: 'brain', name: 'Brain', category: 'education', Icon: Brain },
  { id: 'atom', name: 'Atom', category: 'education', Icon: Atom },
  { id: 'microscope', name: 'Microscope', category: 'education', Icon: Microscope },
  { id: 'flask', name: 'Flask', category: 'education', Icon: FlaskConical },
  { id: 'beaker', name: 'Beaker', category: 'education', Icon: Beaker },
  { id: 'test-tube', name: 'Test Tube', category: 'education', Icon: TestTube2 },
  { id: 'dna', name: 'DNA', category: 'education', Icon: Dna },
  { id: 'lightbulb', name: 'Lightbulb', category: 'education', Icon: Lightbulb },
  { id: 'palette', name: 'Palette', category: 'education', Icon: Palette },
  { id: 'music', name: 'Music', category: 'education', Icon: Music },
  { id: 'scissors', name: 'Scissors', category: 'education', Icon: Scissors },
  { id: 'wrench', name: 'Wrench', category: 'education', Icon: Wrench },
  { id: 'compass', name: 'Compass', category: 'education', Icon: Compass },

  // Medical (15+)
  { id: 'stethoscope', name: 'Stethoscope', category: 'medical', Icon: Stethoscope },
  { id: 'syringe', name: 'Syringe', category: 'medical', Icon: Syringe },
  { id: 'pill', name: 'Pill', category: 'medical', Icon: Pill },
  { id: 'heart-pulse', name: 'Heart Pulse', category: 'medical', Icon: HeartPulse },
  { id: 'activity', name: 'Activity', category: 'medical', Icon: Activity },
  { id: 'thermometer', name: 'Thermometer', category: 'medical', Icon: Thermometer },
  { id: 'eye', name: 'Eye', category: 'medical', Icon: Eye },
  { id: 'ear', name: 'Ear', category: 'medical', Icon: Ear },
  { id: 'hand', name: 'Hand', category: 'medical', Icon: Hand },
  { id: 'accessibility', name: 'Accessibility', category: 'medical', Icon: Accessibility },
  { id: 'cross-medical', name: 'Medical Cross', category: 'medical', Icon: Cross },
  { id: 'heart', name: 'Heart', category: 'medical', Icon: Heart },

  // Finance (15+)
  { id: 'credit-card', name: 'Credit Card', category: 'finance', Icon: CreditCard },
  { id: 'dollar', name: 'Dollar', category: 'finance', Icon: DollarSign },
  { id: 'wallet', name: 'Wallet', category: 'finance', Icon: Wallet },
  { id: 'receipt', name: 'Receipt', category: 'finance', Icon: Receipt },
  { id: 'landmark', name: 'Bank', category: 'finance', Icon: Landmark },
  { id: 'badge-dollar', name: 'Badge Dollar', category: 'finance', Icon: BadgeDollarSign },
  { id: 'line-chart', name: 'Line Chart', category: 'finance', Icon: LineChartIcon },
  { id: 'pie-chart', name: 'Pie Chart', category: 'finance', Icon: PieChartIcon },
  { id: 'trending-up', name: 'Trending Up', category: 'finance', Icon: TrendingUp },
  { id: 'gift', name: 'Gift', category: 'finance', Icon: Gift },

  // Communication (15+)
  { id: 'mail', name: 'Mail', category: 'communication', Icon: Mail },
  { id: 'phone', name: 'Phone', category: 'communication', Icon: Phone },
  { id: 'chat', name: 'Chat', category: 'communication', Icon: Chat },
  { id: 'video', name: 'Video', category: 'communication', Icon: Video },
  { id: 'mic', name: 'Microphone', category: 'communication', Icon: Mic },
  { id: 'send', name: 'Send', category: 'communication', Icon: Send },
  { id: 'share', name: 'Share', category: 'communication', Icon: Share2 },
  { id: 'link', name: 'Link', category: 'communication', Icon: Link },
  { id: 'bell', name: 'Bell', category: 'communication', Icon: Bell },
  { id: 'megaphone', name: 'Megaphone', category: 'communication', Icon: Megaphone },
  { id: 'radio', name: 'Radio', category: 'communication', Icon: Radio },
  { id: 'podcast', name: 'Podcast', category: 'communication', Icon: Podcast },
  { id: 'rss', name: 'RSS', category: 'communication', Icon: Rss },
  { id: 'at-sign', name: 'At Sign', category: 'communication', Icon: AtSign },
  { id: 'hash', name: 'Hash', category: 'communication', Icon: Hash },

  // Weather (15+)
  { id: 'sun', name: 'Sun', category: 'weather', Icon: Sun },
  { id: 'moon', name: 'Moon', category: 'weather', Icon: Moon },
  { id: 'cloud-rain', name: 'Rain', category: 'weather', Icon: CloudRain },
  { id: 'cloud-snow', name: 'Snow', category: 'weather', Icon: CloudSnow },
  { id: 'cloud-lightning', name: 'Lightning', category: 'weather', Icon: CloudLightning },
  { id: 'wind', name: 'Wind', category: 'weather', Icon: Wind },
  { id: 'umbrella', name: 'Umbrella', category: 'weather', Icon: Umbrella },
  { id: 'snowflake', name: 'Snowflake', category: 'weather', Icon: Snowflake },
  { id: 'droplets', name: 'Droplets', category: 'weather', Icon: Droplets },
  { id: 'rainbow', name: 'Rainbow', category: 'weather', Icon: Rainbow },
  { id: 'cloud', name: 'Cloud', category: 'weather', Icon: Cloud },
  { id: 'zap', name: 'Lightning Bolt', category: 'weather', Icon: Zap },
  { id: 'waves', name: 'Waves', category: 'weather', Icon: Waves },

  // Arrows (20+)
  { id: 'arrow-right', name: 'Arrow Right', category: 'arrows', Icon: ArrowRight },
  { id: 'arrow-left', name: 'Arrow Left', category: 'arrows', Icon: ArrowLeft },
  { id: 'arrow-up', name: 'Arrow Up', category: 'arrows', Icon: ArrowUp },
  { id: 'arrow-down', name: 'Arrow Down', category: 'arrows', Icon: ArrowDown },
  { id: 'arrow-up-right', name: 'Arrow Up Right', category: 'arrows', Icon: ArrowUpRight },
  { id: 'arrow-down-right', name: 'Arrow Down Right', category: 'arrows', Icon: ArrowDownRight },
  { id: 'move-right', name: 'Move Right', category: 'arrows', Icon: MoveRight },
  { id: 'move-left', name: 'Move Left', category: 'arrows', Icon: MoveLeft },
  { id: 'move-up', name: 'Move Up', category: 'arrows', Icon: MoveUp },
  { id: 'move-down', name: 'Move Down', category: 'arrows', Icon: MoveDown },
  { id: 'refresh', name: 'Refresh', category: 'arrows', Icon: RefreshCw },
  { id: 'rotate-cw', name: 'Rotate CW', category: 'arrows', Icon: RotateCw },
  { id: 'rotate-ccw', name: 'Rotate CCW', category: 'arrows', Icon: RotateCcw },
  { id: 'maximize', name: 'Maximize', category: 'arrows', Icon: Maximize2 },
  { id: 'chevron-right', name: 'Chevron Right', category: 'arrows', Icon: ChevronRight },
  { id: 'chevron-left', name: 'Chevron Left', category: 'arrows', Icon: ChevronLeft },
  { id: 'chevron-up', name: 'Chevron Up', category: 'arrows', Icon: ChevronUp },
  { id: 'chevron-down', name: 'Chevron Down', category: 'arrows', Icon: ChevronDown },
  { id: 'chevrons-up', name: 'Chevrons Up', category: 'arrows', Icon: ChevronsUp },
  { id: 'chevrons-down', name: 'Chevrons Down', category: 'arrows', Icon: ChevronsDown },

  // Social Media (10+)
  { id: 'github', name: 'GitHub', category: 'social', Icon: Github },
  { id: 'twitter', name: 'Twitter', category: 'social', Icon: Twitter },
  { id: 'youtube', name: 'YouTube', category: 'social', Icon: Youtube },
  { id: 'twitch', name: 'Twitch', category: 'social', Icon: Twitch },
  { id: 'linkedin', name: 'LinkedIn', category: 'social', Icon: Linkedin },
  { id: 'instagram', name: 'Instagram', category: 'social', Icon: Instagram },
  { id: 'facebook', name: 'Facebook', category: 'social', Icon: Facebook },

  // General (30+)
  { id: 'image', name: 'Image', category: 'general', Icon: Image },
  { id: 'camera', name: 'Camera', category: 'general', Icon: Camera },
  { id: 'map', name: 'Map', category: 'general', Icon: Map },
  { id: 'navigation', name: 'Navigation', category: 'general', Icon: Navigation },
  { id: 'paperclip', name: 'Paperclip', category: 'general', Icon: Paperclip },
  { id: 'download', name: 'Download', category: 'general', Icon: Download },
  { id: 'upload', name: 'Upload', category: 'general', Icon: Upload },
  { id: 'save', name: 'Save', category: 'general', Icon: Save },
  { id: 'trash', name: 'Trash', category: 'general', Icon: Trash2 },
  { id: 'coffee', name: 'Coffee', category: 'general', Icon: Coffee },
  { id: 'utensils', name: 'Utensils', category: 'general', Icon: Utensils },
  { id: 'headphones', name: 'Headphones', category: 'general', Icon: Headphones },
  { id: 'hammer', name: 'Hammer', category: 'general', Icon: Hammer },
  { id: 'circle-dot', name: 'Target', category: 'general', Icon: CircleDot },
  { id: 'tv', name: 'TV', category: 'general', Icon: Tv },
  { id: 'play', name: 'Play', category: 'general', Icon: PlayCircle },
  { id: 'skip-back', name: 'Skip Back', category: 'general', Icon: SkipBack },
  { id: 'skip-forward', name: 'Skip Forward', category: 'general', Icon: SkipForward },
  { id: 'home', name: 'Home', category: 'general', Icon: Home },
  { id: 'info', name: 'Info', category: 'general', Icon: Info },
];

// ===================== SHAPE FORMATTING =====================

export interface ShapeFormatting {
  fill: {
    type: 'solid' | 'gradient' | 'pattern' | 'none';
    color: string;
    gradientStart?: string;
    gradientEnd?: string;
    gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
    opacity?: number;
  };
  outline: {
    color: string;
    weight: number;
    dashStyle: 'solid' | 'dash' | 'dot' | 'dash-dot';
  };
  effects: {
    shadow: boolean;
    shadowColor?: string;
    shadowBlur?: number;
    shadowX?: number;
    shadowY?: number;
    reflection: boolean;
    glow: boolean;
    glowColor?: string;
    glowSize?: number;
    softEdges: number;
    bevel: 'none' | 'circle' | 'relaxed' | 'cross' | 'angle';
    rotation3d?: { x: number; y: number; z: number };
  };
  text?: {
    content: string;
    verticalAlign: 'top' | 'middle' | 'bottom';
    fontSize: number;
    color: string;
    fontWeight: 'normal' | 'bold';
  };
}

export const DEFAULT_SHAPE_FORMATTING: ShapeFormatting = {
  fill: { type: 'solid', color: '#4e79a7', opacity: 1 },
  outline: { color: '#333333', weight: 2, dashStyle: 'solid' },
  effects: { shadow: false, reflection: false, glow: false, softEdges: 0, bevel: 'none' },
};

// ===================== SHAPE PICKER COMPONENT =====================

interface ShapePickerProps {
  onSelectShape: (shape: ShapeDefinition) => void;
  onClose: () => void;
}

export function ShapePicker({ onSelectShape, onClose }: ShapePickerProps) {
  const [activeCategory, setActiveCategory] = useState<ShapeCategory>('basic');

  const shapes = SHAPE_DEFINITIONS.filter(s => s.category === activeCategory);

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl w-[400px] max-h-[500px] flex flex-col"
      onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-700">
        <span className="text-sm font-semibold dark:text-gray-200">Shapes</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">×</button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b dark:border-gray-700">
        {SHAPE_CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
            className={`px-2 py-1 text-[10px] rounded ${
              activeCategory === cat.key
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Shape grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-6 gap-1.5">
          {shapes.map(shape => (
            <button key={shape.id} onClick={() => { onSelectShape(shape); onClose(); }}
              className="w-12 h-12 border rounded hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 flex items-center justify-center"
              title={shape.name}>
              <svg viewBox="0 0 100 100" className="w-8 h-8">
                <path d={shape.svgPath} fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-600 dark:text-gray-300" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===================== ICON PICKER COMPONENT =====================

interface IconPickerProps {
  onSelectIcon: (icon: IconDefinition) => void;
  onClose: () => void;
}

export function IconPicker({ onSelectIcon, onClose }: IconPickerProps) {
  const [activeCategory, setActiveCategory] = useState<IconCategory>('business');
  const [searchQuery, setSearchQuery] = useState('');

  const icons = useMemo(() => {
    let filtered = ICON_DEFINITIONS;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(ic => ic.name.toLowerCase().includes(q) || ic.category.includes(q));
    } else {
      filtered = filtered.filter(ic => ic.category === activeCategory);
    }
    return filtered;
  }, [activeCategory, searchQuery]);

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl w-[450px] max-h-[550px] flex flex-col"
      onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-700">
        <span className="text-sm font-semibold dark:text-gray-200">Icons ({ICON_DEFINITIONS.length}+ icons)</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">×</button>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 border-b dark:border-gray-700">
        <input type="text" placeholder="Search icons..."
          className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      {/* Category tabs */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b dark:border-gray-700">
          {ICON_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className={`px-2 py-1 text-[10px] rounded ${
                activeCategory === cat.key
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Icon grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-1">
          {icons.map(icon => (
            <button key={icon.id} onClick={() => { onSelectIcon(icon); onClose(); }}
              className="w-10 h-10 border rounded hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 flex items-center justify-center"
              title={icon.name}>
              <icon.Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          ))}
        </div>
        {icons.length === 0 && (
          <div className="text-center text-gray-400 text-xs py-8">No icons found</div>
        )}
      </div>
    </div>
  );
}

// ===================== SHAPE FORMATTING PANEL =====================

interface ShapeFormattingPanelProps {
  formatting: ShapeFormatting;
  onChange: (formatting: ShapeFormatting) => void;
}

export function ShapeFormattingPanel({ formatting, onChange }: ShapeFormattingPanelProps) {
  const [activeTab, setActiveTab] = useState<'fill' | 'outline' | 'effects' | 'text'>('fill');

  const update = (partial: Partial<ShapeFormatting>) => {
    onChange({ ...formatting, ...partial });
  };

  return (
    <div className="text-xs space-y-2">
      <div className="flex border-b dark:border-gray-700">
        {(['fill', 'outline', 'effects', 'text'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-2 py-1.5 text-[10px] font-medium capitalize border-b-2 ${
              activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'fill' && (
        <div className="space-y-2 p-2">
          <div>
            <label className="text-[10px] text-gray-500">Fill Type</label>
            <select className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
              value={formatting.fill.type}
              onChange={e => update({ fill: { ...formatting.fill, type: e.target.value as any } })}>
              <option value="solid">Solid</option>
              <option value="gradient">Gradient</option>
              <option value="none">No Fill</option>
            </select>
          </div>
          {formatting.fill.type !== 'none' && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-500">Color</label>
              <input type="color" className="w-8 h-6" value={formatting.fill.color}
                onChange={e => update({ fill: { ...formatting.fill, color: e.target.value } })} />
            </div>
          )}
          {formatting.fill.type === 'gradient' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-gray-500">End</label>
                <input type="color" className="w-8 h-6" value={formatting.fill.gradientEnd || '#ffffff'}
                  onChange={e => update({ fill: { ...formatting.fill, gradientEnd: e.target.value } })} />
              </div>
              <select className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                value={formatting.fill.gradientDirection || 'vertical'}
                onChange={e => update({ fill: { ...formatting.fill, gradientDirection: e.target.value as any } })}>
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
                <option value="diagonal">Diagonal</option>
              </select>
            </>
          )}
          <div>
            <label className="text-[10px] text-gray-500">Opacity</label>
            <input type="range" min={0} max={100} className="w-full"
              value={(formatting.fill.opacity ?? 1) * 100}
              onChange={e => update({ fill: { ...formatting.fill, opacity: parseInt(e.target.value) / 100 } })} />
          </div>
        </div>
      )}

      {activeTab === 'outline' && (
        <div className="space-y-2 p-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-gray-500">Color</label>
            <input type="color" className="w-8 h-6" value={formatting.outline.color}
              onChange={e => update({ outline: { ...formatting.outline, color: e.target.value } })} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Weight (px)</label>
            <input type="number" min={0} max={20} className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
              value={formatting.outline.weight}
              onChange={e => update({ outline: { ...formatting.outline, weight: parseFloat(e.target.value) || 0 } })} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Dash Style</label>
            <select className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
              value={formatting.outline.dashStyle}
              onChange={e => update({ outline: { ...formatting.outline, dashStyle: e.target.value as any } })}>
              <option value="solid">Solid</option>
              <option value="dash">Dash</option>
              <option value="dot">Dot</option>
              <option value="dash-dot">Dash-Dot</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'effects' && (
        <div className="space-y-2 p-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formatting.effects.shadow}
              onChange={e => update({ effects: { ...formatting.effects, shadow: e.target.checked, shadowBlur: 8, shadowX: 2, shadowY: 2, shadowColor: '#00000040' } })} />
            <span>Shadow</span>
          </label>
          {formatting.effects.shadow && (
            <div className="pl-4 space-y-1">
              <div className="flex items-center gap-1">
                <label className="text-[10px] text-gray-500 w-10">Blur</label>
                <input type="range" min={0} max={30} className="flex-1"
                  value={formatting.effects.shadowBlur ?? 8}
                  onChange={e => update({ effects: { ...formatting.effects, shadowBlur: parseInt(e.target.value) } })} />
              </div>
            </div>
          )}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formatting.effects.glow}
              onChange={e => update({ effects: { ...formatting.effects, glow: e.target.checked, glowColor: '#4e79a740', glowSize: 10 } })} />
            <span>Glow</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formatting.effects.reflection}
              onChange={e => update({ effects: { ...formatting.effects, reflection: e.target.checked } })} />
            <span>Reflection</span>
          </label>
          <div>
            <label className="text-[10px] text-gray-500">Soft Edges (px)</label>
            <input type="range" min={0} max={20} className="w-full"
              value={formatting.effects.softEdges}
              onChange={e => update({ effects: { ...formatting.effects, softEdges: parseInt(e.target.value) } })} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Bevel</label>
            <select className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
              value={formatting.effects.bevel}
              onChange={e => update({ effects: { ...formatting.effects, bevel: e.target.value as any } })}>
              <option value="none">None</option>
              <option value="circle">Circle</option>
              <option value="relaxed">Relaxed</option>
              <option value="cross">Cross</option>
              <option value="angle">Angle</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500">3D Rotation</label>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <div>
                <label className="text-[9px] text-gray-400">X</label>
                <input type="number" className="w-full px-1 py-0.5 border rounded text-[10px] dark:bg-gray-800 dark:border-gray-600"
                  value={formatting.effects.rotation3d?.x ?? 0}
                  onChange={e => update({ effects: { ...formatting.effects, rotation3d: { ...(formatting.effects.rotation3d || { x: 0, y: 0, z: 0 }), x: parseInt(e.target.value) || 0 } } })} />
              </div>
              <div>
                <label className="text-[9px] text-gray-400">Y</label>
                <input type="number" className="w-full px-1 py-0.5 border rounded text-[10px] dark:bg-gray-800 dark:border-gray-600"
                  value={formatting.effects.rotation3d?.y ?? 0}
                  onChange={e => update({ effects: { ...formatting.effects, rotation3d: { ...(formatting.effects.rotation3d || { x: 0, y: 0, z: 0 }), y: parseInt(e.target.value) || 0 } } })} />
              </div>
              <div>
                <label className="text-[9px] text-gray-400">Z</label>
                <input type="number" className="w-full px-1 py-0.5 border rounded text-[10px] dark:bg-gray-800 dark:border-gray-600"
                  value={formatting.effects.rotation3d?.z ?? 0}
                  onChange={e => update({ effects: { ...formatting.effects, rotation3d: { ...(formatting.effects.rotation3d || { x: 0, y: 0, z: 0 }), z: parseInt(e.target.value) || 0 } } })} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'text' && (
        <div className="space-y-2 p-2">
          <div>
            <label className="text-[10px] text-gray-500">Text Content</label>
            <textarea className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600 text-xs" rows={2}
              value={formatting.text?.content || ''}
              onChange={e => update({ text: { ...formatting.text || { content: '', verticalAlign: 'middle', fontSize: 14, color: '#000000', fontWeight: 'normal' }, content: e.target.value } })} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Vertical Alignment</label>
            <select className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
              value={formatting.text?.verticalAlign || 'middle'}
              onChange={e => update({ text: { ...formatting.text || { content: '', verticalAlign: 'middle', fontSize: 14, color: '#000000', fontWeight: 'normal' }, verticalAlign: e.target.value as any } })}>
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-gray-500">Font Size</label>
              <input type="number" min={8} max={72} className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                value={formatting.text?.fontSize || 14}
                onChange={e => update({ text: { ...formatting.text || { content: '', verticalAlign: 'middle', fontSize: 14, color: '#000000', fontWeight: 'normal' }, fontSize: parseInt(e.target.value) || 14 } })} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500">Color</label>
              <input type="color" className="w-8 h-6" value={formatting.text?.color || '#000000'}
                onChange={e => update({ text: { ...formatting.text || { content: '', verticalAlign: 'middle', fontSize: 14, color: '#000000', fontWeight: 'normal' }, color: e.target.value } })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== SHAPE RENDERER =====================

interface ShapeRendererProps {
  shape: ShapeDefinition;
  formatting: ShapeFormatting;
  width: number;
  height: number;
  className?: string;
  onClick?: () => void;
}

export function ShapeRenderer({ shape, formatting, width, height, className, onClick }: ShapeRendererProps) {
  const dashArray = {
    solid: 'none',
    dash: '8 4',
    dot: '2 4',
    'dash-dot': '8 4 2 4',
  }[formatting.outline.dashStyle];

  const filterId = `filter-${shape.id}-${Math.random().toString(36).slice(2, 8)}`;
  const gradientId = `grad-${shape.id}-${Math.random().toString(36).slice(2, 8)}`;

  let fillValue = formatting.fill.type === 'none' ? 'none' : formatting.fill.color;
  if (formatting.fill.type === 'gradient') {
    fillValue = `url(#${gradientId})`;
  }

  const transform3d = formatting.effects.rotation3d
    ? `perspective(500px) rotateX(${formatting.effects.rotation3d.x}deg) rotateY(${formatting.effects.rotation3d.y}deg) rotateZ(${formatting.effects.rotation3d.z}deg)`
    : undefined;

  return (
    <div className={className} onClick={onClick}
      style={{
        width,
        height,
        transform: transform3d,
        filter: formatting.effects.softEdges > 0 ? `blur(${formatting.effects.softEdges * 0.3}px)` : undefined,
      }}>
      <svg viewBox="0 0 100 100" width={width} height={height}>
        <defs>
          {formatting.fill.type === 'gradient' && (
            <linearGradient id={gradientId}
              x1="0%" y1="0%"
              x2={formatting.fill.gradientDirection === 'horizontal' ? '100%' : formatting.fill.gradientDirection === 'diagonal' ? '100%' : '0%'}
              y2={formatting.fill.gradientDirection === 'vertical' ? '100%' : formatting.fill.gradientDirection === 'diagonal' ? '100%' : '0%'}>
              <stop offset="0%" stopColor={formatting.fill.color} />
              <stop offset="100%" stopColor={formatting.fill.gradientEnd || '#ffffff'} />
            </linearGradient>
          )}
          {(formatting.effects.shadow || formatting.effects.glow) && (
            <filter id={filterId}>
              {formatting.effects.shadow && (
                <feDropShadow dx={formatting.effects.shadowX ?? 2} dy={formatting.effects.shadowY ?? 2}
                  stdDeviation={formatting.effects.shadowBlur ?? 4}
                  floodColor={formatting.effects.shadowColor || '#00000040'} />
              )}
              {formatting.effects.glow && (
                <feDropShadow dx="0" dy="0"
                  stdDeviation={formatting.effects.glowSize ?? 6}
                  floodColor={formatting.effects.glowColor || '#4e79a760'} />
              )}
            </filter>
          )}
        </defs>
        <path d={shape.svgPath}
          fill={fillValue}
          fillOpacity={formatting.fill.opacity ?? 1}
          stroke={formatting.outline.color}
          strokeWidth={formatting.outline.weight}
          strokeDasharray={dashArray}
          filter={(formatting.effects.shadow || formatting.effects.glow) ? `url(#${filterId})` : undefined}
        />
        {/* Text inside shape */}
        {formatting.text?.content && shape.allowText && (
          <text x="50" y={formatting.text.verticalAlign === 'top' ? '25' : formatting.text.verticalAlign === 'bottom' ? '80' : '52'}
            textAnchor="middle" dominantBaseline="middle"
            fill={formatting.text.color}
            fontSize={formatting.text.fontSize * (100 / Math.max(width, height))}
            fontWeight={formatting.text.fontWeight}>
            {formatting.text.content}
          </text>
        )}
      </svg>
      {/* Reflection */}
      {formatting.effects.reflection && (
        <svg viewBox="0 0 100 100" width={width} height={height * 0.3}
          style={{ transform: 'scaleY(-1)', opacity: 0.2, marginTop: -2 }}>
          <path d={shape.svgPath} fill={fillValue} fillOpacity={0.3} stroke="none" />
        </svg>
      )}
    </div>
  );
}
