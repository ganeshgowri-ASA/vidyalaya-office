'use client';

import type { ImageFormatting } from '@/store/picture-store';

/** Build a CSS filter string from formatting values */
export function buildFilterString(f: ImageFormatting): string {
  const parts: string[] = [];
  if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
  if (f.saturation !== 100) parts.push(`saturate(${f.saturation}%)`);
  if (f.blur > 0) parts.push(`blur(${f.blur}px)`);
  if (f.opacity !== 100) parts.push(`opacity(${f.opacity}%)`);
  return parts.join(' ');
}

/** Build a CSS transform string from formatting values */
export function buildTransformString(f: ImageFormatting): string {
  const parts: string[] = [];
  if (f.rotation !== 0) parts.push(`rotate(${f.rotation}deg)`);
  if (f.flipH) parts.push('scaleX(-1)');
  if (f.flipV) parts.push('scaleY(-1)');
  return parts.join(' ');
}

/** Build a CSS box-shadow string */
export function buildBoxShadow(f: ImageFormatting): string {
  const parts: string[] = [];
  if (f.shadowEnabled) {
    parts.push(`${f.shadowOffsetX}px ${f.shadowOffsetY}px ${f.shadowBlur}px ${f.shadowSpread}px ${f.shadowColor}`);
  }
  if (f.glowEnabled) {
    parts.push(`0 0 ${f.glowBlur}px ${Math.round(f.glowBlur / 4)}px ${f.glowColor}`);
  }
  return parts.join(', ');
}

/** Build a CSS border string */
export function buildBorderString(f: ImageFormatting): string {
  if (f.borderStyle === 'none' || f.borderWidth === 0) return 'none';
  return `${f.borderWidth}px ${f.borderStyle} ${f.borderColor}`;
}

/** Apply formatting to a DOM image element */
export function applyFormattingToImg(img: HTMLImageElement, f: ImageFormatting): void {
  img.style.filter = buildFilterString(f);
  img.style.transform = buildTransformString(f);

  const shadow = buildBoxShadow(f);
  img.style.boxShadow = shadow || '';

  const border = buildBorderString(f);
  img.style.border = border === 'none' ? '' : border;

  if (f.borderRadius > 0) {
    img.style.borderRadius = `${f.borderRadius}px`;
  } else {
    img.style.borderRadius = '';
  }

  if (f.clipPath) {
    img.style.clipPath = f.clipPath;
  } else {
    img.style.clipPath = '';
  }

  if (f.reflectionEnabled) {
    (img.style as unknown as Record<string, string>)['-webkit-box-reflect'] =
      `below 2px linear-gradient(transparent, rgba(0,0,0,${f.reflectionOpacity}))`;
  } else {
    (img.style as unknown as Record<string, string>)['-webkit-box-reflect'] = '';
  }

  if (f.width !== null) img.style.width = `${f.width}px`;
  if (f.height !== null) img.style.height = `${f.height}px`;
}

/** Get the currently selected/last image in a contenteditable editor */
export function getEditorImage(editorId: string): HTMLImageElement | null {
  const editor = document.getElementById(editorId);
  if (!editor) return null;
  // Check explicitly marked selected image first
  const marked = editor.querySelector("img[data-selected='true']") as HTMLImageElement | null;
  if (marked) return marked;
  // Fall back to any image
  const imgs = editor.querySelectorAll('img');
  return imgs.length > 0 ? (imgs[imgs.length - 1] as HTMLImageElement) : null;
}

/** Read current formatting from a DOM image element */
export function readFormattingFromImg(img: HTMLImageElement): Partial<ImageFormatting> {
  const filterStr = img.style.filter || '';
  const brightness = extractFilter(filterStr, 'brightness', 100);
  const contrast = extractFilter(filterStr, 'contrast', 100);
  const saturation = extractFilter(filterStr, 'saturate', 100);
  const blur = extractFilterPx(filterStr, 'blur', 0);

  const transformStr = img.style.transform || '';
  const rotation = extractRotation(transformStr);
  const flipH = transformStr.includes('scaleX(-1)');
  const flipV = transformStr.includes('scaleY(-1)');

  return { brightness, contrast, saturation, blur, rotation, flipH, flipV, altText: img.alt || '' };
}

function extractFilter(filter: string, name: string, def: number): number {
  const m = filter.match(new RegExp(`${name}\\((\\d+(?:\\.\\d+)?)%\\)`));
  return m ? parseFloat(m[1]) : def;
}

function extractFilterPx(filter: string, name: string, def: number): number {
  const m = filter.match(new RegExp(`${name}\\((\\d+(?:\\.\\d+)?)px\\)`));
  return m ? parseFloat(m[1]) : def;
}

function extractRotation(transform: string): number {
  const m = transform.match(/rotate\(([-\d.]+)deg\)/);
  return m ? parseFloat(m[1]) : 0;
}

/** Compress an image element via canvas */
export function compressImageElement(img: HTMLImageElement, quality = 0.6, scale = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('No canvas context')); return; }
    const tempImg = new window.Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.onload = () => {
      canvas.width = Math.round(tempImg.width * scale);
      canvas.height = Math.round(tempImg.height * scale);
      ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    tempImg.onerror = reject;
    tempImg.src = img.src;
  });
}

/** Remove background via corner-pixel color-key (basic stub) */
export function removeBackgroundBasic(img: HTMLImageElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('No canvas context')); return; }
    const tempImg = new window.Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.onload = () => {
      canvas.width = tempImg.width;
      canvas.height = tempImg.height;
      ctx.drawImage(tempImg, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      const bgR = d[0], bgG = d[1], bgB = d[2];
      const threshold = 40;
      for (let i = 0; i < d.length; i += 4) {
        if (
          Math.abs(d[i] - bgR) < threshold &&
          Math.abs(d[i + 1] - bgG) < threshold &&
          Math.abs(d[i + 2] - bgB) < threshold
        ) {
          d[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    tempImg.onerror = reject;
    tempImg.src = img.src;
  });
}

/** Insert an image into a contenteditable div */
export function insertImageIntoEditor(editorId: string, src: string, altText = ''): void {
  const editor = document.getElementById(editorId);
  if (!editor) return;
  editor.focus();
  const safeAlt = altText.replace(/"/g, '&quot;');
  const safeSrc = src.startsWith('data:') ? src : encodeURI(src);
  document.execCommand(
    'insertHTML',
    false,
    `<img src="${safeSrc}" alt="${safeAlt}" data-selected="true" style="max-width:100%;height:auto;margin:8px 4px;cursor:pointer;" />`
  );
}

/** Generate an SVG placeholder data URI */
export function makeSvgPlaceholder(label: string, color: string, w = 600, h = 400): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect fill="${color}" width="${w}" height="${h}"/>
    <text fill="white" font-family="Arial" font-size="22" x="${w / 2}" y="${h / 2}"
      text-anchor="middle" dominant-baseline="central">${label}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
