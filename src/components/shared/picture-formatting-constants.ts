'use client';

export const CROP_SHAPES = [
  { name: 'Rectangle', clip: 'inset(0)' },
  { name: 'Rounded Rect', clip: 'inset(0 round 12px)' },
  { name: 'Circle', clip: 'circle(50% at 50% 50%)' },
  { name: 'Ellipse', clip: 'ellipse(50% 40% at 50% 50%)' },
  { name: 'Triangle', clip: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
  { name: 'Diamond', clip: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
  { name: 'Hexagon', clip: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' },
  { name: 'Star', clip: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' },
  { name: 'Pentagon', clip: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' },
  { name: 'Arrow Right', clip: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)' },
  { name: 'Cross', clip: 'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)' },
  { name: 'Heart', clip: 'polygon(50% 18%, 61% 0%, 80% 0%, 100% 18%, 100% 40%, 50% 100%, 0% 40%, 0% 18%, 20% 0%, 39% 0%)' },
];

export const ASPECT_RATIOS = [
  { name: 'Free', w: 0, h: 0 },
  { name: '1:1 Square', w: 1, h: 1 },
  { name: '4:3 Standard', w: 4, h: 3 },
  { name: '16:9 Widescreen', w: 16, h: 9 },
  { name: '3:2 Photo', w: 3, h: 2 },
  { name: '2:3 Portrait', w: 2, h: 3 },
  { name: '3:4 Portrait', w: 3, h: 4 },
];

export const TEXT_WRAP_OPTIONS = [
  { name: 'Inline', value: 'inline' as const, desc: 'Image sits in line with text' },
  { name: 'Square', value: 'square' as const, desc: 'Text wraps in a square around the image' },
  { name: 'Tight', value: 'tight' as const, desc: 'Text wraps tightly around the image' },
  { name: 'Through', value: 'through' as const, desc: 'Text flows through transparent areas' },
  { name: 'Top & Bottom', value: 'top-bottom' as const, desc: 'Text above and below only' },
  { name: 'Behind Text', value: 'behind' as const, desc: 'Image sits behind text' },
  { name: 'In Front', value: 'in-front' as const, desc: 'Image floats in front of text' },
];

export const PRESET_BORDERS = [
  { name: 'None', width: 0, color: '#000000', style: 'none' as const, radius: 0 },
  { name: 'Thin Black', width: 1, color: '#000000', style: 'solid' as const, radius: 0 },
  { name: 'Medium Blue', width: 2, color: '#4472C4', style: 'solid' as const, radius: 0 },
  { name: 'Thick Gold', width: 3, color: '#FFC000', style: 'solid' as const, radius: 0 },
  { name: 'Dashed', width: 2, color: '#4472C4', style: 'dashed' as const, radius: 0 },
  { name: 'Dotted Red', width: 2, color: '#FF0000', style: 'dotted' as const, radius: 0 },
  { name: 'Rounded', width: 2, color: '#dddddd', style: 'solid' as const, radius: 8 },
  { name: 'Polaroid', width: 8, color: '#ffffff', style: 'solid' as const, radius: 0 },
];

export const PRESET_SHADOWS = [
  { name: 'None', enabled: false, x: 0, y: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.3)' },
  { name: 'Soft', enabled: true, x: 0, y: 4, blur: 16, spread: 0, color: 'rgba(0,0,0,0.15)' },
  { name: 'Drop', enabled: true, x: 4, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.3)' },
  { name: 'Offset', enabled: true, x: 8, y: 8, blur: 0, spread: 0, color: 'rgba(0,0,0,0.15)' },
  { name: 'Deep', enabled: true, x: 0, y: 8, blur: 24, spread: 2, color: 'rgba(0,0,0,0.4)' },
  { name: 'Inner', enabled: true, x: 0, y: 0, blur: 8, spread: -4, color: 'rgba(0,0,0,0.5)' },
];

export const PRESET_GLOWS = [
  { name: 'Blue', color: '#4472C4', blur: 16 },
  { name: 'Gold', color: '#FFC000', blur: 16 },
  { name: 'Green', color: '#70AD47', blur: 16 },
  { name: 'Red', color: '#FF0000', blur: 16 },
  { name: 'Purple', color: '#7030A0', blur: 16 },
  { name: 'White', color: '#ffffff', blur: 20 },
];

export const STOCK_PHOTOS = [
  { name: 'Mountain Landscape', color: '#4472C4', emoji: '🏔️' },
  { name: 'Ocean Sunset', color: '#ED7D31', emoji: '🌅' },
  { name: 'Forest Trail', color: '#70AD47', emoji: '🌲' },
  { name: 'City Skyline', color: '#7030A0', emoji: '🏙️' },
  { name: 'Abstract Pattern', color: '#FFC000', emoji: '🎨' },
  { name: 'Technology', color: '#44546A', emoji: '💻' },
  { name: 'Business Meeting', color: '#2E75B6', emoji: '👔' },
  { name: 'Nature Macro', color: '#548235', emoji: '🌿' },
];
