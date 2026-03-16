// SmartArt SVG generation functions
import { escSvg, type SmartArtLayout, type NodeItem, type ColorTheme } from "./types";

export function generateSmartArtSVG(layout: SmartArtLayout, nodes: NodeItem[], theme: ColorTheme): string {
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
      const nextAngle = (2 * Math.PI * ((i + 1) % nodes.length)) / nodes.length - Math.PI / 2;
      const mx = cx + (r - 50) * Math.cos((angle + nextAngle) / 2);
      const my = cy + (r - 50) * Math.sin((angle + nextAngle) / 2);
      svg += `<circle cx="${mx}" cy="${my}" r="4" fill="${theme.accent}"/>`;
    });
  } else if (cat === "Hierarchy") {
    const drawHierNode = (node: NodeItem, x: number, y: number, levelW: number, depth: number) => {
      const nw = 100, nh = 40;
      const fill = depth === 0 ? theme.accent : depth === 1 ? theme.primary : theme.secondary;
      if (layout.id === "org-chart") {
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
